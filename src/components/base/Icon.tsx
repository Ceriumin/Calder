import React from 'react';
import { Svg } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  PathData?: string;
}

export default function Icon({ size = 24, color = 'black', PathData }: IconProps) {
  
  if (!PathData) {
    return null; 
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none">
      <path d={PathData} fill={color} />
    </Svg>
  );
}