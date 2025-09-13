import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ProcessedImage } from '../store/imagesSlice';
import { useDispatch } from 'react-redux';
import { removeImage } from '../store/imagesSlice';

const { width, height } = Dimensions.get('window');

interface ImageDetailsProps {
  route: {
    params: {
      image: ProcessedImage;
    };
  };
  navigation: any;
}

const ImageDetailsScreen: React.FC<ImageDetailsProps> = ({ route, navigation }) => {
  const { image } = route.params;
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const styles = createStyles(theme);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'processed':
        return { 
          emoji: '✅', 
          color: theme.colors.success, 
          text: 'Processed',
          description: 'Image has been successfully processed and captioned'
        };
      case 'processing':
        return { 
          emoji: '⏳', 
          color: theme.colors.warning, 
          text: 'Processing',
          description: 'Image is currently being processed by AI'
        };
      case 'error':
        return { 
          emoji: '❌', 
          color: theme.colors.error, 
          text: 'Error',
          description: 'An error occurred while processing this image'
        };
      default:
        return { 
          emoji: '⭕', 
          color: theme.colors.textSecondary, 
          text: 'Unprocessed',
          description: 'Image is waiting to be processed'
        };
    }
  };

  const statusInfo = getStatusInfo(image.status);

  const formatDate = (timestamp?: number | string) => {
    if (!timestamp) return 'Unknown';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to remove this image from Memora? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            dispatch(removeImage(image.id));
            navigation.goBack();
          }
        },
      ]
    );
  };

  const estimatedFileSize = Math.round((image.width * image.height * 3) / 1024); // Rough estimate

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backEmoji}>👈</Text>
          <Text style={[styles.backText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: theme.colors.text }]}>Image Details</Text>
        
        <TouchableOpacity style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />
          {image.status === 'processing' && (
            <View style={styles.processingOverlay}>
              <Text style={styles.processingText}>🔄 Processing...</Text>
            </View>
          )}
        </View>

        {/* Image Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📋 Image Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>📄 Filename</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{image.filename || 'Unknown'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>📅 Created</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatDate(image.creationTime)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>📏 Dimensions</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{image.width} × {image.height}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>💾 File Size</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>~{estimatedFileSize} KB</Text>
          </View>
        </View>

        {/* Processing Status */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>⚡ Processing Status</Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusIndicatorEmoji}>{statusInfo.emoji}</Text>
            </View>
            <View style={styles.statusDetails}>
              <Text style={[styles.statusTitle, { color: theme.colors.text }]}>{statusInfo.text}</Text>
              <Text style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
                {statusInfo.description}
              </Text>
            </View>
          </View>

          {image.processingStarted && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>🚀 Started</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatDate(image.processingStarted)}</Text>
            </View>
          )}

          {image.processingCompleted && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>🏁 Completed</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatDate(image.processingCompleted)}</Text>
            </View>
          )}

          {image.error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>❌ {image.error}</Text>
            </View>
          )}
        </View>

        {/* AI Caption */}
        {image.caption && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🤖 AI Caption</Text>
            <View style={[styles.captionContainer, { backgroundColor: theme.colors.primary + '10' }]}>
              <Text style={[styles.captionText, { color: theme.colors.text }]}>{image.caption}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>⚙️ Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={handleDelete}
          >
            <Text style={styles.actionButtonEmoji}>🗑️</Text>
            <Text style={styles.actionButtonText}>Remove from Memora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backEmoji: {
    fontSize: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusEmoji: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    elevation: 3,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: width - 32,
    height: (width - 32) * 0.8,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicatorEmoji: {
    fontSize: 20,
  },
  statusDetails: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  captionContainer: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  captionText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonEmoji: {
    fontSize: 18,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default ImageDetailsScreen;