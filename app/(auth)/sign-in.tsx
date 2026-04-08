import AuthScreen from "@/components/auth/AuthScreen"
import AuthTextField from "@/components/auth/AuthTextField"
import {
  createAuthNavigate,
  getActionErrorMessage,
  getHookErrorMessage,
  normalizeEmail,
  signInNeedsEmailCode,
  validateCode,
  validateSignInForm,
} from "@/libs/auth"
import { useSignIn } from "@clerk/expo"
import { Link, useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"
import { useRef, useState } from "react"
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, View } from "react-native"

type LocalErrors = Partial<Record<"emailAddress" | "password" | "code", string>>

const SignInScreen = () => {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const posthog = usePostHog()

  const passwordRef = useRef<TextInput>(null)
  const codeRef = useRef<TextInput>(null)

  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [localErrors, setLocalErrors] = useState<LocalErrors>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)

  const isBusy = fetchStatus === "fetching"
  const showVerificationStep = signInNeedsEmailCode(signIn)
  const globalErrorMessage = formMessage || getHookErrorMessage(errors)

  const emailError =
    localErrors.emailAddress ||
    errors.fields.identifier?.longMessage ||
    errors.fields.identifier?.message
  const passwordError =
    localErrors.password || errors.fields.password?.longMessage || errors.fields.password?.message
  const codeError =
    localErrors.code || errors.fields.code?.longMessage || errors.fields.code?.message

  const handleFinalize = async () => {
    const { error } = await signIn.finalize({ navigate: createAuthNavigate(router) })

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      posthog.capture("user_sign_in_failed", { error_message: getActionErrorMessage(error) })
      return
    }

    const email = normalizeEmail(emailAddress)
    posthog.identify(email, { $set: { email } })
    posthog.capture("user_signed_in", { method: "password" })
  }

  const handleSubmit = async () => {
    Keyboard.dismiss()

    const nextLocalErrors = validateSignInForm({ emailAddress, password })

    if (Object.keys(nextLocalErrors).length > 0) {
      setLocalErrors(nextLocalErrors)
      setFormMessage(null)
      return
    }

    setLocalErrors({})
    setFormMessage(null)

    const normalizedEmail = normalizeEmail(emailAddress)
    const { error } = await signIn.password({
      emailAddress: normalizedEmail,
      password,
    })

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      posthog.capture("user_sign_in_failed", { error_message: getActionErrorMessage(error) })
      return
    }

    if (signIn.status === "complete") {
      await handleFinalize()
      return
    }

    if (signInNeedsEmailCode(signIn)) {
      const emailCodeResult = await signIn.mfa.sendEmailCode()

      if (emailCodeResult.error) {
        setFormMessage(getActionErrorMessage(emailCodeResult.error))
        return
      }

      setVerificationMessage(`We sent a 6-digit code to ${normalizedEmail}.`)
      setCode("")
      return
    }

    setFormMessage("We couldn't finish sign in yet. Please try again.")
  }

  const handleVerifyCode = async () => {
    const nextCodeError = validateCode(code)

    if (nextCodeError) {
      setLocalErrors({ code: nextCodeError })
      setFormMessage(null)
      return
    }

    setLocalErrors({})
    setFormMessage(null)

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() })

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      return
    }

    if (signIn.status === "complete") {
      await handleFinalize()
      return
    }

    setFormMessage("Your code was accepted, but there’s still one more sign-in step pending.")
  }

  const handleResendCode = async () => {
    setFormMessage(null)

    const { error } = await signIn.mfa.sendEmailCode()

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      return
    }

    setVerificationMessage(`A fresh code is on the way to ${normalizeEmail(emailAddress)}.`)
    codeRef.current?.focus()
  }

  const handleStartOver = async () => {
    await signIn.reset()
    setCode("")
    setPassword("")
    setFormMessage(null)
    setVerificationMessage(null)
    setLocalErrors({})
  }

  return (
    <AuthScreen
      subtitle={
        showVerificationStep
          ? "Enter the code from your inbox to get back to your subscriptions and recurring payments."
          : "Sign in to see renewals, upcoming charges, and subscription spend at a glance."
      }
      title={showVerificationStep ? "Verify your device" : "Welcome back"}
    >
      <View className="auth-form">
        {globalErrorMessage ? (
          <View className="auth-banner auth-banner-error">
            <Text className="auth-banner-text">{globalErrorMessage}</Text>
          </View>
        ) : null}

        {verificationMessage ? (
          <View className="auth-banner auth-banner-success">
            <Text className="auth-banner-text">{verificationMessage}</Text>
          </View>
        ) : null}

        {showVerificationStep ? (
          <>
            <AuthTextField
              ref={codeRef}
              autoComplete="one-time-code"
              autoCorrect={false}
              error={codeError}
              helperText="Use the latest 6-digit code from your email."
              keyboardType="number-pad"
              label="Verification code"
              onChangeText={(value) => setCode(value.replace(/[^\d]/g, "").slice(0, 6))}
              onSubmitEditing={() => {
                if (!isBusy) {
                  void handleVerifyCode()
                }
              }}
              placeholder="Enter 6-digit code"
              returnKeyType="done"
              textContentType="oneTimeCode"
              value={code}
            />

            <Pressable
              className={`auth-button ${isBusy || code.trim().length !== 6 ? "auth-button-disabled" : ""}`}
              disabled={isBusy || code.trim().length !== 6}
              onPress={() => void handleVerifyCode()}
            >
              {isBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="auth-button-text">Verify and continue</Text>
              )}
            </Pressable>

            <Pressable
              className="auth-secondary-button"
              disabled={isBusy}
              onPress={() => void handleResendCode()}
            >
              <Text className="auth-secondary-button-text">Resend code</Text>
            </Pressable>

            <Pressable disabled={isBusy} onPress={() => void handleStartOver()}>
              <Text className="auth-link text-center">Use a different email</Text>
            </Pressable>
          </>
        ) : (
          <>
            <AuthTextField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              error={emailError}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmailAddress}
              onSubmitEditing={() => passwordRef.current?.focus()}
              placeholder="Enter your email"
              returnKeyType="next"
              textContentType="emailAddress"
              value={emailAddress}
            />

            <AuthTextField
              ref={passwordRef}
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              error={passwordError}
              label="Password"
              onChangeText={setPassword}
              onSubmitEditing={() => {
                if (!isBusy) {
                  void handleSubmit()
                }
              }}
              placeholder="Enter your password"
              returnKeyType="done"
              secure
              textContentType="password"
              value={password}
            />

            <Text className="auth-helper">
              Pick up right where you left off with your billing dashboard ready to go.
            </Text>

            <Pressable
              className={`auth-button ${isBusy || !emailAddress.trim() || !password ? "auth-button-disabled" : ""}`}
              disabled={isBusy || !emailAddress.trim() || !password}
              onPress={() => void handleSubmit()}
            >
              {isBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="auth-button-text">Sign in</Text>
              )}
            </Pressable>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Billza?</Text>
              <Link href="/sign-up">
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </>
        )}
      </View>
    </AuthScreen>
  )
}

export default SignInScreen
