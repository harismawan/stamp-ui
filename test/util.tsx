import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { StampProvider } from '../src/provider';

export function renderWithTheme(ui: ReactElement) {
  return render(<StampProvider>{ui}</StampProvider>);
}
