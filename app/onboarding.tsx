import React, { useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = 'theekzu:onboarding_done';

const SLIDES = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Premium iPhones',
    description:
      'Discover carefully selected Apple devices at competitive prices. Brand new and certified pre-owned — all quality checked.',
    gradient: ['#0A0A1E', '#0A1A3E'] as [string, string],
    accent: '#0A84FF',
  },
  {
    icon: 'layers-outline' as const,
    title: 'Find Your Perfect Match',
    description:
      'Compare storage, colors, prices and availability in seconds. Every variant updated live from our inventory.',
    gradient: ['#0A001E', '#1A0A2E'] as [string, string],
    accent: '#6B2FE8',
  },
  {
    icon: 'logo-whatsapp' as const,
    title: 'Fast & Easy Ordering',
    description:
      'Choose your device and order directly through WhatsApp. Instant confirmation, islandwide delivery across Sri Lanka.',
    gradient: ['#001A0E', '#001E16'] as [string, string],
    accent: '#30D158',
  },
];

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const next = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIdx = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIdx * width, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      finish();
    }
  };

  return (
    <View style={styles.root}>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
      >
        {SLIDES.map((slide, i) => (
          <LinearGradient
            key={i}
            colors={slide.gradient}
            style={styles.slide}
          >
            {/* Glow circle */}
            <View
              style={[
                styles.glowCircle,
                { backgroundColor: `${slide.accent}20` },
              ]}
            />
            {/* Icon */}
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${slide.accent}25`, borderColor: `${slide.accent}50` },
              ]}
            >
              <Ionicons name={slide.icon} size={56} color={slide.accent} />
            </View>
            {/* Text */}
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDesc}>{slide.description}</Text>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <SafeAreaView edges={['bottom']} style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => {
            const dotWidth = i === currentIndex ? 24 : 8;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    backgroundColor:
                      i === currentIndex
                        ? SLIDES[currentIndex].accent
                        : 'rgba(255,255,255,0.3)',
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.btnRow}>
          {/* Skip */}
          <TouchableOpacity onPress={finish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Next / Get Started */}
          <TouchableOpacity
            onPress={next}
            style={[
              styles.nextBtn,
              { backgroundColor: SLIDES[currentIndex].accent },
            ]}
          >
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={
                currentIndex === SLIDES.length - 1
                  ? 'checkmark'
                  : 'arrow-forward'
              }
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
    paddingBottom: 180,
  },
  glowCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  slideDesc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 25,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
