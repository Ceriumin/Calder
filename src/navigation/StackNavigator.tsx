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
  const { isAuthenticated, isLoading } = useAuth();
  const { currentTheme, themeMode } = useTheme();

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: currentTheme.colors.background 
      }}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  // Merge navigation theme with our app theme
  const navigationTheme = {
    ...(themeMode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(themeMode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      ...currentTheme.colors,
    },
  };

  return (
    <React.Fragment>
      <AuthListener />
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <RootStack.Navigator 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: currentTheme.colors.background },
          }}
        >
          {isAuthenticated ? (
            <RootStack.Screen 
              name="Main" 
              component={TabNavigator}
              options={{ 
                gestureEnabled: false 
              }}
            />
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