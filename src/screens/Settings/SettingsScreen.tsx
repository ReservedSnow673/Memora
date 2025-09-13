import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  toggleAutoScan, 
  setScanFrequency, 
  setCustomDays, 
  toggleWifiOnly, 
  toggleChargingOnly,
  updateTimeRestriction,
  updateAccessibility 
} from '../../store/slices/settingsSlice';
import { COLORS } from '../../utils/constants';
import { getAccessibleFontSize } from '../../utils/helpers';

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state.settings);
  const { accessibility } = settings;
  const colors = accessibility.highContrast ? COLORS.highContrast : COLORS;

  const SettingRow: React.FC<{
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }> = ({ title, subtitle, icon, onPress, rightElement }) => (
    <TouchableOpacity
      style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />)}
    </TouchableOpacity>
  );

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionHeader title="AUTO SCAN" />
      
      <SettingRow
        title="Enable Auto Scan"
        subtitle="Automatically scan gallery for new images"
        icon="scan-outline"
        rightElement={
          <Switch
            value={settings.autoScanEnabled}
            onValueChange={() => {
              dispatch(toggleAutoScan());
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        }
      />

      {settings.autoScanEnabled && (
        <>
          <SettingRow
            title="Scan Frequency"
            subtitle={`Currently: ${settings.scanFrequency}`}
            icon="timer-outline"
            onPress={() => {
              Alert.alert('Feature Coming Soon', 'Scan frequency settings will be implemented.');
            }}
          />

          <SettingRow
            title="WiFi Only"
            subtitle="Only scan when connected to WiFi"
            icon="wifi-outline"
            rightElement={
              <Switch
                value={settings.scanOnWifiOnly}
                onValueChange={() => {
                  dispatch(toggleWifiOnly());
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            }
          />

          <SettingRow
            title="While Charging"
            subtitle="Only scan when device is charging"
            icon="battery-charging-outline"
            rightElement={
              <Switch
                value={settings.scanOnCharging}
                onValueChange={() => {
                  dispatch(toggleChargingOnly());
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            }
          />

          <SettingRow
            title="Time Restrictions"
            subtitle={settings.scanTimeRestriction.enabled ? 
              `${settings.scanTimeRestriction.startTime} - ${settings.scanTimeRestriction.endTime}` : 
              'No restrictions'
            }
            icon="time-outline"
            onPress={() => {
              Alert.alert('Feature Coming Soon', 'Time restriction settings will be implemented.');
            }}
          />
        </>
      )}

      <SectionHeader title="ACCESSIBILITY" />

      <SettingRow
        title="Dynamic Font Size"
        subtitle="Scale text based on system settings"
        icon="text-outline"
        rightElement={
          <Switch
            value={accessibility.dynamicFontSize}
            onValueChange={(value) => {
              dispatch(updateAccessibility({ dynamicFontSize: value }));
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        }
      />

      <SettingRow
        title="High Contrast"
        subtitle="Use high contrast colors"
        icon="contrast-outline"
        rightElement={
          <Switch
            value={accessibility.highContrast}
            onValueChange={(value) => {
              dispatch(updateAccessibility({ highContrast: value }));
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        }
      />

      <SettingRow
        title="Screen Reader Optimized"
        subtitle="Enhanced compatibility with screen readers"
        icon="accessibility-outline"
        rightElement={
          <Switch
            value={accessibility.screenReaderOptimized}
            onValueChange={(value) => {
              dispatch(updateAccessibility({ screenReaderOptimized: value }));
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        }
      />

      <SectionHeader title="ACCOUNT" />

      <SettingRow
        title="Sign In with Google"
        subtitle="Access Google Photos integration"
        icon="logo-google"
        onPress={() => {
          Alert.alert('Feature Coming Soon', 'Google Sign In will be implemented.');
        }}
      />

      <SectionHeader title="ABOUT" />

      <SettingRow
        title="Privacy Policy"
        icon="shield-outline"
        onPress={() => {
          Alert.alert('Privacy Policy', 'Privacy policy content will be available here.');
        }}
      />

      <SettingRow
        title="Terms of Service"
        icon="document-text-outline"
        onPress={() => {
          Alert.alert('Terms of Service', 'Terms of service content will be available here.');
        }}
      />

      <SettingRow
        title="App Version"
        subtitle="1.0.0"
        icon="information-circle-outline"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default SettingsScreen;