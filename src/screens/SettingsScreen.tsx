import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { RootState } from '../store';
import {
  setBackgroundFetchFrequency,
  setWifiOnly,
  setChargingOnly,
  setOpenAIApiKey,
  setAutoProcessImages,
  setSaveToGooglePhotos,
} from '../store/settingsSlice';
import { createOpenAIService, hasValidApiKey, getCurrentApiKey } from '../services/openai';
import { firebaseAuth } from '../services/firebase';

export default function SettingsScreen() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const settings = useSelector((state: RootState) => state.settings);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const frequencyOptions = [
    { label: 'Hourly', value: 'hourly' as const },
    { label: 'Daily', value: 'daily' as const },
    { label: 'Weekly', value: 'weekly' as const },
  ];

  const handleFrequencyChange = (frequency: 'hourly' | 'daily' | 'weekly') => {
    dispatch(setBackgroundFetchFrequency(frequency));
  };

  const handleApiKeyUpdate = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setTestingConnection(true);
    
    try {
      const openaiService = createOpenAIService(apiKeyInput.trim());
      const isValid = await openaiService.testConnection();
      
      if (isValid) {
        dispatch(setOpenAIApiKey(apiKeyInput.trim()));
        setApiKeyInput('');
        setShowApiKeyInput(false);
        Alert.alert('Success', 'OpenAI API key updated successfully!');
      } else {
        Alert.alert('Error', 'Invalid API key. Please check and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate API key. Please check your internet connection.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await firebaseAuth.signInWithGoogle();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const renderApiKeyModal = () => (
    <Modal visible={showApiKeyInput} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>OpenAI API Key</Text>
          <Text style={styles.modalSubtitle}>
            {hasValidApiKey() 
              ? 'You can use your own OpenAI API key or continue with the default one. Custom keys take priority.'
              : 'Enter your OpenAI API key to enable AI image captioning. A default key is available as fallback.'}
          </Text>
          
          <TextInput
            style={styles.apiKeyInput}
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder="sk-..."
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowApiKeyInput(false);
                setApiKeyInput('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleApiKeyUpdate}
              disabled={testingConnection}
            >
              <Text style={styles.saveButtonText}>
                {testingConnection ? 'Testing...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* OpenAI Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowApiKeyInput(true)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>API Key</Text>
            <Text style={styles.settingDescription}>
              {settings.openAIApiKey 
                ? 'Custom key configured' 
                : hasValidApiKey() 
                  ? 'Using default key' 
                  : 'Not configured'}
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: '#999' }}>▶️</Text>
        </TouchableOpacity>

        {settings.openAIApiKey && (
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: '#fff5f5' }]}
            onPress={() => {
              dispatch(setOpenAIApiKey(''));
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: '#dc2626' }]}>Clear Custom Key</Text>
              <Text style={styles.settingDescription}>
                Switch back to using the default API key
              </Text>
            </View>
            <Text style={{ fontSize: 20, color: '#dc2626' }}>🗑️</Text>
          </TouchableOpacity>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Process Images</Text>
            <Text style={styles.settingDescription}>
              Automatically generate captions for new images
            </Text>
          </View>
          <Switch
            value={settings.autoProcessImages}
            onValueChange={(value) => {
              dispatch(setAutoProcessImages(value));
            }}
          />
        </View>
      </View>

      {/* Background Processing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background Processing</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Fetch Frequency</Text>
            <Text style={styles.settingDescription}>
              How often to process unprocessed images
            </Text>
          </View>
        </View>
        
        <View style={styles.frequencyOptions}>
          {frequencyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.frequencyOption,
                settings.backgroundFetchFrequency === option.value && styles.selectedOption,
              ]}
              onPress={() => handleFrequencyChange(option.value)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  settings.backgroundFetchFrequency === option.value && styles.selectedText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>WiFi Only</Text>
            <Text style={styles.settingDescription}>
              Only process images when connected to WiFi
            </Text>
          </View>
          <Switch
            value={settings.wifiOnly}
            onValueChange={(value) => {
              dispatch(setWifiOnly(value));
            }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Charging Only</Text>
            <Text style={styles.settingDescription}>
              Only process images when device is charging
            </Text>
          </View>
          <Switch
            value={settings.chargingOnly}
            onValueChange={(value) => {
              dispatch(setChargingOnly(value));
            }}
          />
        </View>
      </View>

      {/* Google Photos Integration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Google Photos Integration</Text>
        
        {isAuthenticated ? (
          <>
            <View style={styles.userInfo}>
              <Text style={{ fontSize: 20, color: '#34C759' }}>✅</Text>
              <Text style={styles.userInfoText}>
                Signed in as {user?.displayName || user?.email}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleGoogleSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Save to Google Photos</Text>
                <Text style={styles.settingDescription}>
                  Upload processed images with captions to Google Photos
                </Text>
              </View>
              <Switch
                value={settings.saveToGooglePhotos}
                onValueChange={(value) => {
                  dispatch(setSaveToGooglePhotos(value));
                }}
              />
            </View>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleGoogleSignIn}
          >
            <Text style={{ fontSize: 20, color: 'white' }}>🔑</Text>
            <Text style={styles.signInButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingDescription}>Memora 2.0.0</Text>
          </View>
        </View>
      </View>

      {renderApiKeyModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  frequencyOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  frequencyText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});