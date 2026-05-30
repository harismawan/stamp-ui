import * as React from 'react';
import styled from 'styled-components';
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
  type Placement,
} from '@floating-ui/react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  startOfMonth,
  addMonths,
  isSameDay,
  isWithin,
  monthLabel,
  MonthGrid,
} from './internal/calendar';

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  format?: (date: Date) => string;
  weekStartsOn?: 0 | 1;
  id?: string;
}

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.body};
  font-weight: 800;
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  cursor: pointer;
  transition: transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }
  &:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: ${(p) => p.theme.shadow.none};
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const TriggerLabel = styled.span<{ $placeholder: boolean }>`
  color: ${(p) => (p.$placeholder ? p.theme.colors.textSubtle : p.theme.colors.text)};
`;

const TriggerWrap = styled.span`
  display: inline-flex;
  align-items: center;
`;

const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${(p) => p.theme.colors.textSubtle};
  cursor: pointer;
  padding: 0;
  margin-left: ${(p) => p.theme.space[1]};
  border-radius: ${(p) => p.theme.radii.xs};

  &:hover {
    color: ${(p) => p.theme.colors.text};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
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
  min-width: 280px;
  z-index: 1000;
  outline: none;
`;

const GridWrap = styled.div`
  display: contents;
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
  transition: transform 80ms ${(p) => p.theme.easing.out},
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
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export function DatePicker(props: DatePickerProps): React.ReactElement {
  const {
    value,
    defaultValue,
    onChange,
    min,
    max,
    placeholder = 'Select date',
    disabled = false,
    clearable = false,
    format,
    weekStartsOn = 0,
    id,
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date | null>(
    defaultValue ?? null,
  );
  const selected = isControlled ? (value ?? null) : internalValue;

  const [open, setOpen] = React.useState(false);
  const [viewedMonth, setViewedMonth] = React.useState<Date>(() =>
    startOfMonth(selected ?? new Date()),
  );
  const [focusedDay, setFocusedDay] = React.useState<Date | null>(null);

  // Resolves to the roving day cell (tabIndex 0) so focus lands on a day,
  // not the first nav button, when the popover opens.
  const initialFocusRef = React.useRef<HTMLElement | null>(null);

  const generatedId = React.useId();
  const baseId = id ?? generatedId;
  const labelId = `${baseId}-label`;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start' as Placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // When the popover opens, sync the viewed month to the current selection (or
  // today) and seed roving focus on that day so arrow keys work immediately.
  React.useEffect(() => {
    if (open) {
      const initial = selected ?? new Date();
      setViewedMonth(startOfMonth(initial));
      setFocusedDay(initial);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (date: Date | null) => {
    if (!isControlled) setInternalValue(date);
    onChange?.(date);
  };

  const handleSelect = (day: Date) => {
    commit(day);
    setOpen(false);
  };

  const handleFocusDay = (day: Date) => {
    setFocusedDay(day);
    // Keep the focused cell mounted: if it falls outside the viewed month,
    // scroll the calendar to that month.
    if (
      day.getMonth() !== viewedMonth.getMonth() ||
      day.getFullYear() !== viewedMonth.getFullYear()
    ) {
      setViewedMonth(startOfMonth(day));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected) commit(null);
  };

  const triggerText = selected
    ? format
      ? format(selected)
      : selected.toLocaleDateString()
    : placeholder;

  return (
    <>
      <TriggerWrap>
        <Trigger
          type="button"
          ref={refs.setReference}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={selected ? `Choose date, selected ${triggerText}` : 'Choose date'}
          {...getReferenceProps()}
        >
          <Calendar size={16} aria-hidden="true" />
          <TriggerLabel $placeholder={!selected}>{triggerText}</TriggerLabel>
        </Trigger>
        {clearable && selected && !disabled && (
          <ClearButton
            type="button"
            aria-label="Clear date"
            onClick={handleClear}
            onKeyDown={(e) => {
              // Keep Enter/Space from bubbling to the trigger and opening the
              // popover; the button's own activation still fires onClick.
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
              }
            }}
          >
            <X size={16} aria-hidden="true" />
          </ClearButton>
        )}
      </TriggerWrap>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={initialFocusRef}
          >
            <Panel
              ref={refs.setFloating}
              style={floatingStyles}
              aria-labelledby={labelId}
              {...getFloatingProps()}
            >
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
              <GridWrap
                ref={(el) => {
                  // Point FloatingFocusManager's initialFocus at the roving day
                  // cell (the only day button with tabIndex 0) so opening lands
                  // focus on a day, enabling arrow navigation immediately.
                  initialFocusRef.current =
                    el?.querySelector<HTMLButtonElement>('button[tabindex="0"]') ?? null;
                }}
              >
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
              </GridWrap>
            </Panel>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
