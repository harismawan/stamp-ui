import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../src/components/Calendar';
import { renderWithTheme } from './util';

afterEach(cleanup);

const JUNE_2024 = new Date(2024, 5, 1);
/** Day cells are labelled with the locale date string — build it, don't guess. */
const dayLabel = (d: number) => new Date(2024, 5, d).toLocaleDateString();
const dayCell = (d: number) => screen.getByRole('button', { name: dayLabel(d) });

describe('Calendar', () => {
  it('opens on defaultMonth and walks months with the nav buttons', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Calendar defaultMonth={JUNE_2024} />);
    expect(screen.getByText('June 2024')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('July 2024')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('May 2024')).toBeTruthy();
  });

  it('selects a day and reports it when uncontrolled', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date) => {});
    renderWithTheme(<Calendar defaultMonth={JUNE_2024} onChange={onChange} />);

    await user.click(dayCell(15));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].getDate()).toBe(15);
    // Uncontrolled: the component owns the selection and paints it.
    expect(dayCell(15).closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('does not move the selection on its own when controlled', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date) => {});
    renderWithTheme(
      <Calendar defaultMonth={JUNE_2024} value={new Date(2024, 5, 10)} onChange={onChange} />,
    );

    await user.click(dayCell(15));

    expect(onChange).toHaveBeenCalledTimes(1);
    // Selection stays on the controlled value until the parent passes a new one.
    expect(dayCell(10).closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('true');
    expect(dayCell(15).closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('false');
  });

  it('disables days outside min/max', async () => {
    const user = userEvent.setup();
    const onChange = mock((_d: Date) => {});
    renderWithTheme(
      <Calendar
        defaultMonth={JUNE_2024}
        min={new Date(2024, 5, 10)}
        max={new Date(2024, 5, 20)}
        onChange={onChange}
      />,
    );

    expect((dayCell(5) as HTMLButtonElement).disabled).toBe(true);
    expect((dayCell(25) as HTMLButtonElement).disabled).toBe(true);
    expect((dayCell(15) as HTMLButtonElement).disabled).toBe(false);

    await user.click(dayCell(5));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('follows arrow-key focus into the neighbouring month', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Calendar defaultMonth={JUNE_2024} />);

    // Seed roving focus on the 1st, then walk back a day across the boundary.
    await user.click(dayCell(1));
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByText('May 2024')).toBeTruthy();
  });
});
