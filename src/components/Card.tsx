import styled from 'styled-components';

export interface CardProps {
  $hover?: boolean;
  $accent?: boolean;
  $flat?: boolean;
}

export const Card = styled.div<CardProps>`
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: ${(p) => p.theme.space[6]};
  min-width: 0;
  overflow: hidden;
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

  ${(p) =>
    p.$accent &&
    `
    background: ${p.theme.colors.primary};
    color: ${p.theme.colors.primaryInk};
  `}

  ${(p) =>
    p.$flat &&
    `
    box-shadow: none;
  `}
`;

export const CardTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => p.theme.colors.textMuted};
  margin-bottom: ${(p) => p.theme.space[2]};
`;

export const CardValue = styled.div`
  font-family: ${(p) => p.theme.font.mono};
  font-size: clamp(1.25rem, 2.4cqi + 0.6rem, 1.75rem);
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
