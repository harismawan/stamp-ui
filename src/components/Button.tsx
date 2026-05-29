import styled, { css } from 'styled-components';

export interface ButtonProps {
  $variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
  $full?: boolean;
}

const sizeMap = {
  sm: css`
    padding: 8px 14px;
    font-size: 0.875rem;
    border-radius: ${(p) => p.theme.radii.md};
  `,
  md: css`
    padding: 11px 20px;
    font-size: 0.9375rem;
    border-radius: ${(p) => p.theme.radii.md};
  `,
  lg: css`
    padding: 14px 26px;
    font-size: 1rem;
    border-radius: ${(p) => p.theme.radii.md};
  `,
} as const;

const stamp = css`
  border: 2px solid ${(p) => p.theme.colors.border};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  transition:
    transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out},
    background 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled):not([aria-disabled='true']) {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }
  &:active:not(:disabled):not([aria-disabled='true']) {
    transform: translate(4px, 4px);
    box-shadow: none;
  }
`;

const variantMap = {
  primary: css`
    ${stamp};
    background: ${(p) => p.theme.colors.primary};
    color: ${(p) => p.theme.colors.primaryInk};
    &:hover:not(:disabled):not([aria-disabled='true']) {
      background: ${(p) => p.theme.colors.primaryHover};
      color: ${(p) => p.theme.colors.primaryInk};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${(p) => p.theme.colors.text};
    border: 2px solid transparent;
    &:hover:not(:disabled):not([aria-disabled='true']) {
      background: ${(p) => p.theme.colors.surfaceMuted};
      color: ${(p) => p.theme.colors.text};
    }
  `,
  outline: css`
    ${stamp};
    background: ${(p) => p.theme.colors.surface};
    color: ${(p) => p.theme.colors.text};
    &:hover:not(:disabled):not([aria-disabled='true']) {
      color: ${(p) => p.theme.colors.text};
    }
  `,
  danger: css`
    ${stamp};
    background: ${(p) => p.theme.colors.danger};
    color: ${(p) => p.theme.colors.surface};
    &:hover:not(:disabled):not([aria-disabled='true']) {
      color: ${(p) => p.theme.colors.surface};
    }
  `,
} as const;

export const Button = styled.button.attrs<ButtonProps>((p) =>
  (p as { as?: unknown }).as === 'a'
    ? {}
    : { type: (p as { type?: 'button' | 'submit' | 'reset' }).type ?? 'button' },
)<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(p) => p.theme.space[2]};
  font-family: inherit;
  font-weight: 700;
  letter-spacing: -0.005em;
  white-space: nowrap;
  text-decoration: none;
  ${(p) => sizeMap[p.$size ?? 'md']};
  ${(p) => variantMap[p.$variant ?? 'primary']};
  ${(p) => p.$full && 'width: 100%;'}

  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
