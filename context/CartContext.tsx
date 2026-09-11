import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { validateVariant } from '../services/products';
import type { CartItem } from '../types/product';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cart_item_id'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  /**
   * Validates each cart item's price and stock against Supabase.
   * Returns false if any item is out of stock or has a stale price.
   */
  validateCart: () => Promise<boolean>;
}

const STORAGE_KEY = 'theekzu:cart';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setItems(JSON.parse(raw) as CartItem[]);
        } catch {
          // ignore corrupted data
        }
      }
    });
  }, []);

  // Persist on every change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((incoming: Omit<CartItem, 'cart_item_id'>) => {
    setItems((prev) => {
      // If same variant already in cart, just increase qty
      const existing = prev.find((i) => i.variant_id === incoming.variant_id);
      if (existing) {
        return prev.map((i) =>
          i.variant_id === incoming.variant_id
            ? { ...i, quantity: i.quantity + incoming.quantity }
            : i
        );
      }
      const cart_item_id = `${incoming.variant_id}-${Date.now()}`;
      return [...prev, { ...incoming, cart_item_id }];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.cart_item_id === cartItemId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const validateCart = useCallback(async (): Promise<boolean> => {
    let allValid = true;
    const updated: CartItem[] = [];

    for (const item of items) {
      const fresh = await validateVariant(item.variant_id);
      if (!fresh || !fresh.active || fresh.stock === 0) {
        Alert.alert(
          'Item Unavailable',
          `${item.name} (${item.storage} / ${item.color}) is no longer in stock and has been removed from your cart.`
        );
        allValid = false;
        // Skip this item — remove it
        continue;
      }
      if (fresh.price !== item.price) {
        // Price changed — update silently
        updated.push({ ...item, price: fresh.price });
        allValid = false; // Still warn
      } else {
        updated.push(item);
      }
    }

    setItems(updated);

    if (!allValid) {
      Alert.alert(
        'Cart Updated',
        'Some item prices or availability have changed. Please review your cart before ordering.'
      );
    }

    return allValid && updated.length === items.length;
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        totalItems,
        subtotal,
        validateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
