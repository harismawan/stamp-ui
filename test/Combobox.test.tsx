import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Combobox, type ComboboxOption } from '../src/components/Combobox';

afterEach(cleanup);

const OPTIONS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

function getInput() {
  return screen.getByRole('combobox') as HTMLInputElement;
}

describe('Combobox', () => {
  it('is closed by default (no listbox)', () => {
    renderWithTheme(<Combobox options={OPTIONS} />);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(getInput().getAttribute('aria-expanded')).toBe('false');
  });

  it('exposes role=combobox with aria-autocomplete and aria-controls', () => {
    renderWithTheme(<Combobox options={OPTIONS} />);
    const input = getInput();
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-controls')).toBeTruthy();
  });

  it('opens on focus and toggles aria-expanded', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Combobox options={OPTIONS} />);
    await user.click(getInput());
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    expect(getInput().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('filters options case-insensitively as the user types', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Combobox options={OPTIONS} />);
    await user.click(getInput());
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    await user.type(getInput(), 'an');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      expect(opts).toHaveLength(1);
      expect(opts[0].textContent).toContain('Banana');
    });
  });

  it('honors a provided filter prop', async () => {
    const user = userEvent.setup();
    const filter = (opt: ComboboxOption, q: string) => opt.value.startsWith(q);
    renderWithTheme(<Combobox options={OPTIONS} filter={filter} />);
    await user.click(getInput());
    await user.type(getInput(), 'd');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      expect(opts).toHaveLength(1);
      expect(opts[0].textContent).toContain('Date');
    });
  });

  it('highlights the first match on the keystroke that produces matches and Enter selects it', async () => {
    const user = userEvent.setup();
    const onChange = mock((_: string | null) => {});
    renderWithTheme(<Combobox options={OPTIONS} onChange={onChange} />);
    const input = getInput();
    await user.click(input);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    // "zzz" -> no matches -> nothing highlighted.
    await user.type(input, 'zzz');
    await waitFor(() => expect(screen.getByText('No results')).toBeTruthy());
    expect(input.getAttribute('aria-activedescendant')).toBeNull();

    // Clear and type "ba" -> matches Banana; on this keystroke (which turns
    // no-matches into matches) the first match must already be highlighted so
    // Enter selects it (regression: stale `filtered` left this un-highlighted).
    await user.clear(input);
    await user.type(input, 'ba');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      expect(opts).toHaveLength(1);
      expect(input.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    });
    await user.keyboard('{Enter}');
    expect(onChange.mock.calls[0][0]).toBe('banana');
  });

  it('auto-highlights the first ENABLED option, skipping a leading disabled match', async () => {
    const user = userEvent.setup();
    const opts: ComboboxOption[] = [
      { value: 'crab', label: 'Crab', disabled: true },
      { value: 'crane', label: 'Crane' },
    ];
    const onChange = mock((_: string | null) => {});
    renderWithTheme(<Combobox options={opts} onChange={onChange} />);
    const input = getInput();
    await user.click(input);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    // "cr" matches both; index 0 (Crab) is disabled, so the highlight and
    // aria-activedescendant must land on Crane (index 1).
    await user.type(input, 'cr');
    await waitFor(() => {
      const rendered = screen.getAllByRole('option');
      expect(rendered).toHaveLength(2);
      expect(input.getAttribute('aria-activedescendant')).toBe(rendered[1].id);
    });
    await user.keyboard('{Enter}');
    expect(onChange.mock.calls[0][0]).toBe('crane');
  });

  it('two-stage Escape: first clears a non-empty query (stays open), second closes', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Combobox options={OPTIONS} />);
    const input = getInput();
    await user.click(input);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    await user.type(input, 'an');
    await waitFor(() => expect(input.value).toBe('an'));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(input.value).toBe(''));
    expect(screen.getByRole('listbox')).toBeTruthy();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('shows the empty row with default and custom emptyText', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithTheme(<Combobox options={OPTIONS} />);
    await user.click(getInput());
    await user.type(getInput(), 'zzz');
    await waitFor(() => expect(screen.getByText('No results')).toBeTruthy());
    expect(screen.queryAllByRole('option')).toHaveLength(0);

    cleanup();
    renderWithTheme(<Combobox options={OPTIONS} emptyText="Nothing here" />);
    await user.click(getInput());
    await user.type(getInput(), 'zzz');
    await waitFor(() => expect(screen.getByText('Nothing here')).toBeTruthy());
  });

  it('moves aria-activedescendant with ArrowDown, loops, and skips disabled options', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Combobox options={OPTIONS} />);
    const input = getInput();
    await user.click(input);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      expect(input.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    });

    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      expect(input.getAttribute('aria-activedescendant')).toBe(opts[1].id);
    });

    // Cherry (index 2) is disabled -> skipped, lands on Date (index 3).
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      expect(input.getAttribute('aria-activedescendant')).toBe(opts[3].id);
    });

    // Loop back to the first option.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      expect(input.getAttribute('aria-activedescendant')).toBe(opts[0].id);
    });
  });

  it('moves active up and loops with ArrowUp', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Combobox options={OPTIONS} />);
    const input = getInput();
    await user.click(input);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    await user.keyboard('{ArrowUp}');
    await waitFor(() => {
      const opts = screen.getAllByRole('option');
      // Loops to the last (enabled) option.
      expect(input.getAttribute('aria-activedescendant')).toBe(opts[3].id);
    });
  });

  describe('single select', () => {
    it('selects with Enter: fires onChange, shows label, closes', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string | null) => {});
      renderWithTheme(<Combobox options={OPTIONS} onChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toBe('apple');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(input.value).toBe('Apple');
    });

    it('selects with a click: fires onChange and closes', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string | null) => {});
      renderWithTheme(<Combobox options={OPTIONS} onChange={onChange} />);
      await user.click(getInput());
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toBe('banana');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(getInput().value).toBe('Banana');
    });

    it('reflects aria-selected on the chosen option when reopened', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Combobox options={OPTIONS} defaultValue="banana" />);
      await user.click(getInput());
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      const banana = screen.getByRole('option', { name: 'Banana' });
      expect(banana.getAttribute('aria-selected')).toBe('true');
    });

    it('strict revert: restores the selected label on close after typing', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Combobox options={OPTIONS} defaultValue="apple" />);
      const input = getInput();
      expect(input.value).toBe('Apple');
      await user.click(input);
      await user.type(input, 'xyz');
      expect(input.value).toBe('xyz');
      // First Escape clears the (non-empty) query but keeps the list open.
      await user.keyboard('{Escape}');
      await waitFor(() => expect(input.value).toBe(''));
      expect(screen.getByRole('listbox')).toBeTruthy();
      // Second Escape closes; single-select reverts to the selected label.
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(input.value).toBe('Apple');
    });

    it('does not select a disabled option on click', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string | null) => {});
      renderWithTheme(<Combobox options={OPTIONS} onChange={onChange} />);
      await user.click(getInput());
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      await user.click(screen.getByRole('option', { name: 'Cherry' }));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeTruthy();
    });
  });

  describe('multi select', () => {
    it('marks the listbox aria-multiselectable in multi mode (and not in single)', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Combobox multiple options={OPTIONS} />);
      await user.click(getInput());
      await waitFor(() =>
        expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true'),
      );

      cleanup();
      renderWithTheme(<Combobox options={OPTIONS} />);
      await user.click(getInput());
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBeNull();
    });

    it('toggles values, stays open, clears query, renders chips', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string[]) => {});
      renderWithTheme(<Combobox multiple options={OPTIONS} onChange={onChange} />);
      const input = getInput();
      await user.click(input);
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(onChange.mock.calls[0][0]).toEqual(['apple']);
      // Stays open.
      expect(screen.getByRole('listbox')).toBeTruthy();
      // Chip rendered (its remove button is unique to a chip).
      await waitFor(() => expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeTruthy());

      await user.click(screen.getByRole('option', { name: 'Banana' }));
      expect(onChange.mock.calls[1][0]).toEqual(['apple', 'banana']);

      // Toggling Apple again removes it.
      await user.click(screen.getByRole('option', { name: 'Apple' }));
      expect(onChange.mock.calls[2][0]).toEqual(['banana']);
    });

    it('removes a value via the chip remove button', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string[]) => {});
      renderWithTheme(
        <Combobox multiple options={OPTIONS} defaultValue={['apple', 'banana']} onChange={onChange} />,
      );
      await user.click(screen.getByRole('button', { name: 'Remove Apple' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual(['banana']);
    });

    it('Backspace on an empty query removes the last selected value', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string[]) => {});
      renderWithTheme(
        <Combobox multiple options={OPTIONS} defaultValue={['apple', 'banana']} onChange={onChange} />,
      );
      const input = getInput();
      await user.click(input);
      await user.keyboard('{Backspace}');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual(['apple']);
    });
  });

  describe('clearable', () => {
    it('single: clear button resets value to null and refocuses input', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string | null) => {});
      renderWithTheme(
        <Combobox options={OPTIONS} defaultValue="apple" clearable onChange={onChange} />,
      );
      await user.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toBeNull();
      expect(getInput().value).toBe('');
    });

    it('multi: clear button resets value to []', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string[]) => {});
      renderWithTheme(
        <Combobox multiple options={OPTIONS} defaultValue={['apple', 'banana']} clearable onChange={onChange} />,
      );
      await user.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual([]);
    });

    it('does not render a clear button when there is no value', () => {
      renderWithTheme(<Combobox options={OPTIONS} clearable />);
      expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();
    });
  });

  describe('dismissal', () => {
    it('closes on Escape', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Combobox options={OPTIONS} />);
      await user.click(getInput());
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    });

    it('closes on outside click', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <div>
          <button>outside</button>
          <Combobox options={OPTIONS} />
        </div>,
      );
      await user.click(getInput());
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      await user.click(screen.getByRole('button', { name: 'outside' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    });
  });

  describe('controlled', () => {
    it('reflects the controlled value and reports changes without self-updating', async () => {
      const user = userEvent.setup();
      const onChange = mock((_: string | null) => {});
      renderWithTheme(<Combobox options={OPTIONS} value="apple" onChange={onChange} />);
      const input = getInput();
      expect(input.value).toBe('Apple');
      await user.click(input);
      await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
      await user.click(screen.getByRole('option', { name: 'Banana' }));
      expect(onChange.mock.calls[0][0]).toBe('banana');
      // Controlled: value prop still "apple", so closed label reverts to Apple.
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(input.value).toBe('Apple');
    });
  });

  describe('disabled', () => {
    it('cannot be opened', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Combobox options={OPTIONS} disabled />);
      const input = getInput();
      expect(input.disabled).toBe(true);
      await user.click(input);
      fireEvent.focus(input);
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });
});
