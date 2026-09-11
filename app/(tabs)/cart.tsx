import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { ProductImage } from '../../components/ProductImage';
import { EmptyState } from '../../components/EmptyState';
import { BUSINESS } from '../../config/business';
import type { CartItem } from '../../types/product';

function CartItemRow({
  item,
  onRemove,
  onQtyChange,
}: {
  item: CartItem;
  onRemove: () => void;
  onQtyChange: (qty: number) => void;
}) {
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const formatLKR = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`;

  return (
    <View style={[styles.itemCard, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
      <ProductImage uri={item.image_url} style={styles.itemImage} borderRadius={10} />
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, { color: C.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.itemVariant, { color: C.textTertiary }]}>
          {item.storage} · {item.color}
        </Text>
        <Text style={[styles.itemPrice, { color: C.accent }]}>
          {formatLKR(item.price)}
        </Text>
        {/* Qty controls */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: C.cardBorder, backgroundColor: C.surface }]}
            onPress={() => onQtyChange(item.quantity - 1)}
            accessibilityLabel="Decrease quantity"
          >
            <Ionicons name="remove" size={16} color={C.text} />
          </TouchableOpacity>
          <Text style={[styles.qty, { color: C.text }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: C.cardBorder, backgroundColor: C.surface }]}
            onPress={() => onQtyChange(item.quantity + 1)}
            accessibilityLabel="Increase quantity"
          >
            <Ionicons name="add" size={16} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeBtn}
            accessibilityLabel={`Remove ${item.name} from cart`}
          >
            <Ionicons name="trash-outline" size={18} color={C.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = isDark ? Colors.dark : Colors.light;
  const { items, removeItem, updateQuantity, clear, subtotal, totalItems, validateCart } =
    useCart();
  const [ordering, setOrdering] = useState(false);

  const formatLKR = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`;

  const handleWhatsApp = async () => {
    setOrdering(true);
    try {
      const valid = await validateCart();
      if (!valid) {
        setOrdering(false);
        return;
      }

      const lines = items
        .map(
          (item) =>
            `• ${item.name}\n  Storage: ${item.storage}\n  Color: ${item.color}\n  Qty: ${item.quantity}\n  Price: ${formatLKR(item.price)}`
        )
        .join('\n\n');

      const message = `Hello Theekzu Mobile 👋\n\nI would like to order:\n\n${lines}\n\n*Total: ${formatLKR(subtotal)}*\n\nPlease confirm availability.`;
      const url = BUSINESS.whatsappInquiryUrl(message);

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback: open WhatsApp web
        const webUrl = `https://wa.me/94740245749?text=${encodeURIComponent(message)}`;
        await Linking.openURL(webUrl);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert(
        'WhatsApp Unavailable',
        'Please contact us at ' + BUSINESS.phone + ' or visit ' + BUSINESS.website
      );
    } finally {
      setOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: C.background }]}
        edges={['top']}
      >
        <View style={[styles.header, { borderBottomColor: C.separator }]}>
          <Text style={[styles.title, { color: C.text }]}>Cart</Text>
        </View>
        <EmptyState
          icon="bag-outline"
          title="Your Cart Is Empty"
          description="Add iPhones or accessories to your cart and order them easily via WhatsApp."
          ctaLabel="Browse iPhones"
          onCta={() => router.push('/(tabs)/shop')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.separator }]}>
        <Text style={[styles.title, { color: C.text }]}>Cart ({totalItems})</Text>
        <TouchableOpacity onPress={clear} accessibilityLabel="Clear cart">
          <Text style={[styles.clearBtn, { color: C.danger }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.cart_item_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onRemove={() => removeItem(item.cart_item_id)}
            onQtyChange={(qty) => updateQuantity(item.cart_item_id, qty)}
          />
        )}
        ListFooterComponent={
          <View
            style={[
              styles.summary,
              {
                backgroundColor: C.card,
                borderColor: C.cardBorder,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>
                Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </Text>
              <Text style={[styles.summaryValue, { color: C.text }]}>
                {formatLKR(subtotal)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: C.separator }]} />
            <Text style={[styles.note, { color: C.textTertiary }]}>
              Final price confirmed via WhatsApp. Delivery charges may apply.
            </Text>
          </View>
        }
      />

      {/* Sticky order button */}
      <View
        style={[
          styles.footer,
          { backgroundColor: C.background, borderTopColor: C.separator },
        ]}
      >
        <TouchableOpacity
          style={[styles.whatsappBtn, { opacity: ordering ? 0.7 : 1 }]}
          onPress={handleWhatsApp}
          disabled={ordering}
          accessibilityRole="button"
          accessibilityLabel="Order via WhatsApp"
        >
          <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
          <Text style={styles.whatsappBtnText}>
            {ordering ? 'Validating...' : 'Order via WhatsApp'}
          </Text>
        </TouchableOpacity>
      </View>
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
  listContent: { padding: 16, gap: 12, paddingBottom: 16 },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 14,
    alignItems: 'flex-start',
  },
  itemImage: { width: 90, height: 90 },
  itemContent: { flex: 1, gap: 5 },
  itemName: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  itemVariant: { fontSize: 12 },
  itemPrice: { fontSize: 16, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  removeBtn: { marginLeft: 'auto' },
  summary: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 15 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  divider: { height: 1 },
  note: { fontSize: 12, lineHeight: 18 },
  footer: {
    padding: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
