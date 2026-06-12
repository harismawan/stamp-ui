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
  renderWithTheme(
    <TopNav logo={<span>logo</span>} mobileTitle="Menu">
      <TopNavLinks>
        <a href="/x">LinkX</a>
      </TopNavLinks>
    </TopNav>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
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
