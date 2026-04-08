import AuthScreen from "@/components/auth/AuthScreen"
import AuthTextField from "@/components/auth/AuthTextField"
import {
  createAuthNavigate,
  getActionErrorMessage,
  getHookErrorMessage,
  normalizeEmail,
  signUpNeedsEmailVerification,
  validateCode,
  validateSignUpForm,
} from "@/libs/auth"
import { useSignUp } from "@clerk/expo"
import { Link, useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"
import { useRef, useState } from "react"
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, View } from "react-native"

type LocalErrors = Partial<
  Record<
    "emailAddress" | "password" | "code" | "firstName" | "lastName" | "username" | "legalAccepted",
    string
  >
>

const SignUpScreen = () => {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()
  const posthog = usePostHog()

  const lastNameRef = useRef<TextInput>(null)
  const usernameRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const codeRef = useRef<TextInput>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [localErrors, setLocalErrors] = useState<LocalErrors>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)

  const isBusy = fetchStatus === "fetching"
  const requiredFields = signUp.requiredFields ?? []
  const showVerificationStep = signUpNeedsEmailVerification(signUp)
  const requiresPhoneNumber = requiredFields.includes("phone_number")
  const showFirstNameField = requiredFields.includes("first_name")
  const showLastNameField = requiredFields.includes("last_name")
  const showUsernameField = requiredFields.includes("username")

  const globalErrorMessage = formMessage || getHookErrorMessage(errors)

  const firstNameError =
    localErrors.firstName ||
    errors.fields.firstName?.longMessage ||
    errors.fields.firstName?.message
  const lastNameError =
    localErrors.lastName || errors.fields.lastName?.longMessage || errors.fields.lastName?.message
  const usernameError =
    localErrors.username || errors.fields.username?.longMessage || errors.fields.username?.message
  const emailError =
    localErrors.emailAddress ||
    errors.fields.emailAddress?.longMessage ||
    errors.fields.emailAddress?.message
  const passwordError =
    localErrors.password || errors.fields.password?.longMessage || errors.fields.password?.message
  const codeError =
    localErrors.code || errors.fields.code?.longMessage || errors.fields.code?.message
  const legalAcceptedError =
    localErrors.legalAccepted ||
    errors.fields.legalAccepted?.longMessage ||
    errors.fields.legalAccepted?.message

  const handleFinalize = async () => {
    const { error } = await signUp.finalize({ navigate: createAuthNavigate(router) })

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      posthog.capture("user_sign_up_failed", { error_message: getActionErrorMessage(error) })
      return
    }

    const email = normalizeEmail(emailAddress)
    posthog.identify(
      email,
      {
        email,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      },
      { first_sign_up_date: new Date().toISOString() }
    )
    posthog.capture("user_signed_up", { method: "password" })
  }

  const handleCreateAccount = async () => {
    Keyboard.dismiss()

    if (requiresPhoneNumber) {
      setFormMessage(
        "Phone number sign up is required for this workspace right now. Update the auth settings or add phone support before continuing."
      )
      return
    }

    const nextLocalErrors = validateSignUpForm({
      emailAddress,
      firstName,
      lastName,
      legalAccepted,
      password,
      requiredFields,
      username,
    })

    if (Object.keys(nextLocalErrors).length > 0) {
      setLocalErrors(nextLocalErrors)
      setFormMessage(null)
      return
    }

    setLocalErrors({})
    setFormMessage(null)

    const { error } = await signUp.password({
      emailAddress: normalizeEmail(emailAddress),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      legalAccepted,
      password,
      username: username.trim() || undefined,
    })

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      posthog.capture("user_sign_up_failed", { error_message: getActionErrorMessage(error) })
      return
    }

    if (signUp.status === "complete") {
      await handleFinalize()
      return
    }

    if (signUpNeedsEmailVerification(signUp)) {
      const emailCodeResult = await signUp.verifications.sendEmailCode()

      if (emailCodeResult.error) {
        setFormMessage(getActionErrorMessage(emailCodeResult.error))
        return
      }

      setVerificationMessage(
        `We sent a 6-digit verification code to ${normalizeEmail(emailAddress)}.`
      )
      setCode("")
      return
    }

    if (signUp.missingFields.length > 0) {
      setFormMessage(
        "A few required account fields are still missing. Review the form and try again."
      )
      return
    }

    setFormMessage("We couldn't complete sign up yet. Please try again.")
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

    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() })

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      return
    }

    if (signUp.status === "complete") {
      await handleFinalize()
      return
    }

    setFormMessage("Your code was accepted, but your account still has pending requirements.")
  }

  const handleResendCode = async () => {
    setFormMessage(null)

    const { error } = await signUp.verifications.sendEmailCode()

    if (error) {
      setFormMessage(getActionErrorMessage(error))
      return
    }

    setVerificationMessage(`A fresh code is on the way to ${normalizeEmail(emailAddress)}.`)
    codeRef.current?.focus()
  }

  const handleEditDetails = async () => {
    await signUp.reset()
    setCode("")
    setFormMessage(null)
    setVerificationMessage(null)
    setLocalErrors({})
  }

  return (
    <AuthScreen
      subtitle={
        showVerificationStep
          ? "Verify your email to finish setting up your Billza account."
          : "Create your Billza account to track renewals, spending, and every recurring charge in one place."
      }
      title={showVerificationStep ? "Verify your email" : "Create your account"}
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
              helperText="Use the latest 6-digit code from your inbox."
              keyboardType="number-pad"
              label="Email verification code"
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
                <Text className="auth-button-text">Create account</Text>
              )}
            </Pressable>

            <Pressable
              className="auth-secondary-button"
              disabled={isBusy}
              onPress={() => void handleResendCode()}
            >
              <Text className="auth-secondary-button-text">Resend code</Text>
            </Pressable>

            <Pressable disabled={isBusy} onPress={() => void handleEditDetails()}>
              <Text className="auth-link text-center">Edit your details</Text>
            </Pressable>
          </>
        ) : (
          <>
            {showFirstNameField ? (
              <AuthTextField
                autoCapitalize="words"
                autoCorrect={false}
                error={firstNameError}
                label="First name"
                onChangeText={setFirstName}
                onSubmitEditing={() => {
                  if (showLastNameField) {
                    lastNameRef.current?.focus()
                    return
                  }

                  if (showUsernameField) {
                    usernameRef.current?.focus()
                    return
                  }

                  emailRef.current?.focus()
                }}
                placeholder="Enter your first name"
                returnKeyType="next"
                textContentType="givenName"
                value={firstName}
              />
            ) : null}

            {showLastNameField ? (
              <AuthTextField
                ref={lastNameRef}
                autoCapitalize="words"
                autoCorrect={false}
                error={lastNameError}
                label="Last name"
                onChangeText={setLastName}
                onSubmitEditing={() => {
                  if (showUsernameField) {
                    usernameRef.current?.focus()
                    return
                  }

                  emailRef.current?.focus()
                }}
                placeholder="Enter your last name"
                returnKeyType="next"
                textContentType="familyName"
                value={lastName}
              />
            ) : null}

            {showUsernameField ? (
              <AuthTextField
                ref={usernameRef}
                autoCapitalize="none"
                autoCorrect={false}
                error={usernameError}
                label="Username"
                onChangeText={setUsername}
                onSubmitEditing={() => emailRef.current?.focus()}
                placeholder="Choose a username"
                returnKeyType="next"
                textContentType="username"
                value={username}
              />
            ) : null}

            <AuthTextField
              ref={emailRef}
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
              autoComplete="new-password"
              autoCorrect={false}
              error={passwordError}
              helperText="Use 8+ characters for stronger account security."
              label="Password"
              onChangeText={setPassword}
              onSubmitEditing={() => {
                if (!isBusy) {
                  void handleCreateAccount()
                }
              }}
              placeholder="Create a password"
              returnKeyType="done"
              secure
              textContentType="newPassword"
              value={password}
            />

            <Pressable
              className="auth-checkbox-row"
              disabled={isBusy}
              onPress={() => setLegalAccepted((currentValue) => !currentValue)}
            >
              <View className={`auth-checkbox ${legalAccepted ? "auth-checkbox-active" : ""}`}>
                {legalAccepted ? <Text className="auth-checkbox-mark">✓</Text> : null}
              </View>
              <Text className="auth-legal-copy">
                I agree to the Terms and Privacy Policy and understand this account protects my
                billing history.
              </Text>
            </Pressable>

            {legalAcceptedError ? <Text className="auth-error">{legalAcceptedError}</Text> : null}

            <Pressable
              className={`auth-button ${isBusy || !emailAddress.trim() || !password || !legalAccepted ? "auth-button-disabled" : ""}`}
              disabled={isBusy || !emailAddress.trim() || !password || !legalAccepted}
              onPress={() => void handleCreateAccount()}
            >
              {isBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="auth-button-text">Create account</Text>
              )}
            </Pressable>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/sign-in">
                <Text className="auth-link">Sign in</Text>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </>
        )}
      </View>
    </AuthScreen>
  )
}

export default SignUpScreen
