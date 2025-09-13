import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'highContrast' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface ThemeColors {
  primary: string;
  primaryVariant: string;
  secondary: string;
  secondaryVariant: string;
  background: string;
  surface: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
  shadow: string;
  overlay: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  colorScheme: ColorScheme;
}

interface ThemeState {
  theme: Theme;
  mode: ThemeMode;
  colorScheme: ColorScheme;
}

type ThemeAction = 
  | { type: 'SET_MODE'; payload: ThemeMode }
  | { type: 'SET_COLOR_SCHEME'; payload: ColorScheme }
  | { type: 'SET_SYSTEM_THEME'; payload: ColorSchemeName };

const lightColors: ThemeColors = {
  primary: '#6366f1',
  primaryVariant: '#4f46e5',
  secondary: '#06b6d4',
  secondaryVariant: '#0891b2',
  background: '#ffffff',
  surface: '#f8fafc',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onBackground: '#1e293b',
  onSurface: '#334155',
  onError: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  divider: '#f1f5f9',
  shadow: '#00000010',
  overlay: '#00000040',
};

const darkColors: ThemeColors = {
  primary: '#818cf8',
  primaryVariant: '#6366f1',
  secondary: '#22d3ee',
  secondaryVariant: '#06b6d4',
  background: '#0f172a',
  surface: '#1e293b',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  info: '#60a5fa',
  onPrimary: '#1e293b',
  onSecondary: '#1e293b',
  onBackground: '#f1f5f9',
  onSurface: '#e2e8f0',
  onError: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  divider: '#475569',
  shadow: '#00000030',
  overlay: '#00000060',
};

const highContrastColors: ThemeColors = {
  primary: '#000000',
  primaryVariant: '#333333',
  secondary: '#666666',
  secondaryVariant: '#999999',
  background: '#ffffff',
  surface: '#f5f5f5',
  error: '#cc0000',
  success: '#006600',
  warning: '#cc6600',
  info: '#0066cc',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onBackground: '#000000',
  onSurface: '#000000',
  onError: '#ffffff',
  text: '#000000',
  textSecondary: '#333333',
  border: '#000000',
  divider: '#cccccc',
  shadow: '#00000020',
  overlay: '#00000080',
};

const protanopiaColors: ThemeColors = {
  primary: '#0066cc',
  primaryVariant: '#004499',
  secondary: '#ffaa00',
  secondaryVariant: '#cc8800',
  background: '#ffffff',
  surface: '#f8fafc',
  error: '#cc6600',
  success: '#0088cc',
  warning: '#ffaa00',
  info: '#0066cc',
  onPrimary: '#ffffff',
  onSecondary: '#000000',
  onBackground: '#1e293b',
  onSurface: '#334155',
  onError: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  divider: '#f1f5f9',
  shadow: '#00000010',
  overlay: '#00000040',
};

const getColorsForScheme = (isDark: boolean, colorScheme: ColorScheme): ThemeColors => {
  if (colorScheme === 'highContrast') {
    return isDark ? { ...highContrastColors, background: '#000000', surface: '#1a1a1a', text: '#ffffff', onBackground: '#ffffff', onSurface: '#ffffff' } : highContrastColors;
  }
  
  if (colorScheme === 'protanopia' || colorScheme === 'deuteranopia') {
    return isDark ? { ...protanopiaColors, background: '#0f172a', surface: '#1e293b', text: '#f1f5f9', onBackground: '#f1f5f9', onSurface: '#e2e8f0' } : protanopiaColors;
  }
  
  if (colorScheme === 'tritanopia') {
    const tritColors = {
      ...protanopiaColors,
      primary: '#cc0066',
      primaryVariant: '#990044',
      secondary: '#006633',
      secondaryVariant: '#004422',
    };
    return isDark ? { ...tritColors, background: '#0f172a', surface: '#1e293b', text: '#f1f5f9', onBackground: '#f1f5f9', onSurface: '#e2e8f0' } : tritColors;
  }
  
  return isDark ? darkColors : lightColors;
};

const createTheme = (isDark: boolean, mode: ThemeMode, colorScheme: ColorScheme): Theme => ({
  colors: getColorsForScheme(isDark, colorScheme),
  isDark,
  mode,
  colorScheme,
});

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_MODE': {
      const newMode = action.payload;
      const systemIsDark = Appearance.getColorScheme() === 'dark';
      const isDark = newMode === 'system' ? systemIsDark : newMode === 'dark';
      return {
        ...state,
        mode: newMode,
        theme: createTheme(isDark, newMode, state.colorScheme),
      };
    }
    case 'SET_COLOR_SCHEME': {
      const newColorScheme = action.payload;
      return {
        ...state,
        colorScheme: newColorScheme,
        theme: createTheme(state.theme.isDark, state.mode, newColorScheme),
      };
    }
    case 'SET_SYSTEM_THEME': {
      if (state.mode === 'system') {
        const isDark = action.payload === 'dark';
        return {
          ...state,
          theme: createTheme(isDark, state.mode, state.colorScheme),
        };
      }
      return state;
    }
    default:
      return state;
  }
};

const ThemeContext = createContext<{
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
} | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, {
    mode: 'system' as ThemeMode,
    colorScheme: 'default' as ColorScheme,
    theme: createTheme(Appearance.getColorScheme() === 'dark', 'system', 'default'),
  });

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        const savedColorScheme = await AsyncStorage.getItem('colorScheme');
        
        if (savedMode) {
          dispatch({ type: 'SET_MODE', payload: savedMode as ThemeMode });
        }
        if (savedColorScheme) {
          dispatch({ type: 'SET_COLOR_SCHEME', payload: savedColorScheme as ColorScheme });
        }
      } catch (error) {
        console.warn('Failed to load theme settings:', error);
      }
    };

    loadSavedTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch({ type: 'SET_SYSTEM_THEME', payload: colorScheme });
    });

    return () => subscription?.remove();
  }, []);

  const setMode = async (mode: ThemeMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.warn('Failed to save theme mode:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    dispatch({ type: 'SET_COLOR_SCHEME', payload: scheme });
    try {
      await AsyncStorage.setItem('colorScheme', scheme);
    } catch (error) {
      console.warn('Failed to save color scheme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: state.theme, setMode, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};