import { describe, it, expect } from 'bun:test';
import { renderWithTheme } from './util';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonGroup,
} from '../src/components/Skeleton';

describe('Skeleton', () => {
  it('renders with the given width', () => {
    const { container } = renderWithTheme(<Skeleton $w="120px" data-testid="sk" />);
    const el = container.querySelector('[data-testid="sk"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.width).toBe('120px');
  });

  it('SkeletonText renders N lines (default 3)', () => {
    const { container } = renderWithTheme(<SkeletonText data-testid="lines-group" />);
    const group = container.querySelector('[data-testid="lines-group"]') as HTMLElement;
    expect(group.children.length).toBe(3);
  });

  it('SkeletonText respects an explicit lines count', () => {
    const { container } = renderWithTheme(<SkeletonText lines={5} data-testid="five" />);
    expect((container.querySelector('[data-testid="five"]') as HTMLElement).children.length).toBe(5);
  });

  it('SkeletonCircle renders with equal width/height from $size', () => {
    const { container } = renderWithTheme(<SkeletonCircle $size={48} data-testid="circ" />);
    const el = container.querySelector('[data-testid="circ"]') as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('SkeletonCircle does not leak its size prop to the DOM', () => {
    const { container } = renderWithTheme(<SkeletonCircle $size={48} data-testid="circ" />);
    const el = container.querySelector('[data-testid="circ"]') as HTMLElement;
    // $size is transient and must be stripped; size is invalid on <div>.
    expect(el.hasAttribute('size')).toBe(false);
    expect(el.hasAttribute('$size')).toBe(false);
  });

  it('Skeleton placeholders are aria-hidden so they are not announced', () => {
    const { container } = renderWithTheme(<Skeleton data-testid="sk2" />);
    const el = container.querySelector('[data-testid="sk2"]') as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('SkeletonGroup exposes a status role with aria-busy and a label', () => {
    const { container } = renderWithTheme(
      <SkeletonGroup data-testid="grp">
        <Skeleton />
        <Skeleton />
      </SkeletonGroup>,
    );
    const grp = container.querySelector('[data-testid="grp"]') as HTMLElement;
    expect(grp.getAttribute('role')).toBe('status');
    expect(grp.getAttribute('aria-busy')).toBe('true');
    expect(grp.getAttribute('aria-label')).toBe('Loading');
  });

  it('SkeletonText exposes status semantics and an overridable label', () => {
    const { container } = renderWithTheme(
      <SkeletonText $label="Loading profile" data-testid="txt" />,
    );
    const txt = container.querySelector('[data-testid="txt"]') as HTMLElement;
    expect(txt.getAttribute('role')).toBe('status');
    expect(txt.getAttribute('aria-busy')).toBe('true');
    expect(txt.getAttribute('aria-label')).toBe('Loading profile');
    // $label is transient and must not appear on the DOM node.
    expect(txt.hasAttribute('$label')).toBe(false);
    expect(txt.hasAttribute('label')).toBe(false);
  });

  it('SkeletonGroup renders its children', () => {
    const { container } = renderWithTheme(
      <SkeletonGroup data-testid="grp">
        <Skeleton />
        <Skeleton />
      </SkeletonGroup>,
    );
    expect((container.querySelector('[data-testid="grp"]') as HTMLElement).children.length).toBe(2);
  });
});
