import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store, persistor } from '@/store/store'; // Import your Redux store
import Home from '@/screens/Stack/Home'; 
import { PersistGate } from 'redux-persist/integration/react';


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
        name="Home"
        component={Home}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}

// Any context providers should be defined here
export default function Navigation() {
  return (
    <Provider store={store}>
        <NavigationContent />
    </Provider>
  );
}