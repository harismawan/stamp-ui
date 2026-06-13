import React from 'react';
import styled from 'styled-components';
import { type MediaAspect, aspectRatio } from './MediaCard';

export interface MediaGalleryItem {
  src: string;
  alt: string;
}

export interface MediaGalleryProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  items: MediaGalleryItem[];
  /** Controlled active index. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  $aspect?: MediaAspect;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[3]};
`;

const Main = styled.div<{ $aspect: MediaAspect }>`
  width: 100%;
  aspect-ratio: ${(p) => aspectRatio[p.$aspect]};
  overflow: hidden;
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  box-shadow: ${(p) => p.theme.shadow.stamp};
`;

const MainImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Thumbs = styled.div`
  display: flex;
  gap: ${(p) => p.theme.space[2]};
  overflow-x: auto;
  padding: ${(p) => p.theme.space[1]};
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ThumbButton = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => (p.$active ? p.theme.shadow.stampSm : p.theme.shadow.none)};
  opacity: ${(p) => (p.$active ? 1 : 0.6)};
  transition: opacity 80ms ${(p) => p.theme.easing.out};

  &:hover {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }

  & > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/** Main image + thumbnail strip. Controlled via `index`, else uncontrolled. */
export function MediaGallery({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  $aspect = '4:3',
  ...rest
}: MediaGalleryProps) {
  const [inner, setInner] = React.useState(defaultIndex);
  const active = index !== undefined ? index : inner;
  const current = items[active] ?? items[0];

  const select = (i: number) => {
    if (index === undefined) setInner(i);
    onIndexChange?.(i);
  };

  if (items.length === 0) return null;

  return (
    <Wrap {...rest}>
      <Main $aspect={$aspect}>
        <MainImg src={current.src} alt={current.alt} />
      </Main>
      {items.length > 1 ? (
        <Thumbs>
          {items.map((item, i) => (
            <ThumbButton
              key={item.src}
              type="button"
              aria-label={item.alt}
              aria-current={i === active ? 'true' : undefined}
              $active={i === active}
              onClick={() => select(i)}
            >
              <img src={item.src} alt="" aria-hidden="true" />
            </ThumbButton>
          ))}
        </Thumbs>
      ) : null}
    </Wrap>
  );
}
