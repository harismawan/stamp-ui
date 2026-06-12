import { expect, test } from 'bun:test';
import { screen } from '@testing-library/react';
import {
  MediaCard,
  MediaCardBadge,
  MediaCardBody,
  MediaCardCover,
} from '../src/components/MediaCard';
import { renderWithTheme } from './util';

test('MediaCard composes cover image, badge, and body', () => {
  renderWithTheme(
    <MediaCard>
      <MediaCardCover src="/cover.jpg" alt="Sample cover" $aspect="3:4">
        <MediaCardBadge>Photopack</MediaCardBadge>
      </MediaCardCover>
      <MediaCardBody>
        <span>Judul produk</span>
      </MediaCardBody>
    </MediaCard>,
  );
  expect(screen.getByRole('img', { name: 'Sample cover' })).toBeTruthy();
  expect(screen.getByText('Photopack')).toBeTruthy();
  expect(screen.getByText('Judul produk')).toBeTruthy();
});

test('MediaCardCover renders without a src (placeholder box)', () => {
  const { container } = renderWithTheme(<MediaCardCover alt="" />);
  expect(container.querySelector('img')).toBeNull();
  expect(container.firstChild).toBeTruthy();
});

test('MediaCard does not leak $hover or $aspect to the DOM', () => {
  const { container } = renderWithTheme(
    <MediaCard $hover>
      <MediaCardCover src="/x.jpg" alt="x" $aspect="16:9" />
    </MediaCard>,
  );
  const card = container.firstChild as HTMLElement;
  expect(card.getAttribute('$hover')).toBeNull();
  const cover = card.firstChild as HTMLElement;
  expect(cover.getAttribute('$aspect')).toBeNull();
});
