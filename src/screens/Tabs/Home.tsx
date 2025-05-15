import React from 'react';
import { View } from 'react-native';
import Divider from '@/components/base/Divider';
import Text from '@/components/base/Text';
import Heading from '@/components/base/Heading';


export default function Home() {
  return (
    <View>
      <Heading level={1} style={{ marginBottom: 10 }}>
        Home
      </Heading>
      <Text>Home</Text>
    </View>
  );
}
