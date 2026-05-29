import { describe, it, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
// Note: extensionless paths — repo tsconfig.json (`bunx tsc`) lacks
// `allowImportingTsExtensions`, so `.tsx` import suffixes fail TS5097 there.
import { renderWithTheme } from './util';
import { Card, CardTitle, CardValue } from '../src/components/Card';

// Shared happy-dom document across the suite — unmount after each test so
// sibling renders don't accumulate in the global tree (see Button.test.tsx).
afterEach(() => cleanup());

describe('Card', () => {
  it('renders its children', () => {
    renderWithTheme(<Card>Hello card</Card>);
    expect(screen.getByText('Hello card')).toBeTruthy();
  });

  it('renders CardTitle and CardValue text', () => {
    renderWithTheme(
      <Card>
        <CardTitle>Balance</CardTitle>
        <CardValue>1.000.000</CardValue>
      </Card>,
    );
    expect(screen.getByText('Balance')).toBeTruthy();
    expect(screen.getByText('1.000.000')).toBeTruthy();
  });

  it('still renders with $accent applied', () => {
    renderWithTheme(<Card $accent>Accented</Card>);
    expect(screen.getByText('Accented')).toBeTruthy();
  });
});
