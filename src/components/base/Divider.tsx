import { View } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  style?: object;
}

export default function Divider({
  orientation = 'horizontal',
  color = '#000',
  thickness = 1,
  style = {},
}: DividerProps ) {
  
  const dividerStyle = {
    backgroundColor: color,
    width: orientation === 'horizontal' ? '100%' : thickness,
    height: orientation === 'horizontal' ? thickness : '100%',
    ...style,
  } as const;

  return <View style={dividerStyle} />;
};




