import { describe, it, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { NumberInput } from '../src/components/NumberInput';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

describe('NumberInput', () => {
  it('formats the display value with the default thousand separator', () => {
    renderWithTheme(<NumberInput value="1000000" onChange={() => {}} aria-label="amount" />);
    expect((screen.getByLabelText('amount') as HTMLInputElement).value).toBe('1.000.000');
  });

  it('emits the raw digit string when a formatted value is typed', async () => {
    const onChange = mock((_e: { target: { value: string } }) => {});
    renderWithTheme(<NumberInput value="" onChange={onChange} aria-label="amount" />);
    await userEvent.type(screen.getByLabelText('amount'), '1.234.567');
    const calls = onChange.mock.calls;
    const last = calls[calls.length - 1]?.[0] as { target: { value: string } };
    expect(last.target.value).toBe('1234567');
  });

  it('respects a custom thousandSep', () => {
    renderWithTheme(
      <NumberInput value="1000000" thousandSep="," onChange={() => {}} aria-label="amount" />,
    );
    expect((screen.getByLabelText('amount') as HTMLInputElement).value).toBe('1,000,000');
  });

  it('forwards a ref to the underlying input', () => {
    let node: HTMLInputElement | null = null;
    renderWithTheme(
      <NumberInput
        ref={(n) => {
          node = n;
        }}
        value="5"
        onChange={() => {}}
        aria-label="amount"
      />,
    );
    expect(node).toBeTruthy();
    expect((node as HTMLInputElement | null)?.tagName).toBe('INPUT');
  });
});
