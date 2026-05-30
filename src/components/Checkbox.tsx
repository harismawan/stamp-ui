import React from 'react';
import styled from 'styled-components';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'type'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  /**
   * Mixed state (e.g. a "select all" header where only some rows are selected).
   * Sets the native `input.indeterminate` flag for assistive tech and renders a
   * visible dash glyph. Only applies while `checked` is false.
   */
  indeterminate?: boolean;
}

const Root = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.body};
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.55 : 1)};
  user-select: none;
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

const Box = styled.span<{ $checked: boolean; $indeterminate?: boolean; $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  background: ${(p) =>
    p.$checked || p.$indeterminate ? p.theme.colors.primary : p.theme.colors.surface};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  color: ${(p) => p.theme.colors.primaryInk};
  transition: background 80ms ${(p) => p.theme.easing.out};

  ${HiddenInput}:focus-visible + & {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }
`;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, label, disabled, indeterminate = false, ...rest }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    // Mixed state only applies while unchecked; a checked box is never "mixed".
    const showIndeterminate = indeterminate && !checked;

    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = showIndeterminate;
    }, [showIndeterminate]);

    return (
      <Root $disabled={disabled}>
        <HiddenInput
          ref={innerRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          {...rest}
        />
        <Box
          $checked={checked}
          $indeterminate={showIndeterminate}
          $disabled={disabled}
          aria-hidden="true"
        >
          {checked ? (
            <Check size={16} strokeWidth={3} />
          ) : showIndeterminate ? (
            <Minus size={16} strokeWidth={3} />
          ) : null}
        </Box>
        {label != null ? <span>{label}</span> : null}
      </Root>
    );
  },
);

Checkbox.displayName = 'Checkbox';
