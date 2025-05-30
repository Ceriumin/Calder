import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  style?: TextProps['style'];
}

export default function Heading({ level = 1, children, style }: HeadingProps) {

  const { currentTheme } = useTheme();

  // Just to prevent any stupid problems
  if (level < 1 || level > 6) {
    throw new Error('Level must be between 1 and 6');
  }

  // Adjusts the font size based on the heading level
  const fontSize = 24 - (level - 1) * 2; 
  const color = currentTheme.colors.text;

  return (
      <Text style={[{ fontSize, color }, style]}>
        {children}
      </Text>
  );
}

  
  