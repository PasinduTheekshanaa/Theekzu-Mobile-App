import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useProductDetail } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { VariantSelector } from '../../components/VariantSelector';
import { PriceDisplay } from '../../components/PriceDisplay';
import { ProductDetailSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { BUSINESS } from '../../config/business';
import type { ProductVariant } from '../../types/product';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  const { product, loading, error, refetch } = useProductDetail(slug ?? '');
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Auto-select first available variant when product loads
  useEffect(() => {
    if (!product) return;
    const firstVariant = product.variants.find((v) => v.active && v.stock > 0);
    if (firstVariant) {
      setSelectedStorage(firstVariant.storage);
      setSelectedColor(firstVariant.color);
    }
  }, [product]);

  // Current matching variant
  const currentVariant: ProductVariant | null = useMemo(() => {
    if (!product || !selectedStorage || !selectedColor) return null;
    return (
      product.variants.find(
        (v) =>
          v.active &&
          v.storage === selectedStorage &&
          v.color === selectedColor
      ) ?? null
    );
  }, [product, selectedStorage, selectedColor]);

  const imageUrls = useMemo(() => {
    if (!product) return [];
    if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls;
    }
    return product.primary_image_url ? [product.primary_image_url] : [];
  }, [product]);

  const wishlisted = product ? isWishlisted(product.id) : false;

  const handleAddToCart = useCallback(() => {
    if (!product || !currentVariant) return;
    if (currentVariant.stock === 0) {
      Alert.alert('Out of Stock', 'This variant is currently unavailable.');
      return;
    }
    addItem({
      product_id: product.id,
      variant_id: currentVariant.id,
      name: product.name,
      slug: product.slug,
      storage: currentVariant.storage,
      color: currentVariant.color,
      price: currentVariant.price,
      quantity: 1,
      image_url: product.primary_image_url,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added to Cart', `${product.name} (${currentVariant.storage} / ${currentVariant.color}) has been added to your cart.`);
  }, [product, currentVariant, addItem]);

  const handleWhatsApp = useCallback(async () => {
    if (!product || !currentVariant) return;
    const formatLKR = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`;
    const message =
      `Hello Theekzu Mobile 👋\n\nI would like to order:\n\n` +
      `Product: ${product.name}\n` +
      `Storage: ${currentVariant.storage}\n` +
      `Color: ${currentVariant.color}\n` +
      `Price: ${formatLKR(currentVariant.price)}\n\n` +
      `Please confirm availability.`;

    const url = BUSINESS.whatsappInquiryUrl(message);
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://wa.me/94740245749?text=${encodeURIComponent(message)}`);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Alert.alert('WhatsApp Unavailable', `Call us at ${BUSINESS.phone}`);
    }
  }, [product, currentVariant]);

  const handleWishlist = () => {
    if (!product) return;
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <ProductDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <EmptyState
          icon="alert-circle-outline"
          title="Product Not Found"
          description={error || 'This product may no longer be available.'}
          ctaLabel="Go Back"
          onCta={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const inStock = currentVariant ? currentVariant.stock > 0 : false;
  const formatLKR = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top']}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.topBtn, { backgroundColor: C.card }]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: C.text }]} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          onPress={handleWishlist}
          style={[styles.topBtn, { backgroundColor: C.card }]}
          accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={22}
            color={wishlisted ? '#FF453A' : C.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image gallery */}
        <View style={[styles.imageContainer, { backgroundColor: C.card }]}>
          <Image
            source={imageUrls[selectedImageIdx] ? { uri: imageUrls[selectedImageIdx] } : null}
            style={styles.mainImage}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>

        {/* Thumbnail strip */}
        {imageUrls.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
          >
            {imageUrls.map((uri, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedImageIdx(i)}
                style={[
                  styles.thumb,
                  {
                    borderColor: i === selectedImageIdx ? C.accent : C.cardBorder,
                    backgroundColor: C.card,
                  },
                ]}
                accessibilityLabel={`Image ${i + 1}`}
              >
                <Image
                  source={{ uri }}
                  style={styles.thumbImg}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product info */}
        <View style={styles.info}>
          {/* Name & badges */}
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: C.text }]}>{product.name}</Text>
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: C.accentGlow }]}>
              <Text style={[styles.badgeText, { color: C.accent }]}>{product.series}</Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    product.condition === 'Brand New' ? C.successLight : C.warningLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      product.condition === 'Brand New' ? C.success : C.warning,
                  },
                ]}
              >
                {product.condition}
              </Text>
            </View>
          </View>

          {/* Price */}
          {currentVariant ? (
            <PriceDisplay
              price={currentVariant.price}
              oldPrice={currentVariant.old_price}
              size="lg"
            />
          ) : (
            <PriceDisplay price={product.starting_price} showLabel size="lg" />
          )}

          {/* Stock */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                { backgroundColor: inStock ? C.success : C.danger },
              ]}
            />
            <Text
              style={[styles.stockText, { color: inStock ? C.success : C.danger }]}
            >
              {currentVariant
                ? inStock
                  ? `In Stock (${currentVariant.stock} available)`
                  : 'Out of Stock'
                : 'Select variant'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: C.separator }]} />

          {/* Variant selector */}
          <VariantSelector
            variants={product.variants}
            selectedStorage={selectedStorage}
            selectedColor={selectedColor}
            onStorageChange={setSelectedStorage}
            onColorChange={setSelectedColor}
          />

          <View style={[styles.divider, { backgroundColor: C.separator }]} />

          {/* Description */}
          {product.description && (
            <>
              <Text style={[styles.sectionLabel, { color: C.textTertiary }]}>
                About this product
              </Text>
              <Text style={[styles.description, { color: C.textSecondary }]}>
                {product.description}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom actions */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: C.background,
            borderTopColor: C.separator,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.cartBtn,
            {
              backgroundColor: C.card,
              borderColor: C.accent,
              opacity: !currentVariant || !inStock ? 0.5 : 1,
            },
          ]}
          onPress={handleAddToCart}
          disabled={!currentVariant || !inStock}
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
        >
          <Ionicons name="bag-add-outline" size={20} color={C.accent} />
          <Text style={[styles.cartBtnText, { color: C.accent }]}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.waBtn,
            { opacity: !currentVariant || !inStock ? 0.5 : 1 },
          ]}
          onPress={handleWhatsApp}
          disabled={!currentVariant || !inStock}
          accessibilityRole="button"
          accessibilityLabel="Order on WhatsApp"
        >
          <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
          <Text style={styles.waBtnText}>Order on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: 16 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { flex: 1, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  scroll: { paddingBottom: 24 },
  imageContainer: {
    height: 320,
    marginHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainImage: { width: width - 32, height: 320 },
  thumbStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: 52, height: 52 },
  info: { paddingHorizontal: 16, gap: 14 },
  nameRow: {},
  name: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  description: { fontSize: 15, lineHeight: 24 },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: 24,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cartBtnText: { fontSize: 15, fontWeight: '700' },
  waBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 15,
    borderRadius: 16,
  },
  waBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
