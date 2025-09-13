import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImageData } from '../../types';

interface ImagesState {
  images: ImageData[];
  selectedImages: string[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'processed' | 'unprocessed';
  searchQuery: string;
}

const initialState: ImagesState = {
  images: [],
  selectedImages: [],
  isLoading: false,
  error: null,
  filter: 'all',
  searchQuery: '',
};

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<ImageData[]>) => {
      state.images = action.payload;
      state.error = null;
    },
    addImage: (state, action: PayloadAction<ImageData>) => {
      state.images.unshift(action.payload);
    },
    addImages: (state, action: PayloadAction<ImageData[]>) => {
      // Add new images that don't already exist
      const existingIds = new Set(state.images.map(img => img.id));
      const newImages = action.payload.filter(img => !existingIds.has(img.id));
      state.images.unshift(...newImages);
    },
    updateImage: (state, action: PayloadAction<{ id: string; updates: Partial<ImageData> }>) => {
      const index = state.images.findIndex(img => img.id === action.payload.id);
      if (index !== -1) {
        state.images[index] = { ...state.images[index], ...action.payload.updates };
      }
    },
    deleteImage: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter(img => img.id !== action.payload);
      state.selectedImages = state.selectedImages.filter(id => id !== action.payload);
    },
    deleteImages: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = new Set(action.payload);
      state.images = state.images.filter(img => !idsToDelete.has(img.id));
      state.selectedImages = state.selectedImages.filter(id => !idsToDelete.has(id));
    },
    selectImage: (state, action: PayloadAction<string>) => {
      if (!state.selectedImages.includes(action.payload)) {
        state.selectedImages.push(action.payload);
      }
    },
    deselectImage: (state, action: PayloadAction<string>) => {
      state.selectedImages = state.selectedImages.filter(id => id !== action.payload);
    },
    toggleImageSelection: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      if (state.selectedImages.includes(imageId)) {
        state.selectedImages = state.selectedImages.filter(id => id !== imageId);
      } else {
        state.selectedImages.push(imageId);
      }
    },
    selectAllImages: (state) => {
      state.selectedImages = state.images.map(img => img.id);
    },
    deselectAllImages: (state) => {
      state.selectedImages = [];
    },
    setFilter: (state, action: PayloadAction<'all' | 'processed' | 'unprocessed'>) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    markAsProcessed: (state, action: PayloadAction<{ id: string; altText: string; detailedDescription: string }>) => {
      const index = state.images.findIndex(img => img.id === action.payload.id);
      if (index !== -1) {
        state.images[index].isProcessed = true;
        state.images[index].altText = action.payload.altText;
        state.images[index].detailedDescription = action.payload.detailedDescription;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setImages,
  addImage,
  addImages,
  updateImage,
  deleteImage,
  deleteImages,
  selectImage,
  deselectImage,
  toggleImageSelection,
  selectAllImages,
  deselectAllImages,
  setFilter,
  setSearchQuery,
  setLoading,
  setError,
  markAsProcessed,
  clearError,
} = imagesSlice.actions;

export default imagesSlice.reducer;