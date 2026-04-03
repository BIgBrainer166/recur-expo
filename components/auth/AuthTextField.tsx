import { colors } from "@/constants/theme"
import { MaterialIcons } from "@expo/vector-icons"
import { clsx } from "clsx"
import { forwardRef, useState } from "react"
import { Pressable, Text, TextInput, type TextInputProps, View } from "react-native"

type AuthTextFieldProps = TextInputProps & {
  label: string
  error?: string | null
  helperText?: string | null
  secure?: boolean
}

const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(function AuthTextField(
  { label, error, helperText, secure = false, ...props },
  ref,
) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const secureTextEntry = secure && !isPasswordVisible

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>

      <View className="relative">
        <TextInput
          ref={ref}
          className={clsx("auth-input", error && "auth-input-error", secure && "pr-14")}
          placeholderTextColor="rgba(8, 17, 38, 0.45)"
          secureTextEntry={secureTextEntry}
          selectionColor={colors.accent}
          {...props}
        />

        {secure ? (
          <Pressable
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -mt-5 size-10 items-center justify-center"
            hitSlop={10}
            onPress={() => setIsPasswordVisible((currentValue) => !currentValue)}
          >
            <MaterialIcons
              color={colors.mutedForeground}
              name={isPasswordVisible ? "visibility-off" : "visibility"}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="auth-error">{error}</Text> : null}
      {!error && helperText ? <Text className="auth-helper">{helperText}</Text> : null}
    </View>
  )
})

export default AuthTextField
