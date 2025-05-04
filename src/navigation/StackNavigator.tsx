import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';

// Any listeners or references to the navigation context should be defined here
function NavigationContent() { 

  // Navigation references used to navigate from outside of the navigation context
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);

  return (
    <React.Fragment>
      <NavigationContainer
        ref={navigationRef}
      >
        <MainNavigator />
      </NavigationContainer>
    </React.Fragment>
  );
}

function MainNavigator() {

  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      {/* Add more screens here */}
    </Stack.Navigator>
  );
}

// Any context providers should be defined here
export default function Navigation() {
  return (
    <NavigationContent />
  );
}