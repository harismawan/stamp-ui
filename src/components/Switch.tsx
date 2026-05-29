import React from 'react';
import styled from 'styled-components';

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'type' | 'role'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
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

const Track = styled.span<{ $checked: boolean }>`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  background: ${(p) => (p.$checked ? p.theme.colors.primary : p.theme.colors.surfaceMuted)};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  transition: background 80ms ${(p) => p.theme.easing.out};

  ${HiddenInput}:focus-visible + & {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Thumb = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 1px;
  left: 1px;
  width: 20px;
  height: 20px;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  background: ${(p) => p.theme.colors.surface};
  transform: translateX(${(p) => (p.$checked ? '22px' : '0')});
  transition: transform 80ms ${(p) => p.theme.easing.out};
`;

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onChange, label, disabled, ...rest }, ref) => {
    return (
      <Root $disabled={disabled}>
        <HiddenInput
          ref={ref}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          {...rest}
        />
        <Track $checked={checked} aria-hidden="true">
          <Thumb $checked={checked} />
        </Track>
        {label != null ? <span>{label}</span> : null}
      </Root>
    );
  },
);

Switch.displayName = 'Switch';
