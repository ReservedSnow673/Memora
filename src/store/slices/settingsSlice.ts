import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';
import { DEFAULT_SETTINGS } from '../../utils/constants';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<AppSettings>) => {
      state.settings = action.payload;
      state.error = null;
    },
    updateSetting: <K extends keyof AppSettings>(
      state: SettingsState,
      action: PayloadAction<{ key: K; value: AppSettings[K] }>
    ) => {
      state.settings[action.payload.key] = action.payload.value;
      state.error = null;
    },
    toggleAutoScan: (state) => {
      state.settings.autoScanEnabled = !state.settings.autoScanEnabled;
    },
    setScanFrequency: (state, action: PayloadAction<'daily' | 'weekly' | 'custom'>) => {
      state.settings.scanFrequency = action.payload;
    },
    setCustomDays: (state, action: PayloadAction<number>) => {
      state.settings.customDays = action.payload;
    },
    toggleWifiOnly: (state) => {
      state.settings.scanOnWifiOnly = !state.settings.scanOnWifiOnly;
    },
    toggleChargingOnly: (state) => {
      state.settings.scanOnCharging = !state.settings.scanOnCharging;
    },
    updateTimeRestriction: (state, action: PayloadAction<{
      enabled?: boolean;
      startTime?: string;
      endTime?: string;
    }>) => {
      state.settings.scanTimeRestriction = {
        ...state.settings.scanTimeRestriction,
        ...action.payload,
      };
    },
    updateAccessibility: (state, action: PayloadAction<Partial<AppSettings['accessibility']>>) => {
      state.settings.accessibility = {
        ...state.settings.accessibility,
        ...action.payload,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetSettings: (state) => {
      state.settings = DEFAULT_SETTINGS;
      state.error = null;
    },
  },
});

export const {
  setSettings,
  updateSetting,
  toggleAutoScan,
  setScanFrequency,
  setCustomDays,
  toggleWifiOnly,
  toggleChargingOnly,
  updateTimeRestriction,
  updateAccessibility,
  setLoading,
  setError,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;