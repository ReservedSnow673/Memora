import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SettingsService } from '../services/SettingsService';
import { OpenAIService } from '../services/OpenAIService';
import { BackgroundTaskService } from '../services/BackgroundTaskService';
import { CONFIG } from '../config/constants';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(CONFIG.DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [backgroundTaskStatus, setBackgroundTaskStatus] = useState(null);

  useEffect(() => {
    loadSettings();
    loadBackgroundTaskStatus();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await SettingsService.getSettings();
      const userApiKey = await SettingsService.getApiKey();
      
      setSettings(userSettings);
      setApiKey(userApiKey || '');
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadBackgroundTaskStatus = async () => {
    try {
      const status = await BackgroundTaskService.getBackgroundTaskStatus();
      setBackgroundTaskStatus(status);
    } catch (error) {
      console.error('Error loading background task status:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      await SettingsService.updateSettings({ [key]: value });
      
      // If background processing settings changed, update background task
      if (key === 'backgroundProcessingEnabled' || key === 'backgroundFrequency') {
        await BackgroundTaskService.registerBackgroundTask();
        await loadBackgroundTaskStatus();
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const saveApiKey = async () => {
    try {
      setTestingApiKey(true);
      
      if (apiKey.trim()) {
        const isValid = await OpenAIService.testApiKey(apiKey.trim());
        if (!isValid) {
          Alert.alert('Invalid API Key', 'The provided API key is not valid');
          return;
        }
      }
      
      await SettingsService.setApiKey(apiKey.trim() || null);
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setTestingApiKey(false);
    }
  };

  const testBackgroundProcessing = async () => {
    try {
      Alert.alert(
        'Test Background Processing',
        'This will manually run the background processing task. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test',
            onPress: async () => {
              try {
                setLoading(true);
                const result = await BackgroundTaskService.testBackgroundProcessing();
                Alert.alert(
                  'Test Complete',
                  `Successfully processed ${result.processedCount} images`
                );
              } catch (error) {
                Alert.alert('Test Failed', error.message);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error testing background processing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.textInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-..."
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={saveApiKey}
              disabled={testingApiKey}
            >
              <Text style={styles.buttonText}>
                {testingApiKey ? 'Testing...' : 'Save & Test'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>GPT Model</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.gptModel}
                onValueChange={(value) => updateSetting('gptModel', value)}
                style={styles.picker}
              >
                <Picker.Item label="GPT-4o-mini (Faster, Cheaper)" value="gpt-4o-mini" />
                <Picker.Item label="GPT-4o (Higher Quality)" value="gpt-4o" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Description Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description Options</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Generate Alt Text</Text>
            <Switch
              value={settings.generateAltText}
              onValueChange={(value) => updateSetting('generateAltText', value)}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Generate Narrative Description</Text>
            <Switch
              value={settings.generateNarrativeDescription}
              onValueChange={(value) => updateSetting('generateNarrativeDescription', value)}
            />
          </View>
        </View>

        {/* Background Processing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Processing</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Background Processing</Text>
            <Switch
              value={settings.backgroundProcessingEnabled}
              onValueChange={(value) => updateSetting('backgroundProcessingEnabled', value)}
            />
          </View>

          {settings.backgroundProcessingEnabled && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Processing Frequency</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.backgroundFrequency}
                  onValueChange={(value) => updateSetting('backgroundFrequency', value)}
                  style={styles.picker}
                >
                  {Object.entries(CONFIG.BACKGROUND_FREQUENCIES).map(([key, config]) => (
                    <Picker.Item key={key} label={config.label} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {backgroundTaskStatus && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Background Task Status:</Text>
              <Text style={styles.statusValue}>
                {backgroundTaskStatus.isRegistered ? 'Registered' : 'Not Registered'} 
                {backgroundTaskStatus.statusText && ` (${backgroundTaskStatus.statusText})`}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testBackgroundProcessing}
            disabled={!settings.backgroundProcessingEnabled || !apiKey.trim()}
          >
            <Text style={styles.buttonText}>Test Background Processing</Text>
          </TouchableOpacity>
        </View>

        {/* Google Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Integration</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Google Login</Text>
            <Switch
              value={settings.googleAuthEnabled}
              onValueChange={(value) => updateSetting('googleAuthEnabled', value)}
            />
          </View>
          
          {settings.googleAuthEnabled && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Google integration is currently in development. This will enable cloud sync and Google Photos import.
              </Text>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Memora v1.0.0{'\n'}
            Making memories visible, making images accessible.{'\n\n'}
            This app uses OpenAI's GPT-Vision API to generate descriptions for your photos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  statusContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});