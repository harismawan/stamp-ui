import { test, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Tag } from '../src/components/Tag';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

test('Tag renders its children', () => {
  renderWithTheme(<Tag>Groceries</Tag>);
  expect(screen.getByText('Groceries')).toBeTruthy();
});

test('Tag shows no remove button when onRemove is absent', () => {
  renderWithTheme(<Tag>Groceries</Tag>);
  expect(screen.queryByRole('button')).toBeNull();
});

test('Tag shows a remove button when onRemove is provided', () => {
  renderWithTheme(<Tag onRemove={() => {}}>Groceries</Tag>);
  const btn = screen.getByRole('button', { name: /remove groceries/i });
  expect(btn).toBeTruthy();
});

test('clicking the remove button fires onRemove', async () => {
  const user = userEvent.setup();
  const onRemove = mock(() => {});
  renderWithTheme(<Tag onRemove={onRemove}>Groceries</Tag>);
  await user.click(screen.getByRole('button', { name: /remove groceries/i }));
  expect(onRemove).toHaveBeenCalledTimes(1);
});
