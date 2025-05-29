import { View } from 'react-native';
import { Text } from '@/components/base/_index';
import { Button, PasswordField, InputField } from '@/components/input/_index';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';


const Register = () => {
  
  type AuthStackParamList = {
    ConfirmRegister: { email: string };
    Register: undefined;
  };


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const { signUp } = useAuth();

  const handleRegister = async () => {
    try {
      await signUp(email, password);
      navigation.navigate('ConfirmRegister', { email });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }; 

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Register</Text>
      <InputField
        placeholder="Email"
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ marginBottom: 16 }}
        value={email}
      />
      <PasswordField
        placeholder="Password"
        style={{ marginBottom: 16 }}
        value={password}
        onChangeText={setPassword}
      />
      <PasswordField
        placeholder="Confirm Password"
        style={{ marginBottom: 24 }}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default Register;
