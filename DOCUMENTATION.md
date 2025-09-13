# Memora App Documentation

## Overview

Memora is an Expo React Native application that automatically generates alt-text and narrated descriptions for photos using OpenAI's GPT-Vision API. The app helps make images more accessible by adding intelligent captions to your photo library.

## Features

### Core Functionality
- 📸 **Photo Capture**: Take new photos directly within the app
- 🖼️ **Photo Selection**: Choose existing photos from your device's library
- 🤖 **AI Description Generation**: Uses GPT-4o or GPT-4o-mini to generate:
  - Alt-text for accessibility (concise, screen-reader friendly)
  - Narrative descriptions (detailed, engaging descriptions)
- 💾 **Metadata Storage**: Stores generated descriptions linked to image data

### Background Processing
- 🔄 **Automatic Processing**: Configurable background processing for uncaptioned images
- ⏰ **Scheduled Execution**: Choose from daily, weekly, or manual processing
- 🔔 **Notifications**: Get notified when background processing completes
- ⚙️ **Configurable Options**: Enable/disable background processing as needed

### Settings & Configuration
- 🔑 **API Key Management**: Secure storage of OpenAI API keys
- 🎛️ **Model Selection**: Choose between GPT-4o and GPT-4o-mini
- 📝 **Description Options**: Configure which types of descriptions to generate
- 🚀 **Background Control**: Manage background processing settings

### Future Features (Placeholder)
- ☁️ **Google Integration**: Optional cloud sync and Google Photos import
- 👥 **User Accounts**: Optional Google login for cloud features

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd Memora
   npm install
   ```

2. **Configure API Key**
   - Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Open the app and go to Settings
   - Enter your API key and save

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   ```bash
   npm run ios     # iOS
   npm run android # Android
   npm run web     # Web browser
   ```

## Usage Guide

### First Time Setup
1. **Launch the app** - You'll see a setup banner if no API key is configured
2. **Go to Settings** - Tap the "⚙️ Settings" button
3. **Enter API Key** - Add your OpenAI API key and tap "Save & Test"
4. **Configure Options** - Adjust settings according to your preferences:
   - Choose GPT model (GPT-4o-mini is faster and cheaper)
   - Enable/disable alt-text and narrative generation
   - Configure background processing

### Taking and Processing Photos
1. **Capture New Photo**: Tap "📸 Capture Photo" to take a new picture
2. **Select from Library**: Tap "🖼️ Select from Library" to choose an existing photo
3. **Process Uncaptioned**: Tap "🔄 Process Uncaptioned" to batch process recent photos without descriptions

### Background Processing
- **Enable**: Go to Settings > Background Processing > Enable Background Processing
- **Set Frequency**: Choose Daily, Weekly, or Manual Only
- **Test**: Use "Test Background Processing" to run a manual test
- **Monitor**: Check recent processing on the home screen

## Configuration Options

### GPT Models
- **GPT-4o-mini**: Faster, more cost-effective, good quality descriptions
- **GPT-4o**: Higher quality descriptions, slower, more expensive

### Background Processing
- **Daily**: Processes new photos once per day
- **Weekly**: Processes new photos once per week  
- **Manual**: Only processes when manually triggered

### Description Types
- **Alt Text**: Short, accessible descriptions suitable for screen readers
- **Narrative**: Longer, engaging descriptions that capture mood and context

## Technical Architecture

### Services
- **SettingsService**: Manages app configuration and user preferences
- **OpenAIService**: Handles GPT-Vision API communication
- **ImageService**: Manages photo capture, selection, and processing
- **BackgroundTaskService**: Handles scheduled background processing
- **GoogleAuthService**: Placeholder for future Google integration

### Screens
- **HomeScreen**: Main interface for photo capture and recent activity
- **SettingsScreen**: Configuration and preferences management

### Storage
- **AsyncStorage**: Non-sensitive app settings and processed image records
- **SecureStore**: Sensitive data like API keys
- **Media Library**: Device photo storage with metadata

## Privacy & Security

### Data Protection
- API keys are stored securely using Expo SecureStore
- Image processing is done on-demand; no images are stored on external servers
- Generated descriptions are stored locally on the device

### Permissions
- **Camera**: Required for photo capture
- **Photo Library**: Required for photo selection and access
- **Background Processing**: Required for automatic processing
- **Notifications**: Used to notify about background processing completion

## Troubleshooting

### Common Issues

**"Setup required" message**
- Ensure you have a valid OpenAI API key
- Check that the API key is correctly entered in Settings

**Background processing not working**
- Verify background processing is enabled in Settings
- Check that you have a valid API key configured
- Ensure the app has necessary permissions

**Photos not processing**
- Check your internet connection
- Verify your OpenAI API key has sufficient credits
- Try selecting a different GPT model

**Permission errors**
- Grant camera and photo library permissions when prompted
- Check device settings if permissions were previously denied

### Support
For issues and questions, please check the app logs and ensure all permissions are granted.

## Development

### Project Structure
```
src/
├── config/
│   └── constants.js          # App configuration constants
├── screens/
│   ├── HomeScreen.js         # Main app interface
│   └── SettingsScreen.js     # Settings and configuration
└── services/
    ├── BackgroundTaskService.js  # Background processing
    ├── GoogleAuthService.js     # Google integration (placeholder)
    ├── ImageService.js          # Photo handling
    ├── OpenAIService.js         # GPT-Vision API
    └── SettingsService.js       # App settings management
```

### Adding Features
1. **New Services**: Add to `src/services/`
2. **New Screens**: Add to `src/screens/` and update navigation in `App.js`
3. **Configuration**: Update `src/config/constants.js` for new settings
4. **Permissions**: Update `app.json` for new system permissions

### Testing
- Use the web version for quick UI testing: `npm run web`
- Test on actual devices for camera and background processing features
- Use the "Test Background Processing" feature in Settings for debugging

## API Costs

### OpenAI Pricing (Approximate)
- **GPT-4o-mini**: ~$0.01 per image description
- **GPT-4o**: ~$0.05 per image description

Processing 100 photos daily would cost approximately:
- GPT-4o-mini: ~$1/day or ~$30/month
- GPT-4o: ~$5/day or ~$150/month

Choose GPT-4o-mini for regular use and GPT-4o for higher quality when needed.