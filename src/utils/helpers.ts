import { ImageData, AppSettings } from '../types';
import { APP_CONFIG } from './constants';

/**
 * Generate a unique ID for images
 */
export const generateImageId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate image file size and format
 */
export const validateImage = (uri: string, fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? APP_CONFIG.SUPPORTED_IMAGE_FORMATS.includes(extension) : false;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Check if scanning should occur based on settings
 */
export const shouldPerformScan = (
  settings: AppSettings,
  lastScanTime?: Date,
  isConnectedToWifi: boolean = false,
  isCharging: boolean = false
): boolean => {
  if (!settings.autoScanEnabled) return false;
  
  // Check WiFi requirement
  if (settings.scanOnWifiOnly && !isConnectedToWifi) return false;
  
  // Check charging requirement
  if (settings.scanOnCharging && !isCharging) return false;
  
  // Check time restrictions
  if (settings.scanTimeRestriction.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseTimeString(settings.scanTimeRestriction.startTime);
    const endTime = parseTimeString(settings.scanTimeRestriction.endTime);
    
    if (currentTime < startTime || currentTime > endTime) return false;
  }
  
  // Check frequency
  if (!lastScanTime) return true;
  
  const daysSinceLastScan = Math.floor(
    (Date.now() - lastScanTime.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const requiredDays = settings.scanFrequency === 'daily' ? 1 :
                      settings.scanFrequency === 'weekly' ? 7 :
                      settings.customDays;
  
  return daysSinceLastScan >= requiredDays;
};

/**
 * Parse time string (HH:MM) to minutes
 */
const parseTimeString = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Get accessible font size based on settings
 */
export const getAccessibleFontSize = (
  baseSize: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge',
  dynamicFontSize: boolean,
  fontScale: number = 1
): number => {
  const baseSizes = {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
  };
  
  const size = baseSizes[baseSize];
  
  if (dynamicFontSize) {
    return Math.round(size * fontScale);
  }
  
  return size;
};

/**
 * Debounce function for search and input handling
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Chunk array into smaller arrays of specified size
 */
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};