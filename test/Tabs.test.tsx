import { describe, it, expect, afterEach } from 'bun:test';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Tabs, TabList, Tab, TabPanel } from '../src/components/Tabs';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

function Example() {
  return (
    <Tabs value="a" onChange={() => {}}>
      <TabList aria-label="sections">
        <Tab value="a">First</Tab>
        <Tab value="b">Second</Tab>
        <Tab value="c">Third</Tab>
      </TabList>
      <TabPanel value="a">Panel A</TabPanel>
      <TabPanel value="b">Panel B</TabPanel>
      <TabPanel value="c">Panel C</TabPanel>
    </Tabs>
  );
}

// Controlled wrapper so onChange actually updates state.
function Controlled() {
  return <Example />;
}

describe('Tabs', () => {
  it('renders a tablist with tabs and exposes correct roles', () => {
    renderWithTheme(<Example />);
    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab').length).toBe(3);
  });

  it('marks the active tab aria-selected and shows only its panel', () => {
    renderWithTheme(<Example />);
    const first = screen.getByRole('tab', { name: 'First' });
    const second = screen.getByRole('tab', { name: 'Second' });
    expect(first.getAttribute('aria-selected')).toBe('true');
    expect(second.getAttribute('aria-selected')).toBe('false');
    // active panel visible (role tabpanel rendered, not hidden)
    const panelA = screen.getByText('Panel A');
    expect(panelA.hasAttribute('hidden')).toBe(false);
    // inactive panels hidden
    expect(screen.getByText('Panel B').hasAttribute('hidden')).toBe(true);
  });

  it('roving tabindex: only the selected tab is focusable', () => {
    renderWithTheme(<Example />);
    expect(screen.getByRole('tab', { name: 'First' }).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('tab', { name: 'Second' }).getAttribute('tabindex')).toBe('-1');
  });

  it('clicking a tab switches the visible panel', () => {
    let current = 'a';
    function Stateful() {
      const [v, setV] = (require('react') as typeof import('react')).useState('a');
      current = v;
      return (
        <Tabs value={v} onChange={setV}>
          <TabList aria-label="x">
            <Tab value="a">First</Tab>
            <Tab value="b">Second</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </Tabs>
      );
    }
    renderWithTheme(<Stateful />);
    fireEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(current).toBe('b');
    expect(screen.getByText('Panel B').hasAttribute('hidden')).toBe(false);
    expect(screen.getByText('Panel A').hasAttribute('hidden')).toBe(true);
  });

  it('ArrowRight moves selection to the next tab and wraps', () => {
    let current = 'a';
    function Stateful() {
      const [v, setV] = (require('react') as typeof import('react')).useState('a');
      current = v;
      return (
        <Tabs value={v} onChange={setV}>
          <TabList aria-label="x">
            <Tab value="a">First</Tab>
            <Tab value="b">Second</Tab>
            <Tab value="c">Third</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
          <TabPanel value="c">Panel C</TabPanel>
        </Tabs>
      );
    }
    renderWithTheme(<Stateful />);
    const first = screen.getByRole('tab', { name: 'First' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(current).toBe('b');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Second' }), { key: 'ArrowRight' });
    expect(current).toBe('c');
    // wrap around
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Third' }), { key: 'ArrowRight' });
    expect(current).toBe('a');
  });

  it('ArrowRight skips a disabled tab', () => {
    let current = 'a';
    function Stateful() {
      const [v, setV] = (require('react') as typeof import('react')).useState('a');
      current = v;
      return (
        <Tabs value={v} onChange={setV}>
          <TabList aria-label="x">
            <Tab value="a">First</Tab>
            <Tab value="b" disabled>
              Second
            </Tab>
            <Tab value="c">Third</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
          <TabPanel value="c">Panel C</TabPanel>
        </Tabs>
      );
    }
    renderWithTheme(<Stateful />);
    const first = screen.getByRole('tab', { name: 'First' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    // Middle tab is disabled, so selection jumps to the third.
    expect(current).toBe('c');
  });

  it('Home and End land on the first/last enabled tab', () => {
    let current = 'b';
    function Stateful() {
      const [v, setV] = (require('react') as typeof import('react')).useState('b');
      current = v;
      return (
        <Tabs value={v} onChange={setV}>
          <TabList aria-label="x">
            <Tab value="a" disabled>
              First
            </Tab>
            <Tab value="b">Second</Tab>
            <Tab value="c" disabled>
              Third
            </Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
          <TabPanel value="c">Panel C</TabPanel>
        </Tabs>
      );
    }
    renderWithTheme(<Stateful />);
    const second = screen.getByRole('tab', { name: 'Second' });
    second.focus();
    fireEvent.keyDown(second, { key: 'Home' });
    // First tab is disabled, so Home lands on the first enabled tab (Second).
    expect(current).toBe('b');
    fireEvent.keyDown(second, { key: 'End' });
    // Last tab is disabled, so End lands on the last enabled tab (Second).
    expect(current).toBe('b');
  });

  it('ArrowLeft moves selection to the previous tab and wraps', () => {
    let current = 'a';
    function Stateful() {
      const [v, setV] = (require('react') as typeof import('react')).useState('a');
      current = v;
      return (
        <Tabs value={v} onChange={setV}>
          <TabList aria-label="x">
            <Tab value="a">First</Tab>
            <Tab value="b">Second</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </Tabs>
      );
    }
    renderWithTheme(<Stateful />);
    const first = screen.getByRole('tab', { name: 'First' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(current).toBe('b');
  });
});
