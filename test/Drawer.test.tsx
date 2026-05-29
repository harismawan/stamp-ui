import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Drawer } from '../src/components/Drawer';

afterEach(cleanup);

describe('Drawer', () => {
  it('renders nothing when not open', () => {
    renderWithTheme(
      <Drawer open={false} onClose={() => {}} title="Settings">
        <p>Body</p>
      </Drawer>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Body')).toBeNull();
  });

  it('renders a modal dialog with title and body when open', () => {
    renderWithTheme(
      <Drawer open onClose={() => {}} title="Settings">
        <p>Body</p>
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('fires onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = mock(() => {});
    renderWithTheme(
      <Drawer open onClose={onClose}>
        <p>Body</p>
      </Drawer>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onClose when the overlay is clicked', async () => {
    const user = userEvent.setup();
    const onClose = mock(() => {});
    renderWithTheme(
      <Drawer open onClose={onClose}>
        <p>Body</p>
      </Drawer>,
    );
    await user.click(screen.getByTestId('drawer-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reflects the side prop via a data attribute', () => {
    renderWithTheme(
      <Drawer open onClose={() => {}} side="left">
        <p>Body</p>
      </Drawer>,
    );
    expect(screen.getByRole('dialog').getAttribute('data-side')).toBe('left');
  });

  it('defaults the side to right', () => {
    renderWithTheme(
      <Drawer open onClose={() => {}}>
        <p>Body</p>
      </Drawer>,
    );
    expect(screen.getByRole('dialog').getAttribute('data-side')).toBe('right');
  });

  it('moves focus into the panel when opened', async () => {
    renderWithTheme(
      <Drawer open onClose={() => {}} title="Settings">
        <p>Body</p>
      </Drawer>,
    );
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });
});
