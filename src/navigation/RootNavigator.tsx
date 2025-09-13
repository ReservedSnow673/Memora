import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store';
import { TabParamList, RootStackParamList } from '../types';

// Import screens (placeholder imports for now)
import HomeScreen from '../screens/Home/HomeScreen';
import GalleryScreen from '../screens/Gallery/GalleryScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import CameraScreen from '../screens/Camera/CameraScreen';
import AuthScreen from '../screens/Auth/AuthScreen';
import ImageDetailScreen from '../screens/Gallery/ImageDetailScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  const { settings } = useAppSelector(state => state.settings);
  const { highContrast } = settings.accessibility;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Gallery') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: highContrast ? '#0A84FF' : '#007AFF',
        tabBarInactiveTintColor: highContrast ? '#8E8E93' : '#8E8E93',
        tabBarStyle: {
          backgroundColor: highContrast ? '#1C1C1E' : '#FFFFFF',
          borderTopColor: highContrast ? '#48484A' : '#C6C6C8',
        },
        headerStyle: {
          backgroundColor: highContrast ? '#1C1C1E' : '#FFFFFF',
        },
        headerTintColor: highContrast ? '#FFFFFF' : '#000000',
        tabBarAccessibilityLabel: route.name,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Home',
          headerTitle: 'Memora',
        }}
      />
      <Tab.Screen 
        name="Gallery" 
        component={GalleryScreen}
        options={{
          title: 'Gallery',
          headerTitle: 'Your Images',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { settings } = useAppSelector(state => state.settings);
  const { highContrast } = settings.accessibility;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: highContrast ? '#1C1C1E' : '#FFFFFF',
          },
          headerTintColor: highContrast ? '#FFFFFF' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{
            title: 'Capture Image',
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="ImageDetail" 
          component={ImageDetailScreen}
          options={{
            title: 'Image Details',
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{
            title: 'Sign In',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;