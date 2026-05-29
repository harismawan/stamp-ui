import React from 'react';
import styled from 'styled-components';

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'type' | 'value' | 'min' | 'max' | 'step'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const Input = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 14px;
  margin: 8px 0;
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.disabled ? 0.55 : 1)};

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border: 2px solid ${(p) => p.theme.colors.border};
    border-radius: ${(p) => p.theme.radii.sm};
    background: ${(p) => p.theme.colors.primary};
    box-shadow: ${(p) => p.theme.shadow.stampSm};
    cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border: 2px solid ${(p) => p.theme.colors.border};
    border-radius: ${(p) => p.theme.radii.sm};
    background: ${(p) => p.theme.colors.primary};
    box-shadow: ${(p) => p.theme.shadow.stampSm};
    cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  }
`;

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onChange, min = 0, max = 100, step = 1, disabled, ...rest }, ref) => {
    return (
      <Input
        ref={ref}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        {...rest}
      />
    );
  },
);

Slider.displayName = 'Slider';
