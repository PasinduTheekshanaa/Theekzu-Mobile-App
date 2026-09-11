import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface ProductImageProps {
  uri: string | null;
  style?: object;
  borderRadius?: number;
}

const PLACEHOLDER_COLOR = '#1E1E2E';
const BLUR_HASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

export function ProductImage({ uri, style, borderRadius = 12 }: ProductImageProps) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: C.card, borderRadius },
        style,
      ]}
    >
      <Image
        source={uri ? { uri } : null}
        style={[styles.image, { borderRadius }]}
        contentFit="contain"
        placeholder={BLUR_HASH}
        placeholderContentFit="contain"
        transition={300}
        cachePolicy="memory-disk"
        recyclingKey={uri ?? 'placeholder'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
