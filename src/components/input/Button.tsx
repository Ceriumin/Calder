import React from 'react';
import { TouchableHighlight, ActivityIndicator } from 'react-native';
import { Text } from '../base/_index';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variation?: 'primary' | 'secondary' | 'text';
  isFullWidth?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export default function Button({
  onPress,
  title,
  variation = 'primary',
  isFullWidth = false,
  isDisabled = false,
  isLoading = false,
}: ButtonProps) {

  const buttonStyles = {
    backgroundColor: variation === 'primary' ? '#007BFF' : variation === 'secondary' ? '#6C757D' : 'transparent',
    opacity: isDisabled ? 0.5 : 1,
    width: isFullWidth ? '100%' : undefined,
    padding: 10,
    borderRadius: 5,
  } as const;

  return (
    <TouchableHighlight
      onPress={isDisabled || isLoading ? undefined : onPress}
      style={buttonStyles}
      disabled={isDisabled || isLoading}>
      {isLoading ? <ActivityIndicator/> : <Text>{title}</Text>}
    </TouchableHighlight>
  );
}


