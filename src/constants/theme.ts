// ── Onboarding brand tokens ──
export const BRAND = {
  INK:    '#16213E',
  CORAL:  '#EF6F6C',
  MEADOW: '#2D6A4F',
  GOLD:   '#F2B705',
  PAPER:  '#FAF7F2',
  SLATE:  '#6B7280',
  LINE:   '#E3DCCF',
} as const;

export const COLORS = {
  primary: '#FF3B5C',
  primaryHover: '#E02B4B',
  primaryLight: '#FFF0F3',
  primaryTint: '#FFE5EC',
  
  navy: '#141C2E',
  coralSlash: '#FF5A60',

  bgMain: '#F4F6F9',
  bgCard: '#FFFFFF',
  bgSubtle: '#F8FAFC',
  bgInput: '#F1F5F9',

  textMain: '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',

  borderColor: '#E2E8F0',
  badgeGreen: '#10B981',
  badgeBlue: '#3B82F6',

  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  }
} as const;

export const RADIUS = {
  full: 9999,
  xl: 20,
  lg: 16,
  md: 12,
  sm: 8,
} as const;
