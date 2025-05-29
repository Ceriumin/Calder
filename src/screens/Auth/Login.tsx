import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/base/_index';
import { Button, InputField, PasswordField } from '@/components/input/_index';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, isLoading } = useAuth();

  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ marginBottom: 24, fontSize: 24, fontWeight: 'bold' }}>Login</Text>
      <InputField
        placeholder="Email"
        keyboardType="email-address"
        style={{ marginBottom: 16 }}
        value={email}
        onChangeText={setEmail}
      />
      <PasswordField
        placeholder="Password"
        style={{ marginBottom: 24 }}
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => navigation.navigate("Register")}/>
    </View>
  );
};

export default Login;
