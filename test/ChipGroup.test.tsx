import { expect, test } from 'bun:test';
import { fireEvent, screen } from '@testing-library/react';
import { ChipGroup } from '../src/components/ChipGroup';
import { renderWithTheme } from './util';

const OPTIONS = ['photo', 'video', { value: 'voice', label: 'Voice Note' }];

test('ChipGroup single-select renders a radiogroup and fires onChange', () => {
  let next: unknown = null;
  renderWithTheme(
    <ChipGroup aria-label="Type" options={OPTIONS} value="photo" onChange={(v) => (next = v)} />,
  );
  expect(screen.getByRole('radiogroup', { name: 'Type' })).toBeTruthy();
  const photo = screen.getByRole('radio', { name: 'photo' });
  expect(photo.getAttribute('aria-checked')).toBe('true');
  fireEvent.click(screen.getByRole('radio', { name: 'Voice Note' }));
  expect(next).toBe('voice');
});

test('ChipGroup multiple toggles values in and out of the array', () => {
  let next: unknown = null;
  renderWithTheme(
    <ChipGroup
      aria-label="Type"
      multiple
      options={OPTIONS}
      value={['photo']}
      onChange={(v) => (next = v)}
    />,
  );
  const video = screen.getByRole('button', { name: 'video' });
  expect(video.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(video);
  expect(next).toEqual(['photo', 'video']);
});

test('ChipGroup multiple removes an already-selected value', () => {
  let next: unknown = null;
  renderWithTheme(
    <ChipGroup
      aria-label="Type"
      multiple
      options={OPTIONS}
      value={['photo', 'video']}
      onChange={(v) => (next = v)}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'photo' }));
  expect(next).toEqual(['video']);
});

test('ChipGroup disabled option does not fire onChange', () => {
  let fired = false;
  renderWithTheme(
    <ChipGroup
      aria-label="Type"
      options={[{ value: 'photo', disabled: true }]}
      value={null}
      onChange={() => (fired = true)}
    />,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'photo' }));
  expect(fired).toBe(false);
});

test('ChipGroup single-select arrow keys move selection and skip disabled', () => {
  let next: unknown = null;
  renderWithTheme(
    <ChipGroup
      aria-label="Type"
      options={['photo', { value: 'video', disabled: true }, 'voice']}
      value="photo"
      onChange={(v) => (next = v)}
    />,
  );
  const photo = screen.getByRole('radio', { name: 'photo' });
  fireEvent.keyDown(photo, { key: 'ArrowRight' });
  expect(next).toBe('voice'); // skipped disabled 'video'
});

test('ChipGroup single-select uses roving tabIndex', () => {
  renderWithTheme(
    <ChipGroup aria-label="Type" options={['photo', 'video']} value="video" onChange={() => {}} />,
  );
  expect(screen.getByRole('radio', { name: 'video' }).getAttribute('tabindex')).toBe('0');
  expect(screen.getByRole('radio', { name: 'photo' }).getAttribute('tabindex')).toBe('-1');
});
