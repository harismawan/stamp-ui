import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import styled from 'styled-components';
import {
  MonthGrid,
  addMonths,
  isSameDay,
  isWithin,
  monthLabel,
  startOfMonth,
} from './internal/calendar';

export interface CalendarProps {
  /** Controlled selection. Pass `null` for "nothing selected". */
  value?: Date | null;
  /** Initial selection when uncontrolled. */
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Month shown on first render. Defaults to the selection, else today. */
  defaultMonth?: Date;
  min?: Date | null;
  max?: Date | null;
  /** 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: 0 | 1;
  id?: string;
  className?: string;
}

const Root = styled.div`
  display: inline-block;
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  padding: ${(p) => p.theme.space[4]};
  font-family: ${(p) => p.theme.font.body};
  min-width: 280px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(p) => p.theme.space[3]};
`;

const MonthTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${(p) => p.theme.colors.text};
`;

const NavButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;
  transition:
    transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }
  &:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.none};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }
`;

/**
 * Always-visible month calendar — the grid `DatePicker` shows in its popover,
 * without the popover. For booking views, availability grids, and anywhere a
 * date is picked inline.
 */
export function Calendar(props: CalendarProps): React.ReactElement {
  const {
    value,
    defaultValue,
    onChange,
    defaultMonth,
    min,
    max,
    weekStartsOn = 0,
    id,
    className,
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
  const selected = isControlled ? (value ?? null) : internalValue;

  const [viewedMonth, setViewedMonth] = React.useState<Date>(() =>
    startOfMonth(defaultMonth ?? selected ?? new Date()),
  );
  const [focusedDay, setFocusedDay] = React.useState<Date | null>(null);

  const generatedId = React.useId();
  const labelId = `${id ?? generatedId}-label`;

  const handleSelect = (day: Date) => {
    if (!isControlled) setInternalValue(day);
    onChange?.(day);
  };

  const handleFocusDay = (day: Date) => {
    setFocusedDay(day);
    // Keep the focused cell mounted: if arrow keys walk off the viewed month,
    // follow them to that month.
    if (
      day.getMonth() !== viewedMonth.getMonth() ||
      day.getFullYear() !== viewedMonth.getFullYear()
    ) {
      setViewedMonth(startOfMonth(day));
    }
  };

  return (
    <Root className={className} id={id}>
      <Header>
        <NavButton
          type="button"
          aria-label="Previous month"
          onClick={() => setViewedMonth((m) => addMonths(m, -1))}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </NavButton>
        <MonthTitle id={labelId}>{monthLabel(viewedMonth)}</MonthTitle>
        <NavButton
          type="button"
          aria-label="Next month"
          onClick={() => setViewedMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </NavButton>
      </Header>
      <MonthGrid
        month={viewedMonth}
        weekStartsOn={weekStartsOn}
        isSelected={(day) => Boolean(selected) && isSameDay(day, selected as Date)}
        isDisabled={(day) => !isWithin(day, min, max)}
        onSelect={handleSelect}
        focusedDay={focusedDay}
        onFocusDay={handleFocusDay}
        labelId={labelId}
      />
    </Root>
  );
}
