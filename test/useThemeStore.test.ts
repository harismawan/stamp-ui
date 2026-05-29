import { beforeEach, expect, test } from 'bun:test';
import { useThemeStore } from '../src/hooks/useThemeStore';

beforeEach(() => {
  useThemeStore.setState({ mode: 'light' });
});

test('defaults to light mode', () => {
  expect(useThemeStore.getState().mode).toBe('light');
});

test('setMode sets an explicit mode', () => {
  useThemeStore.getState().setMode('dark');
  expect(useThemeStore.getState().mode).toBe('dark');
});

test('toggle flips light -> dark -> light', () => {
  expect(useThemeStore.getState().mode).toBe('light');
  useThemeStore.getState().toggle();
  expect(useThemeStore.getState().mode).toBe('dark');
  useThemeStore.getState().toggle();
  expect(useThemeStore.getState().mode).toBe('light');
});
