import * as React from 'react';
import styled from 'styled-components';
import { ChevronRight } from 'lucide-react';

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string) => void;
  id?: string;
}

const Root = styled.div`
  font-family: ${(p) => p.theme.font.body};
  color: ${(p) => p.theme.colors.text};
`;

const Group = styled.div`
  /* role="group" container for a branch's children. */
`;

// The treeitem element itself. It owns focus (roving tabIndex) so the focus
// ring lives here, but the visual row layout lives in the presentational Row
// nested inside it. This lets the treeitem OWN its child role="group".
const Item = styled.div`
  outline: none;
  border-radius: ${(p) => p.theme.radii.sm};

  &:focus-visible {
    box-shadow: ${(p) => p.theme.shadow.stamp};
  }
`;

const Row = styled.div<{ $selected: boolean; $disabled: boolean; $level: number }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  padding-left: calc(
    ${(p) => p.theme.space[3]} + ${(p) => p.$level - 1} * ${(p) => p.theme.space[4]}
  );
  border-radius: ${(p) => p.theme.radii.sm};
  font-size: 0.95rem;
  font-weight: ${(p) => (p.$selected ? 800 : 600)};
  background: ${(p) => (p.$selected ? p.theme.colors.primarySoft : 'transparent')};
  color: ${(p) => p.theme.colors.text};
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.5 : 1)};
  user-select: none;
  transition: background 80ms ${(p) => p.theme.easing.out};
`;

const Toggle = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 18px;
  height: 18px;
  cursor: pointer;
  color: ${(p) => p.theme.colors.textMuted};
  transition: transform 80ms ${(p) => p.theme.easing.out};
  transform: rotate(${(p) => (p.$expanded ? '90deg' : '0deg')});
`;

// Reserves the same horizontal space as the chevron for leaf nodes so labels
// line up with their sibling branches.
const TogglePlaceholder = styled.span`
  display: inline-flex;
  flex: none;
  width: 18px;
  height: 18px;
`;

const IconSlot = styled.span`
  display: inline-flex;
  align-items: center;
  flex: none;
`;

const Label = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// A treeitem flattened into visible order, paired with the data needed for
// keyboard navigation.
interface FlatItem {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
}

export function TreeView({
  nodes,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  selectedId,
  defaultSelectedId,
  onSelect,
  id: idProp,
}: TreeViewProps) {
  const reactId = React.useId();
  const baseId = idProp ?? reactId;

  const expandedControlled = expandedIds !== undefined;
  const selectedControlled = selectedId !== undefined;

  const [expandedUncontrolled, setExpandedUncontrolled] = React.useState<string[]>(
    () => defaultExpandedIds ?? [],
  );
  const [selectedUncontrolled, setSelectedUncontrolled] = React.useState<string | null>(
    () => defaultSelectedId ?? null,
  );

  const expanded = expandedControlled ? (expandedIds as string[]) : expandedUncontrolled;
  const selected = selectedControlled ? (selectedId as string | null) : selectedUncontrolled;

  const expandedSet = React.useMemo(() => new Set(expanded), [expanded]);

  // Flatten the tree into the order treeitems are visible on screen, honoring
  // the current expanded set. This drives roving tabindex + keyboard nav.
  const visible = React.useMemo<FlatItem[]>(() => {
    const out: FlatItem[] = [];
    const walk = (list: TreeNode[], level: number, parentId: string | null) => {
      for (const node of list) {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const isExpanded = hasChildren && expandedSet.has(node.id);
        out.push({ node, level, parentId, hasChildren, expanded: isExpanded });
        if (isExpanded && node.children) {
          walk(node.children, level + 1, node.id);
        }
      }
    };
    walk(nodes, 1, null);
    return out;
  }, [nodes, expandedSet]);

  // The treeitem that owns tabIndex 0 (roving). Falls back to the first
  // enabled visible item if the active one disappears (e.g. parent collapsed).
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const firstEnabledId = React.useMemo(() => {
    const found = visible.find((v) => !v.node.disabled);
    return found ? found.node.id : null;
  }, [visible]);

  const effectiveActiveId =
    activeId !== null && visible.some((v) => v.node.id === activeId) ? activeId : firstEnabledId;

  const itemRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  const focusItem = React.useCallback((nodeId: string) => {
    const el = itemRefs.current.get(nodeId);
    if (el) el.focus();
  }, []);

  const setExpanded = React.useCallback(
    (next: string[]) => {
      if (!expandedControlled) setExpandedUncontrolled(next);
      onExpandedChange?.(next);
    },
    [expandedControlled, onExpandedChange],
  );

  const toggleExpanded = React.useCallback(
    (nodeId: string) => {
      const next = expandedSet.has(nodeId)
        ? expanded.filter((x) => x !== nodeId)
        : [...expanded, nodeId];
      setExpanded(next);
    },
    [expanded, expandedSet, setExpanded],
  );

  const expand = React.useCallback(
    (nodeId: string) => {
      if (expandedSet.has(nodeId)) return;
      setExpanded([...expanded, nodeId]);
    },
    [expanded, expandedSet, setExpanded],
  );

  const collapse = React.useCallback(
    (nodeId: string) => {
      if (!expandedSet.has(nodeId)) return;
      setExpanded(expanded.filter((x) => x !== nodeId));
    },
    [expanded, expandedSet, setExpanded],
  );

  const select = React.useCallback(
    (node: TreeNode) => {
      if (node.disabled) return;
      if (!selectedControlled) setSelectedUncontrolled(node.id);
      onSelect?.(node.id);
    },
    [selectedControlled, onSelect],
  );

  const moveTo = React.useCallback(
    (nodeId: string) => {
      setActiveId(nodeId);
      focusItem(nodeId);
    },
    [focusItem],
  );

  // Tracks whether focus currently lives inside this tree, so we only re-target
  // focus after a collapse if the user was actually navigating the tree.
  const treeHadFocus = React.useRef(false);

  // When the focused treeitem leaves the visible set (e.g. an ancestor is
  // collapsed and the focused child unmounts), DOM focus would otherwise drop to
  // <body>. If the tree held focus, re-target it to the fallback
  // (effectiveActiveId) so keyboard navigation keeps working.
  React.useEffect(() => {
    if (effectiveActiveId === null || !treeHadFocus.current) return;
    const active = document.activeElement;
    const focusInsideTree =
      active instanceof HTMLElement &&
      Array.from(itemRefs.current.values()).includes(active as HTMLDivElement);
    // Focus is still on a live treeitem in this tree — nothing to fix.
    if (focusInsideTree) return;
    // Focus was lost (dropped to <body> or null) because the focused item
    // unmounted. Pull it back to the fallback item.
    if (active === null || active === document.body) {
      focusItem(effectiveActiveId);
    }
  }, [effectiveActiveId, visible, focusItem]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, item: FlatItem) => {
    // Treeitems are nested in the DOM (a parent treeitem OWNS its child
    // role="group"), so a keydown on a child bubbles up to every ancestor
    // treeitem's handler. Only let the treeitem the event actually originated on
    // act, otherwise an ancestor would override the navigation/selection.
    if (e.target !== e.currentTarget) return;
    const index = visible.findIndex((v) => v.node.id === item.node.id);
    if (index === -1) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (index < visible.length - 1) moveTo(visible[index + 1].node.id);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (index > 0) moveTo(visible[index - 1].node.id);
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (item.hasChildren) {
          if (!item.expanded) {
            expand(item.node.id);
          } else if (index < visible.length - 1 && visible[index + 1].parentId === item.node.id) {
            moveTo(visible[index + 1].node.id);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (item.hasChildren && item.expanded) {
          collapse(item.node.id);
        } else if (item.parentId !== null) {
          moveTo(item.parentId);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        select(item.node);
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (visible.length > 0) moveTo(visible[0].node.id);
        break;
      }
      case 'End': {
        e.preventDefault();
        if (visible.length > 0) moveTo(visible[visible.length - 1].node.id);
        break;
      }
      default:
        break;
    }
  };

  // Recursive renderer. The treeitem element CONTAINS both its presentational
  // row and (when expanded) the nested role="group" of its children, so the
  // ARIA ownership mirrors the tree hierarchy: tree -> treeitem -> group ->
  // treeitem. `parentId` is threaded through so ArrowLeft can move to the parent
  // treeitem.
  const renderNodes = (
    list: TreeNode[],
    level: number,
    parentId: string | null,
  ): React.ReactNode =>
    list.map((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const isExpanded = hasChildren && expandedSet.has(node.id);
      const isSelected = selected === node.id;
      const isActive = effectiveActiveId === node.id;
      const item: FlatItem = { node, level, parentId, hasChildren, expanded: isExpanded };

      return (
        <Item
          key={node.id}
          ref={(el) => {
            if (el) itemRefs.current.set(node.id, el);
            else itemRefs.current.delete(node.id);
          }}
          id={`${baseId}-item-${node.id}`}
          role="treeitem"
          aria-level={level}
          aria-selected={isSelected}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-disabled={node.disabled || undefined}
          // Scope the accessible name to this node's own label. Because the
          // treeitem now CONTAINS its child group, name-from-contents would
          // otherwise fold in every descendant label.
          aria-labelledby={`${baseId}-label-${node.id}`}
          tabIndex={isActive ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, item)}
          // Selection lives on the treeitem element itself (the focusable,
          // interactive node), so clicking anywhere on the row — or the treeitem
          // padding — selects it, matching Enter/Space. stopPropagation keeps a
          // click from bubbling to an ANCESTOR treeitem (which now DOM-contains
          // this one) and selecting that instead.
          onClick={(e) => {
            e.stopPropagation();
            if (node.disabled) return;
            setActiveId(node.id);
            select(node);
          }}
        >
          <Row $selected={isSelected} $disabled={node.disabled === true} $level={level}>
            {hasChildren ? (
              <Toggle
                $expanded={isExpanded}
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.disabled) return;
                  setActiveId(node.id);
                  toggleExpanded(node.id);
                }}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </Toggle>
            ) : (
              <TogglePlaceholder aria-hidden="true" />
            )}
            {node.icon != null && <IconSlot aria-hidden="true">{node.icon}</IconSlot>}
            <Label id={`${baseId}-label-${node.id}`}>{node.label}</Label>
          </Row>
          {hasChildren && isExpanded && (
            <Group role="group">
              {renderNodes(node.children as TreeNode[], level + 1, node.id)}
            </Group>
          )}
        </Item>
      );
    });

  return (
    <Root
      role="tree"
      id={baseId}
      onFocus={() => {
        treeHadFocus.current = true;
      }}
      onBlur={(e) => {
        // Only clear when focus genuinely leaves the tree for another element.
        // A null relatedTarget usually means the focused item unmounted (e.g. a
        // collapse), in which case we keep the flag so focus can be re-targeted.
        const next = e.relatedTarget as Node | null;
        if (next && !e.currentTarget.contains(next)) {
          treeHadFocus.current = false;
        }
      }}
    >
      {renderNodes(nodes, 1, null)}
    </Root>
  );
}
