import React from 'react';
import styled from 'styled-components';

export interface FooterProps extends React.ComponentPropsWithoutRef<'footer'> {
  /** Bottom bar content (copyright line etc.). */
  bottom?: React.ReactNode;
  /** FooterColumn elements. */
  children: React.ReactNode;
}

const Root = styled.footer`
  font-family: ${(p) => p.theme.font.body};
  background: ${(p) => p.theme.colors.bgAlt};
  border-top: 2px solid ${(p) => p.theme.colors.border};
  padding: ${(p) => p.theme.space[7]} ${(p) => p.theme.space[5]};
`;

const Inner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${(p) => p.theme.space[6]};
`;

const BottomBar = styled.div`
  margin-top: ${(p) => p.theme.space[6]};
  padding-top: ${(p) => p.theme.space[4]};
  border-top: 2px solid ${(p) => p.theme.colors.borderSoft};
  font-size: 13px;
  color: ${(p) => p.theme.colors.textSubtle};
`;

export function Footer({ bottom, children, ...rest }: FooterProps) {
  return (
    <Root {...rest}>
      <Inner>
        <Cols>{children}</Cols>
        {bottom != null ? <BottomBar>{bottom}</BottomBar> : null}
      </Inner>
    </Root>
  );
}

export interface FooterColumnProps {
  title?: string;
  children: React.ReactNode;
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};

  & a {
    color: ${(p) => p.theme.colors.textMuted};
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;

    &:hover {
      color: ${(p) => p.theme.colors.text};
      text-decoration: underline;
    }
  }
`;

const ColumnTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => p.theme.colors.text};
`;

export function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <Column>
      {title != null ? <ColumnTitle>{title}</ColumnTitle> : null}
      {children}
    </Column>
  );
}
