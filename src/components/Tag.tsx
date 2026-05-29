import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

export interface TagProps extends React.ComponentPropsWithoutRef<'span'> {
  children: React.ReactNode;
  onRemove?: () => void;
}

const Root = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  padding: ${(p) => p.theme.space[1]} ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.body};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin: 0;
  color: ${(p) => p.theme.colors.textMuted};
  background: transparent;
  border: none;
  border-radius: ${(p) => p.theme.radii.xs};
  cursor: pointer;
  transition: color 80ms ${(p) => p.theme.easing.out},
    background 80ms ${(p) => p.theme.easing.out};

  &:hover {
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => p.theme.colors.surfaceSunken};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
`;

export const Tag: React.FC<TagProps> = ({ children, onRemove, ...rest }) => {
  const label = typeof children === 'string' ? children : undefined;
  return (
    <Root {...rest}>
      <span>{children}</span>
      {onRemove != null ? (
        <RemoveButton
          type="button"
          aria-label={label != null ? `Remove ${label}` : 'Remove'}
          onClick={onRemove}
        >
          <X size={14} strokeWidth={3} aria-hidden="true" />
        </RemoveButton>
      ) : null}
    </Root>
  );
};
