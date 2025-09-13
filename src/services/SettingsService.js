import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../config/constants';

export class SettingsService {
  static async getSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
      const settings = settingsJson ? JSON.parse(settingsJson) : {};
      return { ...CONFIG.DEFAULT_SETTINGS, ...settings };
    } catch (error) {
      console.error('Error getting settings:', error);
      return CONFIG.DEFAULT_SETTINGS;
    }
  }

  static async updateSettings(newSettings) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await AsyncStorage.setItem(
        CONFIG.STORAGE_KEYS.SETTINGS,
        JSON.stringify(updatedSettings)
      );
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  static async getApiKey() {
    try {
      return await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  static async setApiKey(apiKey) {
    try {
      if (apiKey) {
        await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.API_KEY, apiKey);
      } else {
        await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.API_KEY);
      }
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  }

  static async getProcessedImages() {
    try {
      const processedJson = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.PROCESSED_IMAGES);
      return processedJson ? JSON.parse(processedJson) : {};
    } catch (error) {
      console.error('Error getting processed images:', error);
      return {};
    }
  }

  static async markImageAsProcessed(imageId, description) {
    try {
      const processed = await this.getProcessedImages();
      processed[imageId] = {
        processedAt: new Date().toISOString(),
        description,
      };
      await AsyncStorage.setItem(
        CONFIG.STORAGE_KEYS.PROCESSED_IMAGES,
        JSON.stringify(processed)
      );
    } catch (error) {
      console.error('Error marking image as processed:', error);
      throw error;
    }
  }
}