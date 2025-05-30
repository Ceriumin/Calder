import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/_index';
import TabNavigator from './TabNavigator';
import AuthNavigation from './AuthNavigation';
import { AuthListener } from '@/utils/_index';

const RootStack = createNativeStackNavigator();

function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const { isAuthenticated, isEmailVerified } = useAuth();
  const { currentTheme } = useTheme();

  /* isEmailVerified is used to check if the user has verified their email.
   * This was an issue because it wouldnt redirect the user to verify their email*/
  return (
    <React.Fragment>
      <AuthListener />
      <NavigationContainer ref={navigationRef}>
        <RootStack.Navigator 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { 
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.border,
            }
          }}
        >
          {isAuthenticated && isEmailVerified ? (
            <RootStack.Screen name="Main" component={TabNavigator} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigation} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </React.Fragment>        
  );
}

export default function Navigation() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}