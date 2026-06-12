import { expect, test } from 'bun:test';
import { screen } from '@testing-library/react';
import { RankList } from '../src/components/RankList';
import { renderWithTheme } from './util';

const ITEMS = [
  { id: 'a', label: 'Ayang Halu', value: 'Rp 250.000' },
  { id: 'b', label: 'Budi', value: 'Rp 100.000' },
  { id: 'c', label: 'Citra' },
];

test('RankList renders an ordered list with one item per entry', () => {
  renderWithTheme(<RankList items={ITEMS} />);
  expect(screen.getByRole('list')).toBeTruthy();
  expect(screen.getAllByRole('listitem').length).toBe(3);
});

test('RankList renders rank numbers, labels, and values', () => {
  renderWithTheme(<RankList items={ITEMS} />);
  expect(screen.getByText('1')).toBeTruthy();
  expect(screen.getByText('Ayang Halu')).toBeTruthy();
  expect(screen.getByText('Rp 250.000')).toBeTruthy();
  expect(screen.getByText('3')).toBeTruthy();
});

test('RankList marks the highlighted top rows with a data attribute', () => {
  renderWithTheme(<RankList items={ITEMS} highlightTop={2} />);
  const rows = screen.getAllByRole('listitem');
  expect(rows[0].getAttribute('data-highlight')).toBe('true');
  expect(rows[1].getAttribute('data-highlight')).toBe('true');
  expect(rows[2].getAttribute('data-highlight')).toBe('false');
});
