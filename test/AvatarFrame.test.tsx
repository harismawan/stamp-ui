import { expect, test } from 'bun:test';
import { screen } from '@testing-library/react';
import { AvatarFrame } from '../src/components/AvatarFrame';
import { renderWithTheme } from './util';

test('AvatarFrame renders the image with the name as alt', () => {
  renderWithTheme(<AvatarFrame src="/p.jpg" name="Raiden Shogun" />);
  expect(screen.getByRole('img', { name: 'Raiden Shogun' })).toBeTruthy();
});

test('AvatarFrame falls back to initials without src', () => {
  renderWithTheme(<AvatarFrame name="Raiden Shogun" />);
  expect(screen.getByText('RS')).toBeTruthy();
});

test('AvatarFrame renders the badge slot', () => {
  renderWithTheme(<AvatarFrame name="R" badge={<span>Gold</span>} />);
  expect(screen.getByText('Gold')).toBeTruthy();
});

test('AvatarFrame does not leak $aspect to the DOM', () => {
  const { container } = renderWithTheme(<AvatarFrame name="R" $aspect="3:4" />);
  const el = container.firstChild as HTMLElement;
  expect(el.getAttribute('$aspect')).toBeNull();
});
