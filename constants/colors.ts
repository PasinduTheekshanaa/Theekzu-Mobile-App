/**
 * Theekzu Mobile — Design system colors.
 * Premium Apple-inspired dark/light palette with electric blue accent.
 */

export const Colors = {
  dark: {
    background: '#000000',
    backgroundSecondary: '#0A0A0F',
    surface: '#1A1A2E',
    surfaceSecondary: '#16213E',
    card: '#1E1E2E',
    cardBorder: 'rgba(255,255,255,0.08)',

    // ── Text ──────────────────────────────────────────────────────────────
    text: '#FFFFFF',
    textSecondary: 'rgba(235,235,245,0.8)',
    textTertiary: '#8E8E93',
    textDisabled: 'rgba(235,235,245,0.3)',

    // ── Accent ────────────────────────────────────────────────────────────
    accent: '#0A84FF',
    accentSecondary: '#6B2FE8',
    accentGlow: 'rgba(10,132,255,0.2)',

    // ── Status ────────────────────────────────────────────────────────────
    success: '#30D158',
    successLight: 'rgba(48,209,88,0.15)',
    danger: '#FF453A',
    dangerLight: 'rgba(255,69,58,0.15)',
    warning: '#FFD60A',
    warningLight: 'rgba(255,214,10,0.15)',

    // ── Tab bar ───────────────────────────────────────────────────────────
    tabBar: '#0A0A0F',
    tabBarBorder: 'rgba(255,255,255,0.08)',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#636366',

    // ── Separator ─────────────────────────────────────────────────────────
    separator: 'rgba(255,255,255,0.08)',

    // ── Gradient stops ────────────────────────────────────────────────────
    gradientStart: '#0A84FF',
    gradientEnd: '#6B2FE8',

    // ── Skeleton ──────────────────────────────────────────────────────────
    skeletonBase: '#1E1E2E',
    skeletonHighlight: '#2A2A3E',
  },

  light: {
    background: '#F2F2F7',
    backgroundSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F2F2F7',
    card: '#FFFFFF',
    cardBorder: 'rgba(0,0,0,0.08)',

    // ── Text ──────────────────────────────────────────────────────────────
    text: '#000000',
    textSecondary: 'rgba(60,60,67,0.85)',
    textTertiary: '#8E8E93',
    textDisabled: 'rgba(60,60,67,0.3)',

    // ── Accent ────────────────────────────────────────────────────────────
    accent: '#007AFF',
    accentSecondary: '#5856D6',
    accentGlow: 'rgba(0,122,255,0.12)',

    // ── Status ────────────────────────────────────────────────────────────
    success: '#34C759',
    successLight: 'rgba(52,199,89,0.12)',
    danger: '#FF3B30',
    dangerLight: 'rgba(255,59,48,0.12)',
    warning: '#FF9500',
    warningLight: 'rgba(255,149,0,0.12)',

    // ── Tab bar ───────────────────────────────────────────────────────────
    tabBar: '#FFFFFF',
    tabBarBorder: 'rgba(0,0,0,0.08)',
    tabBarActive: '#007AFF',
    tabBarInactive: '#8E8E93',

    // ── Separator ─────────────────────────────────────────────────────────
    separator: 'rgba(0,0,0,0.08)',

    // ── Gradient stops ────────────────────────────────────────────────────
    gradientStart: '#007AFF',
    gradientEnd: '#5856D6',

    // ── Skeleton ──────────────────────────────────────────────────────────
    skeletonBase: '#E5E5EA',
    skeletonHighlight: '#F2F2F7',
  },
} as const;

export type ThemeColors = typeof Colors.dark;
