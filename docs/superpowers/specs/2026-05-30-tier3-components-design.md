# Tier-3 component suite — design spec

**Date:** 2026-05-30
**Status:** scope approved (all 8), pending spec review

## Goal

Add the missing "tier-3" organisms to `@harismawan/stamp-ui` — multi-part,
stateful components that compose existing primitives + keyboard / floating-ui /
data behavior. All match the established stamp aesthetic exactly: 2px borders,
hard offset shadows (`shadow.stamp` family), flat fills, no gradients, theme
tokens only, `lucide-react` icons, `styled-components` with transient `$props`.

## Components (8)

1. Combobox — searchable select (single + multi)
2. DataTable — sortable + selectable + paginated table
3. DatePicker — single-date calendar popover
4. Command — ⌘K command palette
5. FileUpload — drag-and-drop dropzone + file list
6. TreeView — nested expand/collapse hierarchy
7. TagInput — free-form token entry
8. DateRangePicker — dual-month range picker

## Shared conventions (apply to ALL)

- **File:** `src/components/<Name>.tsx`; test `test/<Name>.test.tsx`.
- **Export** from `src/index.ts` (component + its types).
- **Styling:** `styled.<el>` with transient `$props`; tokens from `theme`
  (`colors`, `radii`, `space`, `font`, `shadow`, `easing`). Borders `2px solid
  colors.border`. Focus surfaces use `shadow.stamp`. Transitions `80ms
  easing.out`. No gradients, no blur shadows, no new color/size literals beyond
  what existing components already use.
- **Icons:** `lucide-react` (`Check`, `X`, `ChevronDown/Up/Left/Right`,
  `Calendar`, `UploadCloud`, `Search`, `File`).
- **IDs:** `useId()` (SSR-safe, deterministic for tests).
- **Controlled/uncontrolled:** when a `value`-style prop is provided the
  component is controlled; otherwise it self-manages, seeded by `defaultValue`.
- **Floating:** `@floating-ui/react` (`useFloating` + `offset`/`flip`/`shift`/
  `size`, `FloatingPortal`, `useDismiss`, `useRole`, `useListNavigation`,
  `useInteractions`, `autoUpdate`) — mirror `Popover.tsx` / `DropdownMenu.tsx`.
- **Tests:** `bun:test` + `@testing-library/react` + `@testing-library/user-event`,
  `renderWithTheme` from `test/util`, `afterEach(cleanup)`, `waitFor` for async
  floating UI. Assert behavior + ARIA roles, not styles.
- **a11y first** — matches the repo's recent a11y commits.

## Shared internal: calendar

DatePicker and DateRangePicker share month math + grid rendering. Extract a
non-exported module `src/components/internal/calendar.tsx`:

- Pure helpers: `startOfMonth`, `addMonths`, `daysInMonth`, `isSameDay`,
  `isBefore`/`isAfter`, `clampToRange`, `buildMonthMatrix(date, weekStartsOn)` →
  `(Date|null)[][]` (6 rows × 7), `WEEKDAY_LABELS(weekStartsOn)`.
- Internal `<MonthGrid>` component: renders one month (header label, weekday
  row, day buttons) with `role="grid"`/`gridcell`. Props let the parent decide
  per-day state (selected / in-range / disabled / today / outside-month) and
  handle clicks + keyboard. No date library dependency.

Not exported from `index.ts`; consumed only by DatePicker + DateRangePicker.

---

## 1. Combobox

Searchable/typeahead select. `multiple` discriminant switches single ↔ multi.
Strict (input filters only; committed value is always an option). Sync options.

```tsx
export interface ComboboxOption { value: string; label: string; disabled?: boolean }
interface ComboboxBaseProps {
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  filter?: (opt: ComboboxOption, query: string) => boolean; // default: case-insensitive substring on label
  emptyText?: string;                                        // "No results"
  id?: string;
}
interface SingleComboboxProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string | null; defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}
interface MultiComboboxProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[]; defaultValue?: string[];
  onChange?: (value: string[]) => void;
}
export type ComboboxProps = SingleComboboxProps | MultiComboboxProps;
```

**Anatomy:** control wrapper (styled like `baseInput`, `:focus-within` →
`shadow.stamp`) holding chips (multi, reuse `Tag` + `onRemove`) + input
(`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`,
`aria-autocomplete="list"`) + `ChevronDown` + clear `X` (when `clearable` and a
value exists). Floating listbox (`role="listbox"`, portal, `size` middleware
matches width) of options (`role="option"`, `aria-selected`; active →
`primarySoft`; selected → bold + `Check`; disabled → faded, skipped). Empty row
shows `emptyText`.

**Behavior:** open on focus/click/type/ArrowDown; close on Esc/outside/Tab (and
on select for single). Filter via `filter`. Virtual nav (`useListNavigation
{ virtual: true, loop: true }`) — focus stays in input. Arrow↑↓ move active,
Home/End jump, Enter selects, Esc clears query then closes. Single: select sets
input to label + `onChange(value)` + close. Multi: toggle in array, stay open,
clear query, chips + Backspace-on-empty removes last. Strict revert: single
input resets to selected label on close. Clear resets to `null`/`[]`.

**Tests:** closed by default; opens; filters; empty row; arrow nav +
activedescendant; Enter/click select (single + multi); multi chip remove +
backspace; clearable; Esc/outside close; disabled cannot open; strict revert;
ARIA roles + `aria-expanded`.

## 2. DataTable

Generic `function DataTable<T>(props)`. Composes Table primitives + Checkbox +
Pagination.

```tsx
export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;          // default String(row[key])
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;    // default row[key]
  align?: 'left' | 'right' | 'center';
  width?: string;
}
export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selectedKeys?: string[]; defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  pageSize?: number;                              // enables internal pagination
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  onSortChange?: (sort: { key: string; dir: 'asc' | 'desc' } | null) => void;
  emptyText?: React.ReactNode;                    // "No data"
  caption?: string;
}
```

**Anatomy:** existing `Table/THead/TBody/Tr/Th/Td`. Sortable `Th` is a button
showing `ChevronUp`/`ChevronDown` for active sort. `selectable` adds a leading
column: header `Checkbox` (checked when all rows selected, `indeterminate` when
partial) + per-row `Checkbox`. Footer row hosts `Pagination` when `pageSize`
set. Empty → single full-width cell with `emptyText`.

**Behavior:** client-side sort, header click cycles asc → desc → none
(`onSortChange`). Selection controlled/uncontrolled (`onSelectionChange` with
the key list). Internal pagination slices sorted data by `pageSize`; select-all
applies to the current page's rows. `align`/`width` per column.

**Tests:** renders rows/cells; sort toggles order + indicator + fires
`onSortChange`; select row + select-all (indeterminate) fire
`onSelectionChange`; pagination slices + page change; empty state;
`caption`.

## 3. DatePicker

```tsx
export interface DatePickerProps {
  value?: Date | null; defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  min?: Date; max?: Date;
  placeholder?: string;                  // "Select date"
  disabled?: boolean; clearable?: boolean;
  format?: (date: Date) => string;       // default toLocaleDateString
  weekStartsOn?: 0 | 1;                  // default 0
  id?: string;
}
```

**Anatomy:** trigger button (formatted date or placeholder + `Calendar` icon;
styled like `DropdownMenu` `TriggerButton`) → floating popover (portal) with a
`MonthGrid`: header (`ChevronLeft`/`ChevronRight` to change month + month-year
label), weekday row, 6×7 day buttons. Selected day → `primary` bg; today →
bold + ring; outside-month → muted; `<min`/`>max` → disabled. Optional clear
`X`.

**Behavior:** open on trigger; pick day → `onChange(date)` + close. Keyboard in
grid: arrows move by day/week, PageUp/Down change month, Enter/Space select,
Esc close. `role="grid"`/`gridcell`, roving focus. Clamp navigation to
`min`/`max`.

**Tests:** trigger opens grid; renders correct days for a month; clicking a day
fires `onChange` + closes; prev/next month nav; min/max disables days;
clearable; Esc closes; ARIA grid roles.

## 4. Command (⌘K palette)

```tsx
export interface CommandItem {
  id: string; label: string;
  keywords?: string[]; icon?: React.ReactNode;
  group?: string; shortcut?: string;
  onSelect: () => void; disabled?: boolean;
}
export interface CommandProps {
  open: boolean; onClose: () => void;
  items: CommandItem[];
  placeholder?: string;                  // "Type a command…"
  emptyText?: string;                    // "No results"
  filter?: (item: CommandItem, query: string) => boolean; // default: label + keywords substring
}
```

**Anatomy:** modal overlay (same `colors.overlay` + fade as `Modal`) → panel
(surface, 2px border, `shadow.stampLg`, `radii.lg`) with: search row
(`Search` icon + autofocused input, `role="combobox"`), divider, scrollable
list (`role="listbox"`) grouped by `group` (group label headers), each item
`role="option"` (icon + label + right-aligned `shortcut`), active →
`primarySoft`, disabled skipped. Empty row shows `emptyText`.

**Behavior:** consumer controls `open` (binds ⌘K itself — documented). Type to
filter (label + keywords). Arrow↑↓ move active (skip disabled, loop), Enter
fires `item.onSelect()` + `onClose()`, Esc/outside closes. `aria-activedescendant`
virtual nav, focus stays in input. Resets query on close.

**Tests:** hidden when `open=false`; shows items when open; filters by
label/keyword; arrow nav; Enter fires onSelect + onClose; Esc closes; groups
render; disabled item skipped.

## 5. FileUpload (Dropzone)

```tsx
export interface FileUploadProps {
  value?: File[]; defaultValue?: File[];
  onChange?: (files: File[]) => void;
  accept?: string; multiple?: boolean;   // default false
  maxSize?: number;                      // bytes
  maxFiles?: number;
  disabled?: boolean;
  onReject?: (rejections: { file: File; reason: string }[]) => void;
  label?: React.ReactNode;               // dropzone prompt
  id?: string;
}
```

**Anatomy:** dropzone (`role="button"`, `tabIndex=0`, 2px border, `radii.md`;
drag-over → `primarySoft` bg + `shadow.stamp`) with `UploadCloud` icon + prompt;
hidden real `<input type="file">` (click/Enter/Space opens picker). Below: file
list, one row per file (name + humanized size + remove `X`, styled like a `Tag`
row).

**Behavior:** click/keyboard/drop add files; validate `accept`, `maxSize`,
`maxFiles`, `multiple` → accepted go to value (`onChange`), rejected →
`onReject` with reason. Remove drops a file. Drag handlers
(`dragenter/over/leave/drop`) toggle drag state; `preventDefault` to enable drop.
Disabled blocks all.

**Tests:** renders prompt; selecting via input fires `onChange`; respects
`multiple` (single replaces); `maxSize`/`maxFiles`/`accept` reject → `onReject`;
remove drops file; drag-over state; disabled blocks. (Use `userEvent.upload`.)

## 6. TreeView

```tsx
export interface TreeNode {
  id: string; label: React.ReactNode;
  icon?: React.ReactNode; children?: TreeNode[]; disabled?: boolean;
}
export interface TreeViewProps {
  nodes: TreeNode[];
  expandedIds?: string[]; defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string | null; defaultSelectedId?: string | null;
  onSelect?: (id: string) => void;
  id?: string;
}
```

**Anatomy:** `role="tree"`; recursive items `role="treeitem"` with
`aria-expanded` (branches), `aria-selected`, `aria-level`. Indent by
`space[4] * level`. Branch toggle = `ChevronRight` rotating to down when
expanded. Optional per-node `icon`. Selected → `primarySoft` bg; disabled →
faded, not selectable.

**Behavior:** click chevron toggles expand (`onExpandedChange`); click label
selects (`onSelect`). Roving `tabindex`. Keyboard: ↑/↓ move through *visible*
items, → expand or enter first child, ← collapse or go to parent, Enter/Space
select, Home/End first/last visible. Controlled/uncontrolled expansion +
selection.

**Tests:** renders roots; expand/collapse via chevron toggles children +
`aria-expanded`; select fires `onSelect` + `aria-selected`; keyboard nav
(↑↓→←); disabled node not selectable; ARIA `tree`/`treeitem`/`aria-level`.

## 7. TagInput

Free-form token entry (distinct from Combobox-multi: no preset options).

```tsx
export interface TagInputProps {
  value?: string[]; defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string; disabled?: boolean;
  max?: number;
  validate?: (tag: string) => boolean;
  allowDuplicates?: boolean;             // default false
  delimiters?: string[];                 // default ['Enter', ',']
  id?: string;
}
```

**Anatomy:** wrapper styled like `baseInput` (`:focus-within` → `shadow.stamp`),
`role="group"`, renders `Tag` chips (with `onRemove`) + inline transparent
input.

**Behavior:** typing + a delimiter (Enter or `,`) commits the trimmed token;
rejects empty, over-`max`, failing `validate`, or duplicate (unless
`allowDuplicates`). Backspace on empty input removes the last tag. `onChange`
on every mutation. Disabled blocks input + removal.

**Tests:** type + Enter adds; comma adds; empty rejected; duplicate rejected
(and allowed when `allowDuplicates`); `max` enforced; `validate` rejects;
Backspace removes last; chip remove; disabled blocks.

## 8. DateRangePicker

```tsx
export interface DateRange { start: Date | null; end: Date | null }
export interface DateRangePickerProps {
  value?: DateRange; defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  min?: Date; max?: Date;
  placeholder?: string; disabled?: boolean; clearable?: boolean;
  weekStartsOn?: 0 | 1;
  format?: (date: Date) => string;
  id?: string;
}
```

**Anatomy:** trigger button (`start – end` or placeholder + `Calendar`) →
popover with **two** side-by-side `MonthGrid`s (current + next month). In-range
days → `primarySoft` band; start/end endpoints → `primary` bg. Optional clear.

**Behavior:** first click sets `start` (clears `end`); second click ≥ start sets
`end` → `onChange({start,end})`; second click < start restarts from that day.
Hover preview of range (optional, nice-to-have). Prev/next shift both months.
Clamp to `min`/`max`. Reuses `MonthGrid` + calendar helpers.

**Tests:** trigger opens dual grid; first/second click builds range + fires
`onChange`; second-before-first restarts; in-range styling applied; month nav
shifts both; clearable; Esc closes.

---

## Integration

- `src/index.ts` — export all 8 components + their public types.
- `README.md` — add to component lists: **Form** (Combobox, TagInput,
  FileUpload), **Display** (DataTable, TreeView), **Overlays/pickers**
  (DatePicker, DateRangePicker, Command).
- `example/src/Gallery.tsx` — a demo block per component (Combobox single +
  multi; DataTable with sort/select/paginate sample; DatePicker;
  DateRangePicker; Command behind a button; FileUpload; TreeView; TagInput).

## Build order (dependencies)

1. `internal/calendar.tsx` first (DatePicker + DateRangePicker depend on it).
2. The 8 components (independent files; DatePicker/DateRangePicker import the
   internal calendar).
3. Integration files (`index.ts`, `README.md`, `Gallery.tsx`) last.
4. Verify: `bun run typecheck` + `bun test` green; then adversarial review.

## Out of scope (v1, all components)

Async/remote data, virtualization for huge lists, option groups in Combobox,
i18n/locale calendars beyond `toLocaleDateString`, time-of-day selection,
multi-level selection in TreeView, range hover-preview polish if it complicates
keyboard support.
