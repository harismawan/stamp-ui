import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { renderWithTheme } from './util';

afterEach(() => cleanup());

const OPTS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl', () => {
  it('renders options as radios with the active one checked', () => {
    renderWithTheme(<SegmentedControl value="week" onChange={() => {}} options={OPTS} />);
    expect(screen.getByRole('radiogroup')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Week' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Day' }).getAttribute('aria-checked')).toBe('false');
  });

  it('fires onChange when a segment is clicked', async () => {
    const onChange = mock(() => {});
    renderWithTheme(<SegmentedControl value="day" onChange={onChange} options={OPTS} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Month' }));
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('moves selection with arrow keys (roving focus)', async () => {
    const onChange = mock(() => {});
    renderWithTheme(<SegmentedControl value="day" onChange={onChange} options={OPTS} />);
    const active = screen.getByRole('radio', { name: 'Day' });
    active.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('accepts bare-string options', () => {
    renderWithTheme(<SegmentedControl value="a" onChange={() => {}} options={['a', 'b']} />);
    expect(screen.getByRole('radio', { name: 'a' })).toBeTruthy();
  });

  it('does not select a disabled option on click', async () => {
    const onChange = mock(() => {});
    renderWithTheme(
      <SegmentedControl
        value="day"
        onChange={onChange}
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week', disabled: true },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Week' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
