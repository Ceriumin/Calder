import { TouchableHighlight, ActivityIndicator, DimensionValue } from 'react-native';
import { Text } from '../base/_index';
import color from 'color'; // Changed import style

interface ButtonProps {
  onPress: () => void;
  title: string;
  variation?: 'primary' | 'secondary' | 'text';
  isFullWidth?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  width?: DimensionValue;
  darkenPercent?: number;
  style?: object;
}

export default function Button({
  onPress,
  title,
  variation = 'primary',
  isFullWidth = false,
  isDisabled = false,
  isLoading = false,
  width = '50%',
  darkenPercent = 10,
  style = {},
}: ButtonProps) {

  const backgroundColor = 
    variation === 'primary' ? '#007BFF' : 
    variation === 'secondary' ? 'transparent' : 
    'transparent';

  const getUnderlayColor = (baseColor: string) => {
    if (baseColor === 'transparent') {
      return '#e2e6ea';
    } else {
      return color(baseColor).darken(darkenPercent / 100).hex();
    }
  };

  const buttonStyles = {
    backgroundColor,
    borderColor: variation === 'primary' ? 'transparent' : variation === 'secondary' ? '#6C757D' : 'transparent',
    borderStyle: 'solid',
    borderWidth: variation === 'text' ? 0 : 1,
    opacity: isDisabled ? 0.5 : 1,
    width: isFullWidth ? '100%' : width,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    ...style, 
    
  } as const;

  const textColor = variation === 'primary' ? 'white' : '#6C757D';

  return (
    <TouchableHighlight
      onPress={isDisabled || isLoading ? undefined : onPress}
      style={buttonStyles}
      underlayColor={getUnderlayColor(backgroundColor)}
      disabled={isDisabled || isLoading}>
      {isLoading ? <ActivityIndicator/> : <Text style={{ color: textColor }}>{title}</Text>}
    </TouchableHighlight>
  );
}