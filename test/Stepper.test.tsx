import { describe, it, expect, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Stepper } from '../src/components/Stepper';

afterEach(cleanup);

const steps = [
  { label: 'Account' },
  { label: 'Profile', description: 'Tell us about you' },
  { label: 'Confirm' },
];

describe('Stepper', () => {
  it('renders an ordered list with one item per step', () => {
    const { container } = renderWithTheme(<Stepper steps={steps} active={1} />);
    expect(container.querySelector('ol')).toBeTruthy();
    expect(container.querySelectorAll('li')).toHaveLength(3);
  });

  it('renders each step label', () => {
    renderWithTheme(<Stepper steps={steps} active={1} />);
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('marks the active step with aria-current=step', () => {
    const { container } = renderWithTheme(<Stepper steps={steps} active={1} />);
    const lis = Array.from(container.querySelectorAll('li'));
    expect(lis[1].getAttribute('aria-current')).toBe('step');
    expect(lis[0].getAttribute('aria-current')).toBeNull();
    expect(lis[2].getAttribute('aria-current')).toBeNull();
  });

  it('marks steps before the active one as completed', () => {
    const { container } = renderWithTheme(<Stepper steps={steps} active={2} />);
    const lis = Array.from(container.querySelectorAll('li'));
    expect(lis[0].getAttribute('data-status')).toBe('complete');
    expect(lis[1].getAttribute('data-status')).toBe('complete');
    expect(lis[2].getAttribute('data-status')).toBe('active');
  });
});
