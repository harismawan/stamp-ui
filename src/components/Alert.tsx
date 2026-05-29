import * as React from 'react';
import styled from 'styled-components';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warn' | 'danger';

export interface AlertProps extends React.ComponentPropsWithoutRef<'div'> {
  $variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

const variantColor = (
  theme: import('styled-components').DefaultTheme,
  variant: AlertVariant,
): string => {
  switch (variant) {
    case 'success':
      return theme.colors.success;
    case 'warn':
      return theme.colors.warning;
    case 'danger':
      return theme.colors.danger;
    case 'info':
    default:
      return theme.colors.primary;
  }
};

const variantBg = (
  theme: import('styled-components').DefaultTheme,
  variant: AlertVariant,
): string => {
  switch (variant) {
    case 'success':
      return theme.colors.incomeSoft;
    case 'danger':
      return theme.colors.expenseSoft;
    case 'warn':
      return theme.colors.surfaceMuted;
    case 'info':
    default:
      return theme.colors.primarySoft;
  }
};

const Root = styled.div<{ $variant: AlertVariant }>`
  display: flex;
  align-items: flex-start;
  gap: ${(p) => p.theme.space[3]};
  font-family: ${(p) => p.theme.font.body};
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => variantBg(p.theme, p.$variant)};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  padding: ${(p) => p.theme.space[3]} ${(p) => p.theme.space[4]};
`;

const IconWrap = styled.span<{ $variant: AlertVariant }>`
  display: inline-flex;
  flex-shrink: 0;
  color: ${(p) => variantColor(p.theme, p.$variant)};
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-weight: 800;
  font-size: 15px;
  margin-bottom: ${(p) => p.theme.space[1]};
`;

const Message = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.textMuted};
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: ${(p) => p.theme.colors.textMuted};
  cursor: pointer;
  padding: 2px;
  border-radius: ${(p) => p.theme.radii.xs};

  &:hover {
    color: ${(p) => p.theme.colors.text};
  }
`;

const ICONS: Record<AlertVariant, React.ComponentType<{ size?: number }>> = {
  info: Info,
  success: CheckCircle2,
  warn: AlertTriangle,
  danger: XCircle,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { $variant = 'info', title, onClose, children, ...rest },
  ref,
) {
  const Icon = ICONS[$variant];
  return (
    <Root ref={ref} role="alert" $variant={$variant} {...rest}>
      <IconWrap $variant={$variant} aria-hidden="true">
        <Icon size={20} />
      </IconWrap>
      <Content>
        {title && <Title>{title}</Title>}
        {children && <Message>{children}</Message>}
      </Content>
      {onClose && (
        <CloseButton type="button" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </CloseButton>
      )}
    </Root>
  );
});
