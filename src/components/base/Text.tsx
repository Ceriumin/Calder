import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  style?: RNTextProps['style'];
  type?: 'primary' | 'secondary' | 'tertiary';
}

export function Text({ children, style, ...rest }: TextProps) {
  return (
    <RNText {...rest} style={[{ fontSize: 16 }, style]}>
      {children}
    </RNText>
  );
}

// Component to render text with a bold font weight
// This is a simple wrapper around the Text component from react-native
export function Strong({ children, style, ...rest }: TextProps) {
  return (
    <RNText {...rest} style={[{ fontWeight: 'bold', fontSize: 16 }, style]}>
      {children}
    </RNText>
  );
}



