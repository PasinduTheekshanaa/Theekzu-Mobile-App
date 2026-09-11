import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductImage } from './ProductImage';
import { PriceDisplay } from './PriceDisplay';
import type { ProductWithDetails } from '../types/product';

interface ProductCardProps {
  product: ProductWithDetails;
  style?: ViewStyle;
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

export function ProductCard({ product, style }: ProductCardProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.97, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
    router.push(`/product/${product.slug}`);
  };

  const handleWishlist = () => {
    heartScale.value = withSpring(1.3, { damping: 8 }, () => {
      heartScale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      series: product.series,
      condition: product.condition,
      image_url: product.primary_image_url,
      starting_price: product.starting_price,
      added_at: new Date().toISOString(),
    });
  };

  const hasStock = product.variants.some((v) => v.active && v.stock > 0);
  const bestDiscount = product.variants.reduce<number>((max, v) => {
    if (!v.active || !v.old_price || v.old_price <= v.price) return max;
    const pct = Math.round(((v.old_price - v.price) / v.old_price) * 100);
    return Math.max(max, pct);
  }, 0);

  return (
    <Animated.View
      style={[
        animatedStyle,
        styles.card,
        { backgroundColor: C.card, borderColor: C.cardBorder, width: CARD_WIDTH } as ViewStyle,
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name}`}
      >
        {/* Image */}
        <View style={styles.imageWrap}>
          <ProductImage
            uri={product.primary_image_url}
            style={styles.image}
            borderRadius={12}
          />
          {/* Discount Badge */}
          {bestDiscount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: C.danger } as ViewStyle]}>
              <Text style={[styles.discountText] as TextStyle[]}>-{bestDiscount}%</Text>
            </View>
          )}
          {/* Wishlist button */}
          <TouchableOpacity
            onPress={handleWishlist}
            style={styles.heartBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Animated.View style={heartStyle}>
              <Ionicons
                name={wishlisted ? 'heart' : 'heart-outline'}
                size={20}
                color={wishlisted ? '#FF453A' : C.textTertiary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.name, { color: C.text } as TextStyle]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={[styles.condition, { color: C.textTertiary } as TextStyle]}>
            {product.condition}
          </Text>
          <PriceDisplay
            price={product.starting_price}
            showLabel
            size="sm"
          />
          {/* Stock */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                { backgroundColor: hasStock ? C.success : C.danger } as ViewStyle,
              ]}
            />
            <Text
              style={[
                styles.stockText,
                { color: hasStock ? C.success : C.danger } as TextStyle,
              ]}
            >
              {hasStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 160,
    position: 'relative',
  },
  image: {
    height: 160,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    padding: 5,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 19,
  },
  condition: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
