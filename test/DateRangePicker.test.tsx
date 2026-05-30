import { describe, it, expect, afterEach, mock } from 'bun:test';
import * as React from 'react';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import {
  DateRangePicker,
  type DateRange,
} from '../src/components/DateRangePicker';

afterEach(cleanup);

// Stable label used by MonthGrid day buttons (aria-label = toLocaleDateString()).
function dayLabel(d: Date): string {
  return d.toLocaleDateString();
}

// Pick a fixed month so the dual grid is deterministic: May 2026 (left) +
// June 2026 (right).
const MAY = new Date(2026, 4, 1);

// The trigger's accessible name is the formatted start date (locale-dependent),
// so match against the actual formatted string rather than the long month name.
const MAY_TRIGGER = new RegExp(
  dayLabel(MAY).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
);

describe('DateRangePicker', () => {
  it('renders the placeholder when no range is set', () => {
    renderWithTheme(<DateRangePicker placeholder="Pick a range" />);
    expect(screen.getByRole('button', { name: /Pick a range/ })).toBeTruthy();
  });

  it('is closed by default (no dialog)', () => {
    renderWithTheme(<DateRangePicker />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a popover with two month grids when the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DateRangePicker defaultValue={{ start: MAY, end: null }} />);
    await user.click(screen.getByRole('button', { name: MAY_TRIGGER }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    expect(screen.getAllByRole('grid')).toHaveLength(2);
  });

  it('builds a range across a first then a later second click and fires onChange', async () => {
    const user = userEvent.setup();
    const onChange = mock((_: DateRange) => {});
    renderWithTheme(
      <DateRangePicker defaultValue={{ start: null, end: null }} onChange={onChange} />,
    );
    // Anchor on today; instead drive deterministically by seeding nothing and
    // navigating is unnecessary — open and select within the visible month.
    await user.click(screen.getByRole('button', { name: /Select range/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    // Use two days in the same (left) visible month. The left grid shows the
    // current month; pick the 10th then the 20th of whatever month is shown.
    const grids = screen.getAllByRole('grid');
    const leftButtons = grids[0].querySelectorAll('button');
    // Find enabled day buttons by their text content "10" and "20".
    const findDay = (text: string) =>
      Array.from(leftButtons).find((b) => b.textContent === text) as HTMLButtonElement;
    const d10 = findDay('10');
    const d20 = findDay('20');
    expect(d10).toBeTruthy();
    expect(d20).toBeTruthy();

    await user.click(d10);
    // First click sets the start and fires onChange so a controlled parent can
    // advance (start only, end null); popover stays open.
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    const first = onChange.mock.calls[0][0];
    expect(first.start!.getDate()).toBe(10);
    expect(first.end).toBeNull();
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    await user.click(d20);
    // Second (later) click completes the range, fires onChange again, closes.
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    const arg = onChange.mock.calls[1][0];
    expect(arg.start).toBeTruthy();
    expect(arg.end).toBeTruthy();
    expect(arg.start!.getDate()).toBe(10);
    expect(arg.end!.getDate()).toBe(20);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('restarts the range when the second click is before the first', async () => {
    const user = userEvent.setup();
    const onChange = mock((_: DateRange) => {});
    renderWithTheme(
      <DateRangePicker defaultValue={{ start: null, end: null }} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: /Select range/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    const grids = screen.getAllByRole('grid');
    const leftButtons = Array.from(grids[0].querySelectorAll('button'));
    const findDay = (text: string) =>
      leftButtons.find((b) => b.textContent === text) as HTMLButtonElement;

    await user.click(findDay('20'));
    // First click sets start=20 (onChange #1: start only).
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0].start!.getDate()).toBe(20);
    expect(onChange.mock.calls[0][0].end).toBeNull();

    // Second click BEFORE the first restarts -> onChange #2 (new start=10, end
    // null), still open.
    await user.click(findDay('10'));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    expect(onChange.mock.calls[1][0].start!.getDate()).toBe(10);
    expect(onChange.mock.calls[1][0].end).toBeNull();
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    // A subsequent later click now completes the range from the restarted start (10).
    await user.click(findDay('15'));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(3));
    const arg = onChange.mock.calls[2][0];
    expect(arg.start!.getDate()).toBe(10);
    expect(arg.end!.getDate()).toBe(15);
  });

  it('applies the in-range predicate to days between start and end', async () => {
    const user = userEvent.setup();
    const start = new Date(2026, 4, 10);
    const end = new Date(2026, 4, 20);
    renderWithTheme(<DateRangePicker value={{ start, end }} />);
    await user.click(screen.getByRole('button', { name: /-/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    // Endpoints are aria-selected; an interior day (the 15th) is not selected
    // but is in-range. aria-selected lives on the gridcell wrapping each day
    // button, so read it from the button's parent cell.
    const cellOf = (label: string) =>
      screen.getByRole('button', { name: label }).closest('[role="gridcell"]') as HTMLElement;
    const may15 = cellOf(dayLabel(new Date(2026, 4, 15)));
    const may10 = cellOf(dayLabel(start));
    const may20 = cellOf(dayLabel(end));
    expect(may10.getAttribute('aria-selected')).toBe('true');
    expect(may20.getAttribute('aria-selected')).toBe('true');
    expect(may15.getAttribute('aria-selected')).toBe('false');
  });

  it('shifts both months when the prev/next chevrons are clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DateRangePicker value={{ start: MAY, end: null }} />);
    await user.click(screen.getByRole('button', { name: MAY_TRIGGER }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    // Left = May 2026, right = June 2026 initially.
    expect(screen.getByText('May 2026')).toBeTruthy();
    expect(screen.getByText('June 2026')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    // Both shift forward: left = June, right = July.
    await waitFor(() => expect(screen.getByText('June 2026')).toBeTruthy());
    expect(screen.getByText('July 2026')).toBeTruthy();
    expect(screen.queryByText('May 2026')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    // Two steps back from June -> left = April, right = May.
    await waitFor(() => expect(screen.getByText('April 2026')).toBeTruthy());
    expect(screen.getByText('May 2026')).toBeTruthy();
  });

  it('clears the range when the clear control is activated', async () => {
    const user = userEvent.setup();
    const onChange = mock((_: DateRange) => {});
    renderWithTheme(
      <DateRangePicker
        defaultValue={{ start: new Date(2026, 4, 10), end: new Date(2026, 4, 20) }}
        clearable
        onChange={onChange}
      />,
    );
    const clear = screen.getByRole('button', { name: 'Clear range' });
    await user.click(clear);
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0];
    expect(arg.start).toBeNull();
    expect(arg.end).toBeNull();
    // Trigger falls back to the placeholder once cleared.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Select range/ })).toBeTruthy(),
    );
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DateRangePicker defaultValue={{ start: MAY, end: null }} />);
    await user.click(screen.getByRole('button', { name: MAY_TRIGGER }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('does not open when disabled', async () => {
    renderWithTheme(<DateRangePicker disabled defaultValue={{ start: MAY, end: null }} />);
    const trigger = screen.getByRole('button', { name: MAY_TRIGGER });
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('supports controlled value without firing onChange on render', () => {
    const onChange = mock((_: DateRange) => {});
    const start = new Date(2026, 4, 10);
    const end = new Date(2026, 4, 20);
    renderWithTheme(<DateRangePicker value={{ start, end }} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledTimes(0);
    expect(
      screen.getByRole('button', {
        name: new RegExp(`${dayLabel(start)} - ${dayLabel(end)}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      }),
    ).toBeTruthy();
  });

  it('drives the full range flow in controlled mode via onChange', async () => {
    // A controlled parent that has no internal state: every onChange must carry
    // the advancing range, otherwise the range can never complete.
    const user = userEvent.setup();
    function Controlled() {
      const [range, setRange] = React.useState<DateRange>({ start: null, end: null });
      return <DateRangePicker value={range} onChange={setRange} />;
    }
    renderWithTheme(<Controlled />);
    await user.click(screen.getByRole('button', { name: /Select range/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    const grids = screen.getAllByRole('grid');
    const leftButtons = Array.from(grids[0].querySelectorAll('button'));
    const findDay = (text: string) =>
      leftButtons.find((b) => b.textContent === text) as HTMLButtonElement;

    // First click sets the start; the controlled value must now reflect it.
    await user.click(findDay('8'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    // Second (later) click completes the range and closes — only reachable if
    // the parent value actually gained a start from the first click.
    await user.click(findDay('18'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    // The trigger now shows a completed "start - end" range.
    expect(
      screen.getByRole('button', { name: /\d.*-.*\d/ }),
    ).toBeTruthy();
  });

  it('selects a range with the keyboard (roving focus + Enter)', async () => {
    // Empty controlled range driven by onChange so the keyboard flow exercises
    // both the start-setting and completion branches. Seeded on a fixed day
    // (May 10 2026) well inside the month so ArrowDown stays in the same month.
    const user = userEvent.setup();
    const SEED = new Date(2026, 4, 10);
    const SEED_TRIGGER = new RegExp(dayLabel(SEED).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    function Controlled() {
      const [range, setRange] = React.useState<DateRange>({ start: SEED, end: null });
      return <DateRangePicker value={range} onChange={setRange} />;
    }
    renderWithTheme(<Controlled />);
    await user.click(screen.getByRole('button', { name: SEED_TRIGGER }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    // Opening seeds roving focus on the start day (May 10). Because a start is
    // already set, pressing Enter on a strictly-later focused day completes the
    // range via the keyboard. Arrow right twice -> May 12, then Enter.
    await user.keyboard('{ArrowRight}{ArrowRight}{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    // The completed range is May 10 - May 12, proving keyboard nav moved the
    // focused cell and Enter acted on it (not a fixed cell).
    const expectedName = new RegExp(
      `${dayLabel(SEED)} - ${dayLabel(new Date(2026, 4, 12))}`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    );
    expect(screen.getByRole('button', { name: expectedName })).toBeTruthy();
  });

  it('renders the clear control as a sibling button, not nested in the trigger', () => {
    renderWithTheme(
      <DateRangePicker
        defaultValue={{ start: new Date(2026, 4, 10), end: new Date(2026, 4, 20) }}
        clearable
      />,
    );
    const clear = screen.getByRole('button', { name: 'Clear range' });
    expect(clear.tagName).toBe('BUTTON');
    // Must NOT be nested inside the trigger button (invalid interactive-in-button).
    expect(clear.closest('[aria-haspopup="dialog"]')).toBeNull();
  });

  it('gives the floating dialog an accessible name', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DateRangePicker defaultValue={{ start: MAY, end: null }} />);
    await user.click(screen.getByRole('button', { name: MAY_TRIGGER }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('aria-label') ?? dialog.getAttribute('aria-labelledby')).toBeTruthy();
    // The accessible name resolves to a non-empty string.
    expect(screen.getByRole('dialog', { name: /choose date range/i })).toBeTruthy();
  });
});
