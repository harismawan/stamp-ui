import { test, expect } from 'bun:test';
import { screen } from '@testing-library/react';
import { renderWithTheme } from './util';
import { EmptyState } from '../src/components/EmptyState';

test('EmptyState renders its title', () => {
  renderWithTheme(<EmptyState title="No transactions yet" />);
  expect(screen.getByText('No transactions yet')).toBeTruthy();
});

test('EmptyState renders an optional description', () => {
  renderWithTheme(
    <EmptyState title="No transactions yet" description="Add your first one to get started." />,
  );
  expect(screen.getByText('Add your first one to get started.')).toBeTruthy();
});

test('EmptyState renders an action node', () => {
  renderWithTheme(
    <EmptyState title="No transactions yet" action={<button type="button">Add</button>} />,
  );
  expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy();
});

test('EmptyState renders an icon node when provided', () => {
  renderWithTheme(
    <EmptyState title="No transactions yet" icon={<span data-testid="empty-icon">icon</span>} />,
  );
  expect(screen.getByTestId('empty-icon')).toBeTruthy();
});
