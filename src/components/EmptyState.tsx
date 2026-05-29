import React from 'react';
import styled from 'styled-components';

export interface EmptyStateProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: ${(p) => p.theme.space[3]};
  padding: ${(p) => p.theme.space[8]} ${(p) => p.theme.space[5]};
  font-family: ${(p) => p.theme.font.body};
`;

const IconWrap = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: ${(p) => p.theme.colors.textMuted};
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${(p) => p.theme.colors.text};
`;

const Description = styled.p`
  margin: 0;
  max-width: 42ch;
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.textMuted};
`;

const ActionWrap = styled.div`
  margin-top: ${(p) => p.theme.space[1]};
`;

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  ...rest
}) => {
  return (
    <Root {...rest}>
      {icon != null ? <IconWrap aria-hidden="true">{icon}</IconWrap> : null}
      <Title>{title}</Title>
      {description != null ? <Description>{description}</Description> : null}
      {action != null ? <ActionWrap>{action}</ActionWrap> : null}
    </Root>
  );
};
