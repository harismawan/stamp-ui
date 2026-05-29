import React from 'react';
import styled from 'styled-components';

interface RadioGroupContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const GroupRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};
`;

export const RadioGroup: React.FC<RadioGroupProps> = ({ name, value, onChange, children }) => {
  const ctx = React.useMemo<RadioGroupContextValue>(
    () => ({ name, value, onChange }),
    [name, value, onChange],
  );
  return (
    <RadioGroupContext.Provider value={ctx}>
      <GroupRoot role="radiogroup">{children}</GroupRoot>
    </RadioGroupContext.Provider>
  );
};

export interface RadioProps {
  value: string;
  label: string;
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

const Dot = styled.span<{ $checked: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  background: ${(p) => p.theme.colors.surface};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  transition: background 80ms ${(p) => p.theme.easing.out};

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: ${(p) => p.theme.radii.pill};
    background: ${(p) => p.theme.colors.primary};
    transform: scale(${(p) => (p.$checked ? 1 : 0)});
    transition: transform 80ms ${(p) => p.theme.easing.out};
  }

  ${HiddenInput}:focus-visible + & {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }
`;

export const Radio: React.FC<RadioProps> = ({ value, label, disabled }) => {
  const ctx = React.useContext(RadioGroupContext);
  if (ctx == null) {
    throw new Error('Radio must be used within a RadioGroup');
  }
  const checked = ctx.value === value;
  return (
    <Root $disabled={disabled}>
      <HiddenInput
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => ctx.onChange(value)}
      />
      <Dot $checked={checked} aria-hidden="true" />
      <span>{label}</span>
    </Root>
  );
};
