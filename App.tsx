import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';

// Optional import for gesture handler
let GestureHandlerRootView: any;
try {
  GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView;
} catch {
  // Fallback to regular View if gesture handler is not available
  GestureHandlerRootView = View;
}

import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { storageService } from './src/services/storage/storageService';
import { openAIService } from './src/services/api/openAIService';
import { useAppDispatch, useAppSelector } from './src/store';
import { setSettings } from './src/store/slices/settingsSlice';
import { setImages } from './src/store/slices/imagesSlice';
import { setUser, setInitialized } from './src/store/slices/authSlice';
import { COLORS } from './src/utils/constants';

// App initialization component
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state.settings);
  const { isInitialized } = useAppSelector(state => state.auth);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load stored data
      const [storedSettings, storedImages, storedUser] = await Promise.all([
        storageService.getSettings(),
        storageService.getImages(),
        storageService.getUser(),
      ]);

      // Update Redux store
      dispatch(setSettings(storedSettings));
      dispatch(setImages(storedImages));
      
      if (storedUser) {
        dispatch(setUser(storedUser));
      }

      // Initialize OpenAI service if we have stored API key
      // Note: In a real app, you'd want to store this securely
      // For demo purposes, you can manually initialize it:
      // openAIService.initialize('your-openai-api-key-here');

      dispatch(setInitialized(true));
      
      console.log('App initialized successfully');
      console.log(`Loaded ${storedImages.length} images`);
      
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to initialize app');
      
      // Show error to user but allow app to continue
      Alert.alert(
        'Initialization Error',
        'Some features may not work properly. Please restart the app.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    const colors = settings.accessibility.highContrast ? COLORS.highContrast : COLORS;
    
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading Memora...
        </Text>
      </View>
    );
  }

  if (error && !isInitialized) {
    const colors = settings.accessibility.highContrast ? COLORS.highContrast : COLORS;
    
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: COLORS.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <AppInitializer>
            <StatusBar style="auto" />
            <RootNavigator />
          </AppInitializer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default App;