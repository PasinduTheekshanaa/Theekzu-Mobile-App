/**
 * Central business configuration for Theekzu Mobile.
 * All contact, social, and brand details live here — never scattered in UI files.
 */

export const BUSINESS = {
  name: 'Theekzu Mobile',
  tagline: 'Premium iPhones. Trusted Service.',
  description:
    'Your premier Sri Lankan online destination for genuine Apple iPhones, certified pre-owned devices, original accessories, and trusted warranty service.',

  // ── Contact ──────────────────────────────────────────────────────────────
  phone: '0740245749',
  phoneFormatted: '+94740245749',
  whatsapp: '+94740245749',
  email: 'pasindutheekshana21@gmail.com',

  // ── Business Hours ────────────────────────────────────────────────────────
  businessHours: '8:00 AM – 5:00 PM, Mon–Sat',
  location: 'Online (Islandwide Delivery, Sri Lanka)',

  // ── Website ───────────────────────────────────────────────────────────────
  website: 'https://theekzu.vercel.app',

  // ── Social Media ──────────────────────────────────────────────────────────
  social: {
    instagram: {
      label: '@theekzu_mobile',
      url: 'https://www.instagram.com/theekzu_mobile',
    },
    facebook: {
      label: 'Theekzu Mobile',
      url: 'https://www.facebook.com/share/1EF6rMFmEN/?mibextid=wwXIfr',
    },
    tiktok: {
      label: '@theekzu',
      url: 'https://www.tiktok.com/@theekzu',
    },
    whatsapp: {
      label: '+94 74 024 5749',
      url: 'https://wa.me/94740245749',
    },
  },

  // ── WhatsApp deep-link helpers ────────────────────────────────────────────
  whatsappInquiryUrl: (message?: string) => {
    const text =
      message ??
      'Hello Theekzu Mobile 👋\n\nI would like to know more about your available iPhones.';
    return `https://wa.me/94740245749?text=${encodeURIComponent(text)}`;
  },
} as const;
