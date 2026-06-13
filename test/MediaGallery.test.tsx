import { expect, test } from 'bun:test';
import { fireEvent, screen } from '@testing-library/react';
import { MediaGallery } from '../src/components/MediaGallery';
import { renderWithTheme } from './util';

const ITEMS = [
  { src: '/1.jpg', alt: 'Preview 1' },
  { src: '/2.jpg', alt: 'Preview 2' },
  { src: '/3.jpg', alt: 'Preview 3' },
];

test('MediaGallery shows the first item as the main image by default', () => {
  renderWithTheme(<MediaGallery items={ITEMS} />);
  expect(screen.getByRole('img', { name: 'Preview 1' })).toBeTruthy();
});

test('MediaGallery clicking a thumbnail switches the main image', () => {
  renderWithTheme(<MediaGallery items={ITEMS} />);
  fireEvent.click(screen.getByRole('button', { name: 'Preview 2' }));
  expect(screen.getByRole('img', { name: 'Preview 2' })).toBeTruthy();
});

test('MediaGallery marks the active thumbnail with aria-current', () => {
  renderWithTheme(<MediaGallery items={ITEMS} defaultIndex={2} />);
  expect(screen.getByRole('button', { name: 'Preview 3' }).getAttribute('aria-current')).toBe(
    'true',
  );
});

test('MediaGallery controlled: onIndexChange fires, index prop wins', () => {
  let next = -1;
  renderWithTheme(<MediaGallery items={ITEMS} index={0} onIndexChange={(i) => (next = i)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Preview 3' }));
  expect(next).toBe(2);
  // still controlled at 0
  expect(screen.getByRole('img', { name: 'Preview 1' })).toBeTruthy();
});
