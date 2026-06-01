import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

export interface SegmentedOption {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Currently selected value. */
  value: string;
  onChange: (value: string) => void;
  /** Options as `{ value, label?, disabled? }` or bare strings (value === label). */
  options: Array<SegmentedOption | string>;
  $size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill the container, segments sharing the width equally. */
  $full?: boolean;
  /** Disable the whole control. */
  disabled?: boolean;
}

const segSize = {
  sm: css`
    padding: 4px 12px;
    font-size: 0.8rem;
  `,
  md: css`
    padding: 6px 16px;
    font-size: 0.875rem;
  `,
  lg: css`
    padding: 9px 20px;
    font-size: 1rem;
  `,
} as const;

const Group = styled.div<{ $full?: boolean }>`
  display: ${(p) => (p.$full ? 'flex' : 'inline-flex')};
  ${(p) => p.$full && 'width: 100%;'}
  gap: 4px;
  padding: 4px;
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
`;

const Segment = styled.button<{ $active: boolean; $size: 'sm' | 'md' | 'lg'; $full?: boolean }>`
  flex: ${(p) => (p.$full ? '1' : 'initial')};
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  white-space: nowrap;
  border-radius: ${(p) => p.theme.radii.pill};
  transition:
    background 80ms ${(p) => p.theme.easing.out},
    color 80ms ${(p) => p.theme.easing.out};
  ${(p) => segSize[p.$size]};
  background: ${(p) => (p.$active ? p.theme.colors.primary : 'transparent')};
  color: ${(p) => (p.$active ? p.theme.colors.primaryInk : p.theme.colors.textMuted)};

  &:hover:not(:disabled) {
    background: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.surface)};
    color: ${(p) => (p.$active ? p.theme.colors.primaryInk : p.theme.colors.text)};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const normalize = (o: SegmentedOption | string): SegmentedOption =>
  typeof o === 'string' ? { value: o } : o;

/**
 * Single-select segmented toggle: a row of pill buttons where exactly one is
 * active. Radiogroup semantics with roving focus + arrow/Home/End keys.
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  onChange,
  options,
  $size = 'md',
  $full,
  disabled,
  ...rest
}) => {
  const opts = options.map(normalize);
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
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = seek(idx, 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = seek(idx, -1);
    else if (e.key === 'Home') next = seek(-1, 1);
    else if (e.key === 'End') next = seek(0, -1);
    else return;
    e.preventDefault();
    const v = opts[next].value;
    onChange(v);
    refs.current[next]?.focus();
  };

  const activeIdx = opts.findIndex((o) => o.value === value);

  return (
    <Group role="radiogroup" aria-disabled={disabled || undefined} $full={$full} {...rest}>
      {opts.map((o, i) => {
        const active = o.value === value;
        return (
          <Segment
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            // Roving tabindex: only the active segment (or the first, if none
            // active) is in the tab order.
            tabIndex={active || (activeIdx === -1 && i === 0) ? 0 : -1}
            disabled={disabled || o.disabled}
            $active={active}
            $size={$size}
            $full={$full}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {o.label ?? o.value}
          </Segment>
        );
      })}
    </Group>
  );
};
