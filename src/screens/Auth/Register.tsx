import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/base/_index';
import { Button, PasswordField, InputField } from '@/components/input/_index';
import { NavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '@/hooks/_index';

type AuthStackParamList = {
  ConfirmRegister: { email: string };
  Register: undefined;
  Login: undefined;
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const { colors } = useTheme();
  const { signUp, isLoading } = useAuth();

  const handleRegister = async () => {
    try {
      setError(null);
      
      // Validate inputs
      if (!email || !password || !confirmPassword) {
        setError('All fields are required');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Attempt to sign up
      await signUp(email, password);
      
      console.log('Registration successful, navigating to verification screen');

      Alert.alert(
        'Registration Successful', 
        'Please enter the verification code sent to your email.',
        [{ text: 'OK' }]
      );

      navigation.navigate('ConfirmRegister', { email });

    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
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
          Create Account
        </Text>
        <Text
          style={{
            marginBottom: 24,
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Sign up for Calder
        </Text>
        
        {error && (
          <View style={{
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            padding: 10,
            borderRadius: 8,
            marginBottom: 16
          }}>
            <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          </View>
        )}
        
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
        <PasswordField
          placeholder="Confirm Password"
          style={{ marginBottom: 16 }}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Button
          title={isLoading ? "Registering..." : "Register"}
          onPress={handleRegister}
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
          <Button title='Back to Login' variation='text' onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Register;