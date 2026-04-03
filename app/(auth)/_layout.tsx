import "@/global.css"
import { getPostAuthHref } from "@/libs/auth"
import { useAuth, useSession } from "@clerk/expo"
import { Redirect, Stack } from "expo-router"

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const { session } = useSession()

  if (!isLoaded) return null
  if (isSignedIn) return <Redirect href={getPostAuthHref(session)} />

  return <Stack screenOptions={{ headerShown: false }} />
}
