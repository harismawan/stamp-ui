import { describe, it, expect, afterEach } from 'bun:test';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Accordion, AccordionItem } from '../src/components/Accordion';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

function Single() {
  return (
    <Accordion type="single">
      <AccordionItem value="one" title="First">
        Content one
      </AccordionItem>
      <AccordionItem value="two" title="Second">
        Content two
      </AccordionItem>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('renders headers as buttons collapsed by default', () => {
    renderWithTheme(<Single />);
    const first = screen.getByRole('button', { name: 'First' });
    expect(first.getAttribute('aria-expanded')).toBe('false');
    // region hidden while collapsed
    const region = document.getElementById(first.getAttribute('aria-controls') as string);
    expect(region?.hasAttribute('hidden')).toBe(true);
  });

  it('clicking a header expands it and sets aria-expanded true', () => {
    renderWithTheme(<Single />);
    const first = screen.getByRole('button', { name: 'First' });
    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    const region = document.getElementById(first.getAttribute('aria-controls') as string);
    expect(region?.hasAttribute('hidden')).toBe(false);
    expect(region?.getAttribute('role')).toBe('region');
    expect(region?.getAttribute('aria-labelledby')).toBe(first.id);
  });

  it('clicking an expanded header collapses it', () => {
    renderWithTheme(<Single />);
    const first = screen.getByRole('button', { name: 'First' });
    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  it('single mode: opening one closes the other', () => {
    renderWithTheme(<Single />);
    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });
    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  it('multiple mode: items open independently', () => {
    renderWithTheme(
      <Accordion type="multiple">
        <AccordionItem value="one" title="First">
          Content one
        </AccordionItem>
        <AccordionItem value="two" title="Second">
          Content two
        </AccordionItem>
      </Accordion>,
    );
    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });
    fireEvent.click(first);
    fireEvent.click(second);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(second.getAttribute('aria-expanded')).toBe('true');
  });
});
