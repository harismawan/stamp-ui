import { test, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Avatar, AvatarGroup } from '../src/components/Avatar';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

test('Avatar renders an img when src is provided', () => {
  renderWithTheme(<Avatar src="https://example.com/a.png" name="Ada Lovelace" />);
  const img = screen.getByRole('img', { name: 'Ada Lovelace' }) as HTMLImageElement;
  expect(img.src).toBe('https://example.com/a.png');
});

test('Avatar falls back to initials when no src', () => {
  renderWithTheme(<Avatar name="Ada Lovelace" />);
  expect(screen.getByText('AL')).toBeTruthy();
  expect(screen.queryByRole('img')).toBeNull();
});

test('Avatar derives single initial from a one-word name', () => {
  renderWithTheme(<Avatar name="Ada" />);
  expect(screen.getByText('A')).toBeTruthy();
});

test('AvatarGroup renders all avatars when count is within max', () => {
  renderWithTheme(
    <AvatarGroup max={3}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Bob Ross" />
    </AvatarGroup>,
  );
  expect(screen.getByText('AL')).toBeTruthy();
  expect(screen.getByText('BR')).toBeTruthy();
  expect(screen.queryByText(/^\+/)).toBeNull();
});

test('AvatarGroup caps at max and shows a +N overflow chip', () => {
  renderWithTheme(
    <AvatarGroup max={2}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Bob Ross" />
      <Avatar name="Cy Young" />
      <Avatar name="Di Caprio" />
    </AvatarGroup>,
  );
  expect(screen.getByText('AL')).toBeTruthy();
  expect(screen.getByText('BR')).toBeTruthy();
  expect(screen.queryByText('CY')).toBeNull();
  expect(screen.getByText('+2')).toBeTruthy();
});
