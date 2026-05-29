import { describe, it, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Note: extensionless paths — repo tsconfig.json (`bunx tsc`) lacks
// `allowImportingTsExtensions`, so `.tsx` import suffixes fail TS5097 there.
import { renderWithTheme } from './util';
import { Button } from '../src/components/Button';

// happy-dom is registered once for the whole `bun test` run (test/setup.ts),
// so every file shares one global `document`. These tests query via the global
// `screen`, which scans the entire document; without unmounting after each
// test, renders from sibling tests/files accumulate and `getByRole` throws
// "Found multiple elements" in the full suite (passes in isolation). cleanup()
// keeps the shared DOM single-tree.
afterEach(() => cleanup());

describe('Button', () => {
  it('renders its children', () => {
    renderWithTheme(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('defaults to type="button"', () => {
    renderWithTheme(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('button');
  });

  it('fires onClick when clicked', async () => {
    const onClick = mock(() => {});
    renderWithTheme(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = mock(() => {});
    renderWithTheme(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as an anchor when as="a"', () => {
    renderWithTheme(
      <Button as="a" href="https://example.com">
        Link
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://example.com');
  });
});
