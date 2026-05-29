import { describe, it, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { confirmDialog, ConfirmViewport } from '../src/components/ConfirmDialog';

afterEach(() => cleanup());

describe('ConfirmDialog', () => {
  it('opens the viewport when confirmDialog() is called', async () => {
    renderWithTheme(<ConfirmViewport />);
    confirmDialog({ title: 'Remove item', message: 'Sure?' });
    expect(await screen.findByText('Remove item')).toBeTruthy();
    expect(screen.getByText('Sure?')).toBeTruthy();
  });

  it('resolves true when the confirm button is clicked', async () => {
    renderWithTheme(<ConfirmViewport />);
    const result = confirmDialog({ confirmLabel: 'Delete' });
    const confirmBtn = await screen.findByRole('button', { name: 'Delete' });
    await userEvent.click(confirmBtn);
    expect(await result).toBe(true);
  });

  it('resolves false when the cancel button is clicked', async () => {
    renderWithTheme(<ConfirmViewport />);
    const result = confirmDialog({ cancelLabel: 'Cancel' });
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelBtn);
    expect(await result).toBe(false);
  });
});
