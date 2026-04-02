import ListHeading from "@/components/ListHeading"
import SubscriptionCard from "@/components/SubscriptionCard"
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard"
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data"
import { icons } from "@/constants/icons"
import images from "@/constants/images"
import "@/global.css"
import { formatCurrency } from "@/libs/utils"
import dayjs from "dayjs"
import { styled } from "nativewind"
import { useState } from "react"
import { FlatList, Image, Text, View } from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)

  const renderHomeHeader = () => (
    <>
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>
        <Image source={icons.add} className="home-add-icon" />
      </View>
      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
          <Text className="home-balance-date">
            {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
          </Text>
        </View>
      </View>
      <View className="mb-5">
        <ListHeading title="Upcoming" />
        <FlatList
          data={UPCOMING_SUBSCRIPTIONS}
          renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
          keyExtractor={(item) => item.id}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No Upcoming subscription.</Text>}
        />
      </View>
      <ListHeading title="All Subscription" />
    </>
  )

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <FlatList
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))
            }
          />
        )}
        extraData={expandedSubscriptionId}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListHeaderComponent={renderHomeHeader}
        ListFooterComponent={<View className="h-4" />}
        contentContainerClassName="pb-30"
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions found.</Text>}
      />
    </SafeAreaView>
  )
}
