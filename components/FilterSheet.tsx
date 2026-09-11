import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import type { ProductFilters, SortOption } from '../types/product';

interface FilterSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  filters: ProductFilters;
  sort: SortOption;
  onApply: (filters: ProductFilters, sort: SortOption) => void;
  onReset: () => void;
}

const CONDITIONS = ['Brand New', 'Used', 'Refurbished'];
const STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Featured', value: 'featured' },
];

export function FilterSheet({
  sheetRef,
  filters,
  sort,
  onApply,
  onReset,
}: FilterSheetProps) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  const [localSort, setLocalSort] = useState<SortOption>(sort);

  const snapPoints = useMemo(() => ['75%'], []);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
  }, [sheetRef]);

  const handleApply = () => {
    onApply(localFilters, localSort);
    handleClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    setLocalSort('newest');
    onReset();
    handleClose();
  };

  const toggleCondition = (cond: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      condition: prev.condition === cond ? undefined : cond,
    }));
  };

  const toggleStorage = (s: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      storage: prev.storage === s ? undefined : s,
    }));
  };

  const pillStyle = (active: boolean): ViewStyle => ({
    ...styles.pill,
    backgroundColor: active ? C.accent : C.card,
    borderColor: active ? C.accent : C.cardBorder,
  });

  const pillTextStyle = (active: boolean): TextStyle => ({
    ...styles.pillText,
    color: active ? '#FFF' : C.text,
  });

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' } as ViewStyle}
      handleIndicatorStyle={{ backgroundColor: C.textTertiary } as ViewStyle}
    >
      <BottomSheetView style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: C.text } as TextStyle]}>Filter & Sort</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Sort */}
          <Text style={[styles.sectionTitle, { color: C.textTertiary } as TextStyle]}>Sort By</Text>
          <View style={styles.optionsWrap}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={pillStyle(localSort === opt.value)}
                onPress={() => setLocalSort(opt.value)}
              >
                <Text style={pillTextStyle(localSort === opt.value)}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Condition */}
          <Text style={[styles.sectionTitle, { color: C.textTertiary } as TextStyle]}>Condition</Text>
          <View style={styles.optionsWrap}>
            {CONDITIONS.map((cond) => (
              <TouchableOpacity
                key={cond}
                style={pillStyle(localFilters.condition === cond)}
                onPress={() => toggleCondition(cond)}
              >
                <Text style={pillTextStyle(localFilters.condition === cond)}>{cond}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Storage */}
          <Text style={[styles.sectionTitle, { color: C.textTertiary } as TextStyle]}>Storage</Text>
          <View style={styles.optionsWrap}>
            {STORAGES.map((s) => (
              <TouchableOpacity
                key={s}
                style={pillStyle(localFilters.storage === s)}
                onPress={() => toggleStorage(s)}
              >
                <Text style={pillTextStyle(localFilters.storage === s)}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* In Stock toggle */}
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: C.text } as TextStyle]}>In Stock Only</Text>
            <Switch
              value={!!localFilters.in_stock}
              onValueChange={(v) =>
                setLocalFilters((prev) => ({ ...prev, in_stock: v }))
              }
              trackColor={{ false: C.cardBorder, true: C.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={[styles.actions, { borderTopColor: C.separator } as ViewStyle]}>
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: C.accent } as ViewStyle]}
            onPress={handleReset}
          >
            <Text style={[styles.resetText, { color: C.accent } as TextStyle]}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: C.accent } as ViewStyle]}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
  },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 14, fontWeight: '500' as const },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 4,
  },
  toggleLabel: { fontSize: 16, fontWeight: '500' as const },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  resetText: { fontSize: 16, fontWeight: '600' as const },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  applyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' as const },
});
