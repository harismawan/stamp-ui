/**
 * Stamp theme — saweria-flat. Solid yellow primary, white surfaces, hard
 * offset "stamp" shadows instead of blurry diffusion, thin definite borders,
 * no gradients on UI chrome.
 */

const palette = {
  // Saweria-bright sunflower yellow.
  yellow: '#FFDE15',
  yellowHover: '#FFCB05',
  yellowActive: '#E6B800',
  yellowSoft: '#FFF6BF',
  yellowSofter: '#FFFCE0',

  // Coral accent (fun callouts, error).
  coral: '#FF6B6B',
  coralSoft: '#FFE0E0',

  // Mint income.
  mint: '#1FAB6E',
  mintSoft: '#D7F5E5',

  // Ink + neutrals.
  ink: '#111111',
  inkSoft: '#3A3A3A',
  inkMute: '#6E6E6E',
  inkFaint: '#A3A3A3',

  cream: '#FFFCF0',
  creamAlt: '#FFF8E1',
  off: '#FFFFFF',
  line: '#1A1A1A',
  lineSoft: '#E5E5E5',
} as const;

const radii = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  pill: '999px',
} as const;

const space = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '32px',
  8: '40px',
  9: '56px',
  10: '72px',
} as const;

const font = {
  body: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
} as const;

/**
 * Saweria's signature is the "hard stamp" — solid offset shadow with no blur.
 * Use shadow.stamp for buttons/cards that should feel chunky.
 */
const shadow = {
  none: 'none',
  stamp: '4px 4px 0 #111111',
  stampSm: '2px 2px 0 #111111',
  stampLg: '6px 6px 0 #111111',
} as const;

const easing = {
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

export const lightTheme = {
  mode: 'light',
  colors: {
    primary: palette.yellow,
    primaryHover: palette.yellowHover,
    primaryActive: palette.yellowActive,
    primarySoft: palette.yellowSoft,
    primaryInk: palette.ink,

    accent: palette.coral,
    accentDark: '#D94F4F',

    income: palette.mint,
    incomeSoft: palette.mintSoft,
    expense: palette.coral,
    expenseSoft: palette.coralSoft,

    bg: palette.cream,
    bgAlt: palette.creamAlt,
    surface: palette.off,
    surfaceMuted: palette.yellowSofter,
    surfaceSunken: palette.cream,

    text: palette.ink,
    textMuted: palette.inkSoft,
    textSubtle: palette.inkMute,
    border: palette.line,
    borderSoft: palette.lineSoft,
    borderStrong: palette.line,

    success: palette.mint,
    danger: palette.coral,
    warning: palette.yellowActive,

    overlay: 'rgba(17, 17, 17, 0.55)',
  },
  radii,
  space,
  font,
  shadow,
  easing,
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: palette.yellow,
    primaryHover: palette.yellowHover,
    primaryActive: palette.yellowActive,
    primarySoft: 'rgba(255, 222, 21, 0.18)',
    primaryInk: palette.ink,

    accent: palette.coral,
    accentDark: '#D94F4F',

    income: '#3FD18C',
    incomeSoft: 'rgba(63, 209, 140, 0.15)',
    expense: '#FF8B8B',
    expenseSoft: 'rgba(255, 139, 139, 0.15)',

    bg: '#161310',
    bgAlt: '#1B1714',
    surface: '#211C18',
    surfaceMuted: '#2A241E',
    surfaceSunken: '#1A1612',

    text: '#FFF5E1',
    textMuted: '#C8B89E',
    textSubtle: '#88795F',
    border: '#FFF5E1',
    borderSoft: '#3A2E22',
    borderStrong: '#FFF5E1',

    success: '#3FD18C',
    danger: '#FF8B8B',
    warning: palette.yellow,

    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  radii,
  space,
  font,
  shadow: {
    none: 'none',
    stamp: '4px 4px 0 #FFF5E1',
    stampSm: '2px 2px 0 #FFF5E1',
    stampLg: '6px 6px 0 #FFF5E1',
  },
  easing,
};

/**
 * Public theme contract. Color/shadow values are intentionally widened to
 * `string` so both `lightTheme` and `darkTheme` satisfy the same shape — if
 * they were inferred from `lightTheme` via `typeof`, the `as const` palette
 * would pin each value to a narrow string literal (e.g. `"#FFF6BF"`) and
 * `darkTheme` would NOT be assignable to `Theme`.
 */
export type Theme = {
  mode: string;
  colors: Record<keyof typeof lightTheme.colors, string>;
  radii: typeof radii;
  space: typeof space;
  font: typeof font;
  shadow: Record<keyof typeof shadow, string>;
  easing: typeof easing;
};

// Lock the contract: both exports must structurally satisfy `Theme`. These
// static assertions fail `tsc` if either theme drifts from the shared shape
// (the regression the literal-narrowing `typeof lightTheme` could not catch).
const _lightContract: Theme = lightTheme;
const _darkContract: Theme = darkTheme;
void _lightContract;
void _darkContract;
