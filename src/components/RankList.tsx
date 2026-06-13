import React from 'react';
import styled from 'styled-components';
import { Avatar } from './Avatar';

export interface RankListItem {
  id: string;
  label: string;
  avatarSrc?: string;
  /** Right-aligned value (pre-formatted string or node). */
  value?: React.ReactNode;
}

export interface RankListProps extends React.ComponentPropsWithoutRef<'ol'> {
  items: RankListItem[];
  /** First N rows get the accent (primarySoft) treatment. */
  highlightTop?: number;
  /** Render avatars (initials fallback) before labels. Default true. */
  showAvatars?: boolean;
}

const Root = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  font-family: ${(p) => p.theme.font.body};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  overflow: hidden;
`;

const Row = styled.li<{ $highlight: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[3]};
  padding: ${(p) => p.theme.space[3]} ${(p) => p.theme.space[4]};
  background: ${(p) => (p.$highlight ? p.theme.colors.primarySoft : 'transparent')};

  & + & {
    border-top: 2px solid ${(p) => p.theme.colors.borderSoft};
  }
`;

const RankNum = styled.span`
  width: 28px;
  flex-shrink: 0;
  font-family: ${(p) => p.theme.font.mono};
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${(p) => p.theme.colors.textMuted};
`;

const Label = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Value = styled.span`
  flex-shrink: 0;
  font-family: ${(p) => p.theme.font.mono};
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

/** Ranked list — leaderboards, top supporters. */
export const RankList: React.FC<RankListProps> = ({
  items,
  highlightTop = 0,
  showAvatars = true,
  ...rest
}) => (
  <Root {...rest}>
    {items.map((item, i) => (
      <Row key={item.id} $highlight={i < highlightTop} data-highlight={String(i < highlightTop)}>
        <RankNum>{i + 1}</RankNum>
        {showAvatars ? <Avatar name={item.label} src={item.avatarSrc} size={28} /> : null}
        <Label>{item.label}</Label>
        {item.value != null ? <Value>{item.value}</Value> : null}
      </Row>
    ))}
  </Root>
);
