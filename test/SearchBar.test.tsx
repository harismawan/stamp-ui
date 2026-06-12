import { expect, test } from 'bun:test';
import { fireEvent, screen } from '@testing-library/react';
import { SearchBar } from '../src/components/SearchBar';
import { renderWithTheme } from './util';

test('SearchBar renders a search landmark with a textbox', () => {
  renderWithTheme(<SearchBar aria-label="Site search" placeholder="Cari" />);
  expect(screen.getByRole('search')).toBeTruthy();
  expect(screen.getByPlaceholderText('Cari')).toBeTruthy();
});

test('SearchBar submits the current value on Enter (form submit)', () => {
  let submitted = '';
  renderWithTheme(
    <SearchBar aria-label="s" defaultValue="raiden" onSubmit={(v) => (submitted = v)} />,
  );
  fireEvent.submit(screen.getByRole('search'));
  expect(submitted).toBe('raiden');
});

test('SearchBar works controlled: onChange receives the string value', () => {
  let latest = '';
  renderWithTheme(<SearchBar aria-label="s" value="a" onChange={(v) => (latest = v)} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ab' } });
  expect(latest).toBe('ab');
});

test('SearchBar clearable shows a clear button that empties the value', () => {
  renderWithTheme(<SearchBar aria-label="s" defaultValue="x" clearable />);
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
});
