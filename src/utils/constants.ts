// OpenAI Configuration
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4o',
  MAX_TOKENS: 300,
  TEMPERATURE: 0.3,
};

// App Configuration
export const APP_CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  DEFAULT_SCAN_FREQUENCY_DAYS: 1,
  MAX_BATCH_SIZE: 10,
  PROCESSING_TIMEOUT: 30000, // 30 seconds
};

// AsyncStorage Keys
export const STORAGE_KEYS = {
  IMAGES: '@memora_images',
  SETTINGS: '@memora_settings',
  USER: '@memora_user',
  PROCESSING_QUEUE: '@memora_processing_queue',
  LAST_SCAN_TIME: '@memora_last_scan',
};

// Default Settings
export const DEFAULT_SETTINGS = {
  autoScanEnabled: false,
  scanFrequency: 'daily' as const,
  customDays: 1,
  scanOnWifiOnly: true,
  scanOnCharging: false,
  scanTimeRestriction: {
    enabled: false,
    startTime: '09:00',
    endTime: '21:00',
  },
  accessibility: {
    dynamicFontSize: false,
    highContrast: false,
    screenReaderOptimized: false,
  },
};

// Theme Configuration
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6D6D80',
  border: '#C6C6C8',
  // High Contrast
  highContrast: {
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    primary: '#0A84FF',
    secondary: '#BF5AF2',
    border: '#48484A',
  },
};

// Font Sizes
export const FONT_SIZES = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
  // Dynamic sizes
  dynamic: {
    small: { normal: 12, large: 16, xlarge: 20 },
    medium: { normal: 16, large: 20, xlarge: 24 },
    large: { normal: 20, large: 24, xlarge: 28 },
    xlarge: { normal: 24, large: 28, xlarge: 32 },
    xxlarge: { normal: 32, large: 36, xlarge: 40 },
  },
};