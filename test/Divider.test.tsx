import { test, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Divider } from '../src/components/Divider';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test leaks and getByRole('separator') finds multiple nodes in the
// full suite (passes in isolation). cleanup() resets between tests.
afterEach(() => cleanup());

test('Divider renders with role=separator', () => {
  renderWithTheme(<Divider />);
  expect(screen.getByRole('separator')).toBeTruthy();
});

test('horizontal Divider sets aria-orientation=horizontal by default', () => {
  renderWithTheme(<Divider />);
  expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
});

test('vertical Divider sets aria-orientation=vertical', () => {
  renderWithTheme(<Divider orientation="vertical" />);
  expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
});

test('horizontal Divider renders its centered label text', () => {
  renderWithTheme(<Divider label="OR" />);
  expect(screen.getByText('OR')).toBeTruthy();
  // A labelled separator is no longer purely decorative.
  expect(screen.getByRole('separator')).toBeTruthy();
});
