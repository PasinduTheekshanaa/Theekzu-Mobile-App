import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBox({ width, height, borderRadius = 8, style }: SkeletonBoxProps) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: C.skeletonBase,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
      <SkeletonBox width="100%" height={160} borderRadius={12} />
      <View style={styles.content}>
        <SkeletonBox width="75%" height={14} />
        <SkeletonBox width="50%" height={12} style={{ marginTop: 6 }} />
        <SkeletonBox width="60%" height={18} style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

export function ProductListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function ProductDetailSkeleton() {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <SkeletonBox width="100%" height={320} borderRadius={20} />
      <SkeletonBox width="70%" height={26} />
      <SkeletonBox width="45%" height={16} />
      <SkeletonBox width="55%" height={24} />
      <SkeletonBox width="100%" height={1} />
      <SkeletonBox width="40%" height={16} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {['64GB', '128GB', '256GB'].map((s) => (
          <SkeletonBox key={s} width={70} height={40} borderRadius={10} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
});
