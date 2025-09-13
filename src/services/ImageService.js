import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { SettingsService } from './SettingsService';
import { OpenAIService } from './OpenAIService';

export class ImageService {
  static async requestPermissions() {
    try {
      // Request camera permissions
      const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
      const libraryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const mediaLibraryResult = await MediaLibrary.requestPermissionsAsync();

      return {
        camera: cameraResult.status === 'granted',
        library: libraryResult.status === 'granted',
        mediaLibrary: mediaLibraryResult.status === 'granted',
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {
        camera: false,
        library: false,
        mediaLibrary: false,
      };
    }
  }

  static async capturePhoto() {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.camera) {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Error capturing photo:', error);
      throw error;
    }
  }

  static async selectPhoto() {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.library) {
        throw new Error('Photo library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Error selecting photo:', error);
      throw error;
    }
  }

  static async processImage(imageAsset) {
    try {
      const settings = await SettingsService.getSettings();
      
      // Generate description using OpenAI
      const description = await OpenAIService.generateImageDescription(
        imageAsset.uri,
        settings.generateAltText,
        settings.generateNarrativeDescription
      );

      // Create processed image record
      const processedImage = {
        id: this.generateImageId(imageAsset),
        uri: imageAsset.uri,
        width: imageAsset.width,
        height: imageAsset.height,
        altText: description.altText || '',
        narrative: description.narrative || '',
        processedAt: new Date().toISOString(),
        originalMetadata: imageAsset.exif || {},
      };

      // Mark as processed in storage
      await SettingsService.markImageAsProcessed(processedImage.id, description);

      // If the image is from camera, save it to media library with metadata
      if (imageAsset.uri.includes('ImagePicker')) {
        await this.saveToMediaLibrary(imageAsset, description);
      }

      return processedImage;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  static async saveToMediaLibrary(imageAsset, description) {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.mediaLibrary) {
        console.warn('Media library permission not granted, cannot save image');
        return;
      }

      // Save the image to media library
      const asset = await MediaLibrary.createAssetAsync(imageAsset.uri);
      
      // Note: React Native doesn't allow direct EXIF modification
      // In a real implementation, you might want to use a native module
      // or save the metadata in a separate database
      console.log('Image saved to media library:', asset.id);
      return asset;
    } catch (error) {
      console.error('Error saving to media library:', error);
      throw error;
    }
  }

  static async getUncaptionedImages() {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.mediaLibrary) {
        return [];
      }

      // Get recent images from media library
      const albumResult = await MediaLibrary.getAlbumsAsync();
      const cameraRoll = albumResult.find(album => album.title === 'Camera Roll') || albumResult[0];
      
      if (!cameraRoll) {
        return [];
      }

      const assetsResult = await MediaLibrary.getAssetsAsync({
        album: cameraRoll,
        mediaType: MediaLibrary.MediaType.photo,
        first: 100, // Limit to recent 100 photos
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const processedImages = await SettingsService.getProcessedImages();
      
      // Filter out already processed images
      const uncaptionedImages = assetsResult.assets.filter(asset => {
        const imageId = this.generateImageId({ uri: asset.uri, width: asset.width, height: asset.height });
        return !processedImages[imageId];
      });

      return uncaptionedImages;
    } catch (error) {
      console.error('Error getting uncaptioned images:', error);
      return [];
    }
  }

  static generateImageId(imageAsset) {
    // Generate a consistent ID based on image properties
    const identifier = `${imageAsset.uri}_${imageAsset.width}x${imageAsset.height}`;
    return btoa(identifier).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  static async processUncaptionedImages() {
    try {
      const uncaptionedImages = await this.getUncaptionedImages();
      console.log(`Found ${uncaptionedImages.length} uncaptioned images`);

      const results = [];
      for (const asset of uncaptionedImages.slice(0, 5)) { // Process max 5 at a time
        try {
          const imageAsset = {
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          };
          const processedImage = await this.processImage(imageAsset);
          results.push(processedImage);
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing image ${asset.id}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing uncaptioned images:', error);
      throw error;
    }
  }
}