import * as React from 'react';
import styled from 'styled-components';
import { ChevronDown, Check, X } from 'lucide-react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useDismiss,
  useRole,
  useListNavigation,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { Tag } from './Tag';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxBaseProps {
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  /** Default: case-insensitive substring match on `label`. */
  filter?: (opt: ComboboxOption, query: string) => boolean;
  emptyText?: string;
  id?: string;
}

interface SingleComboboxProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}

interface MultiComboboxProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

export type ComboboxProps = SingleComboboxProps | MultiComboboxProps;

const defaultFilter = (opt: ComboboxOption, query: string): boolean =>
  opt.label.toLowerCase().includes(query.toLowerCase());

const Control = styled.div<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${(p) => p.theme.space[1]};
  width: 100%;
  min-width: 0;
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 7px 10px;
  font-family: ${(p) => p.theme.font.body};
  font-size: 1rem;
  cursor: text;
  transition: box-shadow 80ms ${(p) => p.theme.easing.out};

  ${(p) =>
    p.$disabled
      ? `opacity: 0.6; cursor: not-allowed;`
      : `&:focus-within { box-shadow: ${p.theme.shadow.stamp}; }`}
`;

const ControlInput = styled.input`
  flex: 1 1 60px;
  min-width: 60px;
  font-family: inherit;
  font-size: 1rem;
  color: ${(p) => p.theme.colors.text};
  background: transparent;
  border: none;
  padding: 4px 0;
  outline: none;

  &::placeholder {
    color: ${(p) => p.theme.colors.textSubtle};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  margin: 0;
  flex: none;
  color: ${(p) => p.theme.colors.textMuted};
  background: transparent;
  border: none;
  border-radius: ${(p) => p.theme.radii.xs};
  cursor: pointer;
  transition: color 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    color: ${(p) => p.theme.colors.text};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const Chevron = styled.span<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: ${(p) => p.theme.colors.textMuted};
  transition: transform 80ms ${(p) => p.theme.easing.out};
  transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')});
`;

const Listbox = styled.ul`
  list-style: none;
  margin: 0;
  padding: ${(p) => p.theme.space[1]};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  font-family: ${(p) => p.theme.font.body};
  overflow-y: auto;
  z-index: 1000;
  outline: none;
`;

const OptionRow = styled.li<{ $active: boolean; $selected: boolean; $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  font-size: 14px;
  font-weight: ${(p) => (p.$selected ? 800 : 600)};
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => (p.$active ? p.theme.colors.primarySoft : 'transparent')};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.5 : 1)};
  user-select: none;
`;

const OptionLabel = styled.span`
  flex: 1 1 auto;
  min-width: 0;
`;

const CheckIcon = styled.span`
  display: inline-flex;
  flex: none;
  color: ${(p) => p.theme.colors.text};
`;

const EmptyRow = styled.li`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSubtle};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  user-select: none;
`;

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder,
    disabled = false,
    clearable = false,
    filter = defaultFilter,
    emptyText = 'No results',
    id: idProp,
  } = props;

  const multiple = props.multiple === true;

  // ── Normalize selection to string[] internally ───────────────────────────
  const isControlled = props.value !== undefined;

  const toArray = (v: string | string[] | null | undefined): string[] => {
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
  };

  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() =>
    toArray(props.value !== undefined ? props.value : props.defaultValue),
  );

  const selected = isControlled ? toArray(props.value) : uncontrolled;

  const labelFor = React.useCallback(
    (value: string): string => options.find((o) => o.value === value)?.label ?? '',
    [options],
  );

  // ── Local UI state ────────────────────────────────────────────────────────
  const reactId = React.useId();
  const baseId = idProp ?? reactId;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);

  // Single-select: input mirrors the selected option's label when closed.
  const singleSelectedLabel = !multiple && selected.length > 0 ? labelFor(selected[0]) : '';

  const filtered = React.useMemo(
    () => options.filter((opt) => filter(opt, query)),
    [options, query, filter],
  );

  const commitSelection = (next: string[]) => {
    if (!isControlled) setUncontrolled(next);
    if (multiple) {
      (props as MultiComboboxProps).onChange?.(next);
    } else {
      (props as SingleComboboxProps).onChange?.(next.length > 0 ? next[0] : null);
    }
  };

  const openList = () => {
    if (disabled) return;
    setOpen(true);
  };

  const closeList = () => {
    setOpen(false);
    setActiveIndex(null);
    setQuery('');
  };

  // ── Floating setup (mirror Popover / DropdownMenu) ────────────────────────
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      if (next) openList();
      else closeList();
    },
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(260, availableHeight)}px`,
          });
        },
        padding: 8,
      }),
    ],
  });

  const disabledIndices = React.useMemo(() => {
    const indices: number[] = [];
    filtered.forEach((opt, i) => {
      if (opt.disabled) indices.push(i);
    });
    return indices;
  }, [filtered]);

  // Escape is handled in `handleKeyDown` to support the two-stage behavior
  // (first clears a non-empty query, second closes), so disable floating-ui's
  // own escape-key dismissal here.
  const dismiss = useDismiss(context, { escapeKey: false });
  const role = useRole(context, { role: 'listbox' });
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
    disabledIndices,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    dismiss,
    role,
    listNavigation,
  ]);

  const selectOption = (opt: ComboboxOption) => {
    if (opt.disabled) return;
    if (multiple) {
      const exists = selected.includes(opt.value);
      const next = exists
        ? selected.filter((v) => v !== opt.value)
        : [...selected, opt.value];
      commitSelection(next);
      // Stay open, clear query, keep focus in input.
      setQuery('');
      inputRef.current?.focus();
    } else {
      commitSelection([opt.value]);
      setOpen(false);
      setActiveIndex(null);
      setQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    commitSelection([]);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (!open) openList();
    // Derive the next list directly from the new value to avoid the stale
    // `filtered` memo (computed from the previous query). Highlight the first
    // ENABLED option of the next list, or null if the query is empty / no match.
    if (value.length === 0) {
      setActiveIndex(null);
      return;
    }
    const nextFiltered = options.filter((o) => filter(o, value));
    const firstEnabled = nextFiltered.findIndex((o) => !o.disabled);
    setActiveIndex(firstEnabled === -1 ? null : firstEnabled);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Two-stage Escape: the first Escape clears a non-empty query but keeps the
    // list open; a second Escape (empty query) closes the list.
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      if (query !== '') {
        setQuery('');
        setActiveIndex(null);
      } else {
        closeList();
      }
      return;
    }

    if (e.key === 'Backspace' && query === '' && multiple && selected.length > 0) {
      e.preventDefault();
      commitSelection(selected.slice(0, -1));
      return;
    }

    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      openList();
      return;
    }

    if (e.key === 'Enter') {
      if (open && activeIndex != null && filtered[activeIndex]) {
        e.preventDefault();
        selectOption(filtered[activeIndex]);
      }
      return;
    }
  };

  // The text shown in the input. While open we show the live query; when closed
  // (single) we strictly revert to the selected option's label.
  const inputValue = multiple ? query : open ? query : singleSelectedLabel;

  const hasValue = selected.length > 0;
  const showClear = clearable && hasValue && !disabled;
  const activeId = activeIndex != null && filtered[activeIndex] ? optionId(activeIndex) : undefined;

  const referenceProps = getReferenceProps({
    role: 'combobox',
    'aria-expanded': open,
    'aria-controls': listboxId,
    'aria-autocomplete': 'list',
    'aria-activedescendant': open ? activeId : undefined,
    onChange: handleInputChange as React.ChangeEventHandler<HTMLInputElement>,
    onKeyDown: handleKeyDown as React.KeyboardEventHandler<HTMLInputElement>,
    onFocus: openList,
  });

  return (
    <>
      <Control
        ref={refs.setReference}
        $disabled={disabled}
        onMouseDown={(e) => {
          // Clicking the wrapper focuses the input and opens (ignore the inner
          // buttons / the input itself, which manage their own behavior).
          if (e.target === e.currentTarget && !disabled) {
            e.preventDefault();
            inputRef.current?.focus();
            openList();
          }
        }}
      >
        {multiple &&
          selected.map((value) => (
            <Tag
              key={value}
              onRemove={
                disabled
                  ? undefined
                  : () => commitSelection(selected.filter((v) => v !== value))
              }
            >
              {labelFor(value) || value}
            </Tag>
          ))}

        <ControlInput
          ref={inputRef}
          id={baseId}
          value={inputValue}
          placeholder={!multiple && hasValue ? undefined : placeholder}
          disabled={disabled}
          {...referenceProps}
        />

        {showClear && (
          <IconButton type="button" aria-label="Clear selection" onClick={handleClear}>
            <X size={16} strokeWidth={3} aria-hidden="true" />
          </IconButton>
        )}

        <Chevron
          $open={open}
          aria-hidden="true"
          onMouseDown={(e) => {
            e.preventDefault();
            if (disabled) return;
            if (open) closeList();
            else {
              openList();
              inputRef.current?.focus();
            }
          }}
        >
          <ChevronDown size={18} strokeWidth={3} />
        </Chevron>
      </Control>

      {open && (
        <FloatingPortal>
          <Listbox
            ref={refs.setFloating}
            id={listboxId}
            style={floatingStyles}
            aria-multiselectable={multiple ? true : undefined}
            {...getFloatingProps()}
          >
            {filtered.length === 0 ? (
              <EmptyRow>{emptyText}</EmptyRow>
            ) : (
              filtered.map((opt, index) => {
                const isSelected = selected.includes(opt.value);
                const isActive = activeIndex === index;
                return (
                  <OptionRow
                    key={opt.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    $active={isActive}
                    $selected={isSelected}
                    $disabled={opt.disabled === true}
                    ref={(node) => {
                      listRef.current[index] = node;
                    }}
                    {...getItemProps({
                      onClick(e: React.MouseEvent) {
                        e.preventDefault();
                        selectOption(opt);
                      },
                    })}
                  >
                    <OptionLabel>{opt.label}</OptionLabel>
                    {isSelected && (
                      <CheckIcon>
                        <Check size={16} strokeWidth={3} aria-hidden="true" />
                      </CheckIcon>
                    )}
                  </OptionRow>
                );
              })
            )}
          </Listbox>
        </FloatingPortal>
      )}
    </>
  );
}
