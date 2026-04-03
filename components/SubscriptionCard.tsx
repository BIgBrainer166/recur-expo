import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from "@/libs/utils"
import { clsx } from "clsx"
import React from "react"
import { Image, Pressable, Text, View } from "react-native"

const SubscriptionCard = ({
  name,
  status,
  currency,
  price,
  color,
  billing,
  icon,
  category,
  plan,
  renewalDate,
  onPress,
  startDate,
  expanded,
  paymentMethod,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image className="sub-icon" source={icon} />
        </View>
        <View className="sub-copy">
          <Text className="sub-title" numberOfLines={1}>
            {name}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
            {category?.trim() ||
              plan?.trim() ||
              (renewalDate ? formatSubscriptionDateTime(renewalDate) : "Not provided")}
          </Text>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price" numberOfLines={1}>
            {formatCurrency(price, currency)}
          </Text>
          <Text className="sub-billing" numberOfLines={1}>
            {billing?.trim() || "Not provided"}
          </Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment :</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {paymentMethod?.trim() || "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal Date :</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {renewalDate ? formatSubscriptionDateTime(renewalDate) : "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category :</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {category?.trim() || plan?.trim() || "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started :</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {startDate ? formatSubscriptionDateTime(startDate) : "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status :</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {status ? formatStatusLabel(status) : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  )
}

export default SubscriptionCard
