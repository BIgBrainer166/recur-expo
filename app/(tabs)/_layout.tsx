import { tabs } from "@/constants/data"
import { colors, components } from "@/constants/theme"
import { clsx } from "clsx"
import { Tabs } from "expo-router"
import { Image, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const tabBar = components.tabBar
const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} className="tabs-glyph" />
      </View>
    </View>
  )
}
const TabsLayout = () => {
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          marginHorizontal: tabBar.horizontalInset,
          // paddingRight: tabBar.horizontalInset / 10,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          left: tabBar.horizontalInset,
          right: tabBar.horizontalInset,
          height: tabBar.height,
          paddingHorizontal: tabBar.itemPaddingVertical,
          paddingVertical: tabBar.itemPaddingVertical / 2,
          // elevation: 0,
          overflow: "hidden",
          elevation: 6,
          shadowColor: colors.foreground,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },

        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => {
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tab.icon} />,
            }}
          />
        )
      })}
    </Tabs>
  )
}

export default TabsLayout
