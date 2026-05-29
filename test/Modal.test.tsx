import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../src/components/Modal';
// Note: extensionless paths — repo tsconfig.json (`bunx tsc`) lacks
// `allowImportingTsExtensions`, so `.tsx` import suffixes fail TS5097 there.
import { renderWithTheme } from './util';

// Shared happy-dom document across the suite — unmount after each test so
// the fixed-position overlay doesn't accumulate multiple `dialog` roles.
afterEach(() => cleanup());

describe('Modal', () => {
  it('renders nothing when closed', () => {
    renderWithTheme(
      <Modal open={false} onClose={() => {}} title="Hi">
        body content
      </Modal>,
    );
    expect(screen.queryByText('body content')).toBeNull();
  });

  it('renders a dialog with aria-modal when open', () => {
    renderWithTheme(
      <Modal open onClose={() => {}} title="Hi">
        body content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Hi')).toBeTruthy();
    expect(screen.getByText('body content')).toBeTruthy();
  });

  it('fires onClose when Escape is pressed', async () => {
    const onClose = mock(() => {});
    renderWithTheme(
      <Modal open onClose={onClose} title="Hi">
        body
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onClose when the close button is clicked', async () => {
    const onClose = mock(() => {});
    renderWithTheme(
      <Modal open onClose={onClose} title="Hi">
        body
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click but not on panel click', async () => {
    const onClose = mock(() => {});
    renderWithTheme(
      <Modal open onClose={onClose} title="Hi">
        <span>panel body</span>
      </Modal>,
    );
    // Clicking inside the panel must NOT close.
    await userEvent.click(screen.getByText('panel body'));
    expect(onClose).not.toHaveBeenCalled();

    // Clicking the overlay (parent of the dialog panel) closes.
    const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
