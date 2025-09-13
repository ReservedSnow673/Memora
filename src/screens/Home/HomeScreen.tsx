import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectProcessingStats, selectUnprocessedImagesCount } from '../../store';
import { RootStackParamList } from '../../types';
import { COLORS, FONT_SIZES } from '../../utils/constants';
import { getAccessibleFontSize } from '../../utils/helpers';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { settings } = useAppSelector(state => state.settings);
  const { isProcessing, totalProcessed, totalFailed } = useAppSelector(state => state.processing);
  const processingStats = useAppSelector(selectProcessingStats);
  const unprocessedCount = useAppSelector(selectUnprocessedImagesCount);
  
  const { accessibility } = settings;
  const colors = accessibility.highContrast ? COLORS.highContrast : COLORS;

  useEffect(() => {
    // Announce screen content for screen readers
    if (accessibility.screenReaderOptimized) {
      AccessibilityInfo.announceForAccessibility(
        'Home screen. View your image processing statistics and quick actions.'
      );
    }
  }, [accessibility.screenReaderOptimized]);

  const handleCameraPress = () => {
    navigation.navigate('Camera');
  };

  const handleGalleryPress = () => {
    navigation.navigate('Main');
    // Navigate to Gallery tab (this would need tab navigation ref)
  };

  const handleManualScanPress = () => {
    Alert.alert(
      'Manual Scan',
      'Start scanning gallery for images without captions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Scan', 
          onPress: () => {
            // TODO: Implement manual scan
            Alert.alert('Feature Coming Soon', 'Manual scan will be implemented.');
          }
        },
      ]
    );
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text 
          style={[
            styles.statTitle,
            { 
              color: colors.textSecondary,
              fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
            }
          ]}
          accessibilityRole="text"
        >
          {title}
        </Text>
      </View>
      <Text 
        style={[
          styles.statValue,
          { 
            color: colors.text,
            fontSize: getAccessibleFontSize('xlarge', accessibility.dynamicFontSize, 1.0)
          }
        ]}
        accessibilityRole="text"
        accessibilityLabel={`${title}: ${value}`}
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
        { backgroundColor: color, opacity: disabled ? 0.6 : 1.0 }
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={disabled ? 'Button is disabled' : undefined}
    >
      <Ionicons name={icon} size={24} color="white" />
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
      accessible={true}
      accessibilityLabel="Home screen content"
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text 
          style={[
            styles.welcomeTitle,
            { 
              color: colors.text,
              fontSize: getAccessibleFontSize('xxlarge', accessibility.dynamicFontSize, 1.0)
            }
          ]}
          accessibilityRole="header"
        >
          Welcome to Memora
        </Text>
        <Text 
          style={[
            styles.welcomeSubtitle,
            { 
              color: colors.textSecondary,
              fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
            }
          ]}
          accessibilityRole="text"
        >
          Your AI-powered image caption assistant
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
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
          Statistics
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Images"
            value={processingStats.totalImages}
            icon="images-outline"
            color={colors.primary}
          />
          <StatCard
            title="Processed"
            value={processingStats.processedImages}
            icon="checkmark-circle-outline"
            color={COLORS.success}
          />
          <StatCard
            title="Pending"
            value={unprocessedCount}
            icon="time-outline"
            color={COLORS.warning}
          />
          <StatCard
            title="Failed"
            value={totalFailed}
            icon="alert-circle-outline"
            color={COLORS.error}
          />
        </View>
      </View>

      {/* Processing Status */}
      {isProcessing && (
        <View style={[styles.processingBanner, { backgroundColor: COLORS.warning }]}>
          <Ionicons name="sync-outline" size={20} color="white" />
          <Text style={styles.processingText}>Processing images...</Text>
        </View>
      )}

      {/* Quick Actions */}
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
          Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <ActionButton
            title="Take Photo"
            icon="camera-outline"
            onPress={handleCameraPress}
            color={colors.primary}
          />
          <ActionButton
            title="View Gallery"
            icon="images-outline"
            onPress={handleGalleryPress}
            color={colors.secondary}
          />
          <ActionButton
            title="Manual Scan"
            icon="scan-outline"
            onPress={handleManualScanPress}
            color={COLORS.success}
            disabled={isProcessing}
          />
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
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
          Tips
        </Text>
        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.warning} />
          <Text 
            style={[
              styles.tipText,
              { 
                color: colors.textSecondary,
                fontSize: getAccessibleFontSize('medium', accessibility.dynamicFontSize, 1.0)
              }
            ]}
          >
            Enable auto-scan in Settings to automatically process new photos in your gallery.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontWeight: 'bold',
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  processingText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 24,
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
    gap: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default HomeScreen;