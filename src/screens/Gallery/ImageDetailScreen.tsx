import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  AccessibilityInfo,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useAppSelector, useAppDispatch } from '../../store';
import { RootStackParamList, ImageData } from '../../types';
import { COLORS } from '../../utils/constants';
import { getAccessibleFontSize, formatDate } from '../../utils/helpers';

type ImageDetailRouteProp = RouteProp<RootStackParamList, 'ImageDetail'>;

const { width } = Dimensions.get('window');

const ImageDetailScreen: React.FC = () => {
  const route = useRoute<ImageDetailRouteProp>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { imageId } = route.params;
  
  const { settings } = useAppSelector(state => state.settings);
  const { images } = useAppSelector(state => state.images);
  
  const image = images.find(img => img.id === imageId);
  
  const { accessibility } = settings;
  const colors = accessibility.highContrast ? COLORS.highContrast : COLORS;
  
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (accessibility.screenReaderOptimized && image) {
      AccessibilityInfo.announceForAccessibility(
        `Image detail screen for ${image.fileName}. ${image.altText || 'No caption available'}.`
      );
    }
  }, [image, accessibility.screenReaderOptimized]);

  if (!image) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text 
          style={[
            styles.errorText,
            { 
              color: colors.text,
              fontSize: getAccessibleFontSize('large', accessibility.dynamicFontSize, 1.0)
            }
          ]}
        >
          Image not found
        </Text>
      </View>
    );
  }

  const handleCopyCaption = async () => {
    if (image.altText) {
      await Clipboard.setStringAsync(image.altText);
      Alert.alert('Copied', 'Caption copied to clipboard');
    } else {
      Alert.alert('No Caption', 'This image does not have a caption yet.');
    }
  };

  const handleShare = async () => {
    try {
      if (image.altText) {
        await Share.share({
          message: `Image Caption: ${image.altText}`,
          title: 'Memora Image Caption',
        });
      } else {
        Alert.alert('No Caption', 'This image does not have a caption to share.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share caption');
    }
  };

  const handleReprocess = () => {
    Alert.alert(
      'Reprocess Image',
      'Generate new captions for this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reprocess', 
          onPress: () => {
            // TODO: Implement reprocessing
            Alert.alert('Feature Coming Soon', 'Image reprocessing will be implemented.');
          }
        },
      ]
    );
  };

  const InfoRow: React.FC<{
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text 
          style={[
            styles.infoLabelText,
            { 
              color: colors.textSecondary,
              fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
            }
          ]}
        >
          {label}
        </Text>
      </View>
      <Text 
        style={[
          styles.infoValue,
          { 
            color: colors.text,
            fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
          }
        ]}
        accessibilityLabel={`${label}: ${value}`}
      >
        {value}
      </Text>
    </View>
  );

  const ActionButton: React.FC<{
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color: string;
    disabled?: boolean;
  }> = ({ title, icon, onPress, color, disabled = false }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { 
          backgroundColor: color,
          opacity: disabled ? 0.6 : 1.0
        }
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={disabled ? 'Button is disabled' : undefined}
    >
      <Ionicons name={icon} size={20} color="white" />
      <Text 
        style={[
          styles.actionButtonText,
          { fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0) }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image.uri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors={true}
          accessibilityLabel={image.altText || `Image: ${image.fileName}`}
        />
        
        {/* Processing Status Badge */}
        {!image.isProcessed && (
          <View style={[styles.statusBadge, { backgroundColor: COLORS.warning }]}>
            <Ionicons name="time-outline" size={16} color="white" />
            <Text style={styles.statusBadgeText}>Processing</Text>
          </View>
        )}
        
        {image.isProcessed && (
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color="white" />
            <Text style={styles.statusBadgeText}>Processed</Text>
          </View>
        )}
      </View>

      {/* Image Information */}
      <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text 
          style={[
            styles.sectionTitle,
            { 
              color: colors.text,
              fontSize: getAccessibleFontSize('large', accessibility.dynamicFontSize, 1.0)
            }
          ]}
          accessibilityRole="header"
        >
          Image Information
        </Text>
        
        <InfoRow
          label="Filename"
          value={image.fileName}
          icon="document-text-outline"
        />
        
        <InfoRow
          label="Created"
          value={formatDate(image.createdAt)}
          icon="calendar-outline"
        />
        
        {image.metadata && (
          <>
            <InfoRow
              label="Dimensions"
              value={`${image.metadata.width} × ${image.metadata.height}`}
              icon="resize-outline"
            />
            
            <InfoRow
              label="File Size"
              value={`${(image.metadata.size / 1024 / 1024).toFixed(2)} MB`}
              icon="folder-outline"
            />
          </>
        )}
      </View>

      {/* Caption Section */}
      <View style={[styles.captionSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text 
          style={[
            styles.sectionTitle,
            { 
              color: colors.text,
              fontSize: getAccessibleFontSize('large', accessibility.dynamicFontSize, 1.0)
            }
          ]}
          accessibilityRole="header"
        >
          Alt Text Caption
        </Text>
        
        {image.altText ? (
          <Text 
            style={[
              styles.captionText,
              { 
                color: colors.text,
                fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
              }
            ]}
            accessibilityRole="text"
            accessibilityLabel={`Caption: ${image.altText}`}
          >
            {image.altText}
          </Text>
        ) : (
          <Text 
            style={[
              styles.noCaptionText,
              { 
                color: colors.textSecondary,
                fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
              }
            ]}
          >
            No caption available yet
          </Text>
        )}
      </View>

      {/* Detailed Description Section */}
      {image.detailedDescription && (
        <View style={[styles.descriptionSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.descriptionHeader}
            onPress={() => setShowFullDescription(!showFullDescription)}
            accessibilityRole="button"
            accessibilityLabel={`${showFullDescription ? 'Hide' : 'Show'} detailed description`}
          >
            <Text 
              style={[
                styles.sectionTitle,
                { 
                  color: colors.text,
                  fontSize: getAccessibleFontSize('large', accessibility.dynamicFontSize, 1.0)
                }
              ]}
            >
              Detailed Description
            </Text>
            <Ionicons 
              name={showFullDescription ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {showFullDescription && (
            <Text 
              style={[
                styles.descriptionText,
                { 
                  color: colors.text,
                  fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
                }
              ]}
              accessibilityRole="text"
            >
              {image.detailedDescription}
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Text 
          style={[
            styles.sectionTitle,
            { 
              color: colors.text,
              fontSize: getAccessibleFontSize('large', accessibility.dynamicFontSize, 1.0)
            }
          ]}
          accessibilityRole="header"
        >
          Actions
        </Text>
        
        <View style={styles.actionButtons}>
          <ActionButton
            title="Copy Caption"
            icon="copy-outline"
            onPress={handleCopyCaption}
            color={colors.primary}
            disabled={!image.altText}
          />
          
          <ActionButton
            title="Share"
            icon="share-outline"
            onPress={handleShare}
            color={colors.secondary}
            disabled={!image.altText}
          />
          
          <ActionButton
            title="Reprocess"
            icon="refresh-outline"
            onPress={handleReprocess}
            color={COLORS.warning}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  imageContainer: {
    height: width * 0.8,
    backgroundColor: 'black',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  captionSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  descriptionSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionsSection: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabelText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  infoValue: {
    marginLeft: 28,
  },
  captionText: {
    lineHeight: 22,
  },
  noCaptionText: {
    fontStyle: 'italic',
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionText: {
    marginTop: 12,
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorText: {
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ImageDetailScreen;