import { test, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Slider } from '../src/components/Slider';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test leaks into the next ("Found multiple elements") in the full suite.
afterEach(() => cleanup());

test('Slider renders a range input with min/max/step/value', () => {
  renderWithTheme(<Slider value={40} onChange={() => {}} min={0} max={100} step={5} />);
  const input = screen.getByRole('slider') as HTMLInputElement;
  expect(input.type).toBe('range');
  expect(input.min).toBe('0');
  expect(input.max).toBe('100');
  expect(input.step).toBe('5');
  expect(input.value).toBe('40');
});

test('Slider uses default min=0 max=100 step=1 when omitted', () => {
  renderWithTheme(<Slider value={10} onChange={() => {}} />);
  const input = screen.getByRole('slider') as HTMLInputElement;
  expect(input.min).toBe('0');
  expect(input.max).toBe('100');
  expect(input.step).toBe('1');
});

test('Slider fires onChange with a number on input change', () => {
  const onChange = mock((v: number) => {});
  renderWithTheme(<Slider value={40} onChange={onChange} />);
  const input = screen.getByRole('slider') as HTMLInputElement;
  fireEvent.change(input, { target: { value: '75' } });
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toBe(75);
});

test('Slider is disabled when disabled prop set', () => {
  renderWithTheme(<Slider value={40} onChange={() => {}} disabled />);
  expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(true);
});
