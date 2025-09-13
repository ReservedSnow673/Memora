import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store';
import { setUser, setLoading, setError } from '../../store/slices/authSlice';
import { COLORS } from '../../utils/constants';
import { getAccessibleFontSize } from '../../utils/helpers';

const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { settings } = useAppSelector(state => state.settings);
  const { isLoading, error } = useAppSelector(state => state.auth);
  
  const { accessibility } = settings;
  const colors = accessibility.highContrast ? COLORS.highContrast : COLORS;

  const handleGoogleSignIn = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // TODO: Implement actual Google Sign-In
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
      
      // Mock user data
      const mockUser = {
        id: 'mock-user-id',
        email: 'user@example.com',
        displayName: 'Test User',
        photoURL: undefined,
        isGoogleSignedIn: true,
      };
      
      dispatch(setUser(mockUser));
      Alert.alert('Success', 'Signed in successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      dispatch(setError('Failed to sign in with Google'));
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="logo-google" size={64} color="#4285F4" />
          <Text 
            style={[
              styles.title,
              { 
                color: colors.text,
                fontSize: getAccessibleFontSize('xxlarge', accessibility.dynamicFontSize, 1.0)
              }
            ]}
            accessibilityRole="header"
          >
            Sign In with Google
          </Text>
          <Text 
            style={[
              styles.subtitle,
              { 
                color: colors.textSecondary,
                fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
              }
            ]}
          >
            Access Google Photos integration and sync your captions across devices
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <Text 
            style={[
              styles.featuresTitle,
              { 
                color: colors.text,
                fontSize: getAccessibleFontSize('large', accessibility.dynamicFontSize, 1.0)
              }
            ]}
            accessibilityRole="header"
          >
            What you'll get:
          </Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="cloud-outline" size={24} color={colors.primary} />
            <Text 
              style={[
                styles.featureText,
                { 
                  color: colors.text,
                  fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
                }
              ]}
            >
              Import images from Google Photos
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="sync-outline" size={24} color={colors.primary} />
            <Text 
              style={[
                styles.featureText,
                { 
                  color: colors.text,
                  fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
                }
              ]}
            >
              Sync captions across devices
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
            <Text 
              style={[
                styles.featureText,
                { 
                  color: colors.text,
                  fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
                }
              ]}
            >
              Secure authentication
            </Text>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: COLORS.error + '20', borderColor: COLORS.error }]}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
            <Text style={[styles.errorText, { color: COLORS.error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.signInButton,
              { 
                backgroundColor: '#4285F4',
                opacity: isLoading ? 0.7 : 1.0
              }
            ]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
            accessibilityHint="Sign in to access Google Photos integration"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="white" />
                <Text 
                  style={[
                    styles.signInButtonText,
                    { fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0) }
                  ]}
                >
                  Sign in with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={handleSkip}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Skip sign in"
            accessibilityHint="Continue without signing in"
          >
            <Text 
              style={[
                styles.skipButtonText,
                { 
                  color: colors.text,
                  fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
                }
              ]}
            >
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <Text 
          style={[
            styles.privacyNote,
            { 
              color: colors.textSecondary,
              fontSize: getAccessibleFontSize('small', accessibility.dynamicFontSize, 1.0)
            }
          ]}
        >
          Your privacy is important to us. We only access the data you explicitly authorize.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontWeight: '500',
  },
  privacyNote: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AuthScreen;