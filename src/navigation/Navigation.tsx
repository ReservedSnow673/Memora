import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import GalleryScreen from '../screens/GalleryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Gallery: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let emoji = '⭕';

          if (route.name === 'Home') {
            emoji = '📷';
          } else if (route.name === 'Gallery') {
            emoji = '🖼️';
          } else if (route.name === 'Settings') {
            emoji = '⚙️';
          }

          return <Text style={{ fontSize: size }}>{emoji}</Text>;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home"
        component={HomeScreen}
        options={{ title: 'Capture' }}
      />
      <Tab.Screen 
        name="Gallery" 
        component={GalleryScreen}
        options={{ title: 'Gallery' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: true,
            title: 'Sign In',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}