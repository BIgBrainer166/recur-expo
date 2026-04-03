import { styled } from "nativewind"
import type { PropsWithChildren, ReactNode } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)

type AuthScreenProps = PropsWithChildren<{
  title: string
  subtitle: string
  footer?: ReactNode
}>

const trustPoints = ["Track every renewal", "See upcoming charges", "Set up in minutes"] as const

const AuthScreen = ({ title, subtitle, children, footer }: AuthScreenProps) => {
  return (
    <SafeAreaView className="auth-safe-area" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">B</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Billza</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>

            <Text className="auth-title">{title}</Text>
            <Text className="auth-subtitle">{subtitle}</Text>
          </View>

          <View className="auth-card">{children}</View>

          <View className="auth-trust-row">
            {trustPoints.map((item) => (
              <View key={item} className="auth-trust-chip">
                <Text className="auth-trust-chip-text">{item}</Text>
              </View>
            ))}
          </View>

          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AuthScreen
