# Theekzu Mobile — React Native App

Premium cross-platform mobile shopping app for **Theekzu Mobile**, built with Expo + React Native + TypeScript, connected to the existing Supabase project.

---

## Requirements

- Node.js ≥ 18
- npm ≥ 9 (or yarn/pnpm)
- Expo CLI: `npm install -g expo-cli` *(optional — can use `npx expo` directly)*
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your Supabase credentials
cp .env.example .env
# Edit .env and fill in:
#   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
#   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# 3. Start Expo dev server
npx expo start
```

Scan the QR code in **Expo Go** to test on your phone.

---

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xxx.supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The **anon** public key from Supabase Settings → API |

> ⚠️ **NEVER** put the `service_role` key in the mobile app.

Find these in your Supabase Dashboard → Settings → API.

---

## Supabase Connection

The app connects to your **existing** Supabase project — the same one used by https://theekzu.vercel.app.

Tables used (read-only from mobile):
- `public.products`
- `public.product_variants`
- `public.product_images`

Storage bucket used:
- `product-images`

RLS should already allow unauthenticated `SELECT` (same as your website).

---

## Running on Android

```bash
npx expo start --android
# or
npx expo run:android    # requires Android Studio + emulator
```

---

## Running on iOS

```bash
npx expo start --ios
# or
npx expo run:ios        # requires Xcode + macOS
```

---

## Testing with Expo Go

1. Install **Expo Go** from App Store / Play Store
2. Run `npx expo start`
3. Scan the QR code
4. The app will load on your phone

> **Note**: `@gorhom/bottom-sheet` requires Expo development build for full functionality. For Expo Go, the filter sheet will still render but may have limited animation.

---

## Production Builds

Install EAS CLI:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Build for Android:
```bash
eas build --platform android --profile production
```

Build for iOS:
```bash
eas build --platform ios --profile production
```

---

## Project Structure

```
app/
  _layout.tsx           Root layout (providers)
  index.tsx             Onboarding/tabs redirect
  onboarding.tsx        3-screen onboarding
  (tabs)/
    _layout.tsx         Bottom tab navigator
    index.tsx           Home screen
    shop.tsx            Shop screen
    offers.tsx          Offers screen
    wishlist.tsx        Wishlist screen
    cart.tsx            Cart screen
  product/
    [slug].tsx          Product detail
  settings.tsx          Settings (theme, about)
  contact.tsx           Contact & social links

components/
  ProductCard.tsx       Product grid card
  ProductImage.tsx      expo-image wrapper
  SearchBar.tsx         Search input
  PriceDisplay.tsx      LKR price formatter
  VariantSelector.tsx   Storage/color picker
  EmptyState.tsx        Empty screen state
  LoadingSkeleton.tsx   Shimmer loaders
  FilterSheet.tsx       Filter bottom sheet
  CategoryChips.tsx     Series filter chips
  HeroBanner.tsx        Home hero section

services/
  supabase.ts           Supabase client
  products.ts           All database queries

context/
  ThemeContext.tsx       Dark/light/system theme
  CartContext.tsx        Cart with persistence
  WishlistContext.tsx    Wishlist with persistence

hooks/
  useProducts.ts         Product data hooks
  useWishlist.ts         Wishlist hook
  useCart.ts             Cart hook

types/
  product.ts             TypeScript interfaces

config/
  business.ts            Centralized business info

constants/
  colors.ts              Design system colors
```

---

## App Icons & Splash

Replace these placeholder files with the real Theekzu Mobile logo:
- `assets/images/icon.png` — 1024×1024 app icon
- `assets/images/adaptive-icon.png` — Android adaptive foreground
- `assets/images/splash.png` — Splash background
- `assets/images/favicon.png` — Web favicon

---

## Features

- ✅ Onboarding (first run only, stored in AsyncStorage)
- ✅ Home with featured products from Supabase
- ✅ Shop with search, filter, sort
- ✅ Product detail with image gallery
- ✅ Variant selector (storage + color) — dynamic price/stock
- ✅ Add to Cart (persisted)
- ✅ Wishlist (persisted)
- ✅ WhatsApp order with auto-message
- ✅ Offers tab (real discounts from DB)
- ✅ Pull-to-refresh everywhere
- ✅ Dark / Light / System theme
- ✅ Settings screen
- ✅ Contact & social links
- ✅ Skeleton loaders & empty states
- ✅ Haptic feedback
- ✅ Safe area support (notch, Dynamic Island, Android nav)
- ✅ No admin portal exposed
- ✅ No hardcoded prices

---

## Architecture Decisions

- **No WebView** — fully native React Native UI
- **Read-only Supabase** — uses anon key only; no writes from mobile
- **Client-side filtering** — storage/color/in-stock filters applied after fetch
- **Cart validation** — re-checks Supabase price/stock before WhatsApp order
- **Centralized business config** — all contact/social info in `config/business.ts`
- **Single data service layer** — all Supabase queries in `services/products.ts`
