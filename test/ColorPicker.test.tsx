import { describe, it, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Note: extensionless paths — repo tsconfig.json (`bunx tsc`) lacks
// `allowImportingTsExtensions`, so `.tsx` import suffixes fail TS5097 there.
import { renderWithTheme } from './util';
import { ColorPicker, DEFAULT_SWATCHES } from '../src/components/ColorPicker';

// happy-dom is shared across the whole `bun test` run; without unmounting after
// each test, renders accumulate in the global document and `getByRole` throws
// "Found multiple elements" in the full suite (passes in isolation).
afterEach(() => cleanup());

describe('ColorPicker', () => {
  it('renders a swatch button per default color', () => {
    renderWithTheme(<ColorPicker value="" onChange={() => {}} />);
    expect(screen.getAllByRole('button').length).toBe(DEFAULT_SWATCHES.length);
  });

  it('calls onChange with the clicked hex', async () => {
    const onChange = mock((_hex: string) => {});
    renderWithTheme(<ColorPicker value="" onChange={onChange} />);
    const target = DEFAULT_SWATCHES[2];
    await userEvent.click(screen.getByRole('button', { name: target }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe(target);
  });

  it('marks the active swatch via aria-pressed', () => {
    const active = DEFAULT_SWATCHES[1];
    renderWithTheme(<ColorPicker value={active} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: active }).getAttribute('aria-pressed')).toBe('true');
  });

  it('accepts a custom swatches array', () => {
    renderWithTheme(<ColorPicker value="" onChange={() => {}} swatches={['#000000', '#ffffff']} />);
    expect(screen.getAllByRole('button').length).toBe(2);
  });
});
