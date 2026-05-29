import * as React from 'react';
import styled from 'styled-components';
import { ChevronRight } from 'lucide-react';

const Nav = styled.nav`
  font-family: ${(p) => p.theme.font.body};
`;

const List = styled.ol`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${(p) => p.theme.space[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ItemWrap = styled.li`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  font-size: 14px;
  font-weight: 700;
`;

const Separator = styled.span`
  display: inline-flex;
  align-items: center;
  color: ${(p) => p.theme.colors.textSubtle};
`;

const Link = styled.a`
  color: ${(p) => p.theme.colors.textMuted};
  text-decoration: none;

  &:hover {
    color: ${(p) => p.theme.colors.primary};
    text-decoration: underline;
  }
`;

const Current = styled.span`
  color: ${(p) => p.theme.colors.text};
`;

export interface BreadcrumbItemProps {
  href?: string;
  children: React.ReactNode;
}

export function BreadcrumbItem({ href, children }: BreadcrumbItemProps) {
  if (href) {
    return <Link href={href}>{children}</Link>;
  }
  return <Current aria-current="page">{children}</Current>;
}

export interface BreadcrumbProps {
  children: React.ReactNode;
}

export function Breadcrumb({ children }: BreadcrumbProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement);
  return (
    <Nav aria-label="Breadcrumb">
      <List>
        {items.map((item, index) => (
          <ItemWrap key={index}>
            {item}
            {index < items.length - 1 && (
              <Separator aria-hidden="true">
                <ChevronRight size={16} />
              </Separator>
            )}
          </ItemWrap>
        ))}
      </List>
    </Nav>
  );
}
