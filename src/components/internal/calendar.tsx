/**
 * Shared internal calendar module — month math + grid rendering used by
 * DatePicker and DateRangePicker. No date library; all helpers operate at DAY
 * granularity (time zeroed) and build dates with `new Date(year, month, day)`
 * in local time. Not exported from `index.ts`.
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

// --- Pure helpers ----------------------------------------------------------

/** Local-midnight Date for the same calendar day (time zeroed). */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** First day of `d`'s month at local midnight. */
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * `d` shifted by `n` whole months. The day-of-month is clamped to the target
 * month's length so month-end days don't overflow into the following month
 * (e.g. Jan 31 + 1 month -> Feb 28/29, not Mar 3).
 */
export function addMonths(d: Date, n: number): Date {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const daysInMonth = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), daysInMonth));
}

/** True when `a` and `b` fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** True when `a`'s day is strictly before `b`'s day (time ignored). */
export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

/** True when `a`'s day is strictly after `b`'s day (time ignored). */
export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/**
 * Inclusive day-granularity bounds check. A `null`/`undefined` bound is open
 * (no constraint on that side).
 */
export function isWithin(d: Date, min?: Date | null, max?: Date | null): boolean {
  if (min != null && isBefore(d, min)) return false;
  if (max != null && isAfter(d, max)) return false;
  return true;
}

/**
 * Build a 6-row x 7-column matrix of Date objects for `month`, including
 * leading days from the previous month and trailing days from the next month
 * so the grid is always full and aligned to `weekStartsOn` (0=Sunday,
 * 1=Monday). All cells are local-midnight Dates.
 */
export function buildMonthMatrix(month: Date, weekStartsOn: 0 | 1): Date[][] {
  const first = startOfMonth(month);
  // How many leading days from the previous month precede the 1st.
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - lead);

  const matrix: Date[][] = [];
  for (let row = 0; row < 6; row++) {
    const week: Date[] = [];
    for (let col = 0; col < 7; col++) {
      const offset = row * 7 + col;
      week.push(
        new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + offset),
      );
    }
    matrix.push(week);
  }
  return matrix;
}

const FULL_WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

/** 2-char weekday labels rotated so index 0 is `weekStartsOn`. */
export function weekdayLabels(weekStartsOn: 0 | 1): string[] {
  return FULL_WEEKDAY_LABELS.map((_, i) => FULL_WEEKDAY_LABELS[(i + weekStartsOn) % 7]);
}

/** Long month name + space + 4-digit year, e.g. "May 2026". */
export function monthLabel(month: Date): string {
  return `${month.toLocaleString(undefined, { month: 'long' })} ${month.getFullYear()}`;
}

/** Stable ISO-ish key (YYYY-MM-DD) for a local calendar day. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// --- MonthGrid component ----------------------------------------------------

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
  font-family: ${(p) => p.theme.font.body};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${(p) => p.theme.space[1]};
`;

const WeekdayCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 12px;
  font-weight: 800;
  color: ${(p) => p.theme.colors.textSubtle};
  text-transform: uppercase;
`;

interface DayButtonProps {
  $outside: boolean;
  $selected: boolean;
  $inRange: boolean;
  $today: boolean;
}

const DayButton = styled.button<DayButtonProps>`
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 36px;
  font-family: inherit;
  font-size: 14px;
  font-weight: ${(p) => (p.$today ? 800 : 700)};
  border: 2px solid transparent;
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;
  transition: background 80ms ${(p) => p.theme.easing.out};

  color: ${(p) =>
    p.$selected
      ? p.theme.colors.primaryInk
      : p.$outside
        ? p.theme.colors.textSubtle
        : p.theme.colors.text};

  background: ${(p) =>
    p.$selected ? p.theme.colors.primary : p.$inRange ? p.theme.colors.primarySoft : 'transparent'};

  outline: ${(p) => (p.$today ? `2px solid ${p.theme.colors.accent}` : 'none')};
  outline-offset: ${(p) => (p.$today ? '-2px' : '0')};

  &:hover:not(:disabled) {
    background: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.surfaceSunken)};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export interface MonthGridProps {
  month: Date;
  weekStartsOn?: 0 | 1;
  isSelected?: (day: Date) => boolean;
  isInRange?: (day: Date) => boolean;
  isRangeStart?: (day: Date) => boolean;
  isRangeEnd?: (day: Date) => boolean;
  isDisabled?: (day: Date) => boolean;
  isToday?: (day: Date) => boolean;
  onSelect: (day: Date) => void;
  focusedDay?: Date | null;
  onFocusDay?: (day: Date) => void;
  labelId?: string;
}

const NAV_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'Enter',
  ' ',
]);

export function MonthGrid(props: MonthGridProps): React.ReactElement {
  const {
    month,
    weekStartsOn = 0,
    isSelected,
    isInRange,
    isRangeStart,
    isRangeEnd,
    isDisabled,
    isToday,
    onSelect,
    focusedDay,
    onFocusDay,
    labelId,
  } = props;

  const matrix = useMemo(() => buildMonthMatrix(month, weekStartsOn), [month, weekStartsOn]);
  const labels = useMemo(() => weekdayLabels(weekStartsOn), [weekStartsOn]);

  const dayIsSelected = useCallback(
    (day: Date) =>
      Boolean(isSelected?.(day)) || Boolean(isRangeStart?.(day)) || Boolean(isRangeEnd?.(day)),
    [isSelected, isRangeStart, isRangeEnd],
  );
  const dayIsToday = useCallback(
    (day: Date) => (isToday ? isToday(day) : isSameDay(day, new Date())),
    [isToday],
  );
  const dayIsDisabled = useCallback((day: Date) => Boolean(isDisabled?.(day)), [isDisabled]);

  // Determine which cell owns tabIndex 0 (roving tabindex): focusedDay, else
  // the first selected day, else the first enabled day of the displayed month.
  const rovingDay = useMemo(() => {
    if (focusedDay) return focusedDay;
    const flat = matrix.flat();
    const selected = flat.find(
      (d) => d.getMonth() === month.getMonth() && dayIsSelected(d) && !dayIsDisabled(d),
    );
    if (selected) return selected;
    const firstEnabled = flat.find((d) => d.getMonth() === month.getMonth() && !dayIsDisabled(d));
    if (firstEnabled) return firstEnabled;
    // No enabled day in the displayed month: fall back to the first enabled day
    // anywhere in the matrix so the grid still has a focusable tab stop. Only if
    // every cell is disabled do we fall back to flat[0].
    const anyEnabled = flat.find((d) => !dayIsDisabled(d));
    return anyEnabled ?? flat[0];
  }, [focusedDay, matrix, month, dayIsSelected, dayIsDisabled]);

  // Ref map: ISO day-string -> button element, used to move DOM focus.
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!focusedDay) return;
    const el = cellRefs.current.get(dayKey(focusedDay));
    if (el) el.focus();
  }, [focusedDay]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!NAV_KEYS.has(e.key)) return;
    const current = rovingDay;
    if (!current) return;

    let next: Date | null = null;
    // Per-day step direction used to search outward for the nearest enabled
    // day when the computed target lands on a disabled (out-of-range) day.
    let step = 0;
    switch (e.key) {
      case 'ArrowLeft':
        next = addDays(current, -1);
        step = -1;
        break;
      case 'ArrowRight':
        next = addDays(current, 1);
        step = 1;
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        step = -1;
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        step = 1;
        break;
      case 'PageUp':
        next = addMonths(current, -1);
        step = -1;
        break;
      case 'PageDown':
        next = addMonths(current, 1);
        step = 1;
        break;
      case 'Home': {
        const offset = (current.getDay() - weekStartsOn + 7) % 7;
        next = addDays(current, -offset);
        step = 1; // search forward from week start toward an enabled day
        break;
      }
      case 'End': {
        const offset = (current.getDay() - weekStartsOn + 7) % 7;
        next = addDays(current, 6 - offset);
        step = -1; // search backward from week end toward an enabled day
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!dayIsDisabled(current)) onSelect(current);
        return;
    }

    if (!next) return;

    // If the target is disabled, search outward in the travel direction for the
    // nearest enabled day, bounded by the grid extent. Never focus a disabled
    // (non-focusable) day, which would drop DOM focus to <body>.
    if (dayIsDisabled(next) && step !== 0) {
      const gridStart = matrix[0][0];
      const gridEnd = matrix[matrix.length - 1][6];
      let candidate: Date | null = addDays(next, step);
      next = null;
      while (candidate && !isBefore(candidate, gridStart) && !isAfter(candidate, gridEnd)) {
        if (!dayIsDisabled(candidate)) {
          next = candidate;
          break;
        }
        candidate = addDays(candidate, step);
      }
    }

    if (next && !dayIsDisabled(next)) {
      e.preventDefault();
      onFocusDay?.(next);
    }
  };

  return (
    <Grid role="grid" aria-labelledby={labelId} onKeyDown={handleKeyDown}>
      <Row role="row">
        {labels.map((label, i) => (
          <WeekdayCell key={i} role="columnheader" aria-label={label}>
            {label}
          </WeekdayCell>
        ))}
      </Row>
      {matrix.map((week, rowIndex) => (
        <Row key={rowIndex} role="row">
          {week.map((day) => {
            const outside = day.getMonth() !== month.getMonth();
            const selected = dayIsSelected(day);
            const inRange = Boolean(isInRange?.(day)) && !selected;
            const today = dayIsToday(day);
            const disabled = dayIsDisabled(day);
            const isRoving = Boolean(rovingDay && isSameDay(day, rovingDay));
            const key = dayKey(day);
            return (
              <div key={key} role="gridcell" aria-selected={selected} tabIndex={-1}>
                <DayButton
                  type="button"
                  ref={(el) => {
                    if (el) cellRefs.current.set(key, el);
                    else cellRefs.current.delete(key);
                  }}
                  $outside={outside}
                  $selected={selected}
                  $inRange={inRange}
                  $today={today}
                  tabIndex={isRoving ? 0 : -1}
                  disabled={disabled}
                  aria-label={day.toLocaleDateString()}
                  onClick={() => {
                    if (disabled) return;
                    onFocusDay?.(day);
                    onSelect(day);
                  }}
                >
                  {day.getDate()}
                </DayButton>
              </div>
            );
          })}
        </Row>
      ))}
    </Grid>
  );
}

/** `d` shifted by `n` whole days at local midnight. */
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
