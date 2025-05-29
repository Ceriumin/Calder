import { TextInput } from "react-native";

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: object;
}

export default function InputField({
  placeholder,
  value,
  onChangeText,
  isDisabled = false,
  isFullWidth = true,
  keyboardType = "default",
  style = {},
  autoCapitalize = "none",
}: InputProps) {

  const inputStyles = {
    backgroundColor: isDisabled ? "#e2e6ea" : "#fff",
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    opacity: isDisabled ? 0.5 : 1,
    height: 40,
    width: isFullWidth ? "100%" : "auto",
    ...style,
  } as const;

  return (
    <TextInput
      style={inputStyles}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      editable={!isDisabled}
      selectTextOnFocus={!isDisabled}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  );
}