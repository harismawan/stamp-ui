import { X } from 'lucide-react';
import React from 'react';
import styled, { css } from 'styled-components';

export const FieldWrap = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};
`;

export const FieldLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
`;

const baseInput = css`
  font-family: inherit;
  font-size: 1rem;
  width: 100%;
  min-width: 0;
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 11px 14px;
  transition: box-shadow 80ms ${(p) => p.theme.easing.out};

  &::placeholder {
    color: ${(p) => p.theme.colors.textSubtle};
  }

  &:focus {
    outline: none;
    box-shadow: ${(p) => p.theme.shadow.stamp};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const StyledInput = styled.input<{ $hasClear?: boolean }>`
  ${baseInput};
  ${(p) => p.$hasClear && 'padding-right: 38px;'}
`;

const ClearWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  color: ${(p) => p.theme.colors.textMuted};
  background: transparent;
  border: none;
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;
  transition:
    color 80ms ${(p) => p.theme.easing.out},
    background 80ms ${(p) => p.theme.easing.out};

  &:hover {
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => p.theme.colors.surfaceMuted};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
`;

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  /** Show a trailing clear (✕) button when the (controlled) value is non-empty. */
  clearable?: boolean;
  /** Called when the clear button is pressed. Update your value to '' here. */
  onClear?: () => void;
}

/**
 * Styled text input. With `clearable`, renders a trailing ✕ that fires `onClear`
 * while the controlled `value` is non-empty. Without it, behaves as (and forwards
 * everything to) a plain styled `<input>`, so existing usages are unaffected.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { clearable, onClear, className, style, value, ...rest },
  ref,
) {
  if (!clearable) {
    return <StyledInput ref={ref} className={className} style={style} value={value} {...rest} />;
  }
  const showClear = value != null && String(value).length > 0;
  return (
    <ClearWrap className={className} style={style}>
      <StyledInput ref={ref} value={value} $hasClear {...rest} />
      {showClear && (
        <ClearButton type="button" aria-label="Clear" tabIndex={-1} onClick={onClear}>
          <X size={16} strokeWidth={2.5} aria-hidden="true" />
        </ClearButton>
      )}
    </ClearWrap>
  );
});

export const Select = styled.select`
  ${baseInput};
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 18px) 50%,
    calc(100% - 13px) 50%;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  padding-right: 36px;
`;

export const Textarea = styled.textarea`
  ${baseInput};
  min-height: 96px;
  resize: vertical;
`;

export const FieldError = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.danger};
`;
