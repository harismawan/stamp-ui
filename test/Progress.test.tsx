import { test, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Progress } from '../src/components/Progress';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would otherwise leak and cause "Found multiple elements" in the
// full suite (passes in isolation). cleanup() resets between tests.
afterEach(() => cleanup());

test('Progress exposes role=progressbar with aria value attributes', () => {
  renderWithTheme(<Progress value={40} />);
  const bar = screen.getByRole('progressbar');
  expect(bar.getAttribute('aria-valuenow')).toBe('40');
  expect(bar.getAttribute('aria-valuemin')).toBe('0');
  expect(bar.getAttribute('aria-valuemax')).toBe('100');
});

test('Progress reflects a custom max in aria-valuemax', () => {
  renderWithTheme(<Progress value={3} max={5} />);
  const bar = screen.getByRole('progressbar');
  expect(bar.getAttribute('aria-valuenow')).toBe('3');
  expect(bar.getAttribute('aria-valuemax')).toBe('5');
});

test('Progress fill width reflects the value as a percentage', () => {
  renderWithTheme(<Progress value={25} />);
  const fill = screen.getByTestId('progress-fill');
  expect(fill.style.width).toBe('25%');
});

test('Progress clamps values above max to 100%', () => {
  renderWithTheme(<Progress value={150} max={100} />);
  expect(screen.getByTestId('progress-fill').style.width).toBe('100%');
});

test('Progress clamps aria-valuenow above max to the max', () => {
  renderWithTheme(<Progress value={150} max={100} />);
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
});

test('Progress clamps aria-valuenow below zero to zero', () => {
  renderWithTheme(<Progress value={-20} max={100} />);
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
});

test('Progress renders an optional label', () => {
  renderWithTheme(<Progress value={40} label="Loading" />);
  expect(screen.getByText('Loading')).toBeTruthy();
  expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe('Loading');
});
