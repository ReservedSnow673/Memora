/**
 * Memora Demo Script
 * 
 * This script demonstrates the core functionality of the Memora app
 * for testing and validation purposes.
 */

// Import required services
const { SettingsService } = require('./src/services/SettingsService');
const { OpenAIService } = require('./src/services/OpenAIService');
const { CONFIG } = require('./src/config/constants');

// Mock implementations for Node.js environment
global.btoa = (str) => Buffer.from(str).toString('base64');
global.fetch = require('node-fetch').default || require('node-fetch');

// Mock AsyncStorage for testing
const mockStorage = {};
const AsyncStorage = {
  getItem: async (key) => mockStorage[key] || null,
  setItem: async (key, value) => { mockStorage[key] = value; },
  removeItem: async (key) => { delete mockStorage[key]; },
};

// Mock SecureStore for testing
const mockSecureStorage = {};
const SecureStore = {
  getItemAsync: async (key) => mockSecureStorage[key] || null,
  setItemAsync: async (key, value) => { mockSecureStorage[key] = value; },
  deleteItemAsync: async (key) => { delete mockSecureStorage[key]; },
};

// Make mocks available globally
global.AsyncStorage = AsyncStorage;
global.SecureStore = SecureStore;

/**
 * Demo function to test settings management
 */
async function demoSettings() {
  console.log('\n=== Settings Demo ===');
  
  try {
    // Get default settings
    console.log('1. Loading default settings...');
    const defaultSettings = await SettingsService.getSettings();
    console.log('Default settings:', JSON.stringify(defaultSettings, null, 2));
    
    // Update settings
    console.log('\n2. Updating settings...');
    await SettingsService.updateSettings({
      gptModel: 'gpt-4o',
      backgroundProcessingEnabled: false,
    });
    
    const updatedSettings = await SettingsService.getSettings();
    console.log('Updated settings:', JSON.stringify(updatedSettings, null, 2));
    
    // Test API key storage
    console.log('\n3. Testing API key storage...');
    await SettingsService.setApiKey('test-api-key-12345');
    const retrievedKey = await SettingsService.getApiKey();
    console.log('Stored and retrieved API key:', retrievedKey);
    
    console.log('✅ Settings demo completed successfully');
  } catch (error) {
    console.error('❌ Settings demo failed:', error.message);
  }
}

/**
 * Demo function to test OpenAI service (without actual API call)
 */
async function demoOpenAIService() {
  console.log('\n=== OpenAI Service Demo ===');
  
  try {
    console.log('1. Testing prompt generation...');
    
    // Test prompt generation
    const promptWithBoth = OpenAIService.generatePrompt(true, true);
    console.log('Prompt for both alt-text and narrative:');
    console.log(promptWithBoth);
    
    const promptAltOnly = OpenAIService.generatePrompt(true, false);
    console.log('\nPrompt for alt-text only:');
    console.log(promptAltOnly);
    
    console.log('\n2. Testing description parsing...');
    
    // Test description parsing
    const sampleResponse = `ALT_TEXT: A golden retriever sitting in a sunny park with green grass and blue sky in the background.

NARRATIVE: This heartwarming scene captures a beautiful golden retriever enjoying a peaceful moment in what appears to be a local park. The dog sits attentively on lush green grass, with warm sunlight casting a gentle glow across the scene. Behind the friendly canine, a brilliant blue sky dotted with white clouds creates a perfect backdrop, suggesting this photo was taken on a lovely day perfect for outdoor activities.`;
    
    const parsed = OpenAIService.parseDescription(sampleResponse, true, true);
    console.log('Parsed description:', JSON.stringify(parsed, null, 2));
    
    console.log('\n3. Testing base64 conversion simulation...');
    // Note: In real app, this would convert actual image files
    console.log('Base64 conversion would happen here for actual image files');
    
    console.log('✅ OpenAI service demo completed successfully');
  } catch (error) {
    console.error('❌ OpenAI service demo failed:', error.message);
  }
}

/**
 * Demo function to test configuration constants
 */
async function demoConfiguration() {
  console.log('\n=== Configuration Demo ===');
  
  try {
    console.log('1. Available GPT models:');
    console.log(CONFIG.GPT_MODELS);
    
    console.log('\n2. Background frequencies:');
    console.log(CONFIG.BACKGROUND_FREQUENCIES);
    
    console.log('\n3. Default settings:');
    console.log(JSON.stringify(CONFIG.DEFAULT_SETTINGS, null, 2));
    
    console.log('\n4. Storage keys:');
    console.log(CONFIG.STORAGE_KEYS);
    
    console.log('✅ Configuration demo completed successfully');
  } catch (error) {
    console.error('❌ Configuration demo failed:', error.message);
  }
}

/**
 * Run all demos
 */
async function runAllDemos() {
  console.log('🚀 Starting Memora Demo Script');
  console.log('=====================================');
  
  await demoConfiguration();
  await demoSettings();
  await demoOpenAIService();
  
  console.log('\n=====================================');
  console.log('🎉 Demo script completed!');
  console.log('\nTo test the full app:');
  console.log('1. npm start');
  console.log('2. Configure your OpenAI API key in Settings');
  console.log('3. Test photo capture and processing');
}

// Run demos if this script is executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  demoSettings,
  demoOpenAIService,
  demoConfiguration,
  runAllDemos,
};