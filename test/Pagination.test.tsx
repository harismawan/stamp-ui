import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Pagination } from '../src/components/Pagination';

afterEach(cleanup);

describe('Pagination', () => {
  it('fires onChange with the clicked page number', async () => {
    const user = userEvent.setup();
    const onChange = mock((_: number) => {});
    renderWithTheme(<Pagination page={1} pageCount={5} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('disables the previous button on the first page', () => {
    renderWithTheme(<Pagination page={1} pageCount={5} onChange={() => {}} />);
    expect((screen.getByRole('button', { name: /previous/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables the next button on the last page', () => {
    renderWithTheme(<Pagination page={5} pageCount={5} onChange={() => {}} />);
    expect((screen.getByRole('button', { name: /next/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('marks the active page with aria-current', () => {
    renderWithTheme(<Pagination page={2} pageCount={5} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '2' }).getAttribute('aria-current')).toBe('page');
  });

  it('renders an ellipsis for large page counts', () => {
    renderWithTheme(<Pagination page={10} pageCount={50} onChange={() => {}} />);
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });
});
