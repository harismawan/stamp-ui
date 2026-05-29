import { test, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Switch } from '../src/components/Switch';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test leaks into the next ("Found multiple elements") in the full suite.
afterEach(() => cleanup());

test('Switch exposes role=switch and reflects aria-checked', () => {
  renderWithTheme(<Switch checked={false} onChange={() => {}} label="Dark mode" />);
  const sw = screen.getByRole('switch');
  expect(sw.getAttribute('aria-checked')).toBe('false');
});

test('Switch aria-checked is true when checked', () => {
  renderWithTheme(<Switch checked={true} onChange={() => {}} label="Dark mode" />);
  expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
});

test('Switch fires onChange(true) when toggled on via click', async () => {
  const user = userEvent.setup();
  const onChange = mock((v: boolean) => {});
  renderWithTheme(<Switch checked={false} onChange={onChange} label="Dark mode" />);
  await user.click(screen.getByRole('switch'));
  expect(onChange.mock.calls[0][0]).toBe(true);
});

test('Switch toggles with the Space key', async () => {
  const user = userEvent.setup();
  const onChange = mock((v: boolean) => {});
  renderWithTheme(<Switch checked={false} onChange={onChange} label="Dark mode" />);
  const sw = screen.getByRole('switch');
  sw.focus();
  await user.keyboard(' ');
  expect(onChange.mock.calls[0][0]).toBe(true);
});

test('Switch does not fire onChange when disabled', async () => {
  const user = userEvent.setup();
  const onChange = mock((v: boolean) => {});
  renderWithTheme(<Switch checked={false} onChange={onChange} label="Dark mode" disabled />);
  await user.click(screen.getByRole('switch'));
  expect(onChange).not.toHaveBeenCalled();
});
