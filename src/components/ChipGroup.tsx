import React, { useRef } from 'react';
import styled from 'styled-components';

export type ChipGroupOption = string | { value: string; label?: string; disabled?: boolean };

export interface ChipGroupProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  options: ChipGroupOption[];
  /** Selected value (single) or values (multiple). */
  value: string | string[] | null;
  /** Receives the next value (single) or next array (multiple). */
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
}

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(p) => p.theme.space[2]};
`;

const Chip = styled.button<{ $selected: boolean }>`
  appearance: none;
  cursor: pointer;
  font-family: ${(p) => p.theme.font.body};
  font-size: 13px;
  font-weight: 700;
  padding: 6px 14px;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  background: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.surface)};
  color: ${(p) => (p.$selected ? p.theme.colors.primaryInk : p.theme.colors.text)};
  box-shadow: ${(p) => (p.$selected ? p.theme.shadow.stampSm : p.theme.shadow.none)};
  transition:
    background 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    background: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.surfaceMuted)};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

function normalize(opt: ChipGroupOption): { value: string; label: string; disabled: boolean } {
  if (typeof opt === 'string') return { value: opt, label: opt, disabled: false };
  return { value: opt.value, label: opt.label ?? opt.value, disabled: opt.disabled === true };
}

/**
 * Toggleable selection chips. Single mode is a radiogroup (one value);
 * multiple mode is a group of toggle buttons (string array value).
 * Distinct from `Tag`, which is a removable label.
 */
export const ChipGroup: React.FC<ChipGroupProps> = ({
  options,
  value,
  onChange,
  multiple,
  ...rest
}) => {
  const opts = options.map(normalize);
  const selectedSet = new Set(Array.isArray(value) ? value : value != null ? [value] : []);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Next enabled index walking `step` from `from` (wraps). Returns `from` if all
  // others are disabled.
  const seek = (from: number, step: number): number => {
    const n = opts.length;
    for (let i = 1; i <= n; i += 1) {
      const j = (((from + step * i) % n) + n) % n;
      if (!opts[j].disabled) return j;
    }
    return from;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (multiple) return;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = seek(idx, 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = seek(idx, -1);
    else if (e.key === 'Home') next = seek(-1, 1);
    else if (e.key === 'End') next = seek(0, -1);
    else return;
    e.preventDefault();
    onChange(opts[next].value);
    refs.current[next]?.focus();
  };

  const handleClick = (v: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };

  // In single mode, only the selected chip (or first enabled when value is null)
  // is in the tab order — roving tabIndex matches SegmentedControl idiom.
  const activeIdx = multiple ? -1 : opts.findIndex((o) => o.value === value);

  return (
    <Wrap role={multiple ? 'group' : 'radiogroup'} {...rest}>
      {opts.map((opt, i) => {
        const selected = selectedSet.has(opt.value);
        const a11y = multiple
          ? { 'aria-pressed': selected }
          : { role: 'radio' as const, 'aria-checked': selected };
        const tabIndex = multiple ? undefined : selected || (activeIdx === -1 && i === 0) ? 0 : -1;
        return (
          <Chip
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            $selected={selected}
            disabled={opt.disabled}
            tabIndex={tabIndex}
            onClick={() => handleClick(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            {...a11y}
          >
            {opt.label}
          </Chip>
        );
      })}
    </Wrap>
  );
};
