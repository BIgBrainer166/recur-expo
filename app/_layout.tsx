import "@/global.css"
import { ClerkProvider } from "@clerk/expo"
import { tokenCache } from "@clerk/expo/token-cache"
import { useFonts } from "expo-font"
import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from "expo-router"
import { useEffect, useRef } from "react"
import { PostHogProvider } from "posthog-react-native"
import { posthog } from "@/libs/posthog"

void SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("Failed to prevent splash screen from auto hiding", error)
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  })

  const pathname = usePathname()
  const params = useGlobalSearchParams()
  const previousPathname = useRef<string | undefined>(undefined)

  // Manual screen tracking for Expo Router
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      })
      previousPathname.current = pathname
    }
  }, [pathname, params])

  useEffect(() => {
    let isMounted = true

    const hideSplashScreen = async () => {
      if (!fontsLoaded || !isMounted) return

      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        console.warn("Failed to hide splash screen", error)
      }
    }

    void hideSplashScreen()

    return () => {
      isMounted = false
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error("Add your Clerk Publishable Key to the .env file")
  }
  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ["testID"],
        maxElementsCaptured: 20,
      }}
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkProvider>
    </PostHogProvider>
  )
}
