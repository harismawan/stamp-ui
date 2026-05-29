import { expect, test } from 'bun:test';
import { darkTheme, lightTheme, type Theme } from '../src/theme';

// Static contract lock (checked by `tsc`, not at runtime): both themes must be
// assignable to the public `Theme` type. This catches the literal-narrowing
// regression where `Theme = typeof lightTheme` pinned colors to light-theme
// string literals (e.g. "#FFF6BF") and `darkTheme` failed to compile.
const _light: Theme = lightTheme;
const _dark: Theme = darkTheme;
lightTheme satisfies Theme;
darkTheme satisfies Theme;
void _light;
void _dark;

function deepKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v)
      ? deepKeys(v as Record<string, unknown>, path)
      : [path];
  });
}

test('light and dark themes share identical key structure', () => {
  const lightKeys = deepKeys(lightTheme).sort();
  const darkKeys = deepKeys(darkTheme).sort();
  expect(darkKeys).toEqual(lightKeys);
});

test('themes expose the contract color tokens', () => {
  const required: Array<keyof Theme['colors']> = [
    'primary', 'primaryHover', 'primaryActive', 'primarySoft', 'primaryInk',
    'accent', 'accentDark', 'income', 'incomeSoft', 'expense', 'expenseSoft',
    'bg', 'bgAlt', 'surface', 'surfaceMuted', 'surfaceSunken',
    'text', 'textMuted', 'textSubtle', 'border', 'borderSoft', 'borderStrong',
    'success', 'danger', 'warning', 'overlay',
  ];
  for (const key of required) {
    expect(typeof lightTheme.colors[key]).toBe('string');
    expect(typeof darkTheme.colors[key]).toBe('string');
  }
});

test('shared scales: radii, space, font, shadow, easing', () => {
  expect(lightTheme.radii.pill).toBe('999px');
  expect(lightTheme.space[10]).toBe('72px');
  expect(lightTheme.font.mono).toContain('mono');
  expect(lightTheme.shadow.stamp).toBe('4px 4px 0 #111111');
  expect(darkTheme.shadow.stamp).toBe('4px 4px 0 #FFF5E1');
  expect(lightTheme.easing.out).toContain('cubic-bezier');
});
