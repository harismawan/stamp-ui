import { afterEach, describe, expect, it } from 'bun:test';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmViewport, confirmDialog } from '../src/components/ConfirmDialog';
import { renderWithTheme } from './util';

afterEach(() => cleanup());

describe('ConfirmDialog', () => {
  it('opens the viewport when confirmDialog() is called', async () => {
    renderWithTheme(<ConfirmViewport />);
    // Opens via a store push that re-renders the mounted viewport.
    act(() => {
      confirmDialog({ title: 'Remove item', message: 'Sure?' });
    });
    expect(await screen.findByText('Remove item')).toBeTruthy();
    expect(screen.getByText('Sure?')).toBeTruthy();
  });

  it('resolves true when the confirm button is clicked', async () => {
    renderWithTheme(<ConfirmViewport />);
    let result!: Promise<boolean>;
    act(() => {
      result = confirmDialog({ confirmLabel: 'Delete' });
    });
    const confirmBtn = await screen.findByRole('button', { name: 'Delete' });
    await userEvent.click(confirmBtn);
    expect(await result).toBe(true);
  });

  it('resolves false when the cancel button is clicked', async () => {
    renderWithTheme(<ConfirmViewport />);
    let result!: Promise<boolean>;
    act(() => {
      result = confirmDialog({ cancelLabel: 'Cancel' });
    });
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelBtn);
    expect(await result).toBe(false);
  });
});
