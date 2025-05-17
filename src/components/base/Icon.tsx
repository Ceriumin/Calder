import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  pathData?: string;
}

export default function Icon({ size = 24, color = 'black', pathData }: IconProps) {
  if (!pathData) {
    return null; 
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none">
      <Path d={pathData} fill={color} />
    </Svg>
  );
}