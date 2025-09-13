
# Memora - Intelligent Image Caption & Memory Assistant

A React Native Expo app that automatically organizes and captions your photos using AI, making your memories searchable and accessible.

## Features

### Core Functionality
- 📸 **Smart Image Capture & Import** - Seamlessly capture photos or select from gallery
- 🤖 **AI-Powered Captions** - Generate detailed descriptions using OpenAI GPT-4o Vision API
- 🔍 **Smart Search & Filter** - Find images by caption content, date, or tags
- 📱 **Gallery Management** - Organized grid view with metadata display
- ⚙️ **Comprehensive Settings** - Customize scanning behavior, AI preferences, and accessibility options

### Advanced Features
- 🔄 **Automatic Gallery Scanning** - Background processing of new photos (configurable)
- 🔐 **Firebase Authentication** - Secure Google Sign-In integration
- 📤 **Easy Sharing** - Share images and captions via system share sheet
- ♿ **Full Accessibility** - Screen reader support, dynamic fonts, high contrast mode
- 💾 **Local Storage** - All data stored locally using AsyncStorage with optional cloud sync

### Accessibility Features
- 🎯 **Screen Reader Compatible** - Full VoiceOver/TalkBack support
- 🔤 **Dynamic Text Sizing** - Respects system font size preferences
- 🌓 **High Contrast Mode** - Enhanced visibility for low vision users
- ⌨️ **Keyboard Navigation** - Complete app navigation via external keyboard
- 🏷️ **Semantic Labels** - Descriptive labels for all interactive elements

## Technology Stack

- **Framework**: Expo SDK 54.0.0 with TypeScript
- **Navigation**: React Navigation v6 with accessibility support
- **State Management**: Redux Toolkit with persistence
- **Storage**: AsyncStorage for local data persistence
- **AI Processing**: OpenAI GPT-4o Vision API
- **Authentication**: Firebase Auth with Google provider
- **Image Handling**: Expo Camera, Image Picker, Media Library
- **Sharing**: Expo Sharing and Clipboard integration

## Project Structure

```
Memora/
├── App.tsx                           # Application entry point
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── ImageCard.tsx            # Gallery image display component
│   │   ├── LoadingSpinner.tsx       # Loading indicator
│   │   └── SettingsItem.tsx         # Settings row component
│   ├── hooks/                       # Custom React hooks
│   │   └── useAppSelector.ts        # Typed Redux selector hook
│   ├── navigation/                  # Navigation configuration
│   │   └── RootNavigator.tsx        # Main navigation structure
│   ├── screens/                     # Application screens
│   │   ├── AuthScreen.tsx           # Authentication interface
│   │   ├── CameraScreen.tsx         # Camera capture interface
│   │   ├── GalleryScreen.tsx        # Image gallery with search
│   │   ├── HomeScreen.tsx           # Dashboard and quick actions
│   │   └── SettingsScreen.tsx       # Configuration and preferences
│   ├── services/                    # External service integrations
│   │   ├── api/
│   │   │   ├── imagePickerService.ts # Camera and gallery operations
│   │   │   └── openAIService.ts     # GPT-4o Vision API integration
│   │   ├── auth/
│   │   │   └── firebaseAuthService.ts # Google Sign-In service
│   │   ├── background/
│   │   │   └── backgroundScanService.ts # Background processing
│   │   └── storage/
│   │       └── storageService.ts    # AsyncStorage operations
│   ├── store/                       # Redux state management
│   │   ├── slices/
│   │   │   ├── authSlice.ts         # Authentication state
│   │   │   ├── imagesSlice.ts       # Image data management
│   │   │   ├── processingSlice.ts   # AI processing queue
│   │   │   └── settingsSlice.ts     # App configuration
│   │   └── store.ts                 # Redux store configuration
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                 # Shared interfaces and types
│   └── utils/                       # Utility functions and constants
│       ├── constants.ts             # App constants and configuration
│       └── helpers.ts               # Helper functions
├── app.json                         # Expo configuration
├── package.json                     # Dependencies and scripts
└── tsconfig.json                    # TypeScript configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Initial Setup

1. **Clone and Install Dependencies**
   ```bash
   cd Memora
   npm install
   ```

2. **Configure OpenAI API** (Required for AI captions)
   - Get an API key from [OpenAI Platform](https://platform.openai.com/)
   - Update `src/utils/constants.ts`:
   ```typescript
   export const OPENAI_API_KEY = 'your-openai-api-key-here';
   ```

3. **Configure Firebase** (Optional - for authentication)
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Sign-In in Authentication
   - Add your app configuration to `src/utils/constants.ts`:
   ```typescript
   export const FIREBASE_CONFIG = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     // ... other config
   };
   ```

4. **Start Development Server**
   ```bash
   npx expo start
   ```

5. **Run on Device/Simulator**
   - iOS: Press `i` in terminal or scan QR code with Expo Go
   - Android: Press `a` in terminal or scan QR code with Expo Go

## Configuration Options

### AI Caption Settings
- **Caption Length**: Short, medium, or detailed descriptions
- **Processing Mode**: Real-time or batch processing
- **Language**: Multiple language support for captions

### Scanning Behavior
- **Auto-Scan Frequency**: Configure how often to check for new images
- **Network Requirements**: WiFi-only or allow cellular data
- **Battery Optimization**: Only scan when charging vs. always scan
- **Scan Limits**: Maximum images to process per batch

### Privacy & Storage
- **Local-First**: All data stored locally by default
- **Optional Cloud Sync**: Enable Firebase integration for cross-device sync
- **Data Retention**: Configure how long to keep processed images
- **Export Options**: Backup and restore functionality

## Usage Guide

### Getting Started
1. **Initial Setup**: Open the app and grant camera/photo permissions
2. **Capture/Import**: Take a new photo or select existing images from gallery
3. **AI Processing**: Images are automatically processed with AI captions
4. **Search & Browse**: Use the search bar to find images by caption content
5. **Organize**: View images in gallery with sorting and filtering options

### Key Features

#### Smart Captions
- Automatically generated when images are added
- Detailed descriptions including objects, people, settings, text content
- Customizable detail level in settings
- Multiple language support

#### Intelligent Search
- Search by caption content: "dog in park", "birthday cake", "sunset"
- Filter by date ranges
- Sort by recent, oldest, or relevance
- Tag-based organization

#### Accessibility Features
- **VoiceOver/TalkBack**: Complete screen reader support with descriptive labels
- **Dynamic Type**: Automatic font scaling based on system preferences
- **High Contrast**: Enhanced color schemes for better visibility
- **Voice Control**: Compatible with system voice control features
- **Switch Control**: Support for assistive switches and external keyboards

### Advanced Usage

#### Background Scanning
- Configure automatic scanning of new photos
- Set frequency and conditions (WiFi, charging status)
- Review and approve batch processing results

#### Sharing & Export
- Share individual images with captions
- Export caption data as text or JSON
- Bulk sharing of filtered image sets

## Development

### Available Scripts
```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Type checking
npm run type-check

# Build for production
npm run build
```

### Adding New Features

#### Creating New Screens
1. Add screen component in `src/screens/`
2. Update navigation in `src/navigation/RootNavigator.tsx`
3. Add any required Redux state in appropriate slice
4. Implement accessibility features (labels, hints, roles)

#### Adding API Integrations
1. Create service in appropriate `src/services/` subdirectory
2. Add configuration to `src/utils/constants.ts`
3. Update Redux slices for state management
4. Add error handling and loading states

#### Implementing Background Tasks
1. Use `expo-background-fetch` and `expo-task-manager`
2. Register tasks in `src/services/background/`
3. Handle permission requests and system limitations
4. Test on physical devices (background tasks don't work in simulators)

## API Dependencies

### OpenAI GPT-4o Vision API
- **Purpose**: Generate detailed image captions and alt-text
- **Rate Limits**: Check OpenAI documentation for current limits
- **Cost**: Pay-per-use model, see OpenAI pricing
- **Fallback**: App works without API key but won't generate new captions

### Firebase (Optional)
- **Authentication**: Google Sign-In integration
- **Firestore**: Optional cloud storage for cross-device sync
- **Setup**: Requires Firebase project configuration

## Accessibility Compliance

This app is designed to meet WCAG 2.1 AA standards:

- **Perceivable**: High contrast modes, scalable text, alternative text for images
- **Operable**: Keyboard navigation, sufficient touch targets, no seizure-inducing content
- **Understandable**: Clear navigation, consistent interface, error identification
- **Robust**: Compatible with assistive technologies, semantic markup

### Testing Accessibility
- Enable VoiceOver (iOS) or TalkBack (Android) to test screen reader compatibility
- Test with different font sizes in system settings
- Verify all interactive elements have appropriate labels
- Test navigation with external keyboard or switch control

## Troubleshooting

### Common Issues

#### Camera/Photo Permissions
```
Error: Permission to access camera/photos denied
```
**Solution**: Check app permissions in device settings, restart app after granting permissions

#### OpenAI API Errors
```
Error: Invalid API key or quota exceeded
```
**Solution**: Verify API key in constants.ts, check OpenAI account billing and usage

#### Background Scanning Not Working
```
Background tasks not executing
```
**Solution**: Background tasks require physical device, check battery optimization settings, ensure app isn't force-closed

#### Firebase Authentication Issues
```
Google Sign-In failed
```
**Solution**: Verify Firebase configuration, check Google Sign-In setup in Firebase console, ensure correct SHA certificates

### Performance Optimization
- Images are automatically compressed for storage efficiency
- Lazy loading implemented in gallery view
- Background processing queued to prevent UI blocking
- Local caching minimizes redundant API calls

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Implement proper error handling
- Add comprehensive accessibility features
- Write descriptive commit messages

### Testing
- Test on both iOS and Android devices
- Verify accessibility with screen readers
- Test with different font sizes and contrast settings
- Validate offline functionality

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, feature requests, or questions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include device info, OS version, and steps to reproduce

---

**Memora** - Making your memories searchable and accessible through the power of AI.
