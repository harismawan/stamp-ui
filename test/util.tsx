import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { StampProvider } from '../src/provider';

// `wrapper` rather than wrapping `ui` directly, so the returned `rerender`
// keeps the provider instead of replacing the whole tree with an unthemed one.
export function renderWithTheme(ui: ReactElement) {
  return render(ui, { wrapper: StampProvider });
}
