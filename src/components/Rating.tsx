import { Star } from 'lucide-react';
import React, { useRef } from 'react';
import styled from 'styled-components';

export interface RatingProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'onChange'> {
  /** 0–5; fractions render as partially filled stars in display mode. */
  value: number;
  /** Review count, rendered as "(n)" after the stars. */
  count?: number;
  /** Presence (without readOnly) switches to interactive star-input mode. */
  onChange?: (value: number) => void;
  readOnly?: boolean;
  /** Star glyph size in px. */
  size?: number;
  /** Accessible label override for display mode. */
  label?: string;
}

const Wrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  font-family: ${(p) => p.theme.font.body};
`;

const StarCell = styled.span<{ $size: number }>`
  position: relative;
  display: inline-flex;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  color: ${(p) => p.theme.colors.warning};
`;

const StarFillClip = styled.span<{ $fraction: number }>`
  position: absolute;
  inset: 0;
  width: ${(p) => p.$fraction * 100}%;
  overflow: hidden;
  display: inline-flex;
`;

const StarButton = styled.button<{ $size: number }>`
  appearance: none;
  display: inline-flex;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${(p) => p.theme.colors.warning};
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
    border-radius: ${(p) => p.theme.radii.xs};
  }
`;

const Count = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSubtle};
`;

function DisplayStar({ fraction, size }: { fraction: number; size: number }) {
  return (
    <StarCell $size={size} aria-hidden="true">
      <Star size={size} strokeWidth={2.5} fill="none" />
      <StarFillClip $fraction={fraction}>
        <Star size={size} strokeWidth={2.5} fill="currentColor" />
      </StarFillClip>
    </StarCell>
  );
}

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Star rating. Display mode by default (role="img"); interactive radio-style
 * input when `onChange` is given and `readOnly` is not set.
 */
export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  onChange,
  readOnly,
  size = 18,
  label,
  ...rest
}) => {
  const interactive = onChange != null && readOnly !== true;

  // Roving-focus refs for interactive mode.
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!interactive) {
    return (
      <Wrap role="img" aria-label={label ?? `${value} out of 5 stars`} {...rest}>
        {STARS.map((i) => (
          <DisplayStar key={i} size={size} fraction={Math.max(0, Math.min(1, value - (i - 1)))} />
        ))}
        {count != null ? <Count>{`(${count})`}</Count> : null}
      </Wrap>
    );
  }

  // The "checked" star index (1–5). If value rounds to 0 or below, land on 1.
  const checkedStar = Math.max(1, Math.min(5, Math.round(value)));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, star: number) => {
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(5, star + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, star - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 5;
    else return;
    e.preventDefault();
    onChange(next);
    // next is 1–5, refs array is 0-indexed
    refs.current[next - 1]?.focus();
  };

  return (
    <Wrap role="radiogroup" aria-label={label ?? 'Rating'} {...rest}>
      {STARS.map((i) => {
        const checked = checkedStar === i;
        const starLabel = i === 1 ? '1 star' : `${i} stars`;
        return (
          <StarButton
            key={i}
            ref={(el) => {
              refs.current[i - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={starLabel}
            tabIndex={checked ? 0 : -1}
            $size={size}
            onClick={() => onChange(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            <Star
              size={size}
              strokeWidth={2.5}
              fill={i <= value ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </StarButton>
        );
      })}
      {count != null ? <Count>{`(${count})`}</Count> : null}
    </Wrap>
  );
};
