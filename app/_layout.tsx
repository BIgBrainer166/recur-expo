import "@/global.css"
import { ClerkProvider } from "@clerk/expo"
import { tokenCache } from "@clerk/expo/token-cache"
import { useFonts } from "expo-font"
import { SplashScreen, Stack } from "expo-router"
import { useEffect } from "react"

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
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  )
}
