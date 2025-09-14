import { OpenAIResponse } from '../types';
import * as FileSystem from 'expo-file-system';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Default API key - replace with your actual OpenAI API key
const DEFAULT_OPENAI_API_KEY = 'sk-proj-_VlzIbwSuFVGrK3Fb4i1YSQQ8zcEkQpBQZ7V6fOd_h7_6-w4GlnwjOhfA7T3BlbkFJe1_oU8rZYh0U5rGzN9fH5m-K2mRcGYv8pC7dT6zMqJh4v3C8i-L9eB2tX5sP1r9';

export class OpenAIService {
  private apiKey: string;

  constructor(userApiKey?: string) {
    // Use user's API key if provided, otherwise fallback to default
    this.apiKey = userApiKey && userApiKey.trim() !== '' ? userApiKey : DEFAULT_OPENAI_API_KEY;
  }

  async generateImageCaption(
    imageUri: string, 
    isLongDescription: boolean = false
  ): Promise<string> {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const prompt = isLongDescription 
        ? "You are an agent describing images to a blind person. There is an image attached with this prompt, describe it to a blind person in 1000 characters or less, but make sure the description is not generic. For example, for a kid smiling while cutting a cake, don't just describe it as \"Person cutting birthday cake\", make sure the description has the image. Only give me the image description, no other commentary."
        : "You are an agent describing images to a blind person. There is an image attached with this prompt, describe it to a blind person in 150 characters or less, but make sure the description is not generic. For example, for a kid smiling while cutting a cake, don't just describe it as \"Person cutting birthday cake\", make sure the description has the image. Only give me the image description, no other commentary.";

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using the more affordable mini model
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'low', // Use low detail to reduce cost
                  },
                },
              ],
            },
          ],
          max_tokens: isLongDescription ? 200 : 100,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No caption generated');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating caption:', error);
      
      // Return a fallback caption for demo purposes
      if (isLongDescription) {
        return "This is a detailed description of the image. The AI captioning service is currently unavailable, but this demonstrates how the detailed caption would appear in the app interface.";
      } else {
        return "Image caption unavailable - demo mode";
      }
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // Use Expo FileSystem to read the image as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

export const createOpenAIService = (userApiKey?: string) => new OpenAIService(userApiKey);

// Helper function to check if we have a valid API key
export const hasValidApiKey = (userApiKey?: string): boolean => {
  const apiKey = userApiKey && userApiKey.trim() !== '' ? userApiKey : DEFAULT_OPENAI_API_KEY;
  return apiKey !== 'sk-your-default-openai-api-key-here' && apiKey.startsWith('sk-');
};

// Helper function to get the current API key being used
export const getCurrentApiKey = (userApiKey?: string): string => {
  return userApiKey && userApiKey.trim() !== '' ? userApiKey : DEFAULT_OPENAI_API_KEY;
};