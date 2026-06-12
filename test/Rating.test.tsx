import { expect, test } from 'bun:test';
import { fireEvent, screen } from '@testing-library/react';
import { Rating } from '../src/components/Rating';
import { renderWithTheme } from './util';

test('Rating display mode exposes an img role with accessible value', () => {
  renderWithTheme(<Rating value={4.5} />);
  expect(screen.getByRole('img', { name: '4.5 out of 5 stars' })).toBeTruthy();
});

test('Rating renders the review count when given', () => {
  renderWithTheme(<Rating value={5} count={160} />);
  expect(screen.getByText('(160)')).toBeTruthy();
});

test('Rating input mode renders 5 radios and fires onChange with star index', () => {
  let next = 0;
  renderWithTheme(<Rating value={2} onChange={(v) => (next = v)} />);
  const radios = screen.getAllByRole('radio');
  expect(radios.length).toBe(5);
  expect(radios[1].getAttribute('aria-checked')).toBe('true');
  fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
  expect(next).toBe(4);
});

test('Rating readOnly ignores onChange and renders display mode', () => {
  renderWithTheme(<Rating value={3} readOnly onChange={() => {}} />);
  expect(screen.queryAllByRole('radio').length).toBe(0);
  expect(screen.getByRole('img', { name: '3 out of 5 stars' })).toBeTruthy();
});

test('Rating input mode supports arrow keys with roving tabIndex', () => {
  let next = 0;
  renderWithTheme(<Rating value={2} onChange={(v) => (next = v)} />);
  const checked = screen.getByRole('radio', { name: '2 stars' });
  expect(checked.getAttribute('tabindex')).toBe('0');
  expect(screen.getByRole('radio', { name: '1 star' }).getAttribute('tabindex')).toBe('-1');
  fireEvent.keyDown(checked, { key: 'ArrowRight' });
  expect(next).toBe(3);
});
