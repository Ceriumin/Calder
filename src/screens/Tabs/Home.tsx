import React from 'react';
import { View } from 'react-native';

import { Button, PasswordField } from '@/components/input/_index';

export default function Home() {

  const [changeText, setChangeText] = React.useState<string>('');

  return (
    <View>
      <PasswordField
        value={changeText}
        onChangeText={setChangeText}
      />
    </View>
  );
}
