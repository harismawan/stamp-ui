import { Menu as MenuIcon } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';
import { Drawer } from './Drawer';

export interface TopNavProps extends React.ComponentPropsWithoutRef<'header'> {
  logo?: React.ReactNode;
  /** Center slot (typically a SearchBar). Stays visible on mobile. */
  center?: React.ReactNode;
  sticky?: boolean;
  /** Viewport width (px) below which links/actions collapse into the drawer. */
  collapseAt?: number;
  /** Accessible title of the mobile drawer. */
  mobileTitle?: string;
  /** TopNavLinks / TopNavActions. */
  children?: React.ReactNode;
}

const Bar = styled.header<{ $sticky: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[4]};
  padding: ${(p) => p.theme.space[3]} ${(p) => p.theme.space[5]};
  font-family: ${(p) => p.theme.font.body};
  background: ${(p) => p.theme.colors.surface};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
  ${(p) =>
    p.$sticky &&
    `
    position: sticky;
    top: 0;
    z-index: 1000;
  `}
`;

const LogoSlot = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const CenterSlot = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 560px;
  margin: 0 auto;
`;

const DesktopArea = styled.div<{ $collapseAt: number }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[4]};

  @media (max-width: ${(p) => p.$collapseAt}px) {
    display: none;
  }
`;

const Hamburger = styled.button<{ $collapseAt: number }>`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  flex-shrink: 0;
  cursor: pointer;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stampSm};

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }

  @media (max-width: ${(p) => p.$collapseAt}px) {
    display: inline-flex;
  }
`;

const DrawerStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[5]};

  /* Stack nav/action rows vertically inside the drawer. */
  & nav,
  & [data-stamp-topnav-actions] {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TopNavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};

  & a {
    font-weight: 700;
    text-decoration: none;
    color: ${(p) => p.theme.colors.text};
    padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
    border-radius: ${(p) => p.theme.radii.md};
    transition: background 80ms ${(p) => p.theme.easing.out};

    &:hover {
      background: ${(p) => p.theme.colors.surfaceMuted};
    }
  }
`;

const ActionsRoot = styled.div`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  margin-left: auto;
`;

export interface TopNavActionsProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

export function TopNavActions({ children, ...rest }: TopNavActionsProps) {
  return (
    <ActionsRoot data-stamp-topnav-actions="" {...rest}>
      {children}
    </ActionsRoot>
  );
}

/**
 * Marketplace top navbar: logo · center slot (search) · links/actions.
 * Links/actions collapse into a hamburger Drawer below `collapseAt` px.
 * Children render twice (desktop bar + open drawer) — keep them free of
 * `id`/`htmlFor` attributes to avoid duplicate-id markup.
 */
export function TopNav({
  logo,
  center,
  sticky = true,
  collapseAt = 880,
  mobileTitle = 'Menu',
  children,
  ...rest
}: TopNavProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <Bar {...rest} $sticky={sticky}>
        {logo != null ? <LogoSlot>{logo}</LogoSlot> : null}
        {center != null ? <CenterSlot>{center}</CenterSlot> : null}
        <DesktopArea $collapseAt={collapseAt}>{children}</DesktopArea>
        <Hamburger
          type="button"
          aria-label="Open menu"
          $collapseAt={collapseAt}
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon size={20} strokeWidth={2.5} aria-hidden="true" />
        </Hamburger>
      </Bar>
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="right" title={mobileTitle}>
        <DrawerStack onClick={() => setMenuOpen(false)}>{children}</DrawerStack>
      </Drawer>
    </>
  );
}
