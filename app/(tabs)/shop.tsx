import React, { useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard';
import { SearchBar } from '../../components/SearchBar';
import { FilterSheet } from '../../components/FilterSheet';
import { ProductListSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import type { ProductFilters, SortOption } from '../../types/product';

export default function ShopScreen() {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const { q } = useLocalSearchParams<{ q?: string }>();

  const [search, setSearch] = useState(q ?? '');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<SortOption>('newest');

  const filterRef = useRef<BottomSheet>(null);

  const { products, loading, error, refreshing, refresh } = useProducts(filters, sort);

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.series.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const SORT_LABELS: Record<SortOption, string> = {
    newest: 'Newest',
    price_asc: 'Price ↑',
    price_desc: 'Price ↓',
    featured: 'Featured',
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.separator }]}>
        <Text style={[styles.title, { color: C.text }]}>Shop iPhones</Text>
      </View>

      {/* Search + controls */}
      <View style={styles.controls}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search iPhones..."
            />
          </View>
          {/* Filter */}
          <TouchableOpacity
            style={[
              styles.controlBtn,
              {
                backgroundColor: activeFilterCount > 0 ? C.accent : C.card,
                borderColor: activeFilterCount > 0 ? C.accent : C.cardBorder,
              },
            ]}
            onPress={() => filterRef.current?.expand()}
            accessibilityLabel="Open filters"
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? '#FFF' : C.text}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Sort indicator */}
        <View style={styles.sortRow}>
          <Text style={[styles.resultCount, { color: C.textTertiary }]}>
            {loading ? '...' : `${filtered.length} products`}
          </Text>
          <TouchableOpacity
            style={[styles.sortBtn, { borderColor: C.cardBorder }]}
            onPress={() => filterRef.current?.expand()}
          >
            <Ionicons name="swap-vertical-outline" size={14} color={C.accent} />
            <Text style={[styles.sortLabel, { color: C.accent }]}>
              {SORT_LABELS[sort]}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid */}
      {loading ? (
        <ProductListSkeleton count={6} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
              icon={error ? 'alert-circle-outline' : 'search-outline'}
              title={error ? 'Unable to Load Products' : 'No Products Found'}
              description={
                error
                  ? `${error}\n\nPull down to retry.`
                  : search
                  ? `No iPhones matching "${search}".`
                  : 'Try adjusting your filters.'
              }
              ctaLabel={error ? 'Retry' : 'Clear Filters'}
              onCta={() => {
                if (error) {
                  refresh();
                } else {
                  setSearch('');
                  setFilters({});
                  setSort('newest');
                }
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}

      {/* Filter sheet */}
      <FilterSheet
        sheetRef={filterRef}
        filters={filters}
        sort={sort}
        onApply={(f, s) => {
          setFilters(f);
          setSort(s);
        }}
        onReset={() => {
          setFilters({});
          setSort('newest');
        }}
      />
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
  controls: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF453A',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultCount: { fontSize: 13 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sortLabel: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  row: { gap: 12 },
  cardWrap: { flex: 1 },
});
