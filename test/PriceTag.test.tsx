import { expect, test } from 'bun:test';
import { screen } from '@testing-library/react';
import { PriceTag } from '../src/components/PriceTag';
import { renderWithTheme } from './util';

test('PriceTag renders the formatted price string', () => {
  renderWithTheme(<PriceTag>Rp 15.000</PriceTag>);
  expect(screen.getByText('Rp 15.000')).toBeTruthy();
});

test('PriceTag renders the original price struck through', () => {
  renderWithTheme(<PriceTag original="Rp 25.000">Rp 15.000</PriceTag>);
  const original = screen.getByText('Rp 25.000');
  expect(original.closest('s')).toBeTruthy();
});

test('PriceTag does not render an <s> element without original', () => {
  const { container } = renderWithTheme(<PriceTag>Rp 15.000</PriceTag>);
  expect(container.querySelector('s')).toBeNull();
});

test('PriceTag does not leak $size to the DOM', () => {
  const { container } = renderWithTheme(<PriceTag $size="lg">Rp 15.000</PriceTag>);
  const el = container.firstChild as HTMLElement;
  expect(el.getAttribute('$size')).toBeNull();
});
