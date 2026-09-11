import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { ProductImage } from '../../components/ProductImage';
import { EmptyState } from '../../components/EmptyState';
import type { WishlistItem } from '../../types/product';

function WishlistCard({ item, onRemove }: { item: WishlistItem; onRemove: () => void }) {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  const formatLKR = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.card, borderColor: C.cardBorder }]}
      onPress={() => router.push(`/product/${item.slug}`)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name}`}
    >
      <ProductImage
        uri={item.image_url}
        style={styles.cardImage}
        borderRadius={12}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.name, { color: C.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.condition, { color: C.textTertiary }]}>
          {item.condition}
        </Text>
        <Text style={[styles.price, { color: C.accent }]}>
          From {formatLKR(item.starting_price)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        style={styles.removeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Remove ${item.name} from wishlist`}
      >
        <Ionicons name="heart" size={22} color="#FF453A" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function WishlistScreen() {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const { items, toggle, clear } = useWishlist();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.separator }]}>
        <Text style={[styles.title, { color: C.text }]}>Wishlist</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clear} accessibilityLabel="Clear wishlist">
            <Text style={[styles.clearBtn, { color: C.danger }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Your Wishlist Is Empty"
            description="Save iPhones you love here and revisit them anytime."
            ctaLabel="Browse iPhones"
            onCta={() => router.push('/(tabs)/shop')}
          />
        }
        renderItem={({ item }) => (
          <WishlistCard
            item={item}
            onRemove={() => toggle(item)}
          />
        )}
      />
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
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  clearBtn: { fontSize: 15, fontWeight: '600' },
  listContent: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  cardImage: { width: 80, height: 80 },
  cardContent: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  condition: { fontSize: 12 },
  price: { fontSize: 15, fontWeight: '700' },
  removeBtn: { padding: 4 },
});
