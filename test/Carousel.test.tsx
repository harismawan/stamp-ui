import { expect, test } from 'bun:test';
import { fireEvent, screen } from '@testing-library/react';
import { Carousel } from '../src/components/Carousel';
import { renderWithTheme } from './util';

test('Carousel renders a labelled region with its children', () => {
  renderWithTheme(
    <Carousel ariaLabel="Featured creators">
      <div>slide-1</div>
      <div>slide-2</div>
    </Carousel>,
  );
  expect(screen.getByRole('region', { name: 'Featured creators' })).toBeTruthy();
  expect(screen.getByText('slide-1')).toBeTruthy();
  expect(screen.getByText('slide-2')).toBeTruthy();
});

test('Carousel renders previous/next buttons that scroll the track', () => {
  renderWithTheme(
    <Carousel ariaLabel="row">
      <div>a</div>
    </Carousel>,
  );
  const prev = screen.getByRole('button', { name: 'Previous' });
  const next = screen.getByRole('button', { name: 'Next' });
  expect(prev).toBeTruthy();
  expect(next).toBeTruthy();
  // happy-dom has no layout; just assert clicking does not throw.
  fireEvent.click(next);
  fireEvent.click(prev);
});

test('Carousel does not leak $gap to the DOM', () => {
  renderWithTheme(
    <Carousel ariaLabel="row" $gap={4}>
      <div>a</div>
    </Carousel>,
  );
  const region = screen.getByRole('region', { name: 'row' });
  expect(region.getAttribute('$gap')).toBeNull();
});
