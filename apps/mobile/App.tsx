import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator screenOptions={{ headerShown: false,
        tabBarStyle: { backgroundColor: '#0B1120', borderTopColor: '#ffffff10' },
        tabBarActiveTintColor: '#00FFD1', tabBarInactiveTintColor: '#6B7B9E' }}>
        <Tab.Screen name="Home" component={() => null} />
        <Tab.Screen name="PCOD" component={() => null} />
        <Tab.Screen name="Mood" component={() => null} />
        <Tab.Screen name="Safety" component={() => null} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
