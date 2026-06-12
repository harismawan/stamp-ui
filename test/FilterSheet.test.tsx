import { expect, test } from 'bun:test';
import { fireEvent, screen } from '@testing-library/react';
import { FilterSection, FilterSheet } from '../src/components/FilterSheet';
import { renderWithTheme } from './util';

test('FilterSheet renders a dialog with sections when open', () => {
  renderWithTheme(
    <FilterSheet open onClose={() => {}}>
      <FilterSection title="Tipe Produk">
        <span>chips here</span>
      </FilterSection>
    </FilterSheet>,
  );
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByText('Tipe Produk')).toBeTruthy();
  expect(screen.getByText('chips here')).toBeTruthy();
});

test('FilterSheet renders nothing when closed', () => {
  renderWithTheme(
    <FilterSheet open={false} onClose={() => {}}>
      <span>hidden</span>
    </FilterSheet>,
  );
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('FilterSheet apply fires onApply then onClose', () => {
  const calls: string[] = [];
  renderWithTheme(
    <FilterSheet
      open
      onClose={() => calls.push('close')}
      onApply={() => calls.push('apply')}
      applyLabel="Terapkan"
    >
      <span>x</span>
    </FilterSheet>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));
  expect(calls).toEqual(['apply', 'close']);
});

test('FilterSheet reset-all and section reset fire their handlers', () => {
  let resetAll = false;
  let sectionReset = false;
  renderWithTheme(
    <FilterSheet open onClose={() => {}} onResetAll={() => (resetAll = true)}>
      <FilterSection title="Harga" onReset={() => (sectionReset = true)}>
        <span>x</span>
      </FilterSection>
    </FilterSheet>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reset all' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(resetAll).toBe(true);
  expect(sectionReset).toBe(true);
});
