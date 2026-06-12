import React from 'react';
import styled from 'styled-components';

export type AvatarFrameAspect = '1:1' | '3:4';

export interface AvatarFrameProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  src?: string;
  name: string;
  /** Portrait width in px (height follows $aspect). */
  size?: number;
  /** Frame fill color; defaults to theme primary. */
  frameColor?: string;
  /** Rendered bottom-center, overlapping the frame edge (level plates etc.). */
  badge?: React.ReactNode;
  $aspect?: AvatarFrameAspect;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const Root = styled.div<{ $frameColor?: string }>`
  position: relative;
  display: inline-block;
  padding: ${(p) => p.theme.space[2]};
  background: ${(p) => p.$frameColor ?? p.theme.colors.primary};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  box-shadow: ${(p) => p.theme.shadow.stamp};
`;

const Portrait = styled.div<{ $size: number; $aspect: AvatarFrameAspect }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$size}px;
  height: ${(p) => (p.$aspect === '3:4' ? Math.round((p.$size * 4) / 3) : p.$size)}px;
  overflow: hidden;
  font-family: ${(p) => p.theme.font.body};
  font-size: ${(p) => Math.round(p.$size * 0.3)}px;
  font-weight: 800;
  color: ${(p) => p.theme.colors.primaryInk};
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BadgeSlot = styled.div`
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 50%);
  z-index: 1;
`;

/**
 * Framed portrait with a bottom-edge badge slot — the "trading card" avatar
 * anatomy. The badge overhangs the frame; leave bottom margin in the layout.
 */
export const AvatarFrame: React.FC<AvatarFrameProps> = ({
  src,
  name,
  size = 96,
  frameColor,
  badge,
  $aspect = '1:1',
  ...rest
}) => (
  <Root $frameColor={frameColor} {...rest}>
    <Portrait $size={size} $aspect={$aspect}>
      {src != null ? (
        <Img src={src} alt={name} />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </Portrait>
    {badge != null ? <BadgeSlot>{badge}</BadgeSlot> : null}
  </Root>
);
