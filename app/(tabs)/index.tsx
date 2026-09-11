import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useFeaturedProducts } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/ProductCard';
import { CategoryChips } from '../../components/CategoryChips';
import { HeroBanner } from '../../components/HeroBanner';
import { SearchBar } from '../../components/SearchBar';
import { ProductListSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const [selectedSeries, setSelectedSeries] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { products, loading, error, refreshing, refresh } = useFeaturedProducts(20);

  const filtered = products.filter((p) => {
    if (selectedSeries !== 'All') {
      const num = selectedSeries.replace(/[^0-9]/g, '');
      const matchesNum = Boolean(num && p.series === num);
      const matchesName = p.name.toLowerCase().includes(selectedSeries.toLowerCase());
      if (!matchesNum && !matchesName) return false;
    }
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      router.push({ pathname: '/(tabs)/shop', params: { q } });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top']}
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={C.accent}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.logo, { color: C.text }]}>
                  <Text style={{ color: C.accent }}>THEEKZU</Text>
                  {'\n'}MOBILE
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/wishlist')}
                  style={styles.headerBtn}
                  accessibilityLabel={`Wishlist, ${wishlistItems.length} items`}
                >
                  <Ionicons name="heart-outline" size={24} color={C.text} />
                  {wishlistItems.length > 0 && (
                    <View style={[styles.headerBadge, { backgroundColor: '#FF453A' }]}>
                      <Text style={styles.headerBadgeText}>{wishlistItems.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/cart')}
                  style={styles.headerBtn}
                  accessibilityLabel={`Cart, ${totalItems} items`}
                >
                  <Ionicons name="bag-outline" size={24} color={C.text} />
                  {totalItems > 0 && (
                    <View style={[styles.headerBadge, { backgroundColor: C.accent }]}>
                      <Text style={styles.headerBadgeText}>{totalItems}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/settings')}
                  style={styles.headerBtn}
                  accessibilityLabel="Settings"
                >
                  <Ionicons name="settings-outline" size={24} color={C.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Greeting */}
            <View style={styles.greeting}>
              <Text style={[styles.greetingLine1, { color: C.textTertiary }]}>
                Find Your
              </Text>
              <Text style={[styles.greetingLine2, { color: C.text }]}>
                Next iPhone.
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <SearchBar
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search iPhones..."
              />
            </View>

            {/* Hero Banner */}
            <HeroBanner />

            {/* Section title */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Browse</Text>
            </View>

            {/* Category chips */}
            <CategoryChips
              selected={selectedSeries}
              onSelect={(s) => setSelectedSeries(s)}
            />

            {/* Featured title */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>
                {selectedSeries === 'All' ? 'Featured' : selectedSeries}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/shop')}>
                <Text style={[styles.seeAll, { color: C.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {loading && <ProductListSkeleton count={6} />}
          </>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon={error ? 'alert-circle-outline' : 'phone-portrait-outline'}
              title={error ? 'Unable to Load Products' : 'No Products Found'}
              description={
                error
                  ? `${error}\n\nPull down to retry.`
                  : 'Try a different search or category.'
              }
              ctaLabel={error ? 'Retry' : 'Browse All'}
              onCta={() => {
                if (error) {
                  refresh();
                } else {
                  setSelectedSeries('All');
                  setSearchQuery('');
                }
              }}
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8, position: 'relative' },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  greeting: { paddingHorizontal: 16, marginBottom: 14, marginTop: 4 },
  greetingLine1: { fontSize: 28, fontWeight: '300', lineHeight: 34 },
  greetingLine2: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, lineHeight: 40 },
  searchWrap: { paddingHorizontal: 16, marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  seeAll: { fontSize: 15, fontWeight: '600' },
  row: { paddingHorizontal: 16, gap: 12 },
  cardWrap: { flex: 1 },
});
