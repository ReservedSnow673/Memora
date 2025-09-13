import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageData, AppSettings, User, ProcessingJob } from '../../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../../utils/constants';

class StorageService {
  /**
   * Store images data
   */
  async storeImages(images: ImageData[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(images);
      await AsyncStorage.setItem(STORAGE_KEYS.IMAGES, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing images:', error);
      return false;
    }
  }

  /**
   * Retrieve images data
   */
  async getImages(): Promise<ImageData[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.IMAGES);
      if (jsonValue === null) {
        return [];
      }
      
      const images = JSON.parse(jsonValue);
      // Convert date strings back to Date objects
      return images.map((img: any) => ({
        ...img,
        createdAt: new Date(img.createdAt),
      }));
    } catch (error) {
      console.error('Error getting images:', error);
      return [];
    }
  }

  /**
   * Add a new image
   */
  async addImage(newImage: ImageData): Promise<boolean> {
    try {
      const existingImages = await this.getImages();
      const updatedImages = [newImage, ...existingImages];
      return await this.storeImages(updatedImages);
    } catch (error) {
      console.error('Error adding image:', error);
      return false;
    }
  }

  /**
   * Update an existing image
   */
  async updateImage(imageId: string, updates: Partial<ImageData>): Promise<boolean> {
    try {
      const existingImages = await this.getImages();
      const updatedImages = existingImages.map(img =>
        img.id === imageId ? { ...img, ...updates } : img
      );
      return await this.storeImages(updatedImages);
    } catch (error) {
      console.error('Error updating image:', error);
      return false;
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const existingImages = await this.getImages();
      const updatedImages = existingImages.filter(img => img.id !== imageId);
      return await this.storeImages(updatedImages);
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Delete multiple images
   */
  async deleteImages(imageIds: string[]): Promise<boolean> {
    try {
      const existingImages = await this.getImages();
      const idsToDelete = new Set(imageIds);
      const updatedImages = existingImages.filter(img => !idsToDelete.has(img.id));
      return await this.storeImages(updatedImages);
    } catch (error) {
      console.error('Error deleting images:', error);
      return false;
    }
  }

  /**
   * Store app settings
   */
  async storeSettings(settings: AppSettings): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing settings:', error);
      return false;
    }
  }

  /**
   * Retrieve app settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (jsonValue === null) {
        return DEFAULT_SETTINGS;
      }
      
      const settings = JSON.parse(jsonValue);
      // Merge with default settings to ensure all properties exist
      return { ...DEFAULT_SETTINGS, ...settings };
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Store user data
   */
  async storeUser(user: User): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing user:', error);
      return false;
    }
  }

  /**
   * Retrieve user data
   */
  async getUser(): Promise<User | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (jsonValue === null) {
        return null;
      }
      
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Clear user data (sign out)
   */
  async clearUser(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      return true;
    } catch (error) {
      console.error('Error clearing user:', error);
      return false;
    }
  }

  /**
   * Store processing queue
   */
  async storeProcessingQueue(queue: ProcessingJob[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(queue);
      await AsyncStorage.setItem(STORAGE_KEYS.PROCESSING_QUEUE, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing processing queue:', error);
      return false;
    }
  }

  /**
   * Retrieve processing queue
   */
  async getProcessingQueue(): Promise<ProcessingJob[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PROCESSING_QUEUE);
      if (jsonValue === null) {
        return [];
      }
      
      const queue = JSON.parse(jsonValue);
      // Convert date strings back to Date objects
      return queue.map((job: any) => ({
        ...job,
        createdAt: new Date(job.createdAt),
        completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error getting processing queue:', error);
      return [];
    }
  }

  /**
   * Store last scan time
   */
  async storeLastScanTime(date: Date): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(date.toISOString());
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN_TIME, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing last scan time:', error);
      return false;
    }
  }

  /**
   * Retrieve last scan time
   */
  async getLastScanTime(): Promise<Date | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN_TIME);
      if (jsonValue === null) {
        return null;
      }
      
      const dateString = JSON.parse(jsonValue);
      return new Date(dateString);
    } catch (error) {
      console.error('Error getting last scan time:', error);
      return null;
    }
  }

  /**
   * Clear all app data
   */
  async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.IMAGES,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.PROCESSING_QUEUE,
        STORAGE_KEYS.LAST_SCAN_TIME,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  /**
   * Get storage info for debugging
   */
  async getStorageInfo(): Promise<{
    imagesCount: number;
    queueLength: number;
    hasUser: boolean;
    lastScanTime: Date | null;
    estimatedSize: number;
  }> {
    try {
      const [images, queue, user, lastScanTime] = await Promise.all([
        this.getImages(),
        this.getProcessingQueue(),
        this.getUser(),
        this.getLastScanTime(),
      ]);

      // Rough estimation of storage size
      const estimatedSize = JSON.stringify(images).length + 
                          JSON.stringify(queue).length + 
                          (user ? JSON.stringify(user).length : 0);

      return {
        imagesCount: images.length,
        queueLength: queue.length,
        hasUser: user !== null,
        lastScanTime,
        estimatedSize,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        imagesCount: 0,
        queueLength: 0,
        hasUser: false,
        lastScanTime: null,
        estimatedSize: 0,
      };
    }
  }

  /**
   * Backup data to a JSON string
   */
  async backupData(): Promise<string | null> {
    try {
      const [images, settings, user, queue, lastScanTime] = await Promise.all([
        this.getImages(),
        this.getSettings(),
        this.getUser(),
        this.getProcessingQueue(),
        this.getLastScanTime(),
      ]);

      const backup = {
        images,
        settings,
        user,
        queue,
        lastScanTime,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  /**
   * Restore data from a JSON string
   */
  async restoreData(backupJson: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupJson);
      
      // Validate backup structure
      if (!backup.version || !backup.exportedAt) {
        throw new Error('Invalid backup format');
      }

      // Restore data
      const promises: Promise<boolean>[] = [];
      
      if (backup.images) {
        promises.push(this.storeImages(backup.images));
      }
      
      if (backup.settings) {
        promises.push(this.storeSettings(backup.settings));
      }
      
      if (backup.user) {
        promises.push(this.storeUser(backup.user));
      }
      
      if (backup.queue) {
        promises.push(this.storeProcessingQueue(backup.queue));
      }
      
      if (backup.lastScanTime) {
        promises.push(this.storeLastScanTime(new Date(backup.lastScanTime)));
      }

      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();