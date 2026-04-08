import SubscriptionCard from "@/components/SubscriptionCard"
import { HOME_SUBSCRIPTIONS } from "@/constants/data"
import { colors } from "@/constants/theme"
import { MaterialIcons } from "@expo/vector-icons"
import { styled } from "nativewind"
import { usePostHog } from "posthog-react-native"
import { useDeferredValue, useEffect, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native"
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
const Subscriptions = () => {
  const posthog = usePostHog()
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const insets = useSafeAreaInsets()
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase())
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredSubscriptions = HOME_SUBSCRIPTIONS.filter((subscription) => {
    if (!deferredSearchQuery) return true

    return [
      subscription.name,
      subscription.category,
      subscription.plan,
      subscription.billing,
      subscription.paymentMethod,
      subscription.status,
    ].some((value) => value?.toLowerCase().includes(deferredSearchQuery))
  })

  useEffect(() => {
    if (
      expandedSubscriptionId &&
      !filteredSubscriptions.some((subscription) => subscription.id === expandedSubscriptionId)
    ) {
      setExpandedSubscriptionId(null)
    }
  }, [expandedSubscriptionId, filteredSubscriptions])

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={insets.top}
      >
        <View className="subscriptions-header">
          <Text className="subscriptions-title">Subscriptions</Text>
          <Text className="subscriptions-subtitle">
            Search and manage your recurring payments in one place.
          </Text>
        </View>

        <View className="subscriptions-search">
          <MaterialIcons color={colors.mutedForeground} name="search" size={20} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="subscriptions-search-input"
            onChangeText={(value) => {
              setSearchQuery(value)
              if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
              if (value.trim()) {
                searchDebounceRef.current = setTimeout(() => {
                  posthog.capture("subscription_searched", { query: value.trim() })
                }, 500)
              }
            }}
            placeholder="Search subscriptions"
            placeholderTextColor="rgba(8, 17, 38, 0.45)"
            selectionColor={colors.accent}
            style={{ color: colors.primary }}
            value={searchQuery}
          />
        </View>

        <FlatList
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 160,
          }}
          data={filteredSubscriptions}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-2" />}
          keyExtractor={(item) => item.id}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text className="subscriptions-empty-state">
              {searchQuery.trim()
                ? `No subscriptions match "${searchQuery.trim()}".`
                : "No subscriptions found."}
            </Text>
          }
          ListHeaderComponent={
            <Text className="subscriptions-results">
              {filteredSubscriptions.length}{" "}
              {filteredSubscriptions.length === 1 ? "subscription" : "subscriptions"}
            </Text>
          }
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => {
                const isExpanding = expandedSubscriptionId !== item.id
                setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))
                if (isExpanding) {
                  posthog.capture("subscription_expanded", {
                    subscription_id: item.id,
                    subscription_name: item.name,
                    subscription_category: item.category,
                    source: "subscriptions_screen",
                  })
                }
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Subscriptions
