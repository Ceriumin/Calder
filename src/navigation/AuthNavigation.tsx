import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login, Register, ConfirmRegister } from '@/screens/_index';
import { useTheme } from '@/hooks/_index';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ConfirmRegister:  { email: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigation = () => {
  const { currentTheme } = useTheme();
  
  return (
    <AuthStack.Navigator 
      initialRouteName="Login" 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: currentTheme.colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
      <AuthStack.Screen name="ConfirmRegister" component={ConfirmRegister} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigation;