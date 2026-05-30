import * as React from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  keywords?: string[];
  icon?: React.ReactNode;
  group?: string;
  shortcut?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  emptyText?: string;
  filter?: (item: CommandItem, query: string) => boolean;
}

const defaultFilter = (item: CommandItem, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.label.toLowerCase().includes(q)) return true;
  return (item.keywords ?? []).some((k) => k.toLowerCase().includes(q));
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${(p) => p.theme.colors.overlay};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 50;
  padding: ${(p) => p.theme.space[9]} ${(p) => p.theme.space[5]} ${(p) => p.theme.space[5]};
  animation: cfade 120ms ${(p) => p.theme.easing.out};

  @keyframes cfade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Panel = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  box-shadow: ${(p) => p.theme.shadow.stampLg};
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: crise 140ms ${(p) => p.theme.easing.out};

  @keyframes crise {
    from {
      transform: translate(-4px, -4px);
    }
    to {
      transform: none;
    }
  }
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[3]};
  padding: ${(p) => p.theme.space[4]} ${(p) => p.theme.space[5]};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
  color: ${(p) => p.theme.colors.textSubtle};
`;

const SearchInput = styled.input`
  font-family: ${(p) => p.theme.font.body};
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  min-width: 0;
  background: transparent;
  color: ${(p) => p.theme.colors.text};
  border: none;
  padding: 0;

  &::placeholder {
    color: ${(p) => p.theme.colors.textSubtle};
  }

  &:focus {
    outline: none;
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: ${(p) => p.theme.space[2]};
  max-height: 340px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
`;

const GroupLabel = styled.div`
  font-family: ${(p) => p.theme.font.body};
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${(p) => p.theme.colors.textSubtle};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]} ${(p) => p.theme.space[1]};
`;

const Option = styled.li<{ $active: boolean; $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[3]};
  font-family: ${(p) => p.theme.font.body};
  font-size: 14px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => (p.$active ? p.theme.colors.primarySoft : 'transparent')};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  opacity: ${(p) => (p.$disabled ? 0.55 : 1)};
  transition: background 80ms ${(p) => p.theme.easing.out};
`;

const OptionIcon = styled.span`
  display: grid;
  place-items: center;
  color: ${(p) => p.theme.colors.textMuted};
`;

const OptionLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Shortcut = styled.span`
  font-family: ${(p) => p.theme.font.mono};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSubtle};
`;

const Empty = styled.div`
  font-family: ${(p) => p.theme.font.body};
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSubtle};
  padding: ${(p) => p.theme.space[3]};
  text-align: center;
`;

const Group = styled.li`
  list-style: none;
`;

const GroupOptions = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
`;

interface GroupRow {
  group: string;
  labelId: string;
  items: CommandItem[];
}

export function Command({
  open,
  onClose,
  items,
  placeholder,
  emptyText = 'No results',
  filter = defaultFilter,
}: CommandProps) {
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const baseId = React.useId();
  const listId = `${baseId}-list`;

  // Reset query + active index whenever the palette transitions to open.
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  // Autofocus the input when opened.
  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Escape closes via document keydown (matches Modal).
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const visible = React.useMemo(
    () => items.filter((item) => filter(item, query)),
    [items, query, filter],
  );

  // Build the render structure: ungrouped first, then groups in first-appearance
  // order. `ordered` flattens this in the SAME order rows are rendered, so keyboard
  // navigation order matches the visual order.
  const { ungrouped, groups, ordered } = React.useMemo(() => {
    const groupOrder: string[] = [];
    const byGroup = new Map<string, CommandItem[]>();
    const ungroupedItems: CommandItem[] = [];
    for (const item of visible) {
      if (item.group == null) {
        ungroupedItems.push(item);
      } else {
        let bucket = byGroup.get(item.group);
        if (bucket == null) {
          bucket = [];
          byGroup.set(item.group, bucket);
          groupOrder.push(item.group);
        }
        bucket.push(item);
      }
    }
    const groupRows: GroupRow[] = groupOrder.map((group, i) => ({
      group,
      labelId: `${baseId}-group-${i}`,
      items: byGroup.get(group) ?? [],
    }));
    const orderedItems: CommandItem[] = [...ungroupedItems];
    for (const row of groupRows) orderedItems.push(...row.items);
    return { ungrouped: ungroupedItems, groups: groupRows, ordered: orderedItems };
  }, [visible, baseId]);

  // Navigable items are the non-disabled ones, in rendered (visual) order.
  const navigable = React.useMemo(() => ordered.filter((i) => !i.disabled), [ordered]);

  // O(1) lookup from item -> its index within `navigable` (used per rendered option).
  const navIndexByItem = React.useMemo(() => {
    const map = new Map<CommandItem, number>();
    navigable.forEach((item, i) => map.set(item, i));
    return map;
  }, [navigable]);

  // Keep activeIndex within the navigable range when the filtered set changes.
  React.useEffect(() => {
    setActiveIndex((prev) => {
      if (navigable.length === 0) return 0;
      return Math.min(prev, navigable.length - 1);
    });
  }, [navigable.length]);

  const activeId =
    navigable.length > 0 ? `${baseId}-opt-${navigable[activeIndex]?.id}` : undefined;

  const selectItem = (item: CommandItem) => {
    if (item.disabled) return;
    item.onSelect();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (navigable.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % navigable.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + navigable.length) % navigable.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = navigable[activeIndex];
      if (item) selectItem(item);
    }
  };

  const renderOption = (item: CommandItem) => {
    const navIndex = navIndexByItem.get(item) ?? -1;
    const isActive = navIndex !== -1 && navIndex === activeIndex;
    return (
      <Option
        key={item.id}
        id={`${baseId}-opt-${item.id}`}
        role="option"
        aria-selected={isActive}
        aria-disabled={item.disabled || undefined}
        $active={isActive}
        $disabled={!!item.disabled}
        onMouseDown={(e) => {
          // Prevent the input from losing focus on click.
          e.preventDefault();
        }}
        onClick={() => selectItem(item)}
        onMouseEnter={() => {
          if (navIndex !== -1) setActiveIndex(navIndex);
        }}
      >
        {item.icon != null && <OptionIcon aria-hidden="true">{item.icon}</OptionIcon>}
        <OptionLabel>{item.label}</OptionLabel>
        {item.shortcut != null && <Shortcut>{item.shortcut}</Shortcut>}
      </Option>
    );
  };

  if (!open) return null;

  return (
    <Overlay onMouseDown={() => onClose()}>
      <Panel onMouseDown={(e) => e.stopPropagation()}>
        <SearchRow>
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
          <SearchInput
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder={placeholder ?? 'Type a command...'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
        </SearchRow>
        <List id={listId} role="listbox">
          {ungrouped.map((item) => renderOption(item))}
          {groups.map(({ group, labelId, items: groupItems }) => (
            <Group key={labelId} role="group" aria-labelledby={labelId}>
              <GroupLabel id={labelId}>{group}</GroupLabel>
              <GroupOptions>{groupItems.map((item) => renderOption(item))}</GroupOptions>
            </Group>
          ))}
        </List>
        {ordered.length === 0 && <Empty role="status">{emptyText}</Empty>}
      </Panel>
    </Overlay>
  );
}
