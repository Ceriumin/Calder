import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Profile } from "@/screens/_index";
import { useTheme } from "@/hooks/_index";

export default function TabNavigator() {
  const Tab = createBottomTabNavigator();
  const { currentTheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: currentTheme.colors.card,
        },
        headerTintColor: currentTheme.colors.text,
        tabBarStyle: {
          backgroundColor: currentTheme.colors.card,
        },
        tabBarActiveTintColor: currentTheme.colors.primary,
        tabBarInactiveTintColor: currentTheme.colors.text,
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

