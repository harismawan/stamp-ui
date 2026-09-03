import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { act, cleanup, screen } from '@testing-library/react';
import { ToastViewport, toast, useToastStore } from '../src/components/Toast';
import { renderWithTheme } from './util';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});
afterEach(() => cleanup());

describe('Toast', () => {
  it('toast.success pushes a toast that ToastViewport renders', async () => {
    renderWithTheme(<ToastViewport />);
    // The store push re-renders the mounted viewport — must happen inside act.
    act(() => {
      toast.success('Saved!');
    });
    expect(await screen.findByText('Saved!')).toBeTruthy();
    expect(useToastStore.getState().toasts.length).toBe(1);
  });

  it('dismiss removes the toast from the store', () => {
    toast.error('Boom');
    const { toasts, dismiss } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    dismiss(toasts[0].id);
    expect(useToastStore.getState().toasts.length).toBe(0);
  });

  it('records the kind for each helper', () => {
    toast.info('i');
    toast.warn('w');
    const kinds = useToastStore.getState().toasts.map((t) => t.kind);
    expect(kinds).toEqual(['info', 'warn']);
  });
});
