import React from 'react';
import styled from 'styled-components';

export interface AvatarProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  src?: string;
  name: string;
  size?: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const Root = styled.div<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  flex-shrink: 0;
  overflow: hidden;
  font-family: ${(p) => p.theme.font.body};
  font-size: ${(p) => Math.round(p.$size * 0.38)}px;
  font-weight: 800;
  color: ${(p) => p.theme.colors.primaryInk};
  background: ${(p) => p.theme.colors.primarySoft};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name, size = 40, ...rest }, ref) => {
    return (
      <Root ref={ref} $size={size} {...rest}>
        {src != null ? <Img src={src} alt={name} /> : <span aria-hidden="true">{initials(name)}</span>}
      </Root>
    );
  },
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  max?: number;
  children: React.ReactNode;
}

const GroupRoot = styled.div`
  display: inline-flex;
  align-items: center;

  & > * + * {
    margin-left: -12px;
  }
`;

const Overflow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  font-family: ${(p) => p.theme.font.body};
  font-size: 14px;
  font-weight: 800;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
`;

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ max = 3, children, ...rest }) => {
  const items = React.Children.toArray(children);
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  return (
    <GroupRoot {...rest}>
      {visible}
      {overflow > 0 ? <Overflow aria-hidden="false">{`+${overflow}`}</Overflow> : null}
    </GroupRoot>
  );
};
