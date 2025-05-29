import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text } from '@/components/base/_index';
import { Button, InputField, PasswordField } from '@/components/input/_index';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@react-navigation/native';
import { Alert } from 'react-native';

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
  const { colors } = useTheme();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      Alert.alert('Login Successful', 'You have successfully logged in.', [
        {
          text: 'OK',
        },
      ]);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          marginHorizontal: 24,
          padding: 24,
          backgroundColor: colors.card,
          borderRadius: 16,
          elevation: 3,
          shadowColor: colors.text,
          shadowOpacity: 0.07,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text
          style={{
            marginBottom: 8,
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Welcome Back
        </Text>
        <Text
          style={{
            marginBottom: 24,
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Sign in to your account
        </Text>
        <InputField
          placeholder="Email"
          keyboardType="email-address"
          style={{ marginBottom: 16 }}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <PasswordField
          placeholder="Password"
          style={{ marginBottom: 16 }}
          value={password}
          onChangeText={setPassword}
        />
        <Button
          title={isLoading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          isDisabled={isLoading}
          isFullWidth
          style={{marginTop: 10}}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Button title='Register' variation='text' onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
