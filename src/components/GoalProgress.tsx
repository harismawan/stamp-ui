import React from 'react';
import styled from 'styled-components';
import { Progress, type ProgressVariant } from './Progress';

export interface GoalProgressProps extends React.ComponentPropsWithoutRef<'div'> {
  value: number;
  max: number;
  /** Goal name, top-left. */
  label?: string;
  /** Pre-formatted progress string ("Rp 0 / Rp 350.000 — 0%"), top-right. */
  valueLabel?: string;
  $variant?: ProgressVariant;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
  width: 100%;
  font-family: ${(p) => p.theme.font.body};
`;

const HeadRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${(p) => p.theme.space[2]};
`;

const Label = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
`;

const ValueLabel = styled.span`
  font-family: ${(p) => p.theme.font.mono};
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${(p) => p.theme.colors.text};
`;

/** Goal/progress composite — wishlist funding bars and similar. */
export const GoalProgress: React.FC<GoalProgressProps> = ({
  value,
  max,
  label,
  valueLabel,
  $variant = 'primary',
  ...rest
}) => (
  <Wrap {...rest}>
    {label != null || valueLabel != null ? (
      <HeadRow>
        {label != null ? <Label>{label}</Label> : <span />}
        {valueLabel != null ? <ValueLabel>{valueLabel}</ValueLabel> : null}
      </HeadRow>
    ) : null}
    <Progress value={value} max={max} $variant={$variant} aria-label={label} />
  </Wrap>
);
