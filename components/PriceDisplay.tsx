import React from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface PriceDisplayProps {
  price: number;
  oldPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function PriceDisplay({
  price,
  oldPrice,
  size = 'md',
  showLabel = false,
}: PriceDisplayProps) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;

  const formatLKR = (amount: number) =>
    `Rs. ${amount.toLocaleString('en-LK')}`;

  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const fontSizes = {
    sm: { price: 14, old: 12, label: 10 },
    md: { price: 18, old: 13, label: 11 },
    lg: { price: 26, old: 16, label: 12 },
  };

  const fs = fontSizes[size];

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: C.textTertiary, fontSize: fs.label } satisfies TextStyle]}>
          Starting from
        </Text>
      )}
      <View style={styles.row}>
        <Text style={[styles.price, { color: C.accent, fontSize: fs.price } satisfies TextStyle]}>
          {formatLKR(price)}
        </Text>
        {discount !== null && (
          <View style={[styles.badge, { backgroundColor: C.dangerLight }]}>
            <Text style={[styles.badgeText, { color: C.danger } satisfies TextStyle]}>
              -{discount}%
            </Text>
          </View>
        )}
      </View>
      {oldPrice && oldPrice > price && (
        <Text style={[styles.oldPrice, { color: C.textTertiary, fontSize: fs.old } satisfies TextStyle]}>
          {formatLKR(oldPrice)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2 },
  label: { fontWeight: '400', letterSpacing: 0.2 } as TextStyle,
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontWeight: '700', letterSpacing: -0.5 } as TextStyle,
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700' } as TextStyle,
  oldPrice: { textDecorationLine: 'line-through', fontWeight: '400' } as TextStyle,
});
