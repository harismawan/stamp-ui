import { describe, it, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
// Note: extensionless paths — repo tsconfig.json (`bunx tsc`) lacks
// `allowImportingTsExtensions`, so `.tsx` import suffixes fail TS5097 there.
import { renderWithTheme } from './util';
import { Spinner } from '../src/components/Spinner';

// happy-dom is registered once for the whole `bun test` run (test/setup.ts),
// so every file shares one global `document`. Without unmounting after each
// test, the role="status" node from the first test persists and getByRole
// throws "Found multiple elements" in the full suite (passes in isolation).
afterEach(() => cleanup());

describe('Spinner', () => {
  it('renders with role="status" and the default aria-label', () => {
    renderWithTheme(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-label')).toBe('Loading');
  });

  it('uses a custom label', () => {
    renderWithTheme(<Spinner label="Fetching" />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Fetching');
  });
});
