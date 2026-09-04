import { Menu as MenuIcon } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';
import { Drawer } from './Drawer';

export interface SideNavProps extends React.ComponentPropsWithoutRef<'aside'> {
  /** Brand slot pinned to the top, above the scrolling item list. */
  logo?: React.ReactNode;
  /** Pinned to the bottom — typically a user chip or theme toggle. */
  footer?: React.ReactNode;
  width?: number;
  sticky?: boolean;
  /** Viewport width (px) below which the rail collapses into a drawer. */
  collapseAt?: number;
  /** Accessible title of the mobile drawer. */
  mobileTitle?: string;
  /** SideNavSection / SideNavItem. */
  children?: React.ReactNode;
}

const Rail = styled.aside<{ $width: number; $sticky: boolean; $collapseAt: number }>`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[5]};
  width: ${(p) => p.$width}px;
  flex-shrink: 0;
  padding: ${(p) => p.theme.space[5]};
  font-family: ${(p) => p.theme.font.body};
  background: ${(p) => p.theme.colors.surface};
  border-right: 2px solid ${(p) => p.theme.colors.border};

  ${(p) =>
    p.$sticky &&
    `
    position: sticky;
    top: 0;
    height: 100vh;
  `}

  @media (max-width: ${(p) => p.$collapseAt}px) {
    display: none;
  }
`;

const LogoSlot = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const Scroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[5]};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const FooterSlot = styled.div`
  flex-shrink: 0;
  padding-top: ${(p) => p.theme.space[3]};
  border-top: 2px solid ${(p) => p.theme.colors.border};
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
`;

// --- Section ----------------------------------------------------------------

export interface SideNavSectionProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Uppercase heading above the group. Omit for an unlabelled group. */
  title?: string;
  children?: React.ReactNode;
}

const SectionRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
`;

const SectionTitle = styled.div`
  padding: 0 ${(p) => p.theme.space[3]} ${(p) => p.theme.space[1]};
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => p.theme.colors.textSubtle};
`;

const ItemList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
`;

export function SideNavSection({ title, children, ...rest }: SideNavSectionProps) {
  const titleId = React.useId();
  return (
    <SectionRoot {...rest}>
      {title != null && <SectionTitle id={titleId}>{title}</SectionTitle>}
      <ItemList aria-labelledby={title != null ? titleId : undefined}>{children}</ItemList>
    </SectionRoot>
  );
}

// --- Item -------------------------------------------------------------------

export interface SideNavItemProps extends React.ComponentPropsWithoutRef<'a'> {
  icon?: React.ReactNode;
  /** Trailing count or status pill. */
  badge?: React.ReactNode;
  active?: boolean;
  /** Render as something else — `next/link`, a router Link, or `"button"`. */
  as?: React.ElementType;
  children?: React.ReactNode;
}

const ItemRoot = styled.a<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[3]};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  font-family: inherit;
  font-size: 0.9375rem;
  /* Inactive items sit back so the active one is the only full-contrast row. */
  font-weight: ${(p) => (p.$active ? 700 : 600)};
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  /* Transparent border on inactive items keeps the row from shifting on activate. */
  border: 2px solid ${(p) => (p.$active ? p.theme.colors.border : 'transparent')};
  border-radius: ${(p) => p.theme.radii.md};
  color: ${(p) => (p.$active ? p.theme.colors.primaryInk : p.theme.colors.textMuted)};
  background: ${(p) => (p.$active ? p.theme.colors.primary : 'transparent')};
  transition:
    background 80ms ${(p) => p.theme.easing.out},
    color 80ms ${(p) => p.theme.easing.out},
    border-color 80ms ${(p) => p.theme.easing.out};

  &:hover {
    background: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.surfaceMuted)};
    color: ${(p) => (p.$active ? p.theme.colors.primaryInk : p.theme.colors.text)};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
`;

const Label = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconSlot = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

const BadgeSlot = styled.span`
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 800;
`;

export function SideNavItem({ icon, badge, active = false, children, ...rest }: SideNavItemProps) {
  return (
    <ItemRoot $active={active} aria-current={active ? 'page' : undefined} {...rest}>
      {icon != null && <IconSlot aria-hidden="true">{icon}</IconSlot>}
      <Label>{children}</Label>
      {badge != null && <BadgeSlot>{badge}</BadgeSlot>}
    </ItemRoot>
  );
}

// --- Root -------------------------------------------------------------------

/**
 * Persistent dashboard sidebar: logo · sections of items · footer.
 * Collapses into a hamburger Drawer below `collapseAt` px.
 *
 * Children render twice (rail + open drawer) — keep them free of `id`/`htmlFor`
 * attributes to avoid duplicate-id markup.
 */
export function SideNav({
  logo,
  footer,
  width = 260,
  sticky = true,
  collapseAt = 880,
  mobileTitle = 'Menu',
  children,
  ...rest
}: SideNavProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <Rail {...rest} $width={width} $sticky={sticky} $collapseAt={collapseAt}>
        {logo != null ? <LogoSlot>{logo}</LogoSlot> : null}
        <Scroll>{children}</Scroll>
        {footer != null ? <FooterSlot>{footer}</FooterSlot> : null}
      </Rail>
      <Hamburger
        type="button"
        aria-label="Open menu"
        $collapseAt={collapseAt}
        onClick={() => setMenuOpen(true)}
      >
        <MenuIcon size={20} strokeWidth={2.5} aria-hidden="true" />
      </Hamburger>
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left" title={mobileTitle}>
        <DrawerStack onClick={() => setMenuOpen(false)}>
          {children}
          {footer != null ? <FooterSlot>{footer}</FooterSlot> : null}
        </DrawerStack>
      </Drawer>
    </>
  );
}
