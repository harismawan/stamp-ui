import { test, expect } from 'bun:test';
import { screen } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Badge } from '../src/components/Badge';

test('Badge renders its children text', () => {
  renderWithTheme(<Badge>New</Badge>);
  expect(screen.getByText('New')).toBeTruthy();
});

test('Badge defaults to the neutral variant', () => {
  const { container } = renderWithTheme(<Badge>Neutral</Badge>);
  // neutral fill is surfaceMuted; primary fill is the primary color.
  const el = container.firstChild as HTMLElement;
  expect(el).toBeTruthy();
  expect(el.textContent).toBe('Neutral');
});

test('Badge accepts a variant and still renders its text', () => {
  renderWithTheme(<Badge $variant="success">Paid</Badge>);
  expect(screen.getByText('Paid')).toBeTruthy();
});

test('Badge does not leak the $variant prop to the DOM', () => {
  const { container } = renderWithTheme(<Badge $variant="danger">Overdue</Badge>);
  const el = container.firstChild as HTMLElement;
  expect(el.getAttribute('$variant')).toBeNull();
  expect(el.getAttribute('variant')).toBeNull();
});
