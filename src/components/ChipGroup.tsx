import React from 'react';
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
  const selectedSet = new Set(Array.isArray(value) ? value : value != null ? [value] : []);

  const handleClick = (v: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };

  return (
    <Wrap role={multiple ? 'group' : 'radiogroup'} {...rest}>
      {options.map(normalize).map((opt) => {
        const selected = selectedSet.has(opt.value);
        const a11y = multiple
          ? { 'aria-pressed': selected }
          : { role: 'radio' as const, 'aria-checked': selected };
        return (
          <Chip
            key={opt.value}
            type="button"
            $selected={selected}
            disabled={opt.disabled}
            onClick={() => handleClick(opt.value)}
            {...a11y}
          >
            {opt.label}
          </Chip>
        );
      })}
    </Wrap>
  );
};
