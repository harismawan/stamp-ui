import React from 'react';
import styled from 'styled-components';

export type ProgressVariant = 'primary' | 'success' | 'danger';

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'role'> {
  value: number;
  max?: number;
  $variant?: ProgressVariant;
  label?: string;
}

const variantColor = {
  primary: (p: { theme: import('../theme').Theme }) => p.theme.colors.primary,
  success: (p: { theme: import('../theme').Theme }) => p.theme.colors.income,
  danger: (p: { theme: import('../theme').Theme }) => p.theme.colors.expense,
} as const;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
  width: 100%;
  font-family: ${(p) => p.theme.font.body};
`;

const Label = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
`;

const Track = styled.div`
  width: 100%;
  height: 18px;
  overflow: hidden;
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
`;

const Fill = styled.div<{ $variant: ProgressVariant }>`
  height: 100%;
  background: ${(p) => variantColor[p.$variant](p)};
  border-right: 2px solid ${(p) => p.theme.colors.border};
  transition: width 80ms ${(p) => p.theme.easing.out};
`;

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, $variant = 'primary', label, ...rest }, ref) => {
    const clamped = Math.max(0, Math.min(value, max));
    const pct = max > 0 ? (clamped / max) * 100 : 0;
    return (
      <Wrap ref={ref} {...rest}>
        {label != null ? <Label>{label}</Label> : null}
        <Track
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <Fill $variant={$variant} data-testid="progress-fill" style={{ width: `${pct}%` }} />
        </Track>
      </Wrap>
    );
  },
);

Progress.displayName = 'Progress';
