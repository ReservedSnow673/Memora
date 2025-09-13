import OpenAI from 'openai';
import { OPENAI_CONFIG, APP_CONFIG } from '../../utils/constants';

export interface VisionResponse {
  success: boolean;
  altText?: string;
  detailedDescription?: string;
  error?: string;
}

export interface ImageProcessingResult {
  imageId: string;
  success: boolean;
  altText?: string;
  detailedDescription?: string;
  error?: string;
  processingTime: number;
}

class OpenAIService {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  /**
   * Initialize OpenAI client with API key
   */
  initialize(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.client !== null && this.apiKey !== null;
  }

  /**
   * Convert image URI to base64 for API submission
   */
  private async imageToBase64(uri: string): Promise<string> {
    try {
      // For React Native, we can use the uri directly if it's already base64
      // or use expo-file-system to read the file
      if (uri.startsWith('data:')) {
        // Already base64 encoded
        return uri.split(',')[1];
      }

      // For local files, we'll use fetch to get the blob and convert
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convert blob to base64 using arrayBuffer (React Native compatible)
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  /**
   * Generate alt text for an image
   */
  async generateAltText(imageUri: string): Promise<VisionResponse> {
    if (!this.isInitialized()) {
      return {
        success: false,
        error: 'OpenAI service not initialized. Please provide an API key.',
      };
    }

    try {
      const base64Image = await this.imageToBase64(imageUri);
      
      const response = await this.client!.chat.completions.create({
        model: OPENAI_CONFIG.MODEL,
        max_tokens: 50, // Short for alt text
        temperature: OPENAI_CONFIG.TEMPERATURE,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Generate a concise alt text description for this image in 15 words or less. Focus on the main subject and key visual elements that would be important for accessibility. Do not include "Image of" or "Photo of" in your response.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'low', // Lower detail for faster processing
                },
              },
            ],
          },
        ],
      });

      const altText = response.choices[0]?.message?.content?.trim();
      
      if (!altText) {
        return {
          success: false,
          error: 'No alt text generated',
        };
      }

      return {
        success: true,
        altText,
      };
    } catch (error) {
      console.error('Error generating alt text:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate detailed description for an image
   */
  async generateDetailedDescription(imageUri: string): Promise<VisionResponse> {
    if (!this.isInitialized()) {
      return {
        success: false,
        error: 'OpenAI service not initialized. Please provide an API key.',
      };
    }

    try {
      const base64Image = await this.imageToBase64(imageUri);
      
      const response = await this.client!.chat.completions.create({
        model: OPENAI_CONFIG.MODEL,
        max_tokens: OPENAI_CONFIG.MAX_TOKENS,
        temperature: OPENAI_CONFIG.TEMPERATURE,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Provide a detailed description of this image that could be used for screen reader narration. Include information about the setting, objects, people, colors, lighting, mood, and any text visible in the image. Write in a narrative style that would be helpful for someone who cannot see the image.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high', // High detail for comprehensive description
                },
              },
            ],
          },
        ],
      });

      const detailedDescription = response.choices[0]?.message?.content?.trim();
      
      if (!detailedDescription) {
        return {
          success: false,
          error: 'No detailed description generated',
        };
      }

      return {
        success: true,
        detailedDescription,
      };
    } catch (error) {
      console.error('Error generating detailed description:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate both alt text and detailed description
   */
  async processImage(imageId: string, imageUri: string): Promise<ImageProcessingResult> {
    const startTime = Date.now();

    if (!this.isInitialized()) {
      return {
        imageId,
        success: false,
        error: 'OpenAI service not initialized. Please provide an API key.',
        processingTime: Date.now() - startTime,
      };
    }

    try {
      // Generate both alt text and detailed description in parallel
      const [altTextResult, detailedResult] = await Promise.all([
        this.generateAltText(imageUri),
        this.generateDetailedDescription(imageUri),
      ]);

      // Check if both succeeded
      if (!altTextResult.success && !detailedResult.success) {
        return {
          imageId,
          success: false,
          error: `Alt text: ${altTextResult.error}, Description: ${detailedResult.error}`,
          processingTime: Date.now() - startTime,
        };
      }

      // Return partial success if at least one succeeded
      return {
        imageId,
        success: true,
        altText: altTextResult.altText,
        detailedDescription: detailedResult.detailedDescription,
        error: !altTextResult.success ? `Alt text failed: ${altTextResult.error}` :
               !detailedResult.success ? `Description failed: ${detailedResult.error}` :
               undefined,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        imageId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Process multiple images in batch
   */
  async processBatch(
    images: Array<{ id: string; uri: string }>,
    onProgress?: (completed: number, total: number, currentImage: string) => void
  ): Promise<ImageProcessingResult[]> {
    const results: ImageProcessingResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      onProgress?.(i, images.length, image.id);
      
      try {
        const result = await this.processImage(image.id, image.uri);
        results.push(result);
        
        // Add small delay between requests to avoid rate limiting
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          imageId: image.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          processingTime: 0,
        });
      }
    }
    
    onProgress?.(images.length, images.length, '');
    return results;
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized()) {
      return {
        success: false,
        error: 'OpenAI service not initialized',
      };
    }

    try {
      // Simple test request
      const response = await this.client!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Say "test"',
          },
        ],
      });

      if (response.choices[0]?.message?.content) {
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Invalid response from OpenAI',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get current usage statistics (if available)
   */
  async getUsageStats(): Promise<{
    success: boolean;
    totalTokens?: number;
    error?: string;
  }> {
    // Note: OpenAI doesn't provide usage stats through the API
    // This would need to be tracked client-side or through OpenAI dashboard
    return {
      success: false,
      error: 'Usage statistics not available through API',
    };
  }
}

export const openAIService = new OpenAIService();