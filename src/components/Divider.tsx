import React from 'react';
import styled from 'styled-components';

export interface DividerProps extends React.ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Vertical = styled.div`
  align-self: stretch;
  width: 0;
  min-height: 16px;
  border-left: 2px solid ${(p) => p.theme.colors.border};
`;

const Horizontal = styled.div`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[3]};
  width: 100%;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-top: 2px solid ${(p) => p.theme.colors.border};
  }
`;

const PlainHorizontal = styled.div`
  width: 100%;
  height: 0;
  border-top: 2px solid ${(p) => p.theme.colors.border};
`;

const Label = styled.span`
  font-family: ${(p) => p.theme.font.body};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => p.theme.colors.textMuted};
`;

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', label, ...rest }, ref) => {
    if (orientation === 'vertical') {
      return <Vertical ref={ref} role="separator" aria-orientation="vertical" {...rest} />;
    }
    if (label != null) {
      return (
        <Horizontal ref={ref} role="separator" aria-orientation="horizontal" {...rest}>
          <Label>{label}</Label>
        </Horizontal>
      );
    }
    return <PlainHorizontal ref={ref} role="separator" aria-orientation="horizontal" {...rest} />;
  },
);

Divider.displayName = 'Divider';
