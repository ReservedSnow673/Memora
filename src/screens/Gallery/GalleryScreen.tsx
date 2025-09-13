import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  AccessibilityInfo,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectFilteredImages } from '../../store';
import { setFilter, setSearchQuery, toggleImageSelection } from '../../store/slices/imagesSlice';
import { RootStackParamList, ImageData } from '../../types';
import { COLORS } from '../../utils/constants';
import { getAccessibleFontSize, formatDate } from '../../utils/helpers';

type GalleryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 columns with padding

const GalleryScreen: React.FC = () => {
  const navigation = useNavigation<GalleryScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { settings } = useAppSelector(state => state.settings);
  const { filter, searchQuery, selectedImages, isLoading } = useAppSelector(state => state.images);
  const filteredImages = useAppSelector(selectFilteredImages);
  
  const { accessibility } = settings;
  const colors = accessibility.highContrast ? COLORS.highContrast : COLORS;
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    if (accessibility.screenReaderOptimized) {
      AccessibilityInfo.announceForAccessibility(
        `Gallery screen. ${filteredImages.length} images available.`
      );
    }
  }, [filteredImages.length, accessibility.screenReaderOptimized]);

  const handleImagePress = (imageId: string) => {
    if (isSelectionMode) {
      dispatch(toggleImageSelection(imageId));
    } else {
      navigation.navigate('ImageDetail', { imageId });
    }
  };

  const handleLongPress = (imageId: string) => {
    setIsSelectionMode(true);
    dispatch(toggleImageSelection(imageId));
  };

  const handleCameraPress = () => {
    navigation.navigate('Camera');
  };

  const handleFilterPress = (newFilter: typeof filter) => {
    dispatch(setFilter(newFilter));
  };

  const handleSearchChange = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    // Clear selections if needed
  };

  const renderImageItem = ({ item }: { item: ImageData }) => {
    const isSelected = selectedImages.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          { 
            borderColor: isSelected ? colors.primary : 'transparent',
            borderWidth: isSelected ? 2 : 0,
          }
        ]}
        onPress={() => handleImagePress(item.id)}
        onLongPress={() => handleLongPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Image ${item.fileName}${item.altText ? `, ${item.altText}` : ', no caption'}`}
        accessibilityHint={isSelectionMode ? 'Double tap to select' : 'Double tap to view details'}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          accessibilityIgnoresInvertColors={true}
        />
        
        {/* Processing Status Overlay */}
        {!item.isProcessed && (
          <View style={styles.processingOverlay}>
            <Ionicons name="time-outline" size={16} color="white" />
          </View>
        )}
        
        {/* Selection Overlay */}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        )}
        
        {/* Image Info */}
        <View style={[styles.imageInfo, { backgroundColor: colors.surface + 'E6' }]}>
          <Text 
            style={[
              styles.imageFileName,
              { 
                color: colors.text,
                fontSize: getAccessibleFontSize('small', accessibility.dynamicFontSize, 1.0)
              }
            ]}
            numberOfLines={1}
          >
            {item.fileName}
          </Text>
          {item.altText && (
            <Text 
              style={[
                styles.imageCaption,
                { 
                  color: colors.textSecondary,
                  fontSize: getAccessibleFontSize('small', accessibility.dynamicFontSize, 1.0)
                }
              ]}
              numberOfLines={2}
            >
              {item.altText}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton: React.FC<{
    title: string;
    filterValue: typeof filter;
    count?: number;
  }> = ({ title, filterValue, count }) => {
    const isActive = filter === filterValue;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive ? colors.primary : colors.surface,
            borderColor: colors.border,
          }
        ]}
        onPress={() => handleFilterPress(filterValue)}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${title}${count !== undefined ? `, ${count} items` : ''}`}
        accessibilityState={{ selected: isActive }}
      >
        <Text
          style={[
            styles.filterButtonText,
            {
              color: isActive ? 'white' : colors.text,
              fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
            }
          ]}
        >
          {title}
        </Text>
        {count !== undefined && (
          <View
            style={[
              styles.filterBadge,
              { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : colors.primary }
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                { color: isActive ? 'white' : 'white' }
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color={colors.textSecondary} />
      <Text 
        style={[
          styles.emptyStateTitle,
          { 
            color: colors.text,
            fontSize: getAccessibleFontSize('large', accessibility.dynamicFontSize, 1.0)
          }
        ]}
      >
        No Images Found
      </Text>
      <Text 
        style={[
          styles.emptyStateSubtitle,
          { 
            color: colors.textSecondary,
            fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
          }
        ]}
      >
        Take your first photo to get started
      </Text>
      <TouchableOpacity
        style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
        onPress={handleCameraPress}
        accessibilityRole="button"
        accessibilityLabel="Take photo"
      >
        <Ionicons name="camera-outline" size={20} color="white" />
        <Text style={styles.emptyStateButtonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[
            styles.searchInput,
            { 
              color: colors.text,
              fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
            }
          ]}
          placeholder="Search images..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
          accessibilityLabel="Search images"
          accessibilityHint="Enter text to search for images by filename or caption"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearchChange('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton title="All" filterValue="all" />
        <FilterButton title="Processed" filterValue="processed" />
        <FilterButton title="Pending" filterValue="unprocessed" />
      </View>

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={[styles.selectionHeader, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            onPress={exitSelectionMode}
            accessibilityRole="button"
            accessibilityLabel="Exit selection mode"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.selectionHeaderText}>
            {selectedImages.length} selected
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredImages}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.imageGrid}
          showsVerticalScrollIndicator={false}
          accessibilityLabel="Image grid"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontWeight: '500',
  },
  filterBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageGrid: {
    padding: 16,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize + 60,
    marginRight: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  image: {
    width: imageSize,
    height: imageSize,
  },
  processingOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  imageInfo: {
    padding: 8,
    height: 60,
  },
  imageFileName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  imageCaption: {
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default GalleryScreen;