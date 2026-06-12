import React from 'react';
import styled from 'styled-components';

export type MediaAspect = '3:4' | '4:3' | '16:9' | '1:1';

/** CSS aspect-ratio values keyed by the public aspect names. */
export const aspectRatio: Record<MediaAspect, string> = {
  '3:4': '3 / 4',
  '4:3': '4 / 3',
  '16:9': '16 / 9',
  '1:1': '1 / 1',
};

export interface MediaCardProps {
  $hover?: boolean;
}

/**
 * Media-commerce card shell: zero-padding Card variant whose cover bleeds to
 * the edges. Compose with MediaCardCover / MediaCardBadge / MediaCardBody.
 */
export const MediaCard = styled.div<MediaCardProps>`
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  overflow: hidden;
  min-width: 0;
  container-type: inline-size;
  box-shadow: ${(p) => p.theme.shadow.stamp};
  transition:
    transform 120ms ${(p) => p.theme.easing.out},
    box-shadow 120ms ${(p) => p.theme.easing.out};

  ${(p) =>
    p.$hover &&
    `
    cursor: pointer;
    &:hover {
      transform: translate(-1px, -1px);
      box-shadow: ${p.theme.shadow.stampLg};
    }
  `}
`;

const CoverWrap = styled.div<{ $aspect: MediaAspect }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${(p) => aspectRatio[p.$aspect]};
  background: ${(p) => p.theme.colors.surfaceMuted};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
  overflow: hidden;
`;

const CoverImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export interface MediaCardCoverProps extends React.ComponentPropsWithoutRef<'div'> {
  src?: string;
  alt?: string;
  $aspect?: MediaAspect;
  /** Overlays (MediaCardBadge, countdowns, lock icons) — absolutely positioned. */
  children?: React.ReactNode;
}

export function MediaCardCover({
  src,
  alt = '',
  $aspect = '4:3',
  children,
  ...rest
}: MediaCardCoverProps) {
  return (
    <CoverWrap $aspect={$aspect} {...rest}>
      {src != null ? <CoverImg src={src} alt={alt} /> : null}
      {children}
    </CoverWrap>
  );
}

/** Floating label pinned to the cover's top-right corner. */
export const MediaCardBadge = styled.span`
  position: absolute;
  top: ${(p) => p.theme.space[2]};
  right: ${(p) => p.theme.space[2]};
  z-index: 1;
  padding: 2px 10px;
  font-family: ${(p) => p.theme.font.body};
  font-size: 12px;
  font-weight: 800;
  color: ${(p) => p.theme.colors.primaryInk};
  background: ${(p) => p.theme.colors.primary};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
`;

export const MediaCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};
  padding: ${(p) => p.theme.space[4]};
`;
