export interface ImageData {
  id: string;
  uri: string;
  fileName: string;
  createdAt: Date;
  altText?: string;
  detailedDescription?: string;
  isProcessed: boolean;
  metadata?: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
}

export interface AppSettings {
  autoScanEnabled: boolean;
  scanFrequency: 'daily' | 'weekly' | 'custom';
  customDays: number;
  scanOnWifiOnly: boolean;
  scanOnCharging: boolean;
  scanTimeRestriction: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  accessibility: {
    dynamicFontSize: boolean;
    highContrast: boolean;
    screenReaderOptimized: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isGoogleSignedIn: boolean;
}

export interface ProcessingJob {
  id: string;
  imageUri: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export type RootStackParamList = {
  Main: undefined;
  Camera: undefined;
  ImageDetail: { imageId: string };
  Settings: undefined;
  Auth: undefined;
};

export type TabParamList = {
  Home: undefined;
  Gallery: undefined;
  Settings: undefined;
};