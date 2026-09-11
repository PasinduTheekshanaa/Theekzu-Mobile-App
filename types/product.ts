// ─── Product Types ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  series: string;
  condition: ProductCondition;
  description: string | null;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  storage: string;
  color: string;
  price: number;
  old_price: number | null;
  stock: number;
  sku: string | null;
  active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  url?: string;
  color?: string | null;
  is_primary: boolean;
  sort_order: number;
  alt_text?: string | null;
  created_at?: string;
}

// ─── Product with enriched data ───────────────────────────────────────────────

export interface ProductWithDetails extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
  image_urls: string[];
  starting_price: number;
  primary_image_url: string | null;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Unique cart-item id (uuid generated on add) */
  cart_item_id: string;
  product_id: string;
  variant_id: string;
  name: string;
  slug: string;
  storage: string;
  color: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  product_id: string;
  name: string;
  slug: string;
  series: string;
  condition: ProductCondition;
  image_url: string | null;
  starting_price: number;
  added_at: string;
}

// ─── Filters & Sort ───────────────────────────────────────────────────────────

export type ProductCondition = 'Brand New' | 'Used' | 'Refurbished';

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'featured';

export interface ProductFilters {
  series?: string;
  condition?: string;
  storage?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}
