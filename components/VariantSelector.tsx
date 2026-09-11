import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import type { ProductVariant } from '../types/product';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedStorage: string | null;
  selectedColor: string | null;
  onStorageChange: (storage: string) => void;
  onColorChange: (color: string) => void;
}

export function VariantSelector({
  variants,
  selectedStorage,
  selectedColor,
  onStorageChange,
  onColorChange,
}: VariantSelectorProps) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  // Unique storage options
  const storages = Array.from(
    new Set(variants.filter((v) => v.active).map((v) => v.storage))
  ).sort(storageSort);

  // Colors available for selected storage
  const colorsForStorage = selectedStorage
    ? Array.from(
        new Set(
          variants
            .filter((v) => v.active && v.storage === selectedStorage)
            .map((v) => v.color)
        )
      )
    : Array.from(new Set(variants.filter((v) => v.active).map((v) => v.color)));

  const isComboInStock = (storage: string, color: string) => {
    const v = variants.find(
      (v) => v.active && v.storage === storage && v.color === color
    );
    return v ? v.stock > 0 : false;
  };

  const storageInStock = (storage: string) =>
    variants.some((v) => v.active && v.storage === storage && v.stock > 0);

  return (
    <View style={styles.container}>
      {/* Storage */}
      <Text style={[styles.label, { color: C.textSecondary } as TextStyle]}>Storage</Text>
      <View style={styles.options}>
        {storages.map((storage) => {
          const active = selectedStorage === storage;
          const inStock = storageInStock(storage);
          return (
            <TouchableOpacity
              key={storage}
              style={[
                styles.option,
                {
                  backgroundColor: active ? C.accent : C.card,
                  borderColor: active ? C.accent : C.cardBorder,
                  opacity: inStock ? 1 : 0.45,
                } as ViewStyle,
              ]}
              onPress={() => {
                onStorageChange(storage);
                const colorsInNewStorage = variants
                  .filter((v) => v.active && v.storage === storage)
                  .map((v) => v.color);
                if (selectedColor && !colorsInNewStorage.includes(selectedColor)) {
                  onColorChange(colorsInNewStorage[0] ?? '');
                }
              }}
              disabled={!inStock}
              accessibilityRole="button"
              accessibilityLabel={`${storage}${inStock ? '' : ' — Out of stock'}`}
            >
              <Text style={[styles.optionText, { color: active ? '#FFFFFF' : C.text } as TextStyle]}>
                {storage}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Color */}
      <Text style={[styles.label, { color: C.textSecondary, marginTop: 16 } as TextStyle]}>
        Color
      </Text>
      <View style={styles.options}>
        {colorsForStorage.map((color) => {
          const active = selectedColor === color;
          const inStock = selectedStorage
            ? isComboInStock(selectedStorage, color)
            : true;
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.option,
                {
                  backgroundColor: active ? C.accent : C.card,
                  borderColor: active ? C.accent : C.cardBorder,
                  opacity: inStock ? 1 : 0.45,
                } as ViewStyle,
              ]}
              onPress={() => onColorChange(color)}
              disabled={!inStock}
              accessibilityRole="button"
              accessibilityLabel={`${color}${inStock ? '' : ' — Out of stock'}`}
            >
              <Text style={[styles.optionText, { color: active ? '#FFFFFF' : C.text } as TextStyle]}>
                {color}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function storageSort(a: string, b: string) {
  const parse = (s: string) => {
    const n = parseInt(s);
    if (s.toUpperCase().includes('TB')) return n * 1024;
    return n;
  };
  return parse(a) - parse(b);
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: { fontSize: 14, fontWeight: '600' as const },
});
