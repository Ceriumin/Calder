import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  style?: RNTextProps['style'];
  type?: 'primary' | 'secondary' | 'tertiary';
}

export default function Text({ children, style, ...rest }: TextProps) {
  return (
    <RNText {...rest} style={[{ fontSize: 16 }, style]}>
      {children}
    </RNText>
  );
}


