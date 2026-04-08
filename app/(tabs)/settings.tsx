import images from "@/constants/images"
import Constants from "expo-constants"
import { useClerk, useUser } from "@clerk/expo"
import { useRouter } from "expo-router"
import { styled } from "nativewind"
import { usePostHog } from "posthog-react-native"
import React, { useState } from "react"
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
const Settings = () => {
  const router = useRouter()
  const { signOut } = useClerk()
  const { user } = useUser()
  const posthog = usePostHog()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const displayName =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Billza member"
  const emailAddress = user?.primaryEmailAddress?.emailAddress || "No email address found"
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar
  const emailStatus =
    user?.primaryEmailAddress?.verification?.status === "verified"
      ? "Verified email"
      : "Verification pending"
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(user.createdAt)
    : "Recently joined"
  const appVersion = Constants.expoConfig?.version || "1.0.0"

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      posthog.capture("user_signed_out")
      posthog.reset()
      await signOut()
      router.replace("/sign-in")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

      <View className="mt-6 rounded-3xl border border-border bg-card p-5">
        <View className="flex-row items-center gap-4">
          <Image className="size-16 rounded-full" source={avatarSource} />
          <View className="flex-1">
            <Text className="text-xl font-sans-bold text-primary">{displayName}</Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {emailAddress}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row flex-wrap gap-2">
          <View className="rounded-full bg-background px-3 py-2">
            <Text className="text-xs font-sans-semibold text-primary">{emailStatus}</Text>
          </View>
          <View className="rounded-full bg-background px-3 py-2">
            <Text className="text-xs font-sans-semibold text-primary">
              Member since {memberSince}
            </Text>
          </View>
        </View>

        <Text className="mt-5 text-sm font-sans-medium text-muted-foreground">
          Manage your account, jump back into key screens, and keep your billing workspace feeling
          tidy.
        </Text>
      </View>

      <View className="mt-4 rounded-3xl border border-border bg-card p-5">
        <Text className="text-lg font-sans-bold text-primary">Quick actions</Text>
        <View className="mt-4 flex-row gap-3">
          <Pressable
            className="flex-1 rounded-2xl bg-background px-4 py-4"
            onPress={() => router.push("/")}
          >
            <Text className="text-base font-sans-bold text-primary">Home</Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              Back to your dashboard
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 rounded-2xl bg-background px-4 py-4"
            onPress={() => router.push("/subscriptions")}
          >
            <Text className="text-base font-sans-bold text-primary">Subscriptions</Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              Review active services
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-4 rounded-3xl border border-border bg-card p-5">
        <Text className="text-lg font-sans-bold text-primary">App info</Text>
        <View className="mt-4 gap-3">
          <View className="flex-row items-center justify-between rounded-2xl bg-background px-4 py-4">
            <Text className="text-sm font-sans-medium text-muted-foreground">Version</Text>
            <Text className="text-sm font-sans-bold text-primary">{appVersion}</Text>
          </View>
          <View className="flex-row items-center justify-between rounded-2xl bg-background px-4 py-4">
            <Text className="text-sm font-sans-medium text-muted-foreground">Focus</Text>
            <Text className="text-sm font-sans-bold text-primary">Smart billing</Text>
          </View>
        </View>

        <Pressable
          className={`auth-button mt-6 ${isSigningOut ? "auth-button-disabled" : ""}`}
          disabled={isSigningOut}
          onPress={() => void handleSignOut()}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="auth-button-text">Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Settings
