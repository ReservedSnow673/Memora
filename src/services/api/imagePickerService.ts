import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { ImageData } from '../../types';
import { generateImageId, validateImage } from '../../utils/helpers';

export interface ImagePickerResult {
  success: boolean;
  imageData?: ImageData;
  error?: string;
}

export interface MediaLibraryAsset {
  id: string;
  filename: string;
  uri: string;
  mediaType: 'photo' | 'video';
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration: number;
}

class ImagePickerService {
  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Request media library write permissions
   */
  async requestMediaLibraryWritePermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library write permissions:', error);
      return false;
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(): Promise<ImagePickerResult> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Camera permission not granted',
        };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {
          success: false,
          error: 'Camera capture was cancelled',
        };
      }

      const asset = result.assets[0];
      const fileName = `photo_${Date.now()}.jpg`;

      if (!validateImage(asset.uri, fileName)) {
        return {
          success: false,
          error: 'Invalid image format',
        };
      }

      const imageData: ImageData = {
        id: generateImageId(),
        uri: asset.uri,
        fileName,
        createdAt: new Date(),
        isProcessed: false,
        metadata: {
          width: asset.width || 0,
          height: asset.height || 0,
          size: asset.fileSize || 0,
          type: asset.type || 'image/jpeg',
        },
      };

      return {
        success: true,
        imageData,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      return {
        success: false,
        error: 'Failed to take photo',
      };
    }
  }

  /**
   * Pick an image from the gallery
   */
  async pickImage(): Promise<ImagePickerResult> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Media library permission not granted',
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {
          success: false,
          error: 'Image selection was cancelled',
        };
      }

      const asset = result.assets[0];
      const fileName = asset.fileName || `selected_${Date.now()}.jpg`;

      if (!validateImage(asset.uri, fileName)) {
        return {
          success: false,
          error: 'Invalid image format',
        };
      }

      const imageData: ImageData = {
        id: generateImageId(),
        uri: asset.uri,
        fileName,
        createdAt: new Date(),
        isProcessed: false,
        metadata: {
          width: asset.width || 0,
          height: asset.height || 0,
          size: asset.fileSize || 0,
          type: asset.type || 'image/jpeg',
        },
      };

      return {
        success: true,
        imageData,
      };
    } catch (error) {
      console.error('Error picking image:', error);
      return {
        success: false,
        error: 'Failed to pick image',
      };
    }
  }

  /**
   * Get images from media library for scanning
   */
  async getMediaLibraryImages(
    limit: number = 20,
    after?: string
  ): Promise<{
    assets: MediaLibraryAsset[];
    endCursor?: string;
    hasNextPage: boolean;
  }> {
    try {
      const hasPermission = await this.requestMediaLibraryWritePermissions();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }

      const result = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: 'creationTime',
        first: limit,
        after: after,
      });

      const assets: MediaLibraryAsset[] = result.assets.map((asset) => ({
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        mediaType: 'photo' as const,
        width: asset.width,
        height: asset.height,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        duration: asset.duration,
      }));

      return {
        assets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
      };
    } catch (error) {
      console.error('Error getting media library images:', error);
      return {
        assets: [],
        hasNextPage: false,
      };
    }
  }

  /**
   * Convert media library asset to ImageData
   */
  convertAssetToImageData(asset: MediaLibraryAsset): ImageData {
    return {
      id: generateImageId(),
      uri: asset.uri,
      fileName: asset.filename,
      createdAt: new Date(asset.creationTime),
      isProcessed: false,
      metadata: {
        width: asset.width,
        height: asset.height,
        size: 0, // Size not available from MediaLibrary
        type: 'image/jpeg',
      },
    };
  }

  /**
   * Check if an image already exists in the provided list
   */
  isImageAlreadyExists(asset: MediaLibraryAsset, existingImages: ImageData[]): boolean {
    return existingImages.some(
      (img) =>
        img.fileName === asset.filename ||
        img.uri === asset.uri ||
        Math.abs(img.createdAt.getTime() - asset.creationTime) < 1000 // Within 1 second
    );
  }

  /**
   * Scan media library for new images
   */
  async scanForNewImages(
    existingImages: ImageData[],
    batchSize: number = 50
  ): Promise<ImageData[]> {
    try {
      const newImages: ImageData[] = [];
      let hasNextPage = true;
      let after: string | undefined;

      while (hasNextPage && newImages.length < batchSize) {
        const result = await this.getMediaLibraryImages(20, after);
        
        for (const asset of result.assets) {
          if (!this.isImageAlreadyExists(asset, existingImages)) {
            const imageData = this.convertAssetToImageData(asset);
            newImages.push(imageData);
            
            if (newImages.length >= batchSize) {
              break;
            }
          }
        }

        hasNextPage = result.hasNextPage;
        after = result.endCursor;
      }

      return newImages;
    } catch (error) {
      console.error('Error scanning for new images:', error);
      return [];
    }
  }
}

export const imagePickerService = new ImagePickerService();