import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useOffersProducts } from '../../hooks/useProducts';
import { ProductImage } from '../../components/ProductImage';
import { PriceDisplay } from '../../components/PriceDisplay';
import { EmptyState } from '../../components/EmptyState';
import { ProductListSkeleton } from '../../components/LoadingSkeleton';
import type { ProductWithDetails } from '../../types/product';

function OfferCard({ product }: { product: ProductWithDetails }) {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  // Find the best discounted variant
  const bestVariant = product.variants
    .filter((v) => v.active && v.old_price && v.old_price > v.price)
    .sort((a, b) => {
      const aDisc = ((a.old_price! - a.price) / a.old_price!) * 100;
      const bDisc = ((b.old_price! - b.price) / b.old_price!) * 100;
      return bDisc - aDisc;
    })[0];

  if (!bestVariant) return null;

  const discount = Math.round(
    ((bestVariant.old_price! - bestVariant.price) / bestVariant.old_price!) * 100
  );

  return (
    <TouchableOpacity
      style={[styles.offerCard, { backgroundColor: C.card, borderColor: C.cardBorder }]}
      onPress={() => router.push(`/product/${product.slug}`)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`View offer for ${product.name}`}
    >
      {/* Discount ribbon */}
      <LinearGradient
        colors={[C.gradientStart, C.gradientEnd]}
        style={styles.ribbon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.ribbonText}>SAVE {discount}%</Text>
      </LinearGradient>

      <View style={styles.offerRow}>
        <ProductImage
          uri={product.primary_image_url}
          style={styles.offerImage}
          borderRadius={12}
        />
        <View style={styles.offerContent}>
          <Text style={[styles.offerName, { color: C.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={[styles.offerVariant, { color: C.textTertiary }]}>
            {bestVariant.storage} · {bestVariant.color}
          </Text>
          <Text style={[styles.offerCondition, { color: C.accent }]}>
            {product.condition}
          </Text>
          <PriceDisplay
            price={bestVariant.price}
            oldPrice={bestVariant.old_price}
            size="md"
          />
          {/* Stock */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    bestVariant.stock > 0 ? C.success : C.danger,
                },
              ]}
            />
            <Text
              style={[
                styles.stockText,
                { color: bestVariant.stock > 0 ? C.success : C.danger },
              ]}
            >
              {bestVariant.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OffersScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const { products, loading, error, refreshing, refresh } = useOffersProducts();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.separator }]}>
        <View>
          <Text style={[styles.title, { color: C.text }]}>Hot Offers 🔥</Text>
          <Text style={[styles.subtitle, { color: C.textTertiary }]}>
            Real-time deals from our live inventory
          </Text>
        </View>
      </View>

      {loading ? (
        <ProductListSkeleton count={4} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={C.accent}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={error ? 'alert-circle-outline' : 'pricetag-outline'}
              title={error ? 'Unable to Load Deals' : 'No Offers Right Now'}
              description={
                error
                  ? `${error}\n\nPull down to retry.`
                  : 'Check back soon — our inventory is updated regularly.'
              }
              ctaLabel={error ? 'Retry' : 'Browse All iPhones'}
              onCta={() => {
                if (error) {
                  refresh();
                } else {
                  router.push('/(tabs)/shop');
                }
              }}
            />
          }
          renderItem={({ item }) => <OfferCard product={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  listContent: { padding: 16, gap: 14, paddingBottom: 24 },
  offerCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ribbon: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  offerRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
  },
  offerImage: { width: 110, height: 110 },
  offerContent: { flex: 1, gap: 4 },
  offerName: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  offerVariant: { fontSize: 13 },
  offerCondition: { fontSize: 12, fontWeight: '600' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 12, fontWeight: '600' },
});
