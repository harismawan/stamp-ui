import React from 'react';
import styled from 'styled-components';

export type PriceTagSize = 'sm' | 'md' | 'lg';

export interface PriceTagProps extends React.ComponentPropsWithoutRef<'span'> {
  /** Pre-formatted original price, rendered struck-through after the price. */
  original?: React.ReactNode;
  $size?: PriceTagSize;
  children: React.ReactNode;
}

const sizeFont: Record<PriceTagSize, string> = {
  sm: '0.875rem',
  md: '1.0625rem',
  lg: '1.375rem',
};

const Root = styled.span<{ $size: PriceTagSize }>`
  display: inline-flex;
  align-items: baseline;
  gap: ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.mono};
  font-size: ${(p) => sizeFont[p.$size]};
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
`;

const Original = styled.s`
  font-size: 0.8em;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSubtle};
`;

/**
 * Price display. Never formats numbers — consumers pass pre-formatted strings
 * (decimal-string money stays in the consuming app, per stamp-ui's no-domain rule).
 */
export const PriceTag: React.FC<PriceTagProps> = ({
  original,
  $size = 'md',
  children,
  ...rest
}) => (
  <Root $size={$size} {...rest}>
    <span>{children}</span>
    {original != null ? <Original>{original}</Original> : null}
  </Root>
);
