import React from 'react';
import { Text, TextProps } from 'react-native';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  style?: TextProps['style'];
}

export default function Heading({ level = 1, children, style }: HeadingProps) {
  const fontSize = 24 - (level - 1) * 2; 

  return (
      <Text style={[{ fontSize }, style]}>
        {children}
      </Text>
  );
}

  
  