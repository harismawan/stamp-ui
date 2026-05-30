import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import { createElement } from 'react';
import {
  MonthGrid,
  addMonths,
  buildMonthMatrix,
  isAfter,
  isBefore,
  isSameDay,
  isWithin,
  monthLabel,
  startOfMonth,
  weekdayLabels,
} from '../src/components/internal/calendar';
import { renderWithTheme } from './util';

afterEach(cleanup);

describe('buildMonthMatrix', () => {
  it('returns exactly 6 rows of 7 days', () => {
    const matrix = buildMonthMatrix(new Date(2026, 4, 1), 0);
    expect(matrix.length).toBe(6);
    for (const week of matrix) {
      expect(week.length).toBe(7);
    }
  });

  it('first cell is correct for May 2026 with weekStartsOn=0 (Sunday)', () => {
    // May 1, 2026 is a Friday (getDay() === 5). With Sunday start, the grid
    // leads with 5 days from April, so the first cell is Sun Apr 26, 2026.
    const matrix = buildMonthMatrix(new Date(2026, 4, 1), 0);
    expect(isSameDay(matrix[0][0], new Date(2026, 3, 26))).toBe(true);
    expect(matrix[0][0].getDay()).toBe(0);
    // The 1st of the month lands in the first row at the Friday column.
    expect(isSameDay(matrix[0][5], new Date(2026, 4, 1))).toBe(true);
  });

  it('first cell is correct for May 2026 with weekStartsOn=1 (Monday)', () => {
    // With Monday start, lead = (5 - 1 + 7) % 7 = 4 days from April, so the
    // first cell is Mon Apr 27, 2026.
    const matrix = buildMonthMatrix(new Date(2026, 4, 1), 1);
    expect(isSameDay(matrix[0][0], new Date(2026, 3, 27))).toBe(true);
    expect(matrix[0][0].getDay()).toBe(1);
    expect(isSameDay(matrix[0][4], new Date(2026, 4, 1))).toBe(true);
  });

  it('includes leading and trailing days from adjacent months', () => {
    const matrix = buildMonthMatrix(new Date(2026, 4, 1), 0);
    const flat = matrix.flat();
    expect(flat.some((d) => d.getMonth() === 3)).toBe(true); // April leading
    expect(flat.some((d) => d.getMonth() === 5)).toBe(true); // June trailing
  });

  it('produces contiguous, ascending days across the grid', () => {
    const matrix = buildMonthMatrix(new Date(2026, 1, 1), 1); // Feb 2026
    const flat = matrix.flat();
    for (let i = 1; i < flat.length; i++) {
      const prev = flat[i - 1];
      const cur = flat[i];
      const expected = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
      expect(isSameDay(cur, expected)).toBe(true);
    }
  });
});

describe('weekdayLabels', () => {
  it('orders Sunday-first for weekStartsOn=0', () => {
    expect(weekdayLabels(0)).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  });

  it('orders Monday-first for weekStartsOn=1', () => {
    expect(weekdayLabels(1)).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
  });

  it('always returns 7 two-character labels', () => {
    for (const start of [0, 1] as const) {
      const labels = weekdayLabels(start);
      expect(labels.length).toBe(7);
      for (const l of labels) expect(l.length).toBe(2);
    }
  });
});

describe('startOfMonth / addMonths', () => {
  it('startOfMonth returns the first day at midnight', () => {
    const s = startOfMonth(new Date(2026, 4, 17, 13, 45, 30));
    expect(s.getDate()).toBe(1);
    expect(s.getMonth()).toBe(4);
    expect(s.getFullYear()).toBe(2026);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
  });

  it('addMonths shifts by whole months', () => {
    expect(isSameDay(addMonths(new Date(2026, 4, 10), 1), new Date(2026, 5, 10))).toBe(true);
    expect(isSameDay(addMonths(new Date(2026, 0, 15), -1), new Date(2025, 11, 15))).toBe(true);
  });

  it('addMonths clamps month-end days to the target month length', () => {
    // Jan 31 + 1 month must land on Feb 28 (2026 is not a leap year), NOT Mar 3.
    expect(isSameDay(addMonths(new Date(2026, 0, 31), 1), new Date(2026, 1, 28))).toBe(true);
    // Leap year: Jan 31 + 1 month -> Feb 29.
    expect(isSameDay(addMonths(new Date(2024, 0, 31), 1), new Date(2024, 1, 29))).toBe(true);
    // May 31 + 1 month -> Jun 30 (June has 30 days).
    expect(isSameDay(addMonths(new Date(2026, 4, 31), 1), new Date(2026, 5, 30))).toBe(true);
    // Going backward: Mar 31 - 1 month -> Feb 28.
    expect(isSameDay(addMonths(new Date(2026, 2, 31), -1), new Date(2026, 1, 28))).toBe(true);
    // Day-1 callers are unaffected (the common case for paging).
    expect(isSameDay(addMonths(new Date(2026, 0, 1), 1), new Date(2026, 1, 1))).toBe(true);
  });
});

describe('isSameDay / isBefore / isAfter', () => {
  it('isSameDay ignores time of day', () => {
    expect(isSameDay(new Date(2026, 4, 1, 0, 0), new Date(2026, 4, 1, 23, 59))).toBe(true);
    expect(isSameDay(new Date(2026, 4, 1), new Date(2026, 4, 2))).toBe(false);
  });

  it('isBefore / isAfter compare at day granularity', () => {
    const a = new Date(2026, 4, 1, 23, 0);
    const b = new Date(2026, 4, 2, 1, 0);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    // Same day, different times -> neither before nor after.
    expect(isBefore(new Date(2026, 4, 1, 1), new Date(2026, 4, 1, 22))).toBe(false);
    expect(isAfter(new Date(2026, 4, 1, 22), new Date(2026, 4, 1, 1))).toBe(false);
  });
});

describe('isWithin', () => {
  const day = new Date(2026, 4, 15);

  it('is inclusive of both bounds', () => {
    expect(isWithin(day, new Date(2026, 4, 15), new Date(2026, 4, 15))).toBe(true);
    expect(isWithin(day, new Date(2026, 4, 1), new Date(2026, 4, 31))).toBe(true);
  });

  it('rejects days outside the bounds', () => {
    expect(isWithin(day, new Date(2026, 4, 16), new Date(2026, 4, 31))).toBe(false);
    expect(isWithin(day, new Date(2026, 4, 1), new Date(2026, 4, 14))).toBe(false);
  });

  it('treats null/undefined bounds as open', () => {
    expect(isWithin(day, null, null)).toBe(true);
    expect(isWithin(day, undefined, undefined)).toBe(true);
    expect(isWithin(day, new Date(2026, 4, 20), null)).toBe(false); // below open-ended min
    expect(isWithin(day, null, new Date(2026, 4, 10))).toBe(false); // above open-ended max
    expect(isWithin(day, new Date(2026, 4, 1), null)).toBe(true);
    expect(isWithin(day, null, new Date(2026, 4, 31))).toBe(true);
  });
});

describe('monthLabel', () => {
  it('formats as "<long month name> <4-digit year>"', () => {
    const label = monthLabel(new Date(2026, 4, 1));
    expect(label).toMatch(/^\S.* 2026$/);
    expect(label.endsWith(' 2026')).toBe(true);
    // The month portion is the locale long-name; assert it matches the API
    // contract (toLocaleString long month + space + getFullYear).
    const expected = `${new Date(2026, 4, 1).toLocaleString(undefined, { month: 'long' })} 2026`;
    expect(label).toBe(expected);
  });
});

describe('MonthGrid', () => {
  it('renders a grid with weekday headers and day cells', () => {
    renderWithTheme(createElement(MonthGrid, { month: new Date(2026, 4, 1), onSelect: () => {} }));
    expect(screen.getByRole('grid')).toBeTruthy();
    expect(screen.getAllByRole('columnheader').length).toBe(7);
    expect(screen.getAllByRole('gridcell').length).toBe(42);
  });

  it('calls onSelect with the clicked day', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    const onSelect = mock((_: Date) => {});
    renderWithTheme(createElement(MonthGrid, { month: new Date(2026, 4, 1), onSelect }));
    // "15" appears once within May 2026 (no adjacent-month overlap on the 15th).
    await user.click(
      screen.getByRole('button', { name: new Date(2026, 4, 15).toLocaleDateString() }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(isSameDay(onSelect.mock.calls[0][0], new Date(2026, 4, 15))).toBe(true);
  });

  it('sets aria-selected on the gridcell wrapper only, never on the button', () => {
    renderWithTheme(
      createElement(MonthGrid, {
        month: new Date(2026, 4, 1),
        onSelect: () => {},
        isSelected: (d: Date) => isSameDay(d, new Date(2026, 4, 15)),
      }),
    );
    const button = screen.getByRole('button', {
      name: new Date(2026, 4, 15).toLocaleDateString(),
    });
    // aria-selected is invalid on role="button" and must be absent there.
    expect(button.getAttribute('aria-selected')).toBeNull();
    // The owning gridcell wrapper carries the selected state instead.
    const cell = button.closest('[role="gridcell"]');
    expect(cell).toBeTruthy();
    expect(cell?.getAttribute('aria-selected')).toBe('true');
  });

  it('keyboard navigation skips disabled days and keeps DOM focus on a focusable cell', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    // Disable every day on/before May 15, 2026. Focus starts on May 16.
    const min = new Date(2026, 4, 16);
    const onFocusDay = mock((_: Date) => {});
    renderWithTheme(
      createElement(MonthGrid, {
        month: new Date(2026, 4, 1),
        onSelect: () => {},
        focusedDay: new Date(2026, 4, 16),
        onFocusDay,
        isDisabled: (d: Date) => isBefore(d, min),
      }),
    );
    const start = screen.getByRole('button', {
      name: new Date(2026, 4, 16).toLocaleDateString(),
    });
    start.focus();
    expect(document.activeElement).toBe(start);

    // ArrowLeft from May 16 would land on disabled May 15. Navigation must NOT
    // move focus onto a disabled day, so onFocusDay is never called with one.
    await user.keyboard('{ArrowLeft}');
    for (const call of onFocusDay.mock.calls) {
      expect(isBefore(call[0], min)).toBe(false);
    }
    // Focus must never fall through to <body>.
    expect(document.activeElement).not.toBe(document.body);

    // ArrowRight from May 16 must still navigate to the enabled May 17.
    onFocusDay.mockClear();
    await user.keyboard('{ArrowRight}');
    expect(onFocusDay).toHaveBeenCalledTimes(1);
    expect(isSameDay(onFocusDay.mock.calls[0][0], new Date(2026, 4, 17))).toBe(true);
  });

  it('gives a focusable tab stop even when every displayed-month day is disabled', () => {
    // Disable all of May 2026; trailing June days remain enabled.
    renderWithTheme(
      createElement(MonthGrid, {
        month: new Date(2026, 4, 1),
        onSelect: () => {},
        isDisabled: (d: Date) => d.getMonth() === 4,
      }),
    );
    const buttons = screen.getAllByRole('button');
    const tabbable = buttons.filter((b) => b.getAttribute('tabindex') === '0');
    // Exactly one roving tab stop, and it must be an enabled (focusable) day.
    expect(tabbable.length).toBe(1);
    expect((tabbable[0] as HTMLButtonElement).disabled).toBe(false);
  });
});
