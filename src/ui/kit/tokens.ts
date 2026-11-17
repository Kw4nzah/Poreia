// Pure style logic of the UI kit (no React Native, so it is unit-testable).
// Visual measures follow the BoardUI design language (soft radii, hairline borders, quiet
// press feedback, status tints), expressed with this app's own theme tokens.

import { radius, space, type Theme, type } from '../theme';

/** Smallest touch target (dp). */
export const MIN_TARGET = 44;

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeTone = 'neutral' | 'fast' | 'free' | 'feast' | 'warning';

/** `#RRGGBB` plus an alpha 0..1 as `#RRGGBBAA`. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  return hex.slice(0, 7) + a.toString(16).padStart(2, '0').toUpperCase();
}

export interface ButtonColors {
  background: string;
  border: string;
  text: string;
  /** Colour laid over the button while pressed (darkens it; never scales). */
  overlay: string;
  /** Opacity of that overlay. */
  overlayOpacity: number;
}

export function buttonColors(t: Theme, variant: ButtonVariant): ButtonColors {
  switch (variant) {
    case 'primary':
      return {
        background: t.accent,
        border: t.accent,
        text: t.onAccent,
        overlay: t.dark ? t.onAccent : t.ink,
        overlayOpacity: 0.16,
      };
    case 'danger':
      return {
        background: t.danger,
        border: t.danger,
        text: t.onAccent,
        overlay: t.dark ? t.onAccent : t.ink,
        overlayOpacity: 0.16,
      };
    case 'secondary':
      return {
        background: 'transparent',
        border: t.line,
        text: t.ink,
        overlay: t.ink,
        overlayOpacity: 0.07,
      };
    case 'ghost':
      return {
        background: 'transparent',
        border: 'transparent',
        text: t.accent,
        overlay: t.ink,
        overlayOpacity: 0.07,
      };
  }
}

export interface ButtonMetrics {
  minHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  borderRadius: number;
  fontSize: number;
  lineHeight: number;
}

const BUTTON_SIZES: Record<ButtonSize, ButtonMetrics> = {
  // Every size keeps at least the 44dp touch target.
  sm: {
    minHeight: MIN_TARGET,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.field,
    ...type.label,
  },
  md: {
    minHeight: 48,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.field,
    ...type.body,
  },
  lg: {
    minHeight: 56,
    paddingHorizontal: space.lg,
    paddingVertical: space.smd,
    borderRadius: radius.field,
    ...type.bodyLarge,
  },
};

export function buttonMetrics(size: ButtonSize): ButtonMetrics {
  return BUTTON_SIZES[size];
}

/** Opacity of a disabled control. */
export const DISABLED_OPACITY = 0.5;

export interface BadgeColors {
  background: string;
  border: string;
  dot: string;
  text: string;
}

/** Tinted status pill: the tone colour is a quiet fill, edge and dot; the text stays ink for contrast. */
export function badgeColors(t: Theme, tone: BadgeTone): BadgeColors {
  if (tone === 'neutral') {
    return { background: t.background, border: t.line, dot: t.muted, text: t.ink };
  }
  if (tone === 'feast') {
    return { background: t.feastSurface, border: withAlpha(t.feast, 0.45), dot: t.feast, text: t.ink };
  }
  const base = tone === 'fast' ? t.accent : tone === 'free' ? t.free : t.warning;
  return { background: withAlpha(base, 0.14), border: withAlpha(base, 0.4), dot: base, text: t.ink };
}

export type CardPadding = 'none' | 'md' | 'lg';
export type CardRadius = 'card' | 'field';
export type CardTone = 'surface' | 'feast';

export interface CardStyle {
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  padding: number;
}

export function cardStyle(
  t: Theme,
  padding: CardPadding = 'lg',
  shape: CardRadius = 'card',
  tone: CardTone = 'surface',
): CardStyle {
  return {
    borderRadius: radius[shape],
    borderWidth: tone === 'feast' ? 0 : 1,
    borderColor: t.line,
    backgroundColor: tone === 'feast' ? t.feastSurface : t.surface,
    padding: padding === 'none' ? 0 : space[padding],
  };
}

export interface SegmentColors {
  background: string;
  border: string;
  text: string;
}

export function segmentColors(t: Theme, selected: boolean): SegmentColors {
  return selected
    ? { background: t.accent, border: t.accent, text: t.onAccent }
    : { background: 'transparent', border: t.line, text: t.ink };
}

/** Accessibility state of a control that may be disabled or busy (a busy control is not pressable). */
export function controlState(disabled: boolean, loading: boolean) {
  return { disabled: disabled || loading, busy: loading };
}
