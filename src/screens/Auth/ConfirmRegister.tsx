import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/base/_index';
import { Button, InputField } from '@/components/input/_index';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';

type AuthStackParamList = {
  ConfirmRegister: { email: string };
  Register: undefined;
  Login: undefined;
};

const ConfirmRegister = () => {
  const [code, setCode] = useState('');

  const { confirmSignUp } = useAuth();

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ConfirmRegister'>>();
  const email = route.params.email; // <-- get the email param

  const handleConfirm = async () => {
    try {
      await confirmSignUp(email, code); 
      navigation.navigate('Login');
    }
    catch (error) {
      console.error('Confirmation failed:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Confirm Registration</Text>
      <InputField
        placeholder="Confirmation Code"
        keyboardType="number-pad"
        style={{ marginBottom: 24 }}
        value={code}
        onChangeText={setCode}
      />
      <Button title="Confirm" onPress={handleConfirm} />
    </View>
  );
};

export default ConfirmRegister;
