import { expect, test } from 'bun:test';
import { screen } from '@testing-library/react';
import { GoalProgress } from '../src/components/GoalProgress';
import { renderWithTheme } from './util';

test('GoalProgress renders label, valueLabel, and a progressbar', () => {
  renderWithTheme(
    <GoalProgress
      value={120000}
      max={350000}
      label="Lensa baru"
      valueLabel="Rp 120.000 / Rp 350.000"
    />,
  );
  expect(screen.getByText('Lensa baru')).toBeTruthy();
  expect(screen.getByText('Rp 120.000 / Rp 350.000')).toBeTruthy();
  const bar = screen.getByRole('progressbar');
  expect(bar.getAttribute('aria-valuenow')).toBe('120000');
  expect(bar.getAttribute('aria-valuemax')).toBe('350000');
});

test('GoalProgress clamps value to max', () => {
  renderWithTheme(<GoalProgress value={500} max={100} />);
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
});
