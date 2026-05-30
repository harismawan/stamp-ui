import * as React from 'react';
import styled from 'styled-components';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from '@floating-ui/react';
import {
  MonthGrid,
  addMonths,
  isAfter,
  isBefore,
  isSameDay,
  isWithin,
  monthLabel,
  startOfMonth,
} from './internal/calendar';

const TriggerWrap = styled.span`
  display: inline-flex;
  align-items: center;
`;

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  min?: Date;
  max?: Date;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  weekStartsOn?: 0 | 1;
  format?: (date: Date) => string;
  id?: string;
}

const EMPTY_RANGE: DateRange = { start: null, end: null };

/** Local-midnight Date for the last calendar day of `d`'s month. */
function lastDayOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

const Trigger = styled.button<{ $placeholder: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.body};
  font-weight: 800;
  font-size: 14px;
  color: ${(p) => (p.$placeholder ? p.theme.colors.textSubtle : p.theme.colors.text)};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  cursor: pointer;
  transition:
    transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }
  &:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: ${(p) => p.theme.shadow.none};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const TriggerLabel = styled.span`
  flex: 1;
  text-align: left;
  white-space: nowrap;
`;

const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0;
  flex: none;
  color: ${(p) => p.theme.colors.textMuted};
  background: transparent;
  border: none;
  border-radius: ${(p) => p.theme.radii.xs};
  cursor: pointer;
  transition: color 80ms ${(p) => p.theme.easing.out};

  &:hover {
    color: ${(p) => p.theme.colors.text};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
`;

const Panel = styled.div`
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  padding: ${(p) => p.theme.space[4]};
  font-family: ${(p) => p.theme.font.body};
  z-index: 1000;
  outline: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(p) => p.theme.space[3]};
`;

const MonthsRow = styled.div`
  display: flex;
  gap: ${(p) => p.theme.space[5]};
`;

const MonthColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};
`;

const MonthTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  color: ${(p) => p.theme.colors.text};
`;

const NavButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  flex: none;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;
  transition:
    transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    transform: translate(1px, 1px);
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }
`;

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  min,
  max,
  placeholder = 'Select range',
  disabled = false,
  clearable = false,
  weekStartsOn = 0,
  format,
  id,
}: DateRangePickerProps): React.ReactElement {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<DateRange>(
    () => defaultValue ?? EMPTY_RANGE,
  );
  const range = isControlled ? (value as DateRange) : internal;

  const [open, setOpen] = React.useState(false);

  // The left month shown in the popover; the right month is +1.
  const [viewedMonth, setViewedMonth] = React.useState<Date>(() =>
    startOfMonth(range.start ?? new Date()),
  );
  // The day that owns roving focus across both grids.
  const [focusedDay, setFocusedDay] = React.useState<Date | null>(null);

  // Resolves to the roving day cell (tabIndex 0) so focus lands on a day,
  // not the first nav button, when the popover opens.
  const initialFocusRef = React.useRef<HTMLElement | null>(null);

  const generatedId = React.useId();
  const baseId = id ?? generatedId;
  const leftLabelId = `${baseId}-left`;
  const rightLabelId = `${baseId}-right`;
  const dialogLabelId = `${baseId}-dialog`;

  // When opening, re-anchor the view on the current start (or today) and seed
  // roving focus on that day so arrow keys work immediately.
  const rangeStart = range.start;
  React.useEffect(() => {
    if (open) {
      const initial = rangeStart ?? new Date();
      setViewedMonth(startOfMonth(initial));
      setFocusedDay(initial);
    }
    // Re-anchor on the open transition; rangeStart is included so reopening
    // anchors to the current start rather than a stale value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rangeStart]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      if (disabled) return;
      setOpen(next);
    },
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const commit = (next: DateRange) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const fmt = format ?? ((d: Date) => d.toLocaleDateString());

  const triggerText = React.useMemo(() => {
    if (range.start && range.end) return `${fmt(range.start)} - ${fmt(range.end)}`;
    if (range.start) return fmt(range.start);
    return placeholder;
  }, [range.start, range.end, fmt, placeholder]);

  const hasValue = range.start != null || range.end != null;

  const handleSelect = (day: Date) => {
    const { start, end } = range;
    // No start, or a complete range already exists -> begin a new range.
    // Fire onChange so a controlled parent gains the start and can drive the
    // rest of the flow; without this the controlled value never advances.
    if (!start || (start && end)) {
      commit({ start: day, end: null });
      return;
    }
    // start set, end unset. A click before the start restarts the range.
    if (isBefore(day, start)) {
      commit({ start: day, end: null });
      return;
    }
    // day on/after start completes the range, fires onChange, and closes.
    commit({ start, end: day });
    setOpen(false);
  };

  const handleFocusDay = (day: Date) => {
    setFocusedDay(day);
    // Keep the focused cell mounted within the visible two-month window. If it
    // falls before the left month, shift the view left to anchor on it; if it
    // falls after the right month, shift right so the day stays in view.
    const left = viewedMonth;
    const right = addMonths(viewedMonth, 1);
    if (isBefore(day, startOfMonth(left))) {
      setViewedMonth(startOfMonth(day));
    } else if (isAfter(day, lastDayOfMonth(right))) {
      // Anchor so the focused day's month becomes the right pane.
      setViewedMonth(startOfMonth(addMonths(day, -1)));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    commit(EMPTY_RANGE);
  };

  const shiftMonths = (delta: number) => {
    setViewedMonth((m) => startOfMonth(addMonths(m, delta)));
  };

  const isRangeStart = (day: Date) => Boolean(range.start && isSameDay(day, range.start));
  const isRangeEnd = (day: Date) => Boolean(range.end && isSameDay(day, range.end));
  const isInRange = (day: Date) =>
    Boolean(range.start && range.end && isAfter(day, range.start) && isBefore(day, range.end));
  const isDisabled = (day: Date) => !isWithin(day, min, max);

  const rightMonth = addMonths(viewedMonth, 1);

  return (
    <>
      <TriggerWrap>
        <Trigger
          type="button"
          id={baseId}
          ref={refs.setReference}
          disabled={disabled}
          $placeholder={!range.start}
          aria-haspopup="dialog"
          aria-expanded={open}
          {...getReferenceProps()}
        >
          <Calendar size={16} strokeWidth={2.5} aria-hidden="true" />
          <TriggerLabel>{triggerText}</TriggerLabel>
        </Trigger>
        {clearable && hasValue && !disabled && (
          <ClearButton
            type="button"
            aria-label="Clear range"
            onClick={handleClear}
            onKeyDown={(e) => {
              // Keep Enter/Space from bubbling to the trigger and reopening the
              // popover; the button's own activation still fires onClick.
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
              }
            }}
          >
            <X size={14} strokeWidth={2.5} aria-hidden="true" />
          </ClearButton>
        )}
      </TriggerWrap>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={initialFocusRef}>
            <Panel
              ref={refs.setFloating}
              style={floatingStyles}
              aria-labelledby={dialogLabelId}
              {...getFloatingProps()}
            >
              <span id={dialogLabelId} hidden>
                Choose date range
              </span>
              <Header>
                <NavButton
                  type="button"
                  aria-label="Previous month"
                  onClick={() => shiftMonths(-1)}
                >
                  <ChevronLeft size={18} strokeWidth={2.5} aria-hidden="true" />
                </NavButton>
                <NavButton
                  type="button"
                  aria-label="Next month"
                  onClick={() => shiftMonths(1)}
                >
                  <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
                </NavButton>
              </Header>
              <MonthsRow
                ref={(el) => {
                  // Point FloatingFocusManager's initialFocus at the roving day
                  // cell (the first day button with tabIndex 0) so opening lands
                  // focus on a day, enabling arrow navigation immediately.
                  initialFocusRef.current =
                    el?.querySelector<HTMLButtonElement>('button[tabindex="0"]') ?? null;
                }}
              >
                <MonthColumn>
                  <MonthTitle id={leftLabelId}>{monthLabel(viewedMonth)}</MonthTitle>
                  <MonthGrid
                    month={viewedMonth}
                    weekStartsOn={weekStartsOn}
                    labelId={leftLabelId}
                    isRangeStart={isRangeStart}
                    isRangeEnd={isRangeEnd}
                    isInRange={isInRange}
                    isDisabled={isDisabled}
                    onSelect={handleSelect}
                    focusedDay={focusedDay}
                    onFocusDay={handleFocusDay}
                  />
                </MonthColumn>
                <MonthColumn>
                  <MonthTitle id={rightLabelId}>{monthLabel(rightMonth)}</MonthTitle>
                  <MonthGrid
                    month={rightMonth}
                    weekStartsOn={weekStartsOn}
                    labelId={rightLabelId}
                    isRangeStart={isRangeStart}
                    isRangeEnd={isRangeEnd}
                    isInRange={isInRange}
                    isDisabled={isDisabled}
                    onSelect={handleSelect}
                    focusedDay={focusedDay}
                    onFocusDay={handleFocusDay}
                  />
                </MonthColumn>
              </MonthsRow>
            </Panel>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
