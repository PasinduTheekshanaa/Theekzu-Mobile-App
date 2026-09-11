import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getFeaturedProducts,
  getOffersProducts,
  getProductBySlug,
  getProducts,
  searchProducts,
} from '../services/products';
import type {
  ProductFilters,
  ProductWithDetails,
  SortOption,
} from '../types/product';

// ─── useProducts ──────────────────────────────────────────────────────────────

export function useProducts(
  filters?: ProductFilters,
  sort: SortOption = 'newest'
) {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await getProducts(filters, sort);
        setProducts(data);
      } catch (e: any) {
        console.error('[useProducts] Error loading products:', e);
        setError(e?.message || 'Failed to load products. Pull to refresh.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(filters), sort]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = useCallback(() => fetch(true), [fetch]);

  return { products, loading, error, refreshing, refresh };
}

// ─── useFeaturedProducts ──────────────────────────────────────────────────────

export function useFeaturedProducts(limit = 20) {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getFeaturedProducts(limit);
      setProducts(data);
    } catch (e: any) {
      console.error('[useFeaturedProducts] Error loading featured products:', e);
      setError(e?.message || 'Failed to load featured products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = useCallback(() => fetch(true), [fetch]);

  return { products, loading, error, refreshing, refresh };
}

// ─── useProductDetail ─────────────────────────────────────────────────────────

export function useProductDetail(slug: string) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductBySlug(slug);
      setProduct(data);
    } catch (e: any) {
      console.error(`[useProductDetail] Error loading product "${slug}":`, e);
      setError(e?.message || 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetch();
  }, [fetch, slug]);

  return { product, loading, error, refetch: fetch };
}

// ─── useOffersProducts ────────────────────────────────────────────────────────

export function useOffersProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getOffersProducts();
      setProducts(data);
    } catch (e: any) {
      console.error('[useOffersProducts] Error loading offers:', e);
      setError(e?.message || 'Failed to load offers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = useCallback(() => fetch(true), [fetch]);

  return { products, loading, error, refreshing, refresh };
}

// ─── useSearchProducts ────────────────────────────────────────────────────────

export function useSearchProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchProducts(query);
        setProducts(data);
      } catch (e: any) {
        console.error(`[useSearchProducts] Error searching "${query}":`, e);
        setError(e?.message || 'Search failed.');
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  return { products, loading, error, search };
}
