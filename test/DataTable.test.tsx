import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { DataTable, type DataTableColumn } from '../src/components/DataTable';

afterEach(cleanup);

interface Person {
  id: string;
  name: string;
  age: number;
}

const PEOPLE: Person[] = [
  { id: '1', name: 'Charlie', age: 30 },
  { id: '2', name: 'Alice', age: 25 },
  { id: '3', name: 'Bob', age: 35 },
];

const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true },
];

// Body rows only — the thead and the pagination tfoot also contain `row`s, so
// scope to the tbody (the second rowgroup: thead, tbody, [tfoot]).
function bodyRows(): HTMLElement[] {
  const tbody = screen.getAllByRole('rowgroup')[1];
  return within(tbody).getAllByRole('row');
}

describe('DataTable', () => {
  it('renders rows and cells from typed data', () => {
    renderWithTheme(<DataTable columns={columns} data={PEOPLE} rowKey={(r) => r.id} />);

    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Charlie' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Alice' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: '35' })).toBeTruthy();

    expect(bodyRows()).toHaveLength(3);
  });

  it('uses column.render when provided', () => {
    const cols: DataTableColumn<Person>[] = [
      { key: 'name', header: 'Name', render: (r) => `~${r.name}~` },
    ];
    renderWithTheme(<DataTable columns={cols} data={PEOPLE} rowKey={(r) => r.id} />);
    expect(screen.getByRole('cell', { name: '~Charlie~' })).toBeTruthy();
  });

  it('clicking a sortable header cycles asc -> desc -> none and swaps the indicator', async () => {
    const user = userEvent.setup();
    const onSortChange = mock((_sort: { key: string; dir: 'asc' | 'desc' } | null) => {});
    renderWithTheme(
      <DataTable
        columns={columns}
        data={PEOPLE}
        rowKey={(r) => r.id}
        onSortChange={onSortChange}
      />,
    );

    const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
    const nameButton = screen.getByRole('button', { name: /Name/ });

    // Unsorted initially.
    expect(nameHeader.getAttribute('aria-sort')).toBe('none');

    // asc
    await user.click(nameButton);
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'name', dir: 'asc' });
    await waitFor(() => expect(nameHeader.getAttribute('aria-sort')).toBe('ascending'));
    expect(bodyRows()[0].textContent).toContain('Alice');

    // desc
    await user.click(nameButton);
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'name', dir: 'desc' });
    await waitFor(() => expect(nameHeader.getAttribute('aria-sort')).toBe('descending'));
    expect(bodyRows()[0].textContent).toContain('Charlie');

    // none
    await user.click(nameButton);
    expect(onSortChange).toHaveBeenLastCalledWith(null);
    await waitFor(() => expect(nameHeader.getAttribute('aria-sort')).toBe('none'));
    // back to original data order
    const rows = bodyRows();
    expect(rows[0].textContent).toContain('Charlie');
    expect(rows[1].textContent).toContain('Alice');
  });

  it('sorts numeric columns numerically', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DataTable columns={columns} data={PEOPLE} rowKey={(r) => r.id} />);
    await user.click(screen.getByRole('button', { name: /Age/ }));
    await waitFor(() => {
      const rows = bodyRows();
      expect(rows[0].textContent).toContain('25');
      expect(rows[2].textContent).toContain('35');
    });
  });

  it('sorts numeric columns numerically even when some values are missing', async () => {
    // Mixed magnitudes ("10" vs "5") would order wrong under string sort; a
    // null in the column must not silently degrade the whole column to strings.
    interface Score {
      id: string;
      label: string;
      score: number | null;
    }
    const scoreData: Score[] = [
      { id: 'a', label: 'A', score: 10 },
      { id: 'b', label: 'B', score: null },
      { id: 'c', label: 'C', score: 5 },
      { id: 'd', label: 'D', score: 2 },
    ];
    const scoreCols: DataTableColumn<Score>[] = [
      { key: 'label', header: 'Label' },
      { key: 'score', header: 'Score', sortable: true },
    ];
    const user = userEvent.setup();
    renderWithTheme(<DataTable columns={scoreCols} data={scoreData} rowKey={(r) => r.id} />);

    // asc: 2, 5, 10, then the missing value last.
    await user.click(screen.getByRole('button', { name: /Score/ }));
    await waitFor(() => {
      const rows = bodyRows();
      expect(rows[0].textContent).toContain('D');
      expect(rows[1].textContent).toContain('C');
      expect(rows[2].textContent).toContain('A');
      // missing value sorts to the end
      expect(rows[3].textContent).toContain('B');
    });

    // desc: 10, 5, 2, missing still last (not flipped to the front).
    await user.click(screen.getByRole('button', { name: /Score/ }));
    await waitFor(() => {
      const rows = bodyRows();
      expect(rows[0].textContent).toContain('A');
      expect(rows[1].textContent).toContain('C');
      expect(rows[2].textContent).toContain('D');
      expect(rows[3].textContent).toContain('B');
    });
  });

  it('does not put aria-selected on body rows (invalid on a plain table)', () => {
    renderWithTheme(
      <DataTable
        columns={columns}
        data={PEOPLE}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={['1']}
      />,
    );
    for (const row of bodyRows()) {
      expect(row.hasAttribute('aria-selected')).toBe(false);
    }
  });

  it('selecting a row fires onSelectionChange with the key list', async () => {
    const user = userEvent.setup();
    const onSelectionChange = mock((_keys: string[]) => {});
    renderWithTheme(
      <DataTable
        columns={columns}
        data={PEOPLE}
        rowKey={(r) => r.id}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1']);
  });

  it('select-all toggles all current-page rows and header shows indeterminate for partial selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = mock((_keys: string[]) => {});
    renderWithTheme(
      <DataTable
        columns={columns}
        data={PEOPLE}
        rowKey={(r) => r.id}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    // Select a single row -> header checkbox becomes indeterminate.
    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    const selectAll = screen.getByRole('checkbox', {
      name: 'Select all rows on this page',
    }) as HTMLInputElement;
    await waitFor(() => expect(selectAll.indeterminate).toBe(true));
    expect(selectAll.checked).toBe(false);

    // The mixed state must also be visible to sighted users: the box renders a
    // dash glyph (lucide Minus) rather than appearing fully unchecked.
    const selectAllLabel = selectAll.closest('label') as HTMLElement;
    await waitFor(() =>
      expect(selectAllLabel.querySelector('svg.lucide-minus')).not.toBeNull(),
    );
    expect(selectAllLabel.querySelector('svg.lucide-check')).toBeNull();

    // Select all -> every key selected, no longer indeterminate.
    await user.click(selectAll);
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2', '3']);
    await waitFor(() => {
      expect(selectAll.indeterminate).toBe(false);
      expect(selectAll.checked).toBe(true);
    });
    // Fully selected -> check glyph, no dash.
    expect(selectAllLabel.querySelector('svg.lucide-check')).not.toBeNull();
    expect(selectAllLabel.querySelector('svg.lucide-minus')).toBeNull();

    // Deselect all on the page -> empty selection.
    await user.click(selectAll);
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it('supports controlled selection via selectedKeys', () => {
    renderWithTheme(
      <DataTable
        columns={columns}
        data={PEOPLE}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={['2']}
      />,
    );
    const row2 = screen.getByRole('checkbox', { name: 'Select row 2' }) as HTMLInputElement;
    expect(row2.checked).toBe(true);
    const row1 = screen.getByRole('checkbox', { name: 'Select row 1' }) as HTMLInputElement;
    expect(row1.checked).toBe(false);
  });

  it('with pageSize the body shows only one page and Pagination changes the page', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DataTable columns={columns} data={PEOPLE} rowKey={(r) => r.id} pageSize={2} />,
    );

    // page 1: 2 of 3 rows
    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByRole('cell', { name: 'Charlie' })).toBeTruthy();
    expect(screen.queryByRole('cell', { name: 'Bob' })).toBeNull();

    // navigate to page 2
    await user.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Bob' })).toBeTruthy();
    });
    expect(bodyRows()).toHaveLength(1);
    expect(screen.queryByRole('cell', { name: 'Charlie' })).toBeNull();
  });

  it('shows emptyText when data is empty', () => {
    renderWithTheme(
      <DataTable columns={columns} data={[]} rowKey={(r) => r.id} emptyText="Nothing here" />,
    );
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('shows the default empty text', () => {
    renderWithTheme(<DataTable columns={columns} data={[]} rowKey={(r) => r.id} />);
    expect(screen.getByText('No data')).toBeTruthy();
  });

  it('renders a caption that names the table without a redundant aria-describedby', () => {
    renderWithTheme(
      <DataTable columns={columns} data={PEOPLE} rowKey={(r) => r.id} caption="People list" />,
    );
    expect(screen.getByText('People list')).toBeTruthy();
    // The caption alone names the table; it must not be doubled up as a
    // description (which AT would announce twice).
    const table = screen.getByRole('table');
    expect(table.getAttribute('aria-describedby')).toBeNull();
    expect(table.querySelector('caption')?.textContent).toBe('People list');
  });

  it('applies align and width to the matching cells', () => {
    const cols: DataTableColumn<Person>[] = [
      { key: 'name', header: 'Name' },
      { key: 'age', header: 'Age', align: 'right', width: '120px' },
    ];
    renderWithTheme(<DataTable columns={cols} data={PEOPLE} rowKey={(r) => r.id} />);
    const ageCell = screen.getByRole('cell', { name: '30' }) as HTMLTableCellElement;
    expect(ageCell.style.textAlign).toBe('right');
    expect(ageCell.style.width).toBe('120px');
  });

  it('respects defaultSort', () => {
    renderWithTheme(
      <DataTable
        columns={columns}
        data={PEOPLE}
        rowKey={(r) => r.id}
        defaultSort={{ key: 'name', dir: 'asc' }}
      />,
    );
    expect(bodyRows()[0].textContent).toContain('Alice');
    const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
  });

  it('resets to page 1 when the sort changes', async () => {
    renderWithTheme(
      <DataTable columns={columns} data={PEOPLE} rowKey={(r) => r.id} pageSize={2} />,
    );

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(screen.getByRole('cell', { name: 'Bob' })).toBeTruthy());

    // Changing sort should bounce us back to page 1.
    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    await waitFor(() => {
      expect(bodyRows()).toHaveLength(2);
    });
  });
});
