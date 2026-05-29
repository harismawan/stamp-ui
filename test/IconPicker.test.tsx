import { describe, it, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Note: extensionless paths — repo tsconfig.json (`bunx tsc`) lacks
// `allowImportingTsExtensions`, so `.tsx` import suffixes fail TS5097 there.
import { renderWithTheme } from './util';
import { IconPicker, DEFAULT_ICONS } from '../src/components/IconPicker';

// happy-dom is shared across the whole `bun test` run; without unmounting after
// each test, renders accumulate in the global document and `getByRole` throws
// "Found multiple elements" in the full suite (passes in isolation).
afterEach(() => cleanup());

describe('IconPicker', () => {
  it('renders a tile per default icon', () => {
    renderWithTheme(<IconPicker value="" onChange={() => {}} />);
    expect(screen.getAllByRole('button').length).toBe(DEFAULT_ICONS.length);
  });

  it('calls onChange with the clicked icon name', async () => {
    const onChange = mock((_name: string) => {});
    renderWithTheme(<IconPicker value="" onChange={onChange} />);
    const target = DEFAULT_ICONS[1];
    await userEvent.click(screen.getByRole('button', { name: target }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe(target);
  });

  it('marks the active icon via aria-pressed', () => {
    const active = DEFAULT_ICONS[0];
    renderWithTheme(<IconPicker value={active} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: active }).getAttribute('aria-pressed')).toBe('true');
  });

  it('accepts a custom icons array', () => {
    renderWithTheme(<IconPicker value="" onChange={() => {}} icons={['Star', 'Heart']} />);
    expect(screen.getAllByRole('button').length).toBe(2);
  });
});
