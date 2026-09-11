import { supabase, isSupabaseConfigured } from './supabase';
import catalogImagesJson from '../config/catalogImages.json';
import type {
  Product,
  ProductVariant,
  ProductImage,
  ProductFilters,
  ProductWithDetails,
  SortOption,
} from '../types/product';

const catalogImages: Record<string, string[]> = catalogImagesJson as Record<string, string[]>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the public URL for a product image. */
export function resolveImageUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(pathOrUrl);
  return data?.publicUrl || pathOrUrl;
}

export const getImagePublicUrl = resolveImageUrl;

/** Computes the minimum active-variant price for a product. */
export function getStartingPrice(variants: ProductVariant[]): number {
  const activeInStock = variants.filter((v) => v.active && v.stock > 0);
  if (activeInStock.length > 0) {
    return Math.min(...activeInStock.map((v) => Number(v.price)));
  }
  const allActive = variants.filter((v) => v.active && Number(v.price) > 0);
  if (allActive.length > 0) {
    return Math.min(...allActive.map((v) => Number(v.price)));
  }
  return 0;
}

/** Resolves the list of image URLs for a product (DB uploads prioritized, catalog as fallback). */
export function resolveProductImages(product: Product, dbImages: ProductImage[]): string[] {
  const urls: string[] = [];

  // 1. Primary image from DB first
  const primary = dbImages.find((img) => img.is_primary);
  if (primary) {
    const url = resolveImageUrl(primary.storage_path || primary.url);
    if (url) urls.push(url);
  }

  // 2. Remaining DB images
  dbImages.forEach((img) => {
    const url = resolveImageUrl(img.storage_path || img.url);
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  });

  // 3. Fallback to catalog images (from website catalog)
  const catalogList = catalogImages[product.slug];
  if (urls.length === 0 && catalogList && catalogList.length > 0) {
    catalogList.forEach((url) => {
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    });
  }

  return urls;
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * Fetch all active products with their variants and images.
 * Applies optional filters and sorting.
 */
export async function getProducts(
  filters?: ProductFilters,
  sort: SortOption = 'newest',
  limit = 50,
  offset = 0
): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) {
    console.warn('[Theekzu Supabase] Supabase is not configured. Check your .env file.');
    return [];
  }

  try {
    console.log('[Theekzu Supabase] Fetching products from public.products...');

    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Apply series filter if provided (match number or substring)
    if (filters?.series && filters.series !== 'All') {
      const numOnly = filters.series.replace(/[^0-9]/g, '');
      if (numOnly) {
        query = query.eq('series', numOnly);
      } else {
        query = query.ilike('series', `%${filters.series}%`);
      }
    }

    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'featured') query = query.order('featured', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data: products, error } = await query;
    if (error) {
      console.error('[Theekzu Supabase] getProducts query error:', error);
      throw error;
    }

    if (!products || products.length === 0) {
      console.log('[Theekzu Supabase] No active products returned.');
      return [];
    }

    console.log(`[Theekzu Supabase] Fetched ${products.length} products. Enriching with variants & images...`);
    return await enrichProducts(products as Product[], filters, sort);
  } catch (err) {
    console.error('[Theekzu Supabase] getProducts unexpected error:', err);
    throw err;
  }
}

/**
 * Fetch featured products for Home screen.
 * Falls back to recent active products if none are featured.
 */
export async function getFeaturedProducts(limit = 20): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) {
    console.warn('[Theekzu Supabase] Supabase is not configured. Check your .env file.');
    return [];
  }

  try {
    console.log('[Theekzu Supabase] Fetching featured products...');

    // Try featured = true first
    let { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Theekzu Supabase] Featured products query warning:', error);
    }

    // Fall back to all active products if none are marked featured
    if (!products || products.length === 0) {
      console.log('[Theekzu Supabase] No products with featured=true found; fetching active products...');
      const { data: recent, error: recentErr } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (recentErr) {
        console.error('[Theekzu Supabase] Recent products fallback error:', recentErr);
        throw recentErr;
      }
      products = recent;
    }

    if (!products || products.length === 0) {
      console.log('[Theekzu Supabase] Zero products found in public.products.');
      return [];
    }

    console.log(`[Theekzu Supabase] Found ${products.length} products for Home screen. Enriching...`);
    return await enrichProducts(products as Product[]);
  } catch (err) {
    console.error('[Theekzu Supabase] getFeaturedProducts error:', err);
    throw err;
  }
}

/**
 * Fetch a single product by slug with full variant and image data.
 */
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  if (!isSupabaseConfigured) return null;

  try {
    console.log(`[Theekzu Supabase] Fetching product by slug: "${slug}"...`);

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[Theekzu Supabase] Product with slug "${slug}" not found.`);
        return null;
      }
      console.error('[Theekzu Supabase] getProductBySlug error:', error);
      throw error;
    }

    if (!product) return null;

    const results = await enrichProducts([product as Product]);
    return results[0] ?? null;
  } catch (err) {
    console.error('[Theekzu Supabase] getProductBySlug error:', err);
    throw err;
  }
}

/**
 * Fetch product variants for a specific product.
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('active', true)
    .order('storage', { ascending: true });

  if (error) {
    console.error('[Theekzu Supabase] getProductVariants error:', error);
    throw error;
  }
  return (data as ProductVariant[]) ?? [];
}

/**
 * Fetch product images for a specific product.
 */
export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('[Theekzu Supabase] getProductImages notice:', error);
    return [];
  }
  return (data as ProductImage[]) ?? [];
}

/**
 * Fetch products with active discounts (old_price > price).
 */
export async function getOffersProducts(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) return [];

  try {
    console.log('[Theekzu Supabase] Fetching offers products...');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Theekzu Supabase] getOffersProducts error:', error);
      throw error;
    }
    if (!products || products.length === 0) return [];

    const enriched = await enrichProducts(products as Product[]);

    // Filter: only products that have at least one variant where old_price > price
    const offers = enriched.filter((p) =>
      p.variants.some((v) => v.active && v.old_price !== null && Number(v.old_price) > Number(v.price))
    );

    console.log(`[Theekzu Supabase] Found ${offers.length} products with valid discounts.`);
    return offers;
  } catch (err) {
    console.error('[Theekzu Supabase] getOffersProducts error:', err);
    throw err;
  }
}

/**
 * Search products by name, series, or description.
 */
export async function searchProducts(query: string): Promise<ProductWithDetails[]> {
  const term = query.trim();
  if (!term) return [];

  try {
    console.log(`[Theekzu Supabase] Searching products with term: "${term}"...`);

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .or(`name.ilike.%${term}%,series.ilike.%${term}%,description.ilike.%${term}%`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[Theekzu Supabase] searchProducts error:', error);
      throw error;
    }
    if (!products || products.length === 0) return [];
    return enrichProducts(products as Product[]);
  } catch (err) {
    console.error('[Theekzu Supabase] searchProducts error:', err);
    throw err;
  }
}

/**
 * Validate current price and stock for a cart item's variant.
 * Returns the fresh variant data so the cart can re-price itself.
 */
export async function validateVariant(
  variantId: string
): Promise<Pick<ProductVariant, 'id' | 'price' | 'old_price' | 'stock' | 'active'> | null> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, price, old_price, stock, active')
    .eq('id', variantId)
    .single();

  if (error) {
    console.warn('[Theekzu Supabase] validateVariant notice:', error);
    return null;
  }
  return data as Pick<ProductVariant, 'id' | 'price' | 'old_price' | 'stock' | 'active'>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function enrichProducts(
  products: Product[],
  filters?: ProductFilters,
  sort?: SortOption
): Promise<ProductWithDetails[]> {
  const ids = products.map((p) => p.id);
  if (ids.length === 0) return [];

  // Batch-fetch variants and images for all products concurrently
  const [variantsResult, imagesResult] = await Promise.all([
    supabase
      .from('product_variants')
      .select('*')
      .in('product_id', ids)
      .eq('active', true),
    supabase
      .from('product_images')
      .select('*')
      .in('product_id', ids)
      .order('sort_order', { ascending: true }),
  ]);

  if (variantsResult.error) {
    console.error('[Theekzu Supabase] Failed to fetch product_variants:', variantsResult.error);
  }
  if (imagesResult.error) {
    console.warn('[Theekzu Supabase] Failed to fetch product_images (proceeding with fallback):', imagesResult.error);
  }

  const allVariants = (variantsResult.data as ProductVariant[]) ?? [];
  const allImages = (imagesResult.data as ProductImage[]) ?? [];

  let enriched: ProductWithDetails[] = products.map((product) => {
    const variants = allVariants.filter((v) => v.product_id === product.id);
    const images = allImages.filter((i) => i.product_id === product.id);
    const imageUrls = resolveProductImages(product, images);

    return {
      ...product,
      variants,
      images,
      image_urls: imageUrls,
      starting_price: getStartingPrice(variants),
      primary_image_url: imageUrls[0] ?? null,
    };
  });

  // Client-side filtering
  if (filters?.storage) {
    enriched = enriched.filter((p) =>
      p.variants.some((v) => v.active && v.storage === filters.storage)
    );
  }
  if (filters?.color) {
    enriched = enriched.filter((p) =>
      p.variants.some((v) => v.active && v.color.toLowerCase() === filters.color?.toLowerCase())
    );
  }
  if (filters?.in_stock) {
    enriched = enriched.filter((p) =>
      p.variants.some((v) => v.active && v.stock > 0)
    );
  }
  if (filters?.min_price !== undefined) {
    enriched = enriched.filter((p) => p.starting_price >= filters.min_price!);
  }
  if (filters?.max_price !== undefined) {
    enriched = enriched.filter((p) => p.starting_price <= filters.max_price!);
  }

  // Sort
  if (sort === 'price_asc') {
    enriched.sort((a, b) => a.starting_price - b.starting_price);
  } else if (sort === 'price_desc') {
    enriched.sort((a, b) => b.starting_price - a.starting_price);
  }

  return enriched;
}
