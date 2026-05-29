import { describe, it, expect, afterEach, beforeEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { toast, useToastStore, ToastViewport } from '../src/components/Toast';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});
afterEach(() => cleanup());

describe('Toast', () => {
  it('toast.success pushes a toast that ToastViewport renders', async () => {
    renderWithTheme(<ToastViewport />);
    toast.success('Saved!');
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
