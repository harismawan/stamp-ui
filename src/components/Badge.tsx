import React from 'react';
import styled, { css } from 'styled-components';

export type BadgeVariant = 'primary' | 'neutral' | 'success' | 'danger' | 'warning';

export interface BadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  $variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles = {
  primary: css`
    background: ${(p) => p.theme.colors.primary};
    color: ${(p) => p.theme.colors.primaryInk};
  `,
  neutral: css`
    background: ${(p) => p.theme.colors.surfaceMuted};
    color: ${(p) => p.theme.colors.text};
  `,
  success: css`
    background: ${(p) => p.theme.colors.incomeSoft};
    color: ${(p) => p.theme.colors.income};
  `,
  danger: css`
    background: ${(p) => p.theme.colors.expenseSoft};
    color: ${(p) => p.theme.colors.expense};
  `,
  warning: css`
    background: ${(p) => p.theme.colors.warning};
    color: ${(p) => p.theme.colors.primaryInk};
  `,
} as const;

const Root = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  padding: 2px ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.body};
  font-size: 12px;
  font-weight: 800;
  line-height: 1.4;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  ${(p) => variantStyles[p.$variant]}
`;

export const Badge: React.FC<BadgeProps> = ({ $variant = 'neutral', children, ...rest }) => {
  return (
    <Root $variant={$variant} {...rest}>
      {children}
    </Root>
  );
};
