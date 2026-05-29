import { test, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Radio, RadioGroup } from '../src/components/Radio';

// Testing Library does not auto-cleanup under bun:test, so stale DOM from a
// prior test would trip "Found multiple elements" in the full suite.
afterEach(() => cleanup());

test('RadioGroup renders radios sharing the group name', () => {
  renderWithTheme(
    <RadioGroup name="plan" value="a" onChange={() => {}}>
      <Radio value="a" label="Plan A" />
      <Radio value="b" label="Plan B" />
    </RadioGroup>,
  );
  const a = screen.getByLabelText('Plan A') as HTMLInputElement;
  const b = screen.getByLabelText('Plan B') as HTMLInputElement;
  expect(a.name).toBe('plan');
  expect(b.name).toBe('plan');
});

test('RadioGroup checks only the radio matching value', () => {
  renderWithTheme(
    <RadioGroup name="plan" value="b" onChange={() => {}}>
      <Radio value="a" label="Plan A" />
      <Radio value="b" label="Plan B" />
    </RadioGroup>,
  );
  expect((screen.getByLabelText('Plan A') as HTMLInputElement).checked).toBe(false);
  expect((screen.getByLabelText('Plan B') as HTMLInputElement).checked).toBe(true);
});

test('selecting a radio fires onChange with that value', async () => {
  const user = userEvent.setup();
  const onChange = mock((v: string) => {});
  renderWithTheme(
    <RadioGroup name="plan" value="a" onChange={onChange}>
      <Radio value="a" label="Plan A" />
      <Radio value="b" label="Plan B" />
    </RadioGroup>,
  );
  await user.click(screen.getByLabelText('Plan B'));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toBe('b');
});

test('disabled Radio is disabled and does not fire onChange when clicked', async () => {
  const user = userEvent.setup();
  const onChange = mock((v: string) => {});
  renderWithTheme(
    <RadioGroup name="plan" value="a" onChange={onChange}>
      <Radio value="a" label="Plan A" />
      <Radio value="b" label="Plan B" disabled />
    </RadioGroup>,
  );
  const b = screen.getByLabelText('Plan B') as HTMLInputElement;
  expect(b.disabled).toBe(true);
  await user.click(b);
  expect(onChange).not.toHaveBeenCalled();
});

test('arrow-key navigation moves selection to the next radio and fires onChange', async () => {
  const user = userEvent.setup();
  const onChange = mock((v: string) => {});
  renderWithTheme(
    <RadioGroup name="plan" value="a" onChange={onChange}>
      <Radio value="a" label="Plan A" />
      <Radio value="b" label="Plan B" />
    </RadioGroup>,
  );
  const a = screen.getByLabelText('Plan A') as HTMLInputElement;
  a.focus();
  expect(document.activeElement).toBe(a);
  await user.keyboard('{ArrowDown}');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toBe('b');
});
