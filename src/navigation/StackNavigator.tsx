import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '@/screens/Stack/Home'; 


function NavigationContent() { 
  return (
    <React.Fragment>
      <NavigationContainer>
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
        name="Home"
        component={Home}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContent />
  );
}