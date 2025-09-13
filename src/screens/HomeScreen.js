import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ImageService } from '../services/ImageService';
import { SettingsService } from '../services/SettingsService';
import { BackgroundTaskService } from '../services/BackgroundTaskService';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [recentImages, setRecentImages] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
    loadRecentImages();
    initializeBackgroundTasks();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await SettingsService.getSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadRecentImages = async () => {
    try {
      const processed = await SettingsService.getProcessedImages();
      const recentProcessed = Object.entries(processed)
        .sort(([,a], [,b]) => new Date(b.processedAt) - new Date(a.processedAt))
        .slice(0, 5);
      setRecentImages(recentProcessed);
    } catch (error) {
      console.error('Error loading recent images:', error);
    }
  };

  const initializeBackgroundTasks = async () => {
    try {
      await BackgroundTaskService.initialize();
      await BackgroundTaskService.registerBackgroundTask();
    } catch (error) {
      console.error('Error initializing background tasks:', error);
    }
  };

  const handleCapturePhoto = async () => {
    try {
      setLoading(true);
      const image = await ImageService.capturePhoto();
      
      if (image) {
        const processedImage = await ImageService.processImage(image);
        Alert.alert(
          'Photo Processed!',
          `Alt Text: ${processedImage.altText}\n\nNarrative: ${processedImage.narrative}`,
          [{ text: 'OK' }]
        );
        await loadRecentImages();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPhoto = async () => {
    try {
      setLoading(true);
      const image = await ImageService.selectPhoto();
      
      if (image) {
        const processedImage = await ImageService.processImage(image);
        Alert.alert(
          'Photo Processed!',
          `Alt Text: ${processedImage.altText}\n\nNarrative: ${processedImage.narrative}`,
          [{ text: 'OK' }]
        );
        await loadRecentImages();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessUncaptioned = async () => {
    try {
      setLoading(true);
      const processedImages = await ImageService.processUncaptionedImages();
      Alert.alert(
        'Processing Complete',
        `Added descriptions to ${processedImages.length} image(s)`,
        [{ text: 'OK' }]
      );
      await loadRecentImages();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const needsSetup = !settings?.apiKey;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Memora</Text>
          <Text style={styles.subtitle}>Making memories visible, making images accessible</Text>
        </View>

        {needsSetup && (
          <View style={styles.setupBanner}>
            <Text style={styles.setupText}>
              ⚠️ Setup required: Configure your OpenAI API key in Settings
            </Text>
          </View>
        )}

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Capture & Process</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCapturePhoto}
            disabled={loading || needsSetup}
          >
            <Text style={styles.actionButtonText}>📸 Capture Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSelectPhoto}
            disabled={loading || needsSetup}
          >
            <Text style={styles.actionButtonText}>🖼️ Select from Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.tertiaryButton]}
            onPress={handleProcessUncaptioned}
            disabled={loading || needsSetup}
          >
            <Text style={styles.actionButtonText}>🔄 Process Uncaptioned</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Processing</Text>
          
          {recentImages.length > 0 ? (
            recentImages.map(([imageId, data], index) => (
              <View key={imageId} style={styles.recentItem}>
                <Text style={styles.recentTime}>
                  {new Date(data.processedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.recentDescription} numberOfLines={2}>
                  {data.description?.altText || data.description?.narrative || 'Processed'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRecentText}>No recent processing</Text>
          )}
        </View>

        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.navButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  setupBanner: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  setupText: {
    color: '#856404',
    fontSize: 14,
  },
  actionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  tertiaryButton: {
    backgroundColor: '#FF9500',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: 30,
  },
  recentItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  recentTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  recentDescription: {
    fontSize: 14,
    color: '#333',
  },
  noRecentText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  navigationSection: {
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#6C757D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});