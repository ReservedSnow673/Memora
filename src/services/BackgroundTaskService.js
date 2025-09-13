import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { CONFIG } from '../config/constants';
import { SettingsService } from './SettingsService';
import { ImageService } from './ImageService';

// Define the background task
TaskManager.defineTask(CONFIG.BACKGROUND_TASK_NAME, async () => {
  try {
    console.log('Background task started');
    
    const settings = await SettingsService.getSettings();
    if (!settings.backgroundProcessingEnabled) {
      console.log('Background processing disabled');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const apiKey = await SettingsService.getApiKey();
    if (!apiKey) {
      console.log('No API key configured, skipping background processing');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Process uncaptioned images
    const processedImages = await ImageService.processUncaptionedImages();
    
    if (processedImages.length > 0) {
      // Send notification about processed images
      await BackgroundTaskService.sendNotification(
        'Memora Processing Complete',
        `Added descriptions to ${processedImages.length} image(s)`
      );
      
      console.log(`Background task processed ${processedImages.length} images`);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log('No new images to process');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundTaskService {
  static async initialize() {
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission not granted');
      }

      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      return true;
    } catch (error) {
      console.error('Error initializing background tasks:', error);
      return false;
    }
  }

  static async registerBackgroundTask() {
    try {
      const settings = await SettingsService.getSettings();
      
      if (!settings.backgroundProcessingEnabled) {
        await this.unregisterBackgroundTask();
        return false;
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(CONFIG.BACKGROUND_TASK_NAME);
      
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(CONFIG.BACKGROUND_TASK_NAME);
      }

      const frequency = CONFIG.BACKGROUND_FREQUENCIES[settings.backgroundFrequency];
      if (!frequency.interval) {
        // Manual only - don't register background task
        return false;
      }

      await BackgroundFetch.registerTaskAsync(CONFIG.BACKGROUND_TASK_NAME, {
        minimumInterval: Math.max(frequency.interval / 1000, 15 * 60), // At least 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background task registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering background task:', error);
      return false;
    }
  }

  static async unregisterBackgroundTask() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(CONFIG.BACKGROUND_TASK_NAME);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(CONFIG.BACKGROUND_TASK_NAME);
        console.log('Background task unregistered');
      }
    } catch (error) {
      console.error('Error unregistering background task:', error);
    }
  }

  static async getBackgroundTaskStatus() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(CONFIG.BACKGROUND_TASK_NAME);
      const status = isRegistered ? await BackgroundFetch.getStatusAsync() : null;
      
      return {
        isRegistered,
        status,
        statusText: this.getStatusText(status),
      };
    } catch (error) {
      console.error('Error getting background task status:', error);
      return {
        isRegistered: false,
        status: null,
        statusText: 'Unknown',
      };
    }
  }

  static getStatusText(status) {
    switch (status) {
      case BackgroundFetch.BackgroundFetchStatus.Available:
        return 'Available';
      case BackgroundFetch.BackgroundFetchStatus.Denied:
        return 'Denied';
      case BackgroundFetch.BackgroundFetchStatus.Restricted:
        return 'Restricted';
      default:
        return 'Unknown';
    }
  }

  static async sendNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: false,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static async testBackgroundProcessing() {
    try {
      console.log('Testing background processing...');
      
      const settings = await SettingsService.getSettings();
      const apiKey = await SettingsService.getApiKey();
      
      if (!apiKey) {
        throw new Error('No API key configured');
      }

      if (!settings.backgroundProcessingEnabled) {
        throw new Error('Background processing is disabled');
      }

      // Run the background task manually
      const processedImages = await ImageService.processUncaptionedImages();
      
      await this.sendNotification(
        'Memora Test Complete',
        `Processed ${processedImages.length} image(s) in test run`
      );

      return {
        success: true,
        processedCount: processedImages.length,
      };
    } catch (error) {
      console.error('Background processing test failed:', error);
      await this.sendNotification(
        'Memora Test Failed',
        error.message
      );
      throw error;
    }
  }
}