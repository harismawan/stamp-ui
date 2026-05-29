import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './GlobalStyles';
import { type ThemeMode, useThemeStore } from './hooks/useThemeStore';
import { type Theme, darkTheme, lightTheme } from './theme';

export interface StampProviderProps {
  /** Force a theme mode. If omitted, the persisted useThemeStore mode is used. */
  mode?: ThemeMode;
  /**
   * A full or partial theme object. When given, it is shallow-merged over the
   * base theme (chosen by `mode`) and takes precedence over `mode` selection.
   */
  theme?: Partial<Theme>;
  children: ReactNode;
}

export function StampProvider({ mode, theme, children }: StampProviderProps) {
  // Subscribe to the store so the tree re-renders when the persisted mode
  // changes; only consulted when `mode` is not explicitly provided.
  const storeMode = useThemeStore((s) => s.mode);
  const activeMode: ThemeMode = mode ?? storeMode;
  const base: Theme = activeMode === 'dark' ? darkTheme : lightTheme;
  const resolved: Theme = theme ? { ...base, ...theme } : base;

  return (
    <ThemeProvider theme={resolved}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
