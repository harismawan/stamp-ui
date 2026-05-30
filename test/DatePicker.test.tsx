import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { DatePicker } from '../src/components/DatePicker';
import { monthLabel } from '../src/components/internal/calendar';

afterEach(cleanup);

// A fixed in-month date so tests are deterministic regardless of "today".
const MAY_2026 = new Date(2026, 4, 15);

// The trigger is the only expand-able button (aria-haspopup="dialog"); day
// cells inside the grid are not expand-able, so `expanded` uniquely targets it.
function getTrigger(): HTMLButtonElement {
  return screen.getByRole('button', { expanded: false }) as HTMLButtonElement;
}
function getOpenTrigger(): HTMLButtonElement {
  return screen.getByRole('button', { expanded: true }) as HTMLButtonElement;
}

describe('DatePicker', () => {
  it('is closed by default and exposes aria-expanded=false', () => {
    renderWithTheme(<DatePicker defaultValue={MAY_2026} />);
    const trigger = getTrigger();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.textContent).toContain(MAY_2026.toLocaleDateString());
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('shows the placeholder when there is no value', () => {
    renderWithTheme(<DatePicker placeholder="Pick a day" />);
    expect(getTrigger().textContent).toContain('Pick a day');
  });

  it('opens the popover with a grid when the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());
    expect(getOpenTrigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the current month for the selected value', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());
    expect(screen.getByText(monthLabel(MAY_2026))).toBeTruthy();
  });

  it('fires onChange with the clicked date and closes', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date | null) => {});
    renderWithTheme(<DatePicker defaultValue={MAY_2026} onChange={onChange} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());

    const target = new Date(2026, 4, 20);
    await user.click(
      screen.getByRole('button', { name: target.toLocaleDateString() }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(4);
    expect(arg.getDate()).toBe(20);
    await waitFor(() => expect(screen.queryByRole('grid')).toBeNull());
  });

  it('navigates to the previous and next month via the chevrons', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());

    expect(screen.getByText(monthLabel(new Date(2026, 4, 1)))).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await waitFor(() =>
      expect(screen.getByText(monthLabel(new Date(2026, 3, 1)))).toBeTruthy(),
    );

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    await waitFor(() =>
      expect(screen.getByText(monthLabel(new Date(2026, 5, 1)))).toBeTruthy(),
    );
  });

  it('disables out-of-range days according to min/max', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DatePicker
        defaultValue={MAY_2026}
        min={new Date(2026, 4, 10)}
        max={new Date(2026, 4, 20)}
      />,
    );
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());

    const before = screen.getByRole('button', {
      name: new Date(2026, 4, 5).toLocaleDateString(),
    }) as HTMLButtonElement;
    const after = screen.getByRole('button', {
      name: new Date(2026, 4, 25).toLocaleDateString(),
    }) as HTMLButtonElement;
    const within = screen.getByRole('button', {
      name: new Date(2026, 4, 15).toLocaleDateString(),
    }) as HTMLButtonElement;

    expect(before.disabled).toBe(true);
    expect(after.disabled).toBe(true);
    expect(within.disabled).toBe(false);
  });

  it('does not fire onChange when a disabled day is clicked', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date | null) => {});
    renderWithTheme(
      <DatePicker
        defaultValue={MAY_2026}
        min={new Date(2026, 4, 10)}
        onChange={onChange}
      />,
    );
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());

    await user.click(
      screen.getByRole('button', {
        name: new Date(2026, 4, 5).toLocaleDateString(),
      }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders a clear control that resets to null when clearable', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date | null) => {});
    renderWithTheme(
      <DatePicker defaultValue={MAY_2026} clearable onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeNull();
  });

  it('does not open the popover when clearing', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} clearable />);
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('does not render the clear control without a value', () => {
    renderWithTheme(<DatePicker clearable />);
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
  });

  it('renders the clear control as a real <button> sibling, not nested in the trigger', () => {
    renderWithTheme(<DatePicker defaultValue={MAY_2026} clearable />);
    const trigger = getTrigger();
    const clear = screen.getByRole('button', { name: 'Clear date' });
    // Must be an actual <button>, not a role="button" span.
    expect(clear.tagName).toBe('BUTTON');
    // Interactive content nested inside a <button> is invalid; they must be siblings.
    expect(trigger.contains(clear)).toBe(false);
  });

  it('does not call onChange on clear when there is no value to clear', () => {
    const onChange = mock((_d: Date | null) => {});
    // No value, but the control is still queryable only when there is a value;
    // assert the guard at the handler level by rendering with a value, clearing
    // once, then verifying a second clear is impossible (control unmounts).
    renderWithTheme(<DatePicker defaultValue={MAY_2026} clearable onChange={onChange} />);
    const clear = screen.getByRole('button', { name: 'Clear date' });
    fireEvent.click(clear);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeNull();
    // Uncontrolled: value is now null, so the clear control is gone -> no way to
    // fire a redundant onChange(null).
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
  });

  it('never fires onChange when controlled value is already null (clear control absent)', () => {
    const onChange = mock((_d: Date | null) => {});
    // Controlled with null: there is nothing to clear, so the guard's effect is
    // observable as the clear control simply not being rendered/invokable.
    renderWithTheme(<DatePicker value={null} clearable onChange={onChange} />);
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('gives the dialog an accessible name from the month-year title', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    const dialog = screen.getByRole('dialog');
    const labelledby = dialog.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const title = document.getElementById(labelledby as string);
    expect(title?.textContent).toBe(monthLabel(MAY_2026));
  });

  it('moves focus to the selected day on open so arrow keys work immediately', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());

    // Initial focus lands on the selected day cell, not a nav button.
    await waitFor(() =>
      expect(
        (document.activeElement as HTMLElement)?.getAttribute('aria-label'),
      ).toBe(MAY_2026.toLocaleDateString()),
    );

    // Arrow navigation moves the roving day immediately, with no Tab needed.
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        (document.activeElement as HTMLElement)?.getAttribute('aria-label'),
      ).toBe(new Date(2026, 4, 16).toLocaleDateString()),
    );
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('grid')).toBeNull());
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DatePicker defaultValue={MAY_2026} disabled />);
    const trigger = getTrigger();
    expect(trigger.disabled).toBe(true);
    await user.click(trigger);
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('is controlled when value is provided', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date | null) => {});
    renderWithTheme(<DatePicker value={MAY_2026} onChange={onChange} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());

    await user.click(
      screen.getByRole('button', {
        name: new Date(2026, 4, 20).toLocaleDateString(),
      }),
    );
    // Controlled: fires onChange but the displayed value is driven by the prop.
    expect(onChange).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('grid')).toBeNull());
    expect(getTrigger().textContent).toContain(MAY_2026.toLocaleDateString());
  });

  it('keeps the focused cell mounted when arrowing into an adjacent month', async () => {
    const user = userEvent.setup();
    // First day of the month so ArrowLeft lands in the previous month.
    renderWithTheme(<DatePicker defaultValue={new Date(2026, 4, 1)} />);
    await user.click(getTrigger());
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy());

    // The selected day (May 1) holds roving focus; arrow left across boundary.
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    await waitFor(() =>
      expect(screen.getByText(monthLabel(new Date(2026, 3, 1)))).toBeTruthy(),
    );
    // Grid stays mounted with the previous month showing.
    expect(screen.getByRole('grid')).toBeTruthy();
  });

  it('uses a custom format function when provided', () => {
    renderWithTheme(
      <DatePicker defaultValue={MAY_2026} format={(d) => `Y${d.getFullYear()}`} />,
    );
    expect(getTrigger().textContent).toContain('Y2026');
  });

  it('clears via keyboard on the clear control', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date | null) => {});
    renderWithTheme(
      <DatePicker defaultValue={MAY_2026} clearable onChange={onChange} />,
    );
    const clear = screen.getByRole('button', { name: 'Clear date' });
    // Real <button>: keyboard activation goes through native click semantics,
    // not a hand-rolled keydown handler.
    clear.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeNull();
    // And it must not open the popover.
    expect(screen.queryByRole('grid')).toBeNull();
  });
});
