import { test, expect, afterEach } from 'bun:test';
import { ThemeProvider } from 'styled-components';
import { screen, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { lightTheme } from '../src/theme';
import { Stat } from '../src/components/Stat';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

test('Stat renders its label and value', () => {
  renderWithTheme(<Stat label="Balance" value="$1,200" />);
  expect(screen.getByText('Balance')).toBeTruthy();
  expect(screen.getByText('$1,200')).toBeTruthy();
});

test('Stat renders no delta when delta is absent', () => {
  renderWithTheme(<Stat label="Balance" value="$1,200" />);
  expect(screen.queryByTestId('stat-delta')).toBeNull();
});

test('an up delta is colored with the income color', () => {
  renderWithTheme(<Stat label="Balance" value="$1,200" delta={12} deltaType="up" />);
  const delta = screen.getByTestId('stat-delta');
  expect(delta).toBeTruthy();
  expect(delta.textContent).toContain('12');
  expect(getComputedStyle(delta).color).toBe(lightTheme.colors.income);
});

test('a down delta is colored with the expense color', () => {
  renderWithTheme(<Stat label="Balance" value="$1,200" delta={-8} deltaType="down" />);
  const delta = screen.getByTestId('stat-delta');
  expect(getComputedStyle(delta).color).toBe(lightTheme.colors.expense);
});

test("deltaType 'auto' picks income for positive and expense for negative", () => {
  const { rerender } = renderWithTheme(<Stat label="B" value="$1" delta={5} deltaType="auto" />);
  expect(getComputedStyle(screen.getByTestId('stat-delta')).color).toBe(lightTheme.colors.income);
  rerender(
    <ThemeProvider theme={lightTheme}>
      <Stat label="B" value="$1" delta={-5} deltaType="auto" />
    </ThemeProvider>,
  );
  expect(getComputedStyle(screen.getByTestId('stat-delta')).color).toBe(lightTheme.colors.expense);
});
