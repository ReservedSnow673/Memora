import { CONFIG } from '../config/constants';
import { SettingsService } from './SettingsService';

export class OpenAIService {
  static async generateImageDescription(imageUri, generateAltText = true, generateNarrative = true) {
    try {
      const apiKey = await SettingsService.getApiKey();
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const settings = await SettingsService.getSettings();
      const model = settings.gptModel || 'gpt-4o-mini';

      // Convert image to base64
      const base64Image = await this.imageToBase64(imageUri);

      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: this.generatePrompt(generateAltText, generateNarrative),
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'auto',
              },
            },
          ],
        },
      ];

      const response = await fetch(CONFIG.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const description = data.choices[0]?.message?.content;

      if (!description) {
        throw new Error('No description generated');
      }

      return this.parseDescription(description, generateAltText, generateNarrative);
    } catch (error) {
      console.error('Error generating image description:', error);
      throw error;
    }
  }

  static generatePrompt(generateAltText, generateNarrative) {
    let prompt = 'Analyze this image and provide:\n';
    
    if (generateAltText) {
      prompt += '1. ALT_TEXT: A concise, accessible description suitable for screen readers (1-2 sentences)\n';
    }
    
    if (generateNarrative) {
      prompt += '2. NARRATIVE: A detailed, engaging description that captures the mood, context, and story of the image (2-3 sentences)\n';
    }

    prompt += '\nPlease format your response with clear labels for each section.';
    return prompt;
  }

  static parseDescription(description, generateAltText, generateNarrative) {
    const result = {};
    
    if (generateAltText) {
      const altTextMatch = description.match(/ALT_TEXT:\s*(.*?)(?=\n\d\.|NARRATIVE:|$)/s);
      result.altText = altTextMatch ? altTextMatch[1].trim() : '';
    }
    
    if (generateNarrative) {
      const narrativeMatch = description.match(/NARRATIVE:\s*(.*?)(?=\n\d\.|$)/s);
      result.narrative = narrativeMatch ? narrativeMatch[1].trim() : '';
    }

    // Fallback: if parsing fails, use the whole description
    if (!result.altText && !result.narrative) {
      if (generateAltText && generateNarrative) {
        result.altText = description.substring(0, 150);
        result.narrative = description;
      } else if (generateAltText) {
        result.altText = description;
      } else if (generateNarrative) {
        result.narrative = description;
      }
    }

    return result;
  }

  static async imageToBase64(imageUri) {
    try {
      // For web and file system paths
      if (imageUri.startsWith('http') || imageUri.startsWith('file')) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      // For React Native, use expo-file-system
      const { FileSystem } = require('expo-file-system');
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  static async testApiKey(apiKey) {
    try {
      const response = await fetch(CONFIG.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }
}