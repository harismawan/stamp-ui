import * as React from 'react';
import styled from 'styled-components';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Table, THead, TBody, Tr, Th, Td } from './Table';
import { Checkbox } from './Checkbox';
import { Pagination } from './Pagination';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  /** Default: `String(row[key])`. */
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  /**
   * Default: `row[key]`. A column sorts numerically when every present value is
   * a number (or a numeric string); missing values (null/undefined/empty) sort
   * to the end in both directions. Any non-numeric present value falls back to a
   * locale string comparison for the whole column.
   */
  sortAccessor?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface DataTableSort {
  key: string;
  dir: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Enables internal pagination. */
  pageSize?: number;
  defaultSort?: DataTableSort;
  onSortChange?: (sort: DataTableSort | null) => void;
  emptyText?: React.ReactNode;
  caption?: string;
}

const SortButton = styled.button<{ $align?: 'left' | 'right' | 'center' }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  width: 100%;
  justify-content: ${(p) =>
    p.$align === 'right' ? 'flex-end' : p.$align === 'center' ? 'center' : 'flex-start'};
  font-family: inherit;
  font-size: inherit;
  font-weight: 800;
  color: ${(p) => p.theme.colors.text};
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 80ms ${(p) => p.theme.easing.out};

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 2px;
  }
`;

const FooterCell = styled.td`
  padding: ${(p) => p.theme.space[3]};
  border-top: 2px solid ${(p) => p.theme.colors.border};
`;

const FooterInner = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Caption = styled.caption`
  caption-side: top;
  text-align: left;
  font-family: ${(p) => p.theme.font.body};
  font-weight: 800;
  color: ${(p) => p.theme.colors.text};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
`;

function defaultAccessor<T>(column: DataTableColumn<T>): (row: T) => string | number {
  if (column.sortAccessor) return column.sortAccessor;
  return (row: T) => {
    const v = (row as Record<string, unknown>)[column.key];
    return typeof v === 'number' ? v : String(v ?? '');
  };
}

function defaultRender<T>(column: DataTableColumn<T>, row: T): React.ReactNode {
  if (column.render) return column.render(row);
  return String((row as Record<string, unknown>)[column.key] ?? '');
}

/** A value that should sort to the end of the column regardless of direction. */
function isMissing(v: string | number): boolean {
  return v === '' || (typeof v === 'number' && Number.isNaN(v));
}

/**
 * Parses a sort value to a finite number, or `null` if it is not numeric.
 * Numeric strings (e.g. `"10"`) are accepted so a column backed by strings of
 * digits still sorts numerically.
 */
function toNumber(v: string | number): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * A column is treated as numeric when at least one present value is numeric and
 * no present value is non-numeric. Missing values (null/undefined/empty) do not
 * disqualify numeric mode — they simply sort to the end.
 */
function isNumericColumn(values: (string | number)[]): boolean {
  let sawNumber = false;
  for (const v of values) {
    if (isMissing(v)) continue;
    if (toNumber(v) === null) return false;
    sawNumber = true;
  }
  return sawNumber;
}

/**
 * Compares two sort values. In numeric mode both are coerced to numbers and
 * missing values are pushed to the end (always last, independent of asc/desc).
 * Otherwise a case-insensitive locale comparison is used.
 */
function compareValues(a: string | number, b: string | number, numeric: boolean): number {
  const aMissing = isMissing(a);
  const bMissing = isMissing(b);
  // Missing values always sort last; this branch is direction-independent and
  // the caller must not negate its result (see sortedData).
  if (aMissing || bMissing) {
    if (aMissing && bMissing) return 0;
    return aMissing ? 1 : -1;
  }
  if (numeric) {
    const na = toNumber(a);
    const nb = toNumber(b);
    if (na !== null && nb !== null) return na - nb;
  }
  return String(a).localeCompare(String(b));
}

/** Cycles a column's sort state: unsorted -> asc -> desc -> unsorted. */
function nextSort(current: DataTableSort | null, key: string): DataTableSort | null {
  if (!current || current.key !== key) return { key, dir: 'asc' };
  if (current.dir === 'asc') return { key, dir: 'desc' };
  return null;
}

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    data,
    rowKey,
    selectable = false,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    pageSize,
    defaultSort,
    onSortChange,
    emptyText = 'No data',
    caption,
  } = props;

  // --- Sort state (internal; `onSortChange` reports every change). ---
  const [sort, setSort] = React.useState<DataTableSort | null>(defaultSort ?? null);

  // --- Selection state (controlled when `selectedKeys` provided). ---
  const selectionControlled = selectedKeys !== undefined;
  const [uncontrolledSelection, setUncontrolledSelection] = React.useState<string[]>(
    () => defaultSelectedKeys ?? [],
  );
  const selection = selectionControlled ? selectedKeys : uncontrolledSelection;

  const commitSelection = React.useCallback(
    (next: string[]) => {
      if (!selectionControlled) setUncontrolledSelection(next);
      onSelectionChange?.(next);
    },
    [selectionControlled, onSelectionChange],
  );

  // --- Pagination state. ---
  const [page, setPage] = React.useState(1);

  // --- Sorted data (client-side). ---
  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return data;
    const accessor = defaultAccessor(column);
    const values = data.map(accessor);
    const numeric = isNumericColumn(values);
    const copy = [...data];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      // Missing values stay last in both directions, so handle them before the
      // direction flip rather than letting it invert their placement.
      const aMissing = isMissing(av);
      const bMissing = isMissing(bv);
      if (aMissing || bMissing) {
        if (aMissing && bMissing) return 0;
        return aMissing ? 1 : -1;
      }
      const result = compareValues(av, bv, numeric);
      return sort.dir === 'asc' ? result : -result;
    });
    return copy;
  }, [data, sort, columns]);

  // --- Page slice. ---
  const pageCount = pageSize ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const clampedPage = Math.min(page, pageCount);
  const pageRows = React.useMemo(() => {
    if (!pageSize) return sortedData;
    const start = (clampedPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageSize, clampedPage]);

  const handleSort = (key: string) => {
    const next = nextSort(sort, key);
    setSort(next);
    setPage(1); // reset to first page when the sort changes
    onSortChange?.(next);
  };

  const selectionSet = React.useMemo(() => new Set(selection), [selection]);
  const pageKeys = React.useMemo(() => pageRows.map(rowKey), [pageRows, rowKey]);
  const selectedOnPage = pageKeys.filter((k) => selectionSet.has(k));
  const allOnPageSelected = pageKeys.length > 0 && selectedOnPage.length === pageKeys.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const toggleAllOnPage = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectionSet);
      for (const k of pageKeys) next.add(k);
      commitSelection([...next]);
    } else {
      const pageSet = new Set(pageKeys);
      commitSelection(selection.filter((k) => !pageSet.has(k)));
    }
  };

  const toggleRow = (key: string, checked: boolean) => {
    if (checked) {
      if (selectionSet.has(key)) return;
      commitSelection([...selection, key]);
    } else {
      commitSelection(selection.filter((k) => k !== key));
    }
  };

  const totalColumns = columns.length + (selectable ? 1 : 0);

  return (
    <Table>
      {caption ? <Caption>{caption}</Caption> : null}
      <THead>
        <Tr>
          {selectable ? (
            <Th style={{ width: '1%' }}>
              <Checkbox
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected}
                onChange={toggleAllOnPage}
                aria-label="Select all rows on this page"
              />
            </Th>
          ) : null}
          {columns.map((column) => {
            const isSorted = sort?.key === column.key;
            const ariaSort = !column.sortable
              ? undefined
              : isSorted
                ? sort.dir === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none';
            return (
              <Th
                key={column.key}
                aria-sort={ariaSort}
                style={{
                  textAlign: column.align ?? 'left',
                  width: column.width,
                }}
              >
                {column.sortable ? (
                  <SortButton
                    type="button"
                    $align={column.align}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.header}
                    {isSorted ? (
                      sort.dir === 'asc' ? (
                        <ChevronUp size={16} strokeWidth={3} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={16} strokeWidth={3} aria-hidden="true" />
                      )
                    ) : null}
                  </SortButton>
                ) : (
                  column.header
                )}
              </Th>
            );
          })}
        </Tr>
      </THead>
      <TBody>
        {pageRows.length === 0 ? (
          <Tr>
            <Td colSpan={totalColumns} style={{ textAlign: 'center' }}>
              {emptyText}
            </Td>
          </Tr>
        ) : (
          pageRows.map((row) => {
            const key = rowKey(row);
            const rowSelected = selectionSet.has(key);
            return (
              <Tr key={key}>
                {selectable ? (
                  <Td style={{ width: '1%' }}>
                    <Checkbox
                      checked={rowSelected}
                      onChange={(checked) => toggleRow(key, checked)}
                      aria-label={`Select row ${key}`}
                    />
                  </Td>
                ) : null}
                {columns.map((column) => (
                  <Td
                    key={column.key}
                    style={{
                      textAlign: column.align ?? 'left',
                      width: column.width,
                    }}
                  >
                    {defaultRender(column, row)}
                  </Td>
                ))}
              </Tr>
            );
          })
        )}
      </TBody>
      {pageSize && sortedData.length > 0 ? (
        <tfoot>
          <tr>
            <FooterCell colSpan={totalColumns}>
              <FooterInner>
                <Pagination page={clampedPage} pageCount={pageCount} onChange={setPage} />
              </FooterInner>
            </FooterCell>
          </tr>
        </tfoot>
      ) : null}
    </Table>
  );
}
