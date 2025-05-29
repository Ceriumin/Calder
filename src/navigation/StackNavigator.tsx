import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/_index';
import TabNavigator from './TabNavigator';
import AuthNavigation from './AuthNavigation';
import { View, ActivityIndicator } from 'react-native';
import { AuthListener } from '@/utils/_index';

const RootStack = createNativeStackNavigator();

function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const { isAuthenticated, isLoading, isEmailVerified } = useAuth();
  const { currentTheme, themeMode } = useTheme();

  const navigationTheme = {
    ...(themeMode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(themeMode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      ...currentTheme.colors,
    },
  };

  return (
    <>
      <AuthListener />
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <RootStack.Navigator 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: currentTheme.colors.background },
          }}
        >
          {isAuthenticated && isEmailVerified ? (
            <RootStack.Screen name="Main" component={TabNavigator} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigation} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </>              
  );
}

export default function Navigation() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}