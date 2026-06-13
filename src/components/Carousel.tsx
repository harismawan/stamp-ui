import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';
import type { Theme } from '../theme';

export interface CarouselProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Required accessible name for the carousel region. */
  ariaLabel: string;
  /** theme.space key for the gap between slides (default 4 = 16px). */
  $gap?: keyof Theme['space'];
  children: React.ReactNode;
}

const Root = styled.div`
  position: relative;
`;

const Track = styled.div<{ $gap: keyof Theme['space'] }>`
  display: flex;
  gap: ${(p) => p.theme.space[p.$gap]};
  overflow-x: auto;
  scroll-snap-type: x mandatory;

  @media (prefers-reduced-motion: no-preference) {
    scroll-behavior: smooth;
  }
  /* Leave room for stamp shadows on hover-lifted cards. */
  padding: ${(p) => p.theme.space[1]} ${(p) => p.theme.space[1]} ${(p) => p.theme.space[3]};
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  & > * {
    scroll-snap-align: start;
    flex-shrink: 0;
  }
`;

const NavButton = styled.button<{ $edge: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$edge === 'left' ? 'left: -8px;' : 'right: -8px;')}
  transform: translateY(-50%);
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  cursor: pointer;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  transition: transform 80ms ${(p) => p.theme.easing.out};

  &:hover {
    transform: translateY(-50%) translate(1px, 1px);
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
`;

/**
 * Horizontal scroll-snap strip with chevron paging. No carousel library —
 * pure CSS scroll-snap; each child becomes a snap-aligned slide.
 */
export function Carousel({ ariaLabel, $gap = 4, children, ...rest }: CarouselProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el || typeof el.scrollBy !== 'function') return;
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <Root {...rest} role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
      <NavButton type="button" aria-label="Previous" $edge="left" onClick={() => page(-1)}>
        <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />
      </NavButton>
      <Track ref={trackRef} $gap={$gap}>
        {children}
      </Track>
      <NavButton type="button" aria-label="Next" $edge="right" onClick={() => page(1)}>
        <ChevronRight size={20} strokeWidth={2.5} aria-hidden="true" />
      </NavButton>
    </Root>
  );
}
