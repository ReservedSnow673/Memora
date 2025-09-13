// App configuration constants
export const CONFIG = {
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  BACKGROUND_TASK_NAME: 'MEMORA_BACKGROUND_PROCESSING',
  DEFAULT_SETTINGS: {
    backgroundProcessingEnabled: true,
    backgroundFrequency: 'daily', // daily, weekly, manual
    gptModel: 'gpt-4o-mini', // gpt-4o, gpt-4o-mini
    generateAltText: true,
    generateNarrativeDescription: true,
    apiKey: null,
    googleAuthEnabled: false,
  },
  STORAGE_KEYS: {
    SETTINGS: 'memora_settings',
    API_KEY: 'memora_api_key',
    PROCESSED_IMAGES: 'memora_processed_images',
    GOOGLE_AUTH: 'memora_google_auth',
  },
  GPT_MODELS: {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
  },
  BACKGROUND_FREQUENCIES: {
    daily: { interval: 24 * 60 * 60 * 1000, label: 'Daily' },
    weekly: { interval: 7 * 24 * 60 * 60 * 1000, label: 'Weekly' },
    manual: { interval: null, label: 'Manual Only' },
  },
};