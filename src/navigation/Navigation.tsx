import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreenNew from '../screens/HomeScreenNew';
import ImageDetailsScreen from '../screens/ImageDetailsScreen';
import GalleryScreen from '../screens/GalleryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import { ProcessedImage } from '../store/imagesSlice';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  HomeStack: undefined;
  Gallery: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ImageDetails: { image: ProcessedImage };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreenNew} />
      <HomeStack.Screen name="ImageDetails" component={ImageDetailsScreen} />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let emoji = '⭕';

          if (route.name === 'HomeStack') {
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
        name="HomeStack"
        component={HomeStackScreen}
        options={{ title: 'Gallery' }}
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