import { describe, it, expect, afterEach } from 'bun:test';
import { screen, cleanup, within } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Table, THead, TBody, Tr, Th, Td } from '../src/components/Table';

afterEach(cleanup);

describe('Table', () => {
  it('renders a table with header cells and data rows', () => {
    renderWithTheme(
      <Table>
        <THead>
          <Tr>
            <Th>Name</Th>
            <Th>Amount</Th>
          </Tr>
        </THead>
        <TBody>
          <Tr>
            <Td>Coffee</Td>
            <Td>$4</Td>
          </Tr>
          <Tr>
            <Td>Books</Td>
            <Td>$20</Td>
          </Tr>
        </TBody>
      </Table>,
    );

    const table = screen.getByRole('table');
    expect(table).toBeTruthy();

    const headers = within(table).getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual(['Name', 'Amount']);

    expect(within(table).getByRole('cell', { name: 'Coffee' })).toBeTruthy();
    expect(within(table).getByRole('cell', { name: '$20' })).toBeTruthy();

    // header row + 2 body rows
    expect(within(table).getAllByRole('row')).toHaveLength(3);
  });
});
