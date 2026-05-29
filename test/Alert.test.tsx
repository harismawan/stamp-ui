import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Alert } from '../src/components/Alert';

afterEach(cleanup);

describe('Alert', () => {
  it('renders with role=alert and its content', () => {
    renderWithTheme(<Alert title="Heads up">Something happened</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Heads up');
    expect(alert.textContent).toContain('Something happened');
  });

  it('does not render a close button when onClose is absent', () => {
    renderWithTheme(<Alert>Plain</Alert>);
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
  });

  it('fires onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = mock(() => {});
    renderWithTheme(
      <Alert $variant="danger" onClose={onClose}>
        Failure
      </Alert>,
    );
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders an icon for the variant', () => {
    renderWithTheme(
      <Alert $variant="success" title="Done">
        Saved
      </Alert>,
    );
    expect(screen.getByRole('alert').querySelector('svg')).toBeTruthy();
  });
});
