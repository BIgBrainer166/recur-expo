import "@/global.css";
import { Link } from "expo-router";
import { styled } from 'nativewind';
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)
export default function Index() {
  return (
   <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-xl font-extrabold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Link href={'/onboarding'} className="mt-4 rounded bg-primary text-white">Onboarding</Link>
      <Link href={'/(auth)/sign-in'} className="mt-4 rounded bg-primary text-white">Go to Sign in</Link>
      <Link href={'/(auth)/sign-up'} className="mt-4 rounded bg-primary text-white">Go to Sign up</Link>
      <Link href={'/subscriptions/claude'} className="mt-4 rounded bg-primary text-white">Claude Subscription</Link>
      <Link href={'/subscriptions/gpt'} className="mt-4 rounded bg-primary text-white">GPT Subscription</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: {id: "grok"}
      }} className="mt-4 rounded bg-primary text-white">Grok Subscriptions</Link>
    </SafeAreaView>
  );
}
