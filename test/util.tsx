import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

export function renderWithTheme(ui: ReactElement) {
  // NOTE: temporarily renders without theme. Swapped to wrap in
  // <StampProvider> in the StampProvider foundation task.
  return render(ui);
}
