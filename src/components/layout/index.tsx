import styled, { css } from 'styled-components';
import type { Theme } from '../../theme';

type SpaceKey = keyof Theme['space'];
type RadiusKey = keyof Theme['radii'];
type ColorKey = keyof Theme['colors'];

function spaceValue(theme: Theme, key: SpaceKey | undefined): string | undefined {
  if (key === undefined) return undefined;
  return theme.space[key];
}

export interface BoxProps {
  $p?: SpaceKey;
  $px?: SpaceKey;
  $py?: SpaceKey;
  $m?: SpaceKey;
  $bg?: ColorKey;
  $radius?: RadiusKey;
}

export const Box = styled.div<BoxProps>`
  ${(p) =>
    p.$p !== undefined &&
    css`
      padding: ${spaceValue(p.theme, p.$p)};
    `}
  ${(p) =>
    p.$px !== undefined &&
    css`
      padding-left: ${spaceValue(p.theme, p.$px)};
      padding-right: ${spaceValue(p.theme, p.$px)};
    `}
  ${(p) =>
    p.$py !== undefined &&
    css`
      padding-top: ${spaceValue(p.theme, p.$py)};
      padding-bottom: ${spaceValue(p.theme, p.$py)};
    `}
  ${(p) =>
    p.$m !== undefined &&
    css`
      margin: ${spaceValue(p.theme, p.$m)};
    `}
  ${(p) =>
    p.$bg !== undefined &&
    css`
      background: ${p.theme.colors[p.$bg]};
    `}
  ${(p) =>
    p.$radius !== undefined &&
    css`
      border-radius: ${p.theme.radii[p.$radius]};
    `}
`;

export interface StackProps {
  $gap?: SpaceKey;
  $direction?: 'row' | 'column';
  $align?: React.CSSProperties['alignItems'];
  $justify?: React.CSSProperties['justifyContent'];
}

export const Stack = styled.div<StackProps>`
  display: flex;
  flex-direction: ${(p) => p.$direction ?? 'column'};
  ${(p) =>
    p.$gap !== undefined &&
    css`
      gap: ${spaceValue(p.theme, p.$gap)};
    `}
  ${(p) =>
    p.$align !== undefined &&
    css`
      align-items: ${p.$align};
    `}
  ${(p) =>
    p.$justify !== undefined &&
    css`
      justify-content: ${p.$justify};
    `}
`;

export const HStack = styled(Stack).attrs<StackProps>((p) => ({
  $direction: p.$direction ?? 'row',
}))``;

export const VStack = styled(Stack).attrs<StackProps>((p) => ({
  $direction: p.$direction ?? 'column',
}))``;

export interface GridProps {
  $cols?: number;
  $gap?: SpaceKey;
}

export const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols ?? 1}, minmax(0, 1fr));
  ${(p) =>
    p.$gap !== undefined &&
    css`
      gap: ${spaceValue(p.theme, p.$gap)};
    `}
`;

export interface ContainerProps {
  $max?: number;
}

export const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: ${(p) => p.$max ?? 1120}px;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${(p) => p.theme.space[4]};
  padding-right: ${(p) => p.theme.space[4]};
`;
