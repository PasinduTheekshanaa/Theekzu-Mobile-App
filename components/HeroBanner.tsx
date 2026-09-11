import React from 'react';
import {
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export function HeroBanner() {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  const float = useSharedValue(0);

  React.useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000 }),
        withTiming(6, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#0A0A1E', '#0A1628', '#000B1E']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative glow */}
        <View style={[styles.glow, { backgroundColor: C.accentGlow } as ViewStyle]} />
        <View style={[styles.glow2, { backgroundColor: 'rgba(107,47,232,0.15)' } as ViewStyle]} />

        <View style={styles.content}>
          <View style={styles.badge}>
            <LinearGradient
              colors={[C.gradientStart, C.gradientEnd]}
              style={styles.badgeGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.badgeText as TextStyle}>NEW ARRIVALS</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title as TextStyle}>iPhone 16 Pro</Text>
          <Text style={styles.subtitle as TextStyle}>More Than a Phone.</Text>
          <Text style={styles.description as TextStyle}>
            A18 Pro chip · Titanium design{'\n'}Starting from Rs. 380,000
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/product/iphone-16-pro')}
            accessibilityRole="button"
            accessibilityLabel="Explore iPhone 16 Pro"
          >
            <LinearGradient
              colors={[C.gradientStart, C.gradientEnd]}
              style={styles.buttonGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText as TextStyle}>Explore Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Floating phone placeholder */}
        <Animated.View style={[styles.phoneWrap, floatStyle]}>
          <View style={styles.phoneSilhouette} />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 200,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 16,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -40,
  },
  glow2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -40,
    left: -20,
  },
  content: { flex: 1, zIndex: 1, gap: 6 },
  badge: { marginBottom: 2 },
  badgeGrad: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '400' as const,
  },
  description: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 18,
  },
  button: { marginTop: 6, alignSelf: 'flex-start' },
  buttonGrad: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  phoneWrap: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneSilhouette: {
    width: 56,
    height: 112,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});
