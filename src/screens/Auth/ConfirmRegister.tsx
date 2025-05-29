import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text } from '@/components/base/_index';
import { Button, InputField } from '@/components/input/_index';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation, useRoute, RouteProp, NavigationProp, useTheme } from '@react-navigation/native';

type AuthStackParamList = {
  ConfirmRegister: { email: string };
  Register: undefined;
  Login: undefined;
};

const ConfirmRegister = () => {
  const [code, setCode] = useState('');
  const { confirmSignUp, isLoading } = useAuth();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ConfirmRegister'>>();
  const { colors } = useTheme();
  
  const email = route.params.email;

  const handleConfirm = async () => {
    try {
      await confirmSignUp(email, code);
      navigation.navigate('Login'); 
      Alert.alert('Confirmation Successful', 'Your account has been confirmed.', [
        {
          text: 'OK',
        },
      ]);
    }
    catch (error) {
      console.error('Confirmation failed:', error);
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
          Verify Account
        </Text>
        <Text
          style={{
            marginBottom: 24,
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Enter the verification code sent to {email}
        </Text>
        <InputField
          placeholder="Confirmation Code"
          keyboardType="number-pad"
          style={{ marginBottom: 16 }}
          value={code}
          onChangeText={setCode}
        />
        <Button
          title={isLoading ? "Verifying..." : "Verify Code"}
          onPress={handleConfirm}
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
          <Button title='Back to Register' variation='text' onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ConfirmRegister;