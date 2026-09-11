import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { BUSINESS } from '../config/business';

type ThemeModeLocal = 'system' | 'light' | 'dark';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
  noChevron,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  noChevron?: boolean;
}) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: C.card, borderColor: C.cardBorder }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
    >
      <View style={[styles.rowIcon, { backgroundColor: C.accentGlow }]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? C.danger : C.accent}
        />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? C.danger : C.text }]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.rowValue, { color: C.textTertiary }]}>{value}</Text>
      )}
      {onPress && !noChevron && (
        <Ionicons name="chevron-forward" size={16} color={C.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

const THEME_OPTIONS: { label: string; value: ThemeModeLocal; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, mode, setMode } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.separator }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close settings">
          <Ionicons name="close" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Appearance */}
        <Text style={[styles.section, { color: C.textTertiary }]}>Appearance</Text>
        <View style={[styles.themeSelector, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.themeOption,
                mode === opt.value && [
                  styles.themeOptionActive,
                  { backgroundColor: C.accent },
                ],
              ]}
              onPress={() => setMode(opt.value as any)}
              accessibilityRole="button"
              accessibilityLabel={`Set theme to ${opt.label}`}
              accessibilityState={{ selected: mode === opt.value }}
            >
              <Ionicons
                name={opt.icon}
                size={16}
                color={mode === opt.value ? '#FFFFFF' : C.textTertiary}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: mode === opt.value ? '#FFFFFF' : C.textTertiary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <Text style={[styles.section, { color: C.textTertiary, marginTop: 24 }]}>
          Notifications
        </Text>
        <SettingsRow
          icon="notifications-outline"
          label="Push Notifications"
          value="Coming Soon"
          noChevron
        />

        {/* About */}
        <Text style={[styles.section, { color: C.textTertiary, marginTop: 24 }]}>About</Text>
        <SettingsRow
          icon="information-circle-outline"
          label="About Theekzu Mobile"
          onPress={() => open(BUSINESS.website)}
        />
        <SettingsRow
          icon="call-outline"
          label="Contact Us"
          onPress={() => router.push('/contact')}
        />
        <SettingsRow
          icon="globe-outline"
          label="Visit Website"
          onPress={() => open(BUSINESS.website)}
        />

        {/* Legal */}
        <Text style={[styles.section, { color: C.textTertiary, marginTop: 24 }]}>Legal</Text>
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => open(`${BUSINESS.website}/privacy`)}
        />
        <SettingsRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => open(`${BUSINESS.website}/terms`)}
        />

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: C.textTertiary }]}>
            Theekzu Mobile v1.0.0
          </Text>
          <Text style={[styles.appSub, { color: C.textDisabled }]}>
            Premium iPhones. Trusted Service.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40, gap: 8 },
  section: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  themeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 6,
    gap: 6,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  themeOptionActive: {},
  themeLabel: { fontSize: 13, fontWeight: '600' },
  appInfo: { alignItems: 'center', marginTop: 20, gap: 4 },
  appName: { fontSize: 13, fontWeight: '500' },
  appSub: { fontSize: 12 },
});
