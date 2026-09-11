import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WishlistItem } from '../types/product';

interface WishlistContextValue {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  clear: () => void;
}

const STORAGE_KEY = 'theekzu:wishlist';

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Hydrate from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setItems(JSON.parse(raw) as WishlistItem[]);
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

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.product_id === item.product_id);
      if (exists) {
        return prev.filter((i) => i.product_id !== item.product_id);
      }
      return [...prev, { ...item, added_at: new Date().toISOString() }];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.product_id === productId),
    [items]
  );

  const clear = useCallback(() => {
    setItems([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
