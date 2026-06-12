import { expect, test } from 'bun:test';
import { fireEvent, screen } from '@testing-library/react';
import { TopNav, TopNavActions, TopNavLinks } from '../src/components/TopNav';
import { renderWithTheme } from './util';

test('TopNav renders logo, center slot, links, and actions', () => {
  renderWithTheme(
    <TopNav logo={<span>tokoshi</span>} center={<input aria-label="cari" />}>
      <TopNavLinks>
        <a href="/explore">Jelajah</a>
      </TopNavLinks>
      <TopNavActions>
        <button type="button">Masuk</button>
      </TopNavActions>
    </TopNav>,
  );
  expect(screen.getByRole('banner')).toBeTruthy();
  expect(screen.getByText('tokoshi')).toBeTruthy();
  expect(screen.getByLabelText('cari')).toBeTruthy();
  expect(screen.getByText('Jelajah')).toBeTruthy();
  expect(screen.getByText('Masuk')).toBeTruthy();
});

test('TopNav hamburger opens a drawer with the nav children', () => {
  const { container } = renderWithTheme(
    <TopNav logo={<span>logo</span>} mobileTitle="Menu">
      <TopNavLinks>
        <a href="/x">LinkX</a>
      </TopNavLinks>
    </TopNav>,
  );
  // display:none hides the button from the a11y tree under happy-dom (no real
  // media-query evaluation), so query the DOM directly. In production the
  // button is display:none on desktop and display:inline-flex on mobile —
  // the correct a11y behaviour.
  const hamburger = container.querySelector('button[aria-label="Open menu"]');
  if (!hamburger) throw new Error('Hamburger button not found');
  fireEvent.click(hamburger);
  expect(screen.getByRole('dialog', { name: 'Menu' })).toBeTruthy();
  // link now exists twice: desktop area + drawer
  expect(screen.getAllByText('LinkX').length).toBe(2);
});

test('TopNavLinks is a nav landmark', () => {
  renderWithTheme(
    <TopNav>
      <TopNavLinks aria-label="Utama">
        <a href="/a">A</a>
      </TopNavLinks>
    </TopNav>,
  );
  expect(screen.getByRole('navigation', { name: 'Utama' })).toBeTruthy();
});
