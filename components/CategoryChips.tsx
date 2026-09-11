import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const SERIES = [
  'All',
  'iPhone 11',
  'iPhone 12',
  'iPhone 13',
  'iPhone 14',
  'iPhone 15',
  'iPhone 16',
  'iPhone 17',
];

interface CategoryChipsProps {
  selected: string;
  onSelect: (series: string) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SERIES.map((series) => {
        const isActive = selected === series;
        return (
          <TouchableOpacity
            key={series}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? C.accent : C.card,
                borderColor: isActive ? C.accent : C.cardBorder,
              } as ViewStyle,
            ]}
            onPress={() => onSelect(series)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${series}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.chipText,
                { color: isActive ? '#FFFFFF' : C.textSecondary } as TextStyle,
              ]}
            >
              {series}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
