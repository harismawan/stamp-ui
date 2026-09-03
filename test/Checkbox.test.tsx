import { afterEach, expect, mock, test } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../src/components/Checkbox';
import { renderWithTheme } from './util';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

test('Checkbox renders its label and associates it with the input', () => {
  renderWithTheme(<Checkbox checked={false} onChange={() => {}} label="Accept terms" />);
  const input = screen.getByLabelText('Accept terms') as HTMLInputElement;
  expect(input.type).toBe('checkbox');
  expect(input.checked).toBe(false);
});

test('Checkbox fires onChange(true) when clicked while unchecked', async () => {
  const user = userEvent.setup();
  const onChange = mock((_v: boolean) => {});
  renderWithTheme(<Checkbox checked={false} onChange={onChange} label="Accept terms" />);
  await user.click(screen.getByLabelText('Accept terms'));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toBe(true);
});

test('Checkbox fires onChange(false) when clicked while checked', async () => {
  const user = userEvent.setup();
  const onChange = mock((_v: boolean) => {});
  renderWithTheme(<Checkbox checked={true} onChange={onChange} label="Accept terms" />);
  await user.click(screen.getByLabelText('Accept terms'));
  expect(onChange.mock.calls[0][0]).toBe(false);
});

test('Checkbox does not fire onChange when disabled', async () => {
  const user = userEvent.setup();
  const onChange = mock((_v: boolean) => {});
  renderWithTheme(<Checkbox checked={false} onChange={onChange} label="Accept terms" disabled />);
  const input = screen.getByLabelText('Accept terms') as HTMLInputElement;
  expect(input.disabled).toBe(true);
  await user.click(input);
  expect(onChange).not.toHaveBeenCalled();
});
