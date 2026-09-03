import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { SideNav, SideNavItem, SideNavSection } from '../src/components/SideNav';
import { renderWithTheme } from './util';

afterEach(cleanup);

function Example() {
  return (
    <SideNav logo={<span>Acme</span>} footer={<span>Signed in</span>}>
      <SideNavSection title="Main">
        <SideNavItem href="/dashboard" active>
          Dashboard
        </SideNavItem>
        <SideNavItem href="/orders" badge="12">
          Orders
        </SideNavItem>
      </SideNavSection>
    </SideNav>
  );
}

describe('SideNav', () => {
  it('marks only the active item with aria-current', () => {
    renderWithTheme(<Example />);
    // Children render twice (rail + drawer content is closed), so scope to the rail.
    const dashboard = screen.getAllByRole('link', { name: /Dashboard/ })[0];
    const orders = screen.getAllByRole('link', { name: /Orders/ })[0];
    expect(dashboard.getAttribute('aria-current')).toBe('page');
    expect(orders.getAttribute('aria-current')).toBeNull();
  });

  it('renders the icon as decorative and the badge as content', () => {
    renderWithTheme(
      <SideNav>
        <SideNavItem href="/orders" icon={<svg data-testid="icon" />} badge="12">
          Orders
        </SideNavItem>
      </SideNav>,
    );
    const link = screen.getAllByRole('link', { name: /Orders/ })[0];
    // Badge text is inside the link; the icon is hidden from the a11y tree.
    expect(within(link).getByText('12')).toBeTruthy();
    expect(link.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('labels a section group by its heading', () => {
    renderWithTheme(<Example />);
    expect(screen.getAllByRole('navigation', { name: 'Main' }).length).toBeGreaterThan(0);
  });

  it('opens the drawer from the hamburger and shows the items inside it', () => {
    const { container } = renderWithTheme(<Example />);
    expect(screen.queryByRole('dialog')).toBeNull();

    // The hamburger is display:none until the collapseAt media query fires, and
    // happy-dom doesn't evaluate media queries — so reach for it in the DOM,
    // the same way test/TopNav.test.tsx does.
    const hamburger = container.querySelector('button[aria-label="Open menu"]');
    if (!hamburger) throw new Error('Hamburger button not found');
    fireEvent.click(hamburger);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('link', { name: /Dashboard/ })).toBeTruthy();
    expect(within(dialog).getByText('Signed in')).toBeTruthy();
  });

  it('renders an item as a different element via `as`', () => {
    renderWithTheme(
      <SideNav>
        <SideNavItem as="button" type="button">
          Sign out
        </SideNavItem>
      </SideNav>,
    );
    expect(screen.getAllByRole('button', { name: 'Sign out' })[0]).toBeTruthy();
  });
});
