import { describe, it, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Breadcrumb, BreadcrumbItem } from '../src/components/Breadcrumb';

afterEach(cleanup);

describe('Breadcrumb', () => {
  it('renders a labelled nav containing an ordered list', () => {
    renderWithTheme(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/reports">Reports</BreadcrumbItem>
        <BreadcrumbItem>March</BreadcrumbItem>
      </Breadcrumb>,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeTruthy();
    expect(nav.querySelector('ol')).toBeTruthy();
  });

  it('renders linked items as anchors with hrefs', () => {
    renderWithTheme(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>,
    );
    const home = screen.getByRole('link', { name: 'Home' });
    expect(home.getAttribute('href')).toBe('/');
  });

  it('marks the item without an href as the current page', () => {
    renderWithTheme(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>March</BreadcrumbItem>
      </Breadcrumb>,
    );
    const current = screen.getByText('March');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(screen.queryByRole('link', { name: 'March' })).toBeNull();
  });
});
