import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProcessingJob } from '../../types';

interface ProcessingState {
  queue: ProcessingJob[];
  isProcessing: boolean;
  currentJob: ProcessingJob | null;
  error: string | null;
  lastScanTime: Date | null;
  totalProcessed: number;
  totalFailed: number;
}

const initialState: ProcessingState = {
  queue: [],
  isProcessing: false,
  currentJob: null,
  error: null,
  lastScanTime: null,
  totalProcessed: 0,
  totalFailed: 0,
};

const processingSlice = createSlice({
  name: 'processing',
  initialState,
  reducers: {
    addToQueue: (state, action: PayloadAction<ProcessingJob>) => {
      state.queue.push(action.payload);
    },
    addMultipleToQueue: (state, action: PayloadAction<ProcessingJob[]>) => {
      state.queue.push(...action.payload);
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(job => job.id !== action.payload);
    },
    setCurrentJob: (state, action: PayloadAction<ProcessingJob | null>) => {
      state.currentJob = action.payload;
    },
    updateJobStatus: (state, action: PayloadAction<{ 
      id: string; 
      status: ProcessingJob['status']; 
      error?: string;
    }>) => {
      const { id, status, error } = action.payload;
      
      // Update in queue
      const queueIndex = state.queue.findIndex(job => job.id === id);
      if (queueIndex !== -1) {
        state.queue[queueIndex].status = status;
        if (error) state.queue[queueIndex].error = error;
        if (status === 'completed' || status === 'failed') {
          state.queue[queueIndex].completedAt = new Date();
        }
      }
      
      // Update current job
      if (state.currentJob?.id === id) {
        state.currentJob.status = status;
        if (error) state.currentJob.error = error;
        if (status === 'completed' || status === 'failed') {
          state.currentJob.completedAt = new Date();
        }
      }
      
      // Update counters
      if (status === 'completed') {
        state.totalProcessed += 1;
      } else if (status === 'failed') {
        state.totalFailed += 1;
      }
    },
    setIsProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLastScanTime: (state, action: PayloadAction<Date>) => {
      state.lastScanTime = action.payload;
    },
    clearCompletedJobs: (state) => {
      state.queue = state.queue.filter(
        job => job.status !== 'completed' && job.status !== 'failed'
      );
    },
    clearAllJobs: (state) => {
      state.queue = [];
      state.currentJob = null;
      state.isProcessing = false;
    },
    resetCounters: (state) => {
      state.totalProcessed = 0;
      state.totalFailed = 0;
    },
  },
});

export const {
  addToQueue,
  addMultipleToQueue,
  removeFromQueue,
  setCurrentJob,
  updateJobStatus,
  setIsProcessing,
  setError,
  clearError,
  setLastScanTime,
  clearCompletedJobs,
  clearAllJobs,
  resetCounters,
} = processingSlice.actions;

export default processingSlice.reducer;