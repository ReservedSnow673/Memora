import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from './slices/authSlice';
import imagesReducer from './slices/imagesSlice';
import settingsReducer from './slices/settingsSlice';
import processingReducer from './slices/processingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    images: imagesReducer,
    settings: settingsReducer,
    processing: processingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['processing/setLastScanTime', 'processing/updateJobStatus'],
        ignoredPaths: ['processing.lastScanTime', 'processing.queue.*.createdAt', 'processing.queue.*.completedAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectImages = (state: RootState) => state.images;
export const selectSettings = (state: RootState) => state.settings;
export const selectProcessing = (state: RootState) => state.processing;

// Computed selectors
export const selectFilteredImages = (state: RootState) => {
  const { images, filter, searchQuery } = state.images;
  
  let filtered = images;
  
  // Apply filter
  if (filter === 'processed') {
    filtered = filtered.filter(img => img.isProcessed);
  } else if (filter === 'unprocessed') {
    filtered = filtered.filter(img => !img.isProcessed);
  }
  
  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(img => 
      img.fileName.toLowerCase().includes(query) ||
      img.altText?.toLowerCase().includes(query) ||
      img.detailedDescription?.toLowerCase().includes(query)
    );
  }
  
  return filtered;
};

export const selectPendingJobs = (state: RootState) =>
  state.processing.queue.filter(job => job.status === 'pending');

export const selectIsUserAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated && state.auth.user !== null;

export const selectUnprocessedImagesCount = (state: RootState) =>
  state.images.images.filter(img => !img.isProcessed).length;

export const selectProcessingStats = (state: RootState) => ({
  totalImages: state.images.images.length,
  processedImages: state.images.images.filter(img => img.isProcessed).length,
  unprocessedImages: state.images.images.filter(img => !img.isProcessed).length,
  queueLength: state.processing.queue.length,
  totalProcessed: state.processing.totalProcessed,
  totalFailed: state.processing.totalFailed,
});