import { expect, test } from 'bun:test';
import { screen } from '@testing-library/react';
import { Footer, FooterColumn } from '../src/components/Footer';
import { renderWithTheme } from './util';

test('Footer renders a contentinfo landmark with columns', () => {
  renderWithTheme(
    <Footer bottom={<span>© 2026 tokoshi</span>}>
      <FooterColumn title="Marketplace">
        <a href="/explore">Jelajah</a>
      </FooterColumn>
      <FooterColumn title="Bantuan">
        <a href="/faq">FAQ</a>
      </FooterColumn>
    </Footer>,
  );
  expect(screen.getByRole('contentinfo')).toBeTruthy();
  expect(screen.getByText('Marketplace')).toBeTruthy();
  expect(screen.getByText('FAQ')).toBeTruthy();
  expect(screen.getByText('© 2026 tokoshi')).toBeTruthy();
});

test('Footer renders without a bottom bar', () => {
  renderWithTheme(
    <Footer>
      <FooterColumn>
        <span>solo</span>
      </FooterColumn>
    </Footer>,
  );
  expect(screen.getByText('solo')).toBeTruthy();
});
