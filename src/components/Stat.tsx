import React from 'react';
import styled from 'styled-components';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export type StatDeltaType = 'up' | 'down' | 'auto';

export interface StatProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  value: React.ReactNode;
  delta?: number;
  deltaType?: StatDeltaType;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
  font-family: ${(p) => p.theme.font.body};
`;

const Label = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Value = styled.span`
  font-family: ${(p) => p.theme.font.mono};
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: ${(p) => p.theme.colors.text};
`;

const Delta = styled.span<{ $direction: 'up' | 'down' }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  font-family: ${(p) => p.theme.font.mono};
  font-size: 14px;
  font-weight: 800;
  color: ${(p) => (p.$direction === 'up' ? p.theme.colors.income : p.theme.colors.expense)};
`;

export const Stat: React.FC<StatProps> = ({ label, value, delta, deltaType = 'auto', ...rest }) => {
  let direction: 'up' | 'down' | null = null;
  if (delta != null) {
    if (deltaType === 'auto') {
      direction = delta >= 0 ? 'up' : 'down';
    } else {
      direction = deltaType;
    }
  }
  return (
    <Root {...rest}>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {direction != null ? (
        <Delta $direction={direction} data-testid="stat-delta">
          {direction === 'up' ? (
            <ArrowUpRight size={16} strokeWidth={3} aria-hidden="true" />
          ) : (
            <ArrowDownRight size={16} strokeWidth={3} aria-hidden="true" />
          )}
          {delta}
        </Delta>
      ) : null}
    </Root>
  );
};
