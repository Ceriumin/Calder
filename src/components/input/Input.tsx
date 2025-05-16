import { TextInput } from "react-native";

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isDisabled?: boolean;
  isFullWidth?: boolean;
}

export default function Input({
  placeholder,
  value,
  onChangeText,
  isDisabled = false,
}: InputProps) {

  const inputStyles = {
    backgroundColor: isDisabled ? "#e2e6ea" : "#fff",
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    opacity: isDisabled ? 0.5 : 1,
  } as const;

  return (
    <TextInput
      style={inputStyles}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      editable={!isDisabled}
    />
  );
}