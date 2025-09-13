# Memora 2.0 - AI-Powered Image Captioning App

Memora is a React Native app that uses AI to automatically generate descriptive captions for your photos. It integrates with OpenAI's Vision API for image analysis and optionally syncs with Google Photos for cloud backup.

## Features

### Core Features
- **Image Capture & Captioning**: Capture photos or select from gallery and generate AI captions
- **Gallery View**: Browse all images with their generated captions
- **Settings**: Configure background processing, connectivity options, and integrations
- **Background Processing**: Automatically process new images at configured intervals

### AI Integration
- OpenAI Vision API for generating image captions
- Short descriptions (alt-text style) and detailed descriptions
- Configurable auto-processing of new images

### Google Integration (Optional)
- Firebase Authentication for Google sign-in
- Google Photos API integration for uploading images
- Sync captions to Google Photos metadata
- Fully functional without Google integration

### Technical Features
- React Native with Expo
- Redux Toolkit for state management
- React Navigation for routing
- Background fetch for automated processing
- Local storage with Redux Persist
- TypeScript for type safety

## Setup Instructions

### Prerequisites
1. Node.js 18+ installed
2. Expo CLI installed globally: `npm install -g @expo/cli`
3. OpenAI API key (required for AI captioning)
4. Firebase project (optional, for Google integration)
5. Google Photos API credentials (optional)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd "Memora 2.0"
   npm install
   ```

2. **Configure OpenAI API**
   - Get your API key from https://platform.openai.com/api-keys
   - Open the app and go to Settings
   - Enter your OpenAI API key

3. **Configure Firebase (Optional)**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication and add Google as a provider
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Update `src/services/firebase.ts` with your Firebase config

4. **Configure Google Photos API (Optional)**
   - Enable Google Photos API in Google Cloud Console
   - Create OAuth 2.0 credentials
   - Update the client IDs in `src/services/firebase.ts`

### Running the App

1. **Start Expo Development Server**
   ```bash
   npx expo start
   ```

2. **Run on Device/Simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

### Building for Production

1. **Build for iOS**
   ```bash
   npx expo build:ios
   ```

2. **Build for Android**
   ```bash
   npx expo build:android
   ```

## Configuration

### App Configuration (`app.json`)
The app is configured with all necessary permissions for:
- Camera access
- Photo library access
- Background processing
- Network access

### Environment Variables
Create a `.env` file (not included in repo) with:
```
OPENAI_API_KEY=your_openai_api_key_here
FIREBASE_API_KEY=your_firebase_api_key
GOOGLE_PHOTOS_CLIENT_ID=your_google_client_id
```

## Architecture

### State Management
- **Redux Toolkit** with the following slices:
  - `imagesSlice`: Manages device images
  - `captionsSlice`: Manages AI-generated captions
  - `settingsSlice`: App configuration and preferences
  - `authSlice`: User authentication state

### Services
- `openai.ts`: OpenAI Vision API integration
- `firebase.ts`: Firebase Authentication
- `googlePhotos.ts`: Google Photos API integration
- `imageMetadata.ts`: Local image management with expo-media-library
- `backgroundTasks.ts`: Background processing with expo-background-fetch

### Navigation
- Bottom tab navigation with Home, Gallery, and Settings
- Modal navigation for login screen

## Usage

### Basic Workflow
1. **Capture/Select Image**: Use camera or gallery picker on Home screen
2. **Generate Caption**: AI automatically generates captions (if auto-processing enabled)
3. **View Gallery**: Browse all images with their captions
4. **Configure Settings**: Set up API keys, background processing, and sync options

### Settings Options
- **OpenAI API Key**: Required for AI captioning
- **Auto Process Images**: Automatically caption new images
- **Background Fetch Frequency**: How often to process images (hourly/daily/weekly)
- **WiFi Only**: Only process when connected to WiFi
- **Charging Only**: Only process when device is charging
- **Google Integration**: Sign in and enable Google Photos sync

## Development

### Project Structure
```
src/
├── components/         # Reusable UI components
├── navigation/         # Navigation setup
├── screens/           # Screen components
├── services/          # External API integrations
├── store/             # Redux store and slices
├── types/             # TypeScript type definitions
└── utils/             # Utility functions and hooks
```

### Key Dependencies
- `expo`: React Native framework
- `@reduxjs/toolkit`: State management
- `react-navigation`: Navigation
- `firebase`: Authentication and cloud services
- `expo-camera`: Camera functionality
- `expo-image-picker`: Image selection
- `expo-media-library`: Local image management
- `expo-background-fetch`: Background processing

### Adding New Features
1. Define types in `src/types/index.ts`
2. Create service functions in `src/services/`
3. Add Redux actions in appropriate slice
4. Create UI components in `src/components/`
5. Update screens as needed

## API Integration

### OpenAI Vision API
- Uses `gpt-4-vision-preview` model
- Generates both short and detailed descriptions
- Configurable prompt for different caption styles
- Rate limiting and error handling included

### Google Photos API
- Upload images with captions
- Sync caption metadata
- Batch operations for efficiency
- Authentication via Firebase

## Background Processing

The app can automatically process unprocessed images in the background:
- Configurable frequency (hourly/daily/weekly)
- Respects WiFi and charging preferences
- Processes limited number of images per session
- Graceful error handling and recovery

## Troubleshooting

### Common Issues
1. **API Key Errors**: Verify OpenAI API key is valid and has credits
2. **Permission Errors**: Check camera and photo library permissions
3. **Background Processing**: Ensure background app refresh is enabled
4. **Google Sign-In**: Verify Firebase configuration and OAuth setup

### Development Issues
1. **TypeScript Errors**: Install missing type definitions
2. **Metro Bundler**: Clear cache with `npx expo start --clear`
3. **Simulator Issues**: Reset simulator or use physical device

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the documentation
3. Open an issue on GitHub
4. Contact the development team

## Version History

### 2.0.0
- Complete rewrite with modern React Native and Expo
- OpenAI Vision API integration
- Google Photos sync capability
- Background processing
- Redux Toolkit state management
- TypeScript throughout
- Improved UI/UX with proper accessibility