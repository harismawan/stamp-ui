# stamp-ui — usage guide

Component reference for [`@harismawan/stamp-ui`](https://github.com/harismawan/stamp-ui) — a
stamp-aesthetic React component library (chunky 2px borders, hard offset shadows, flat
fills, no gradients). Every example below is copy-paste TypeScript and is compile-checked
against the current source.

## Install

```bash
bun add @harismawan/stamp-ui
# peer deps (provide your own single shared instance of each):
bun add react react-dom styled-components
```

## At a glance

- Wrap your app **once** in `<StampProvider>` — it sets up the theme and global styles.
- Import everything from the package root: `import { Button, Card } from '@harismawan/stamp-ui'`.
- Style-only props are **transient** (`$`-prefixed — e.g. `$variant`, `$gap`, `$size`) and are
  never forwarded to the DOM.
- Components are **controlled** when you pass `value` / `open` / `selectedKeys` etc., and
  **uncontrolled** (self-managing) when you pass only the matching `defaultValue`.
- Spacing / radius / color props on layout primitives are keyed to theme tokens
  (`theme.space`, `theme.radii`, `theme.colors`).

```tsx
import { StampProvider, Button } from '@harismawan/stamp-ui';

export function App() {
  return (
    <StampProvider mode="light">
      <Button $variant="primary">Hello stamp-ui</Button>
    </StampProvider>
  );
}
```

## Contents

- [Setup & theming](#setup--theming) · [Hooks](#hooks)
- [Form](#form) · [Form — advanced inputs](#form--advanced-inputs)
- [Display & data](#display--data)
- [Overlays & feedback](#overlays--feedback)
- [Disclosure & navigation](#disclosure--navigation)
- [Date pickers](#date-pickers) · [Layout](#layout)

> All examples assume your app is wrapped in `<StampProvider>` and that imports come from
> `@harismawan/stamp-ui`. Where a `React.useState` hook appears, `import * as React from 'react'`.

---

---

## Setup & theming

Wrap your app once in `<StampProvider>`. It injects `<GlobalStyles>` and a styled-components `ThemeProvider`, so every Stamp component below it picks up the theme automatically. With no props it follows the persisted `useThemeStore` mode (defaults to `"light"`); pass `mode` to force one, or `theme` to override tokens.

```tsx
import { StampProvider } from "@harismawan/stamp-ui";

function App() {
  return (
    <StampProvider>
      <YourApp />
    </StampProvider>
  );
}
```

Props: `mode?: "light" | "dark"` (when omitted, uses the persisted `useThemeStore` mode), `theme?: Partial<Theme>` (shallow-merged over the base theme and takes precedence over `mode`), `children` (required).

### StampProvider

The root provider. Supplies theme tokens + global CSS to the whole tree. Place it once, as high as possible in your app.

```tsx
import { StampProvider } from "@harismawan/stamp-ui";

export function Root({ children }: { children: React.ReactNode }) {
  // Force dark mode regardless of the persisted store value.
  return <StampProvider mode="dark">{children}</StampProvider>;
}
```

Props: `mode?: "light" | "dark"`, `theme?: Partial<Theme>`, `children: ReactNode` (required).

### lightTheme / darkTheme / Theme

The two built-in themes plus the `Theme` contract. A theme has `mode`, `colors`, `radii`, `space`, `font`, `shadow`, and `easing`. To customize, pass a `Partial<Theme>` to `StampProvider`; it is shallow-merged over the active base theme, so override whole top-level groups (e.g. provide a full `colors` object).

```tsx
import { StampProvider, lightTheme, type Theme } from "@harismawan/stamp-ui";

const brandTheme: Partial<Theme> = {
  colors: { ...lightTheme.colors, primary: "#7C3AED", primaryHover: "#6D28D9" },
};

export function Themed({ children }: { children: React.ReactNode }) {
  return (
    <StampProvider mode="light" theme={brandTheme}>
      {children}
    </StampProvider>
  );
}
```

Props/types: `lightTheme` and `darkTheme` are `Theme` objects. `Theme` = `{ mode: string; colors: Record<...,string>; radii; space; font; shadow; easing }`. The shallow merge is one level deep, so when overriding `colors` spread the base (`...lightTheme.colors`) to keep the other tokens.

### GlobalStyles

Resets/base CSS (fonts, box-sizing, body background from the theme). `StampProvider` already renders it, so you rarely mount it yourself — only do so if you build a custom provider directly on styled-components' `ThemeProvider`.

```tsx
import { GlobalStyles, lightTheme } from "@harismawan/stamp-ui";
import { ThemeProvider } from "styled-components";

export function CustomProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
```

Props: none — render it once inside a styled-components `ThemeProvider`.

## Hooks

### useThemeStore

Persisted (localStorage, key `stamp-ui-theme`) Zustand store for the active color mode. Use it for a theme toggle. Selecting a slice (e.g. `(s) => s.mode`) avoids unnecessary re-renders.

```tsx
import { Button, useThemeStore } from "@harismawan/stamp-ui";

function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);
  return <Button onClick={toggle}>Switch to {mode === "light" ? "dark" : "light"}</Button>;
}
```

Returns (store state): `mode: "light" | "dark"`, `setMode: (mode: ThemeMode) => void`, `toggle: () => void`. Note: when `StampProvider` is given no `mode` prop, it reads this store, so `toggle()`/`setMode()` re-theme the whole app.

### useDisclosure

Boolean open/close state helper for overlays. Pairs naturally with `Modal` and `Drawer`.

```tsx
import { Button, Modal, useDisclosure } from "@harismawan/stamp-ui";

function ConfirmExample() {
  const { isOpen, open, close } = useDisclosure();
  return (
    <>
      <Button onClick={open}>Open modal</Button>
      <Modal open={isOpen} onClose={close} title="Delete item?">
        <p>This cannot be undone.</p>
        <Button $variant="danger" onClick={close}>Delete</Button>
      </Modal>
    </>
  );
}
```

Signature: `useDisclosure(initial = false)`. Returns `{ isOpen: boolean; open: () => void; close: () => void; toggle: () => void; setOpen: (v: boolean) => void }` (`UseDisclosureReturn`).

### useClickOutside

Calls a handler when a pointer event fires outside the referenced element. Common for closing custom dropdowns/popovers.

```tsx
import { useClickOutside, useDisclosure } from "@harismawan/stamp-ui";

function Dropdown() {
  const { isOpen, toggle, close } = useDisclosure();
  const ref = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, close, isOpen);
  return (
    <div ref={ref}>
      <button onClick={toggle}>Menu</button>
      {isOpen && <div role="menu">Item</div>}
    </div>
  );
}
```

Signature: `useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, handler: (e: MouseEvent | TouchEvent) => void, enabled = true)`. Listens on `mousedown`/`touchstart`; pass `enabled` to switch the listener off (e.g. only while open).

---

## Form

### Button

A clickable action element. Variants and sizes are set through styled-components transient props (`$`-prefixed) so they do not leak onto the DOM. Use it for any action trigger.

```tsx
<HStack $gap={8}>
  <Button onClick={() => save()}>Save</Button>
  <Button $variant="outline">Cancel</Button>
  <Button $variant="ghost" $size="sm">Skip</Button>
  <Button $variant="danger" $full>Delete</Button>
</HStack>
```

Props: `$variant?: 'primary' | 'ghost' | 'outline' | 'danger'` (default `'primary'`), `$size?: 'sm' | 'md' | 'lg'` (default `'md'`), `$full?: boolean` (full width). Renders a `<button>` (default `type="button"`); accepts all native button props (`onClick`, `disabled`, etc.).

### Input, Select, Textarea, FieldWrap, FieldLabel, FieldError

The field composition primitives. `Input`/`Select`/`Textarea` are styled native form controls. `FieldWrap` is a `<label>` column that groups a `FieldLabel`, a control, and an optional `FieldError` message. Compose them for a labelled, validated field.

```tsx
function ContactField() {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('user');
  const [bio, setBio] = React.useState('');
  const invalid = email.length > 0 && !email.includes('@');
  return (
    <>
      <FieldWrap>
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {invalid && <FieldError>Enter a valid email address.</FieldError>}
      </FieldWrap>

      <FieldWrap>
        <FieldLabel>Role</FieldLabel>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
      </FieldWrap>

      <FieldWrap>
        <FieldLabel>Bio</FieldLabel>
        <Textarea
          placeholder="Tell us about yourself"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </FieldWrap>
    </>
  );
}
```

Props: `Input`, `Select`, and `Textarea` are styled wrappers over `<input>`, `<select>`, and `<textarea>` and take all the respective native props (`value`, `onChange`, `placeholder`, `type`, `disabled`, ...). `FieldWrap` (a `<label>`), `FieldLabel` (a `<span>`), and `FieldError` (a `<span>`) are layout/text elements that take their native props plus `children`.

### NumberInput

An integer-only text input that masks the value with a thousands separator (default `.`). Decimals are intentionally dropped. Use it for counts, prices in whole units, or any grouped integer entry.

```tsx
function AmountField() {
  const [amount, setAmount] = React.useState('1000000');
  return (
    <NumberInput
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="0"
    />
  );
}
```

Props: `value?: string | number`, `onChange?: (e: { target: { value: string } }) => void` (emits the raw, unformatted integer-digit string), `thousandSep?: string` (default `'.'`), `decimalSep?: string` (default `','`). Also accepts native `<input>` props except `value`/`onChange`.

### Checkbox

A controlled checkbox with an optional label. Supports an `indeterminate` "mixed" state (e.g. a select-all header) that shows a dash while `checked` is `false`.

```tsx
function TermsCheckbox() {
  const [agree, setAgree] = React.useState(false);
  return (
    <>
      <Checkbox label="I agree to the terms" checked={agree} onChange={setAgree} />
      <Checkbox label="Select all" checked={false} indeterminate onChange={() => {}} />
    </>
  );
}
```

Props: `checked: boolean` (required), `onChange: (checked: boolean) => void` (required), `label?: string`, `indeterminate?: boolean` (default `false`; only renders while `checked` is `false`), `disabled?: boolean`. Also accepts native `<input>` props except `type`/`onChange`.

### Radio + RadioGroup

A single-choice group. `RadioGroup` owns the selected `value` and renders `Radio` children, each of which must live inside a `RadioGroup` (it reads selection from context).

```tsx
function PlanPicker() {
  const [plan, setPlan] = React.useState('free');
  return (
    <RadioGroup name="plan" value={plan} onChange={setPlan}>
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" disabled />
    </RadioGroup>
  );
}
```

Props: `RadioGroup` — `name: string` (required), `value: string` (required), `onChange: (value: string) => void` (required), `children` (required). `Radio` — `value: string` (required), `label: string` (required), `disabled?: boolean`.

### Switch

A controlled on/off toggle (role `switch`) with an optional label. Use it for immediate-effect boolean settings.

```tsx
function NotificationsSwitch() {
  const [on, setOn] = React.useState(true);
  return <Switch label="Email notifications" checked={on} onChange={setOn} />;
}
```

Props: `checked: boolean` (required), `onChange: (checked: boolean) => void` (required), `label?: string`, `disabled?: boolean`. Also accepts native `<input>` props except `type`/`onChange`/`role`.

### Slider

A controlled range slider that emits a number. Use it for bounded numeric selection.

```tsx
function VolumeSlider() {
  const [volume, setVolume] = React.useState(40);
  return <Slider value={volume} onChange={setVolume} min={0} max={100} step={5} />;
}
```

Props: `value: number` (required), `onChange: (value: number) => void` (required), `min?: number` (default `0`), `max?: number` (default `100`), `step?: number` (default `1`), `disabled?: boolean`.

### ColorPicker (+ DEFAULT_SWATCHES)

A swatch grid for picking a hex color. Defaults to the exported `DEFAULT_SWATCHES` palette; pass `swatches` to supply your own.

```tsx
function BrandColor() {
  const [color, setColor] = React.useState('#3B82F6');
  return (
    <ColorPicker value={color} onChange={setColor} swatches={DEFAULT_SWATCHES} />
  );
}
```

Props: `value?: string` (currently selected hex), `onChange: (hex: string) => void` (required), `swatches?: string[]` (default `DEFAULT_SWATCHES`).

### IconPicker (+ DEFAULT_ICONS)

A tile grid for picking a [lucide](https://lucide.dev) icon by name. Defaults to the exported `DEFAULT_ICONS` set; pass `icons` to supply your own list of lucide icon names.

```tsx
function CategoryIcon() {
  const [icon, setIcon] = React.useState('Star');
  return <IconPicker value={icon} onChange={setIcon} icons={DEFAULT_ICONS} />;
}
```

Props: `value?: string` (selected lucide icon name), `onChange: (name: string) => void` (required), `icons?: string[]` (default `DEFAULT_ICONS`).

---

## Form — advanced inputs

### Combobox

A filterable select with a typeahead input and floating listbox. Supports single selection (returns `string | null`) and multi selection (returns `string[]`, rendering chosen options as removable tags). Pass `clearable` to show a clear button.

```tsx
import { Combobox, type ComboboxOption } from "@harismawan/stamp-ui";

const fruitOptions: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date", disabled: true },
];

function FruitPickers() {
  const [fruit, setFruit] = React.useState<string | null>("apple");
  const [fruits, setFruits] = React.useState<string[]>(["apple", "cherry"]);
  return (
    <>
      {/* Single select */}
      <Combobox
        options={fruitOptions}
        value={fruit}
        onChange={setFruit}
        placeholder="Pick a fruit"
        clearable
      />
      {/* Multi select */}
      <Combobox
        multiple
        options={fruitOptions}
        value={fruits}
        onChange={setFruits}
        placeholder="Pick fruits"
      />
    </>
  );
}
```

Props: `options: ComboboxOption[]` (required; each `{ value: string; label: string; disabled?: boolean }`). Single mode: `value?: string | null`, `defaultValue?: string | null`, `onChange?: (value: string | null) => void`. Multi mode: set `multiple: true` then `value?: string[]`, `defaultValue?: string[]`, `onChange?: (value: string[]) => void`. Shared: `placeholder?: string`, `clearable?: boolean` (default `false`), `disabled?: boolean` (default `false`), `filter?: (opt: ComboboxOption, query: string) => boolean` (default case-insensitive substring on `label`), `emptyText?: string` (default `"No results"`), `id?: string`.

### TagInput

A free-form token input. The user types and presses a delimiter key (Enter or comma by default) to commit each tag; tags render as removable chips and Backspace on an empty field removes the last one.

```tsx
import { TagInput } from "@harismawan/stamp-ui";

function Tags() {
  const [tags, setTags] = React.useState<string[]>(["react", "typescript"]);
  return (
    <TagInput
      value={tags}
      onChange={setTags}
      placeholder="Add a tag"
      max={5}
      validate={(tag) => tag.length >= 2}
    />
  );
}
```

Props: `value?: string[]` / `defaultValue?: string[]`, `onChange?: (tags: string[]) => void`, `placeholder?: string`, `disabled?: boolean` (default `false`), `max?: number` (cap the number of tags), `validate?: (tag: string) => boolean` (reject tags that return `false`), `allowDuplicates?: boolean` (default `false`), `delimiters?: string[]` (default `['Enter', ',']`), `groupLabel?: string` (default `'Tags'`), `aria-label?: string` (default `'Add tags'`), `id?: string`.

### FileUpload

A drag-and-drop dropzone (also click-to-browse) that validates files by type, size, and count, lists accepted files with humanized sizes, and reports rejects via `onReject`. The `formatFileSize` helper turns a byte count into a `B`/`KB`/`MB` string.

```tsx
import {
  FileUpload,
  formatFileSize,
  type FileUploadRejection,
} from "@harismawan/stamp-ui";

function Uploader() {
  const [files, setFiles] = React.useState<File[]>([]);
  const handleReject = (rejections: FileUploadRejection[]) => {
    rejections.forEach((r) => console.warn(r.file.name, r.reason));
  };
  return (
    <>
      <FileUpload
        value={files}
        onChange={setFiles}
        multiple
        accept="image/*,.pdf"
        maxSize={5 * 1024 * 1024}
        maxFiles={3}
        onReject={handleReject}
      />
      <p>Max per file: {formatFileSize(5 * 1024 * 1024)}</p>
    </>
  );
}
```

Props: `value?: File[]` / `defaultValue?: File[]` (default `[]`), `onChange?: (files: File[]) => void`, `accept?: string` (e.g. `"image/*,.pdf"`), `multiple?: boolean` (default `false`; in single mode a new file replaces the current one), `maxSize?: number` (bytes per file), `maxFiles?: number` (max held at once), `disabled?: boolean` (default `false`), `onReject?: (rejections: FileUploadRejection[]) => void` where each rejection is `{ file: File; reason: FileUploadRejectReason }` and `FileUploadRejectReason` is `'too-large' | 'too-many' | 'wrong-type'`, `label?: React.ReactNode` (default `"Drag files here or click to browse"`), `id?: string`. Helper: `formatFileSize(bytes: number): string`.

---

## Display & data

### Card

A bordered, stamped surface for grouping related content. `CardTitle` is an uppercase muted label and `CardValue` is a large mono numeric display, ideal for KPIs.

```tsx
<Card $hover>
  <CardTitle>Balance</CardTitle>
  <CardValue>1.000.000</CardValue>
</Card>
```

Props (`Card`): `$hover?: boolean` (lift + pointer on hover), `$accent?: boolean` (primary background), `$flat?: boolean` (no shadow). `Card`, `CardTitle`, and `CardValue` are styled `div`s and accept all native `div` props. All visual props are optional.

### Badge

A small pill label for statuses and counts.

```tsx
<Badge $variant="success">Paid</Badge>
```

Props: `$variant?: BadgeVariant` (`'primary' | 'neutral' | 'success' | 'danger' | 'warning'`, default `'neutral'`), `children: React.ReactNode` (required). Extends native `span` props.

### Tag

A removable chip. Passing `onRemove` renders a close button.

```tsx
<Tag onRemove={() => console.log('removed')}>react</Tag>
```

Props: `children: React.ReactNode` (required), `onRemove?: () => void` (omit for a non-removable tag). Extends native `span` props.

### Avatar / AvatarGroup

A circular user avatar that shows an image when `src` is set, otherwise the initials of `name`. `AvatarGroup` overlaps children and collapses overflow past `max` into a `+N` badge.

```tsx
<>
  <Avatar name="Haris Mawan" size={40} />
  <AvatarGroup max={2}>
    <Avatar name="Alice Brown" />
    <Avatar name="Carol Diaz" />
    <Avatar name="Eve Fox" />
  </AvatarGroup>
</>
```

Props (`Avatar`): `name: string` (required, also used as alt text/initials), `src?: string`, `size?: number` (default `40`). Props (`AvatarGroup`): `max?: number` (default `3`), `children: React.ReactNode` (required).

### Stat

A labelled metric with an optional colored delta indicator (arrow up = income/green, down = expense/red).

```tsx
<Stat label="Net worth" value="12.500.000" delta={4.2} deltaType="up" />
```

Props: `label: string` (required), `value: React.ReactNode` (required), `delta?: number` (omit to hide the indicator), `deltaType?: StatDeltaType` (`'up' | 'down' | 'auto'`, default `'auto'` — direction inferred from the sign of `delta`).

### EmptyState

A centered placeholder for empty lists or zero-result screens, with an optional icon and action.

```tsx
<EmptyState
  icon={<span aria-hidden="true">📭</span>}
  title="Nothing here yet"
  description="Add your first item to get started."
  action={<Button>Add item</Button>}
/>
```

Props: `title: React.ReactNode` (required), `icon?: React.ReactNode`, `description?: React.ReactNode`, `action?: React.ReactNode`. Extends native `div` props (except `title`).

### Divider

A separator line. Horizontal by default; pass `label` for a centered captioned rule, or `orientation="vertical"` for a vertical rule inside a flex row.

```tsx
<Divider label="Today" />
```

Props: `orientation?: 'horizontal' | 'vertical'` (default `'horizontal'`), `label?: string` (horizontal only). Extends native `div` props.

### Progress

A horizontal progress bar. The fill width is `value / max`, clamped to the track.

```tsx
<Progress value={60} label="Uploading" $variant="primary" />
```

Props: `value: number` (required), `max?: number` (default `100`), `$variant?: ProgressVariant` (`'primary' | 'success' | 'danger'`, default `'primary'`), `label?: string` (also used as the accessible label). Extends native `div` props (except `role`).

### Spinner

An animated loading indicator with a `role="status"` accessible label.

```tsx
<Spinner size={24} label="Loading" />
```

Props: `size?: number` (default `18`), `thickness?: number` (default `3`), `label?: string` (default `'Loading'`). Extends native `span` props.

### Skeleton / SkeletonText / SkeletonCircle / SkeletonGroup

Shimmer placeholders for loading content. `Skeleton` is a single bar, `SkeletonCircle` an avatar-shaped block, `SkeletonText` renders `lines` stacked bars (last one shortened), and `SkeletonGroup` is the announcing (`role="status"`) container you nest custom placeholders in.

```tsx
<SkeletonGroup $gap="12px" $label="Loading profile">
  <SkeletonCircle $size={48} />
  <Skeleton $w="60%" $h="18px" $r="md" />
  <SkeletonText lines={3} />
</SkeletonGroup>
```

Props (`Skeleton`): `$w?: string` (default `'100%'`), `$h?: string` (default `'14px'`), `$r?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pill'` (default `'sm'`). `SkeletonCircle`: `$size?: number` (default `40`). `SkeletonText`: `lines?: number` (default `3`), `$label?: string`. `SkeletonGroup`: `$gap?: string`, `$label?: string` (default `'Loading'`).

### Table + THead + TBody + Tr + Th + Td

Styled raw table primitives. Compose them exactly like native `<table>` markup when you want full control over rendering. For sorting/selection/pagination use `DataTable` instead.

```tsx
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
      <Td>25.000</Td>
    </Tr>
    <Tr>
      <Td>Lunch</Td>
      <Td>60.000</Td>
    </Tr>
  </TBody>
</Table>
```

Props: each is a styled native table element (`table`, `thead`, `tbody`, `tr`, `th`, `td`) and accepts all the corresponding native props (e.g. `colSpan`, `style`). No custom props.

### DataTable

A generic, sortable table with optional row selection and client-side pagination. Define typed `columns` and a `rowKey`; sorting and selection are managed internally but every change is reported via callbacks (selection can also be controlled with `selectedKeys`).

```tsx
interface Person { id: string; name: string; age: number; city: string }

const data: Person[] = [
  { id: '1', name: 'Alice', age: 30, city: 'Jakarta' },
  { id: '2', name: 'Bob', age: 24, city: 'Bandung' },
  { id: '3', name: 'Carol', age: 41, city: 'Surabaya' },
];

const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true, align: 'right' },
  { key: 'city', header: 'City', render: (p) => p.city.toUpperCase() },
];

function People() {
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(p) => p.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={setSelected}
      pageSize={10}
      defaultSort={{ key: 'name', dir: 'asc' }}
      caption="People"
    />
  );
}
```

Props: `columns: DataTableColumn<T>[]` (required), `data: T[]` (required), `rowKey: (row: T) => string` (required), `selectable?: boolean` (default `false`), `selectedKeys?: string[]` / `defaultSelectedKeys?: string[]` / `onSelectionChange?: (keys: string[]) => void`, `pageSize?: number` (enables pagination), `defaultSort?: DataTableSort` (`{ key: string; dir: 'asc' | 'desc' }`), `onSortChange?: (sort: DataTableSort | null) => void`, `emptyText?: React.ReactNode` (default `'No data'`), `caption?: string`. A `DataTableColumn<T>` has `key: string`, `header: React.ReactNode`, and optional `render?: (row: T) => React.ReactNode`, `sortable?`, `sortAccessor?: (row: T) => string | number`, `align?: 'left' | 'right' | 'center'`, `width?: string`.

### TreeView

A keyboard-navigable, accessible (`role="tree"`) hierarchy. Provide `nodes` (a recursive `TreeNode[]`). Expansion and selection are uncontrolled by default (`defaultExpandedIds` / `defaultSelectedId`) but can be controlled via `expandedIds` / `selectedId` plus their change handlers.

```tsx
const nodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'index', label: 'index.ts' },
      {
        id: 'components',
        label: 'components',
        children: [{ id: 'button', label: 'Button.tsx' }],
      },
    ],
  },
  { id: 'readme', label: 'README.md', disabled: true },
];

function FileTree() {
  const [selected, setSelected] = React.useState<string | null>(null);
  return (
    <TreeView
      nodes={nodes}
      defaultExpandedIds={['src', 'components']}
      selectedId={selected}
      onSelect={setSelected}
    />
  );
}
```

Props: `nodes: TreeNode[]` (required), `expandedIds?: string[]` / `defaultExpandedIds?: string[]` / `onExpandedChange?: (ids: string[]) => void`, `selectedId?: string | null` / `defaultSelectedId?: string | null` / `onSelect?: (id: string) => void`, `id?: string`. A `TreeNode` has `id: string`, `label: React.ReactNode`, and optional `icon?: React.ReactNode`, `children?: TreeNode[]`, `disabled?: boolean`.

---

## Overlays & feedback

### Modal

A centered, focus-trapped dialog rendered on top of an overlay. Use it for focused tasks or details that interrupt the main flow. Pairs nicely with `useDisclosure` for open/close state. Clicking the overlay or pressing `Escape` calls `onClose`.

```tsx
function Example() {
  const { isOpen, open, close } = useDisclosure();
  return (
    <>
      <Button onClick={open}>Open modal</Button>
      <Modal open={isOpen} onClose={close} title="Edit profile" size="md">
        <p>Modal body content goes here.</p>
      </Modal>
    </>
  );
}
```

Props: `open: boolean` (required), `onClose?: () => void`, `title?: React.ReactNode`, `size?: 'sm' | 'md' | 'lg'` (default `'md'`), `children?: React.ReactNode`.

### Drawer

A panel that slides in from an edge of the screen. Use it for navigation, filters, or secondary content that should not fully cover the page. Rendered in a portal; overlay click and `Escape` call `onClose`.

```tsx
function Example() {
  const { isOpen, open, close } = useDisclosure();
  return (
    <>
      <Button onClick={open}>Open drawer</Button>
      <Drawer open={isOpen} onClose={close} side="right" title="Filters">
        <p>Drawer body content.</p>
      </Drawer>
    </>
  );
}
```

Props: `open: boolean` (required), `onClose: () => void` (required), `side?: DrawerSide` where `DrawerSide = 'left' | 'right' | 'top' | 'bottom'` (default `'right'`), `title?: string`, `children: React.ReactNode` (required).

### ConfirmDialog

An imperative confirmation prompt. Call `confirmDialog(opts)` from anywhere to get a `Promise<boolean>` that resolves to whether the user confirmed. Mount `<ConfirmViewport />` exactly once near the root of your app (typically alongside `<ToastViewport />`).

```tsx
// Mount once at the app root:
// <ConfirmViewport />

function Example() {
  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete item?',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      destructive: true,
    });
    if (ok) {
      // proceed with deletion
    }
  };
  return <Button $variant="danger" onClick={handleDelete}>Delete</Button>;
}
```

Props / API: `confirmDialog(opts?: ConfirmOptions): Promise<boolean>`. `ConfirmOptions` = `{ title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean }`. `destructive` defaults to a danger-styled confirm button; set `destructive: false` for a primary-styled button. `<ConfirmViewport />` takes no props and must be mounted once.

### Toast

Transient, non-blocking notifications. Call `toast.success / toast.error / toast.info / toast.warn` with a message string from anywhere. Mount `<ToastViewport />` once near the app root. Toasts auto-dismiss after 4000ms.

```tsx
// Mount once at the app root:
// <ToastViewport />

function Example() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={() => toast.success('Saved!')}>Success</Button>
      <Button $variant="danger" onClick={() => toast.error('Failed')}>Error</Button>
      <Button $variant="outline" onClick={() => toast.info('Heads up')}>Info</Button>
    </div>
  );
}
```

Props / API: `toast` is an object with methods `success(msg: string)`, `error(msg)`, `info(msg)`, `warn(msg)` — these map to `ToastKind = 'success' | 'error' | 'info' | 'warn'`. `<ToastViewport />` takes no props and must be mounted once. `useToastStore` exposes `{ toasts: ToastItem[]; push; dismiss }` for advanced control (e.g. manual dismissal).

### Tooltip

A small label shown on hover or focus of its single child element. The child must be a single React element that can receive a ref. Positioned with floating-ui (auto-flips/shifts).

```tsx
function Example() {
  return (
    <Tooltip content="Save your changes" placement="top">
      <Button>Save</Button>
    </Tooltip>
  );
}
```

Props: `content: React.ReactNode` (required), `children: React.ReactElement` (required, exactly one element), `placement?` — a floating-ui `Placement` string such as `'top' | 'bottom' | 'left' | 'right'` and their `-start`/`-end` variants (default `'top'`).

### Popover

A click-triggered floating panel for richer content (forms, menus, info). The `trigger` element opens/closes the panel; clicking outside or pressing `Escape` dismisses it.

```tsx
function Example() {
  return (
    <Popover trigger={<Button>Open popover</Button>} placement="bottom">
      <div>
        <strong>Popover title</strong>
        <p>Any content can live here.</p>
      </div>
    </Popover>
  );
}
```

Props: `trigger: React.ReactElement` (required, single element), `children: React.ReactNode` (required), `placement?` — a floating-ui `Placement` (default `'bottom'`).

### Menu (Menu + MenuButton + MenuList + MenuItem)

A dropdown menu compound built on floating-ui with full keyboard navigation. Compose `MenuButton` (the trigger), `MenuList` (the floating list), and `MenuItem` (each option). `MenuItem.onSelect` fires on click/Enter/Space and the menu closes automatically.

```tsx
function Example() {
  return (
    <Menu placement="bottom-start">
      <MenuButton>Actions</MenuButton>
      <MenuList>
        <MenuItem onSelect={() => console.log('edit')}>Edit</MenuItem>
        <MenuItem onSelect={() => console.log('duplicate')}>Duplicate</MenuItem>
        <MenuItem onSelect={() => console.log('delete')}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}
```

Props: `Menu` — `placement?` (floating-ui `Placement`, default `'bottom-start'`), `children` (required). `MenuButton` extends native `<button>` props, `children` (required). `MenuList` — `children` (required). `MenuItem` — `onSelect: () => void` (required), `children` (required).

### Alert

An inline status banner for feedback messages. Optional `title` and a dismiss button (shown when `onClose` is provided). Note the variant prop is `$variant`.

```tsx
function Example() {
  const [show, setShow] = React.useState(true);
  if (!show) return null;
  return (
    <Alert $variant="success" title="Saved" onClose={() => setShow(false)}>
      Your changes have been saved.
    </Alert>
  );
}
```

Props: `$variant?: AlertVariant` where `AlertVariant = 'info' | 'success' | 'warn' | 'danger'` (default `'info'`), `title?: string`, `onClose?: () => void` (renders a close button when set), `children?: React.ReactNode` (the message). Also accepts native `<div>` props.

### Command

A command palette / quick-search overlay. You supply `items: CommandItem[]` and control `open`/`onClose`; the consumer wires up the Cmd/Ctrl+K shortcut. Items can be grouped, carry icons/shortcuts, and define an `onSelect` callback.

```tsx
function Example() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const items: CommandItem[] = [
    { id: 'new', label: 'New file', shortcut: '⌘N', onSelect: () => toast.success('New file') },
    { id: 'save', label: 'Save', shortcut: '⌘S', group: 'File', onSelect: () => toast.success('Saved') },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command palette (⌘K)</Button>
      <Command open={open} onClose={() => setOpen(false)} items={items} />
    </>
  );
}
```

Props: `open: boolean` (required), `onClose: () => void` (required), `items: CommandItem[]` (required), `placeholder?: string`, `emptyText?: string` (default `'No results'`), `filter?: (item: CommandItem, query: string) => boolean`. `CommandItem` = `{ id: string; label: string; onSelect: () => void; keywords?: string[]; icon?: React.ReactNode; group?: string; shortcut?: string; disabled?: boolean }`.

---

## Disclosure & navigation

### Tabs

Controlled tabbed interface. Compose `Tabs` (state owner) with `TabList`, `Tab`, and `TabPanel`. Arrow keys / Home / End move focus between tabs (disabled tabs are skipped). Each `Tab` and its matching `TabPanel` share the same `value`.

```tsx
function Example() {
  const [tab, setTab] = React.useState('a');
  return (
    <Tabs value={tab} onChange={setTab}>
      <TabList>
        <Tab value="a">Account</Tab>
        <Tab value="b">Billing</Tab>
        <Tab value="c" disabled>Archived</Tab>
      </TabList>
      <TabPanel value="a">Account settings</TabPanel>
      <TabPanel value="b">Billing details</TabPanel>
      <TabPanel value="c">Archived items</TabPanel>
    </Tabs>
  );
}
```

Props:
- `Tabs`: `value: string` (required), `onChange: (value: string) => void` (required), `children` (required).
- `TabList`: standard `div` props + `children` (required).
- `Tab`: `value: string` (required), `children` (required), plus `button` props (`disabled`, `onClick`, etc.).
- `TabPanel`: `value: string` (required), `children` (required), plus `div` props.

### Accordion

Collapsible sections. `Accordion` owns the open state internally; `type` controls whether one (`'single'`) or several (`'multiple'`) items can be open at once. Each `AccordionItem` needs a unique `value` and a `title`.

```tsx
<Accordion type="single">
  <AccordionItem value="shipping" title="Shipping">
    Ships in 2-3 business days.
  </AccordionItem>
  <AccordionItem value="returns" title="Returns">
    Free returns within 30 days.
  </AccordionItem>
</Accordion>
```

Props:
- `Accordion`: `type?: 'single' | 'multiple'` (default `'single'`), `children` (required).
- `AccordionItem`: `value: string` (required), `title: React.ReactNode` (required), `children` (required).

### Breadcrumb

Navigation trail. Wrap `BreadcrumbItem`s in `Breadcrumb`; chevron separators are inserted automatically. An item with `href` renders a link; an item without `href` renders the current page.

```tsx
<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/library">Library</BreadcrumbItem>
  <BreadcrumbItem>Components</BreadcrumbItem>
</Breadcrumb>
```

Props:
- `Breadcrumb`: `children` (required).
- `BreadcrumbItem`: `href?: string` (omit for the current/last item), `children` (required).

### Pagination

Page navigation with prev/next arrows and ellipsis truncation. Fully controlled via `page` + `onChange`. `siblingCount` controls how many page numbers show on each side of the current page.

```tsx
function Example() {
  const [page, setPage] = React.useState(1);
  return (
    <Pagination
      page={page}
      pageCount={10}
      onChange={setPage}
      siblingCount={1}
    />
  );
}
```

Props: `page: number` (required), `pageCount: number` (required), `onChange: (page: number) => void` (required), `siblingCount?: number` (default `1`).

### Stepper

Read-only progress indicator across a sequence of steps. Pass a `StepDef[]` and the zero-based `active` index; steps before `active` render as complete, the `active` step is highlighted, and later steps are upcoming.

```tsx
const steps: StepDef[] = [
  { label: 'Cart' },
  { label: 'Shipping', description: 'Address & method' },
  { label: 'Payment' },
  { label: 'Review' },
];

<Stepper steps={steps} active={1} orientation="horizontal" />
```

Props: `steps: StepDef[]` (required; each `{ label: string; description?: string }`), `active: number` (required, zero-based), `orientation?: StepperOrientation` (`'horizontal' | 'vertical'`, default `'horizontal'`).

---

## Date pickers

### DatePicker

A popover calendar for selecting a single date. Use it for any single-date field; the panel opens on click and supports keyboard arrow navigation.

```tsx
function BasicDatePicker() {
  const [date, setDate] = React.useState<Date | null>(null);
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      clearable
      min={new Date(2020, 0, 1)}
      max={new Date(2030, 11, 31)}
      format={(d) => d.toLocaleDateString("en-US")}
    />
  );
}
```

Props: `value?: Date | null` and `onChange?: (date: Date | null) => void` (controlled), or `defaultValue?: Date | null` (uncontrolled); `min?: Date`, `max?: Date` (clamp selectable range); `clearable?: boolean` (default `false`, shows a clear button when a date is set); `format?: (date: Date) => string` (trigger label formatter, defaults to `toLocaleDateString()`); `weekStartsOn?: 0 | 1` (default `0` = Sunday); `placeholder?: string` (default `"Select date"`); `disabled?: boolean`; `id?: string`.

### DateRangePicker

A dual-month popover calendar for selecting a start and end date. Use it for date-range filters or booking windows; clicking start then end completes the range and closes the panel.

```tsx
function BasicDateRangePicker() {
  const [range, setRange] = React.useState<DateRange>({ start: null, end: null });
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      clearable
      weekStartsOn={1}
    />
  );
}
```

Props: `value?: DateRange` and `onChange?: (range: DateRange) => void` (controlled), or `defaultValue?: DateRange` (uncontrolled), where `DateRange = { start: Date | null; end: Date | null }`; `min?: Date`, `max?: Date`; `clearable?: boolean` (default `false`); `format?: (date: Date) => string` (per-date label formatter); `weekStartsOn?: 0 | 1` (default `0`); `placeholder?: string` (default `"Select range"`); `disabled?: boolean`; `id?: string`.

## Layout

All layout primitives are `styled-components` and take **transient `$`-prefixed props** (these are not forwarded to the DOM). Spacing/radius/color props are keyed to the theme tokens (`theme.space`, `theme.radii`, `theme.colors`).

### Box

A generic `div` with theme-aware padding, margin, background, and radius. Use it as the base building block for spacing and surfaces.

```tsx
<Box $p={4} $bg="surface" $radius="md">
  Padded, surface-colored container.
</Box>
```

Props: `$p?`, `$px?`, `$py?`, `$m?` (spacing keys of `theme.space`); `$bg?` (a key of `theme.colors`, e.g. `"surface"`); `$radius?` (a key of `theme.radii`, e.g. `"md"`). All optional. Renders a `<div>`.

### Stack / HStack / VStack

Flexbox layout helpers. `Stack` defaults to a column; `HStack` is a row and `VStack` is a column (thin wrappers over `Stack`). Use them to space children evenly along one axis.

```tsx
<VStack $gap={3} $align="stretch">
  <HStack $gap={2} $align="center" $justify="space-between">
    <span>Left</span>
    <span>Right</span>
  </HStack>
  <Stack $direction="row" $gap={4}>
    <span>A</span>
    <span>B</span>
  </Stack>
</VStack>
```

Props (`StackProps`): `$gap?` (a key of `theme.space`); `$direction?: "row" | "column"` (default `"column"` for `Stack`/`VStack`, `"row"` for `HStack`); `$align?` (CSS `align-items`); `$justify?` (CSS `justify-content`).

### Grid

A CSS grid with a fixed column count and theme-keyed gap. Use it for evenly sized card/tile layouts.

```tsx
<Grid $cols={3} $gap={4}>
  <Box $p={3} $bg="surface">1</Box>
  <Box $p={3} $bg="surface">2</Box>
  <Box $p={3} $bg="surface">3</Box>
</Grid>
```

Props (`GridProps`): `$cols?: number` (default `1`; produces `repeat($cols, minmax(0, 1fr))`); `$gap?` (a key of `theme.space`).

### Container

A centered, max-width wrapper with horizontal page padding. Use it to constrain page content to a comfortable line length.

```tsx
<Container $max={960}>
  <p>Centered page content.</p>
</Container>
```

Props (`ContainerProps`): `$max?: number` (max width in px, default `1120`). Horizontal padding is applied automatically from the theme.
