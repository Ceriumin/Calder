import React from 'react';
import { View } from 'react-native';

import { Button, Input } from '@/components/input/_index';

export default function Home() {

  const [changeText, setChangeText] = React.useState<string>('');

  return (
    <View>
      <Button
        title="Hello"
        onPress={() => {
          console.log('Hello');
        }}
        variation="primary"
        isDisabled={false}
        isLoading={false}
        isFullWidth={false}
      />
      <Input
        placeholder="Enter text"
        value={changeText}
        onChangeText={setChangeText}
        isDisabled={false}
        isFullWidth={false}
      />
    </View>
  );
}
