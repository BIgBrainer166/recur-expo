import type { Href, Router } from "expo-router"
import * as Linking from "expo-linking"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type AuthFieldErrors = Partial<Record<"emailAddress" | "password" | "code" | "firstName" | "lastName" | "username" | "legalAccepted", string>>

type HookErrors = {
  global: Array<{
    message: string
    longMessage?: string
  }> | null
}

type ClerkActionError = {
  message?: string
  longMessage?: string
  errors?: Array<{
    message?: string
    longMessage?: string
  }>
} | null

type SignInLike = {
  status: string
  supportedSecondFactors?: Array<{
    strategy?: string
  }>
}

type SignUpLike = {
  status: string
  missingFields: string[]
  unverifiedFields: string[]
}

type ClerkNavigateParams = {
  session?: {
    currentTask?: unknown
  } | null
  decorateUrl: (url: string) => string
}

export const getPostAuthHref = (session?: { currentTask?: unknown } | null): "/" | "/onboarding" =>
  session?.currentTask ? "/onboarding" : "/"

export const MIN_PASSWORD_LENGTH = 8

export const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(normalizeEmail(value))

export const validateEmail = (value: string) => {
  if (!value.trim()) return "Enter the email address you use for billing alerts."
  if (!isValidEmail(value)) return "Enter a valid email address."
  return undefined
}

export const validatePassword = (value: string) => {
  if (!value.trim()) return "Enter your password."
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return undefined
}

export const validateCode = (value: string) => {
  if (!value.trim()) return "Enter the 6-digit code we sent."
  if (!/^\d{6}$/.test(value.trim())) return "Enter the 6-digit code exactly as received."
  return undefined
}

export const getActionErrorMessage = (error: ClerkActionError) => {
  if (!error) return null

  if (typeof error.longMessage === "string" && error.longMessage) {
    return error.longMessage
  }

  if (Array.isArray(error.errors)) {
    const firstNestedError = error.errors.find(
      (item) => typeof item?.longMessage === "string" || typeof item?.message === "string",
    )

    if (typeof firstNestedError?.longMessage === "string" && firstNestedError.longMessage) {
      return firstNestedError.longMessage
    }

    if (typeof firstNestedError?.message === "string" && firstNestedError.message) {
      return firstNestedError.message
    }
  }

  if (typeof error.message === "string" && error.message) {
    return error.message
  }

  return "Something went wrong. Please try again."
}

export const getHookErrorMessage = (errors: HookErrors) => {
  const firstError = errors.global?.[0]

  if (!firstError) return null
  return firstError.longMessage || firstError.message
}

export const signInNeedsEmailCode = (signIn: SignInLike) => {
  if (signIn.status === "needs_client_trust") {
    return true
  }

  return (
    signIn.status === "needs_second_factor" &&
    (signIn.supportedSecondFactors ?? []).some((factor) => factor.strategy === "email_code")
  )
}

export const signUpNeedsEmailVerification = (signUp: SignUpLike) =>
  signUp.status === "missing_requirements" &&
  signUp.unverifiedFields.includes("email_address") &&
  signUp.missingFields.length === 0

export const createAuthNavigate = (router: Router) => {
  return async ({ session, decorateUrl }: ClerkNavigateParams) => {
    const nextPath = getPostAuthHref(session)
    const nextUrl = decorateUrl(nextPath)

    if (nextUrl.startsWith("http")) {
      try {
        await Linking.openURL(nextUrl)
        return
      } catch (error) {
        console.warn("Failed to open external auth redirect URL", error)

        const canOpenUrl = await Linking.canOpenURL(nextUrl)

        if (canOpenUrl) {
          try {
            await Linking.openURL(nextUrl)
            return
          } catch (retryError) {
            console.warn("Retrying external auth redirect URL failed", retryError)
          }
        }

        router.replace(nextPath)
      }

      return
    }

    router.replace(nextUrl as Href)
  }
}

export const validateSignInForm = (values: {
  emailAddress: string
  password: string
}) => {
  const errors: AuthFieldErrors = {}

  const emailError = validateEmail(values.emailAddress)
  const passwordError = validatePassword(values.password)

  if (emailError) errors.emailAddress = emailError
  if (passwordError) errors.password = passwordError

  return errors
}

export const validateSignUpForm = (values: {
  emailAddress: string
  password: string
  firstName?: string
  lastName?: string
  username?: string
  legalAccepted: boolean
  requiredFields: string[]
}) => {
  const errors: AuthFieldErrors = {}

  const emailError = validateEmail(values.emailAddress)
  const passwordError = validatePassword(values.password)

  if (emailError) errors.emailAddress = emailError
  if (passwordError) errors.password = passwordError

  if (values.requiredFields.includes("first_name") && !values.firstName?.trim()) {
    errors.firstName = "Enter your first name."
  }

  if (values.requiredFields.includes("last_name") && !values.lastName?.trim()) {
    errors.lastName = "Enter your last name."
  }

  if (values.requiredFields.includes("username") && !values.username?.trim()) {
    errors.username = "Choose a username."
  }

  if (!values.legalAccepted) {
    errors.legalAccepted = "You need to accept the terms to create your account."
  }

  return errors
}
