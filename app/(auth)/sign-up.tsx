import { Link } from "expo-router"
import React from "react"
import { Text, View } from "react-native"

const SignUp = () => {
  return (
    <View>
      <Text>Signin</Text>
      <Link href={"/(auth)/sign-in"}>Sign in</Link>
    </View>
  )
}

export default SignUp
