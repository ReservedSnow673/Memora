import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AccessibilityInfo,
  SafeAreaView,
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store';
import { addImage } from '../../store/slices/imagesSlice';
import { COLORS } from '../../utils/constants';
import { generateImageId } from '../../utils/helpers';
import { ImageData } from '../../types';

const CameraScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { settings } = useAppSelector(state => state.settings);
  const { accessibility } = settings;
  const colors = accessibility.highContrast ? COLORS.highContrast : COLORS;
  
  const [permission, requestPermission] = useCameraPermissions();
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isReady, setIsReady] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestGalleryPermissions();
  }, []);

  useEffect(() => {
    if (accessibility.screenReaderOptimized) {
      AccessibilityInfo.announceForAccessibility(
        'Camera screen. Take a photo or select from gallery to add captions.'
      );
    }
  }, [accessibility.screenReaderOptimized]);

  const requestGalleryPermissions = async () => {
    const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasGalleryPermission(galleryStatus.status === 'granted');
  };

  const onCameraReady = () => {
    setIsReady(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isReady) {
      Alert.alert('Camera not ready', 'Please wait for the camera to initialize.');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        const imageData: ImageData = {
          id: generateImageId(),
          uri: photo.uri,
          fileName: `IMG_${Date.now()}.jpg`,
          createdAt: new Date(),
          altText: '',
          detailedDescription: '',
          isProcessed: false,
          metadata: {
            width: photo.width || 0,
            height: photo.height || 0,
            size: 0,
            type: 'image/jpeg',
          },
        };

        dispatch(addImage(imageData));

        if (accessibility.screenReaderOptimized) {
          AccessibilityInfo.announceForAccessibility('Photo captured and saved.');
        }

        Alert.alert(
          'Photo Captured',
          'Your photo has been saved to the gallery.',
          [
            { text: 'Take Another', style: 'default' },
            { text: 'View Gallery', onPress: () => navigation.navigate('Gallery' as never) },
          ]
        );
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const pickImage = async () => {
    if (!hasGalleryPermission) {
      Alert.alert('Permission Required', 'Gallery access is required to select photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach((asset) => {
          const imageData: ImageData = {
            id: generateImageId(),
            uri: asset.uri,
            fileName: asset.fileName || `IMG_${Date.now()}.jpg`,
            createdAt: new Date(),
            altText: '',
            detailedDescription: '',
            isProcessed: false,
            metadata: {
              width: asset.width || 0,
              height: asset.height || 0,
              size: asset.fileSize || 0,
              type: 'image/jpeg',
            },
          };

          dispatch(addImage(imageData));
        });

        if (accessibility.screenReaderOptimized) {
          AccessibilityInfo.announceForAccessibility(
            `${result.assets.length} image${result.assets.length > 1 ? 's' : ''} selected and saved.`
          );
        }

        Alert.alert(
          'Images Selected',
          `${result.assets.length} image${result.assets.length > 1 ? 's' : ''} added to gallery.`,
          [{ text: 'View Gallery', onPress: () => navigation.navigate('Gallery' as never) }]
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const toggleCameraType = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.text }]}>
          Requesting camera permissions...
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.text }]}>
          Camera permission is required to take photos
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel="Grant camera permission"
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={onCameraReady}
      >
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topButton}
            onPress={toggleFlash}
            accessibilityRole="button"
            accessibilityLabel={`Toggle flash ${flash === 'off' ? 'on' : 'off'}`}
          >
            <Ionicons 
              name={flash === 'off' ? 'flash-off' : 'flash'} 
              size={30} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={pickImage}
            accessibilityRole="button"
            accessibilityLabel="Select from gallery"
          >
            <Ionicons name="images" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, !isReady && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={!isReady}
            accessibilityRole="button"
            accessibilityLabel={isReady ? "Take photo" : "Camera not ready"}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideButton}
            onPress={toggleCameraType}
            accessibilityRole="button"
            accessibilityLabel="Switch camera"
          >
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sideButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 15,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
  },
});

export default CameraScreen;