import React from "react";
import { TextInput, Pressable, View } from "react-native";
import { Icon } from '../base/_index';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  isDisabled?: boolean;
  isFullWidth?: boolean;
}

export default function PasswordField({
  value,
  onChangeText,
  isDisabled = false,
}: InputProps) {

  const [isProtected, setIsProtected] = React.useState(true);

  const togglePasswordVisibility = () => {
    setIsProtected(!isProtected);
  };

  const height = 44;
  const backgroundColor = isDisabled ? "#e2e6ea" : "#fff";
  const opacity = isDisabled ? 0.5 : 1;

  const inputStyles = {
    backgroundColor,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRightWidth: 0,
    padding: 10,
    height,
    opacity,
    flex: 1,
  } as const;

  const pathData = {
    d: isProtected
      ? "M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z"
      : "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z"
  } as const;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TextInput
        style={inputStyles}
        placeholder="Password"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isProtected}
        editable={!isDisabled}
      />
      <View style={{ 
        backgroundColor,
        borderColor: "#ced4da",
        borderWidth: 1,
        borderLeftWidth: 0,
        opacity,
        alignItems: 'center',
        justifyContent: 'center',
        width: height,
        height,
      }}> 
        <Pressable 
          onPress={togglePasswordVisibility}
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            size={24}
            pathData={pathData.d}
          />
        </Pressable>
      </View>
    </View>
  );
}
