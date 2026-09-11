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

function ContactRow({
  icon,
  label,
  value,
  onPress,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  onPress?: () => void;
  color?: string;
}) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[styles.contactRow, { backgroundColor: C.card, borderColor: C.cardBorder }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: C.accentGlow }]}>
        <Ionicons name={icon} size={20} color={color ?? C.accent} />
      </View>
      <View style={styles.contactContent}>
        <Text style={[styles.contactLabel, { color: C.textTertiary }]}>{label}</Text>
        <Text style={[styles.contactValue, { color: C.text }]}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={C.textTertiary} />}
    </TouchableOpacity>
  );
}

export default function ContactScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.separator }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
          <Ionicons name="close" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.text }]}>Contact Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: C.text }]}>
            <Text style={{ color: C.accent }}>THEEKZU</Text>
            {' '}MOBILE
          </Text>
          <Text style={[styles.heroSub, { color: C.textTertiary }]}>
            {BUSINESS.tagline}
          </Text>
          <Text style={[styles.hours, { color: C.textSecondary }]}>
            {BUSINESS.businessHours}
          </Text>
        </View>

        <Text style={[styles.section, { color: C.textTertiary }]}>Direct Contact</Text>

        <ContactRow
          icon="call-outline"
          label="Phone"
          value={BUSINESS.phone}
          onPress={() => open(`tel:${BUSINESS.phone}`)}
        />
        <ContactRow
          icon="logo-whatsapp"
          label="WhatsApp"
          value={BUSINESS.phone}
          onPress={() => open(BUSINESS.whatsappInquiryUrl())}
          color="#25D366"
        />
        <ContactRow
          icon="mail-outline"
          label="Email"
          value={BUSINESS.email}
          onPress={() => open(`mailto:${BUSINESS.email}`)}
        />
        <ContactRow
          icon="location-outline"
          label="Location"
          value={BUSINESS.location}
        />
        <ContactRow
          icon="globe-outline"
          label="Website"
          value={BUSINESS.website}
          onPress={() => open(BUSINESS.website)}
        />

        <Text style={[styles.section, { color: C.textTertiary, marginTop: 24 }]}>
          Follow Us
        </Text>

        <ContactRow
          icon="logo-instagram"
          label="Instagram"
          value={BUSINESS.social.instagram.label}
          onPress={() => open(BUSINESS.social.instagram.url)}
          color="#E1306C"
        />
        <ContactRow
          icon="logo-facebook"
          label="Facebook"
          value={BUSINESS.social.facebook.label}
          onPress={() => open(BUSINESS.social.facebook.url)}
          color="#1877F2"
        />
        <ContactRow
          icon="logo-tiktok"
          label="TikTok"
          value={BUSINESS.social.tiktok.label}
          onPress={() => open(BUSINESS.social.tiktok.url)}
          color={isDark ? '#FFFFFF' : '#000000'}
        />
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
  scroll: { padding: 16, paddingBottom: 32, gap: 10 },
  hero: { alignItems: 'center', gap: 6, marginBottom: 20, paddingTop: 8 },
  heroTitle: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  heroSub: { fontSize: 14 },
  hours: { fontSize: 13 },
  section: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactContent: { flex: 1 },
  contactLabel: { fontSize: 12, fontWeight: '500' },
  contactValue: { fontSize: 15, fontWeight: '600', marginTop: 1 },
});
