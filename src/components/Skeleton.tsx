import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

export interface SkeletonProps {
  $w?: string;
  $h?: string;
  $r?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pill';
}

export const Skeleton = styled.div.attrs<SkeletonProps>((p) => ({
  'aria-hidden': p['aria-hidden'] ?? true,
  style: { width: p.$w ?? '100%', height: p.$h ?? '14px' },
}))<SkeletonProps>`
  border-radius: ${(p) => p.theme.radii[p.$r ?? 'sm']};
  background: linear-gradient(
    90deg,
    ${(p) => p.theme.colors.borderSoft} 25%,
    ${(p) => p.theme.colors.surfaceMuted} 50%,
    ${(p) => p.theme.colors.borderSoft} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
  flex-shrink: 0;
`;

// The container announces the loading state to assistive tech (mirrors the
// Spinner's role="status" + aria-label convention). The shimmer placeholders
// themselves are aria-hidden so they are not announced as meaningless content.
export interface SkeletonGroupProps {
  $gap?: string;
  /** Status label announced to assistive tech (non-transient props would leak). */
  $label?: string;
}

export const SkeletonGroup = styled.div.attrs<SkeletonGroupProps>((p) => ({
  role: 'status',
  'aria-busy': true,
  'aria-label': p.$label ?? 'Loading',
}))<SkeletonGroupProps>`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.$gap ?? p.theme.space[2]};
  min-width: 0;
`;

export interface SkeletonTextProps extends React.ComponentPropsWithoutRef<'div'> {
  lines?: number;
  /** Status label announced to assistive tech. */
  $label?: string;
}

export function SkeletonText({ lines = 3, ...rest }: SkeletonTextProps) {
  return (
    <SkeletonGroup {...rest}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} $w={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </SkeletonGroup>
  );
}

export interface SkeletonCircleProps extends React.ComponentPropsWithoutRef<'div'> {
  $size?: number;
}

export const SkeletonCircle = styled(Skeleton).attrs<SkeletonCircleProps>((p) => ({
  style: { width: `${p.$size ?? 40}px`, height: `${p.$size ?? 40}px` },
}))<SkeletonCircleProps>`
  border-radius: ${(p) => p.theme.radii.pill};
`;
