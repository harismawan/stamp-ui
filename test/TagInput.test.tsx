import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '../src/components/TagInput';
import { renderWithTheme } from './util';

afterEach(cleanup);

describe('TagInput', () => {
  it('renders a group with an inline textbox', () => {
    renderWithTheme(<TagInput placeholder="Add tag" />);
    expect(screen.getByRole('group')).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('gives the input a stable accessible name even without a placeholder', () => {
    renderWithTheme(<TagInput />);
    // Default accessible name is independent of placeholder.
    expect(screen.getByRole('textbox', { name: 'Add tags' })).toBeTruthy();
  });

  it('does not derive the input accessible name from the placeholder', () => {
    renderWithTheme(<TagInput placeholder="Type a tag…" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    // Accessible name stays the stable default, not the placeholder anti-pattern.
    expect(input.getAttribute('aria-label')).toBe('Add tags');
    expect(input.placeholder).toBe('Type a tag…');
    expect(screen.queryByRole('textbox', { name: 'Type a tag…' })).toBeNull();
  });

  it('allows overriding the input accessible name via aria-label', () => {
    renderWithTheme(<TagInput aria-label="Add skills" placeholder="Add tag" />);
    expect(screen.getByRole('textbox', { name: 'Add skills' })).toBeTruthy();
  });

  it('gives the group a default accessible name', () => {
    renderWithTheme(<TagInput />);
    expect(screen.getByRole('group', { name: 'Tags' })).toBeTruthy();
  });

  it('allows overriding the group accessible name via groupLabel', () => {
    renderWithTheme(<TagInput groupLabel="Selected skills" />);
    expect(screen.getByRole('group', { name: 'Selected skills' })).toBeTruthy();
  });

  it('renders seeded tags from defaultValue', () => {
    renderWithTheme(<TagInput defaultValue={['react', 'ts']} />);
    expect(screen.getByText('react')).toBeTruthy();
    expect(screen.getByText('ts')).toBeTruthy();
  });

  it('adds a tag when typing then pressing Enter', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByText('hello')).toBeTruthy());
    expect(onChange).toHaveBeenCalledWith(['hello']);
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('adds a tag when typing a comma delimiter', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'world,');
    await waitFor(() => expect(screen.getByText('world')).toBeTruthy());
    expect(onChange).toHaveBeenCalledWith(['world']);
    // The comma must not have been typed into the input.
    expect(input.value).toBe('');
  });

  it('trims whitespace before committing', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), '  spaced  ');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['spaced']);
  });

  it('rejects an empty (or whitespace-only) input', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Enter}');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects a duplicate by default', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput defaultValue={['dup']} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'dup');
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByText('dup')).toHaveLength(1);
  });

  it('accepts a duplicate when allowDuplicates is set', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput defaultValue={['dup']} allowDuplicates onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'dup');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['dup', 'dup']);
    await waitFor(() => expect(screen.getAllByText('dup')).toHaveLength(2));
  });

  it('enforces max', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput defaultValue={['a', 'b']} max={2} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'c');
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText('c')).toBeNull();
  });

  it('rejects tags that fail validate', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    const validate = (tag: string) => tag.length >= 3;
    renderWithTheme(<TagInput validate={validate} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'no');
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    // Rejection does not clear the draft, so reset it before the valid attempt.
    await user.clear(input);
    await user.type(input, 'yes');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['yes']);
  });

  it('removes the last tag on Backspace with an empty input', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput defaultValue={['one', 'two']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['one']);
    await waitFor(() => expect(screen.queryByText('two')).toBeNull());
  });

  it('does not remove a tag on Backspace when the input has text', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput defaultValue={['keep']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'x');
    await user.keyboard('{Backspace}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('keep')).toBeTruthy();
  });

  it('removes a specific tag when its chip remove button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput defaultValue={['alpha', 'beta']} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Remove alpha' }));
    expect(onChange).toHaveBeenCalledWith(['beta']);
    await waitFor(() => expect(screen.queryByText('alpha')).toBeNull());
  });

  it('respects the controlled value prop', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput value={['fixed']} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'new');
    await user.keyboard('{Enter}');
    // onChange fires, but the rendered value stays controlled by the prop.
    expect(onChange).toHaveBeenCalledWith(['fixed', 'new']);
    expect(screen.queryByText('new')).toBeNull();
    expect(screen.getByText('fixed')).toBeTruthy();
  });

  it('supports custom delimiters', async () => {
    const user = userEvent.setup();
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput delimiters={[' ']} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'spaced ');
    expect(onChange).toHaveBeenCalledWith(['spaced']);
  });

  it('disables the input and blocks removal when disabled', async () => {
    const onChange = mock((_tags: string[]) => {});
    renderWithTheme(<TagInput defaultValue={['locked']} disabled onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    // No remove button is rendered for chips while disabled.
    expect(screen.queryByRole('button', { name: 'Remove locked' })).toBeNull();
    // A direct keydown is ignored while disabled.
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
