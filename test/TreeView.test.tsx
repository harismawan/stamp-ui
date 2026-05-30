import { describe, it, expect, afterEach, mock } from 'bun:test';
import * as React from 'react';
import { screen, cleanup, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { TreeView, type TreeNode } from '../src/components/TreeView';

afterEach(cleanup);

const nodes: TreeNode[] = [
  {
    id: 'fruits',
    label: 'Fruits',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  {
    id: 'veggies',
    label: 'Vegetables',
    children: [
      { id: 'carrot', label: 'Carrot' },
      { id: 'potato', label: 'Potato', disabled: true },
    ],
  },
  { id: 'other', label: 'Other' },
];

describe('TreeView', () => {
  it('renders a tree with root treeitems', () => {
    renderWithTheme(<TreeView nodes={nodes} />);
    expect(screen.getByRole('tree')).toBeTruthy();
    // Roots are visible; children are collapsed by default.
    expect(screen.getByRole('treeitem', { name: /Fruits/ })).toBeTruthy();
    expect(screen.getByRole('treeitem', { name: /Vegetables/ })).toBeTruthy();
    expect(screen.getByRole('treeitem', { name: /Other/ })).toBeTruthy();
    expect(screen.queryByRole('treeitem', { name: /Apple/ })).toBeNull();
  });

  it('marks branch nodes with aria-expanded and leaves without it', () => {
    renderWithTheme(<TreeView nodes={nodes} />);
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    const other = screen.getByRole('treeitem', { name: /Other/ });
    expect(fruits.getAttribute('aria-expanded')).toBe('false');
    expect(other.hasAttribute('aria-expanded')).toBe(false);
  });

  it('reports the correct aria-level by depth', async () => {
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['fruits']} />);
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    const apple = screen.getByRole('treeitem', { name: /Apple/ });
    expect(fruits.getAttribute('aria-level')).toBe('1');
    expect(apple.getAttribute('aria-level')).toBe('2');
  });

  it('toggles children and aria-expanded when the chevron is clicked', async () => {
    const user = userEvent.setup();
    const onExpandedChange = mock((_ids: string[]) => {});
    renderWithTheme(<TreeView nodes={nodes} onExpandedChange={onExpandedChange} />);

    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    // The chevron is the first child (aria-hidden span) inside the row.
    const chevron = fruits.querySelector('span');
    expect(chevron).not.toBeNull();

    await user.click(chevron as Element);
    await waitFor(() => {
      expect(screen.getByRole('treeitem', { name: /Apple/ })).toBeTruthy();
    });
    expect(fruits.getAttribute('aria-expanded')).toBe('true');
    expect(onExpandedChange).toHaveBeenCalledWith(['fruits']);

    await user.click(chevron as Element);
    await waitFor(() => {
      expect(screen.queryByRole('treeitem', { name: /Apple/ })).toBeNull();
    });
    expect(fruits.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking the chevron does not select the node', async () => {
    const user = userEvent.setup();
    const onSelect = mock((_id: string) => {});
    renderWithTheme(<TreeView nodes={nodes} onSelect={onSelect} />);
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    const chevron = fruits.querySelector('span') as Element;
    await user.click(chevron);
    expect(onSelect).not.toHaveBeenCalled();
    expect(fruits.getAttribute('aria-selected')).toBe('false');
  });

  it('clicking a row fires onSelect and sets aria-selected', async () => {
    const user = userEvent.setup();
    const onSelect = mock((_id: string) => {});
    renderWithTheme(<TreeView nodes={nodes} onSelect={onSelect} />);
    const other = screen.getByRole('treeitem', { name: /Other/ });
    await user.click(other);
    expect(onSelect).toHaveBeenCalledWith('other');
    await waitFor(() => {
      expect(screen.getByRole('treeitem', { name: /Other/ }).getAttribute('aria-selected')).toBe(
        'true',
      );
    });
  });

  it('navigates with ArrowDown / ArrowUp across visible items', async () => {
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['fruits']} />);
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    fruits.focus();
    expect(document.activeElement).toBe(fruits);

    fireEvent.keyDown(fruits, { key: 'ArrowDown' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: /Apple/ })),
    );

    const apple = screen.getByRole('treeitem', { name: /Apple/ });
    fireEvent.keyDown(apple, { key: 'ArrowDown' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: /Banana/ })),
    );

    const banana = screen.getByRole('treeitem', { name: /Banana/ });
    fireEvent.keyDown(banana, { key: 'ArrowUp' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: /Apple/ })),
    );
  });

  it('ArrowRight expands a collapsed branch, then moves to the first child', async () => {
    renderWithTheme(<TreeView nodes={nodes} />);
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    fruits.focus();

    fireEvent.keyDown(fruits, { key: 'ArrowRight' });
    await waitFor(() => expect(fruits.getAttribute('aria-expanded')).toBe('true'));

    // Second ArrowRight on an already-expanded branch moves to its first child.
    fireEvent.keyDown(fruits, { key: 'ArrowRight' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: /Apple/ })),
    );
  });

  it('ArrowLeft collapses an expanded branch, then moves to the parent', async () => {
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['fruits']} />);
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });

    // From a child, ArrowLeft jumps to the parent.
    const apple = screen.getByRole('treeitem', { name: /Apple/ });
    apple.focus();
    fireEvent.keyDown(apple, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement).toBe(fruits));

    // From the expanded parent, ArrowLeft collapses it.
    fireEvent.keyDown(fruits, { key: 'ArrowLeft' });
    await waitFor(() => expect(fruits.getAttribute('aria-expanded')).toBe('false'));
  });

  it('Home / End jump to the first and last visible items', async () => {
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['fruits', 'veggies']} />);
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    const other = screen.getByRole('treeitem', { name: /Other/ });
    fruits.focus();

    fireEvent.keyDown(fruits, { key: 'End' });
    await waitFor(() => expect(document.activeElement).toBe(other));

    fireEvent.keyDown(other, { key: 'Home' });
    await waitFor(() => expect(document.activeElement).toBe(fruits));
  });

  it('selects with Enter and Space', async () => {
    const onSelect = mock((_id: string) => {});
    renderWithTheme(<TreeView nodes={nodes} onSelect={onSelect} />);
    const other = screen.getByRole('treeitem', { name: /Other/ });
    other.focus();
    fireEvent.keyDown(other, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('other');
    fireEvent.keyDown(other, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('does not select a disabled node', async () => {
    const user = userEvent.setup();
    const onSelect = mock((_id: string) => {});
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['veggies']} onSelect={onSelect} />);
    const potato = screen.getByRole('treeitem', { name: /Potato/ });
    expect(potato.getAttribute('aria-disabled')).toBe('true');
    await user.click(potato);
    expect(onSelect).not.toHaveBeenCalled();
    expect(potato.getAttribute('aria-selected')).toBe('false');
  });

  it('supports controlled expansion', async () => {
    const onExpandedChange = mock((_ids: string[]) => {});
    renderWithTheme(
      <TreeView nodes={nodes} expandedIds={['fruits']} onExpandedChange={onExpandedChange} />,
    );
    // Controlled: Apple shows because expandedIds includes "fruits".
    expect(screen.getByRole('treeitem', { name: /Apple/ })).toBeTruthy();
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    const chevron = fruits.querySelector('span') as Element;
    fireEvent.click(chevron);
    // Fires the callback but stays expanded because the parent owns the state.
    expect(onExpandedChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole('treeitem', { name: /Apple/ })).toBeTruthy();
  });

  it('assigns a roving tabindex to a single visible item', () => {
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['fruits']} />);
    const items = screen.getAllByRole('treeitem');
    const focusable = items.filter((el) => el.tabIndex === 0);
    expect(focusable).toHaveLength(1);
  });

  it('owns the ARIA hierarchy: tree > treeitem > group > treeitem', () => {
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['fruits']} />);
    const tree = screen.getByRole('tree');
    const fruits = screen.getByRole('treeitem', { name: /Fruits/ });
    const apple = screen.getByRole('treeitem', { name: /Apple/ });

    // The tree directly owns the root treeitem.
    expect(fruits.parentElement).toBe(tree);
    // The parent treeitem CONTAINS the role="group" of its children, and that
    // group contains the child treeitem — not a sibling of the parent.
    const group = within(fruits).getByRole('group');
    expect(group.parentElement).toBe(fruits);
    expect(group.contains(apple)).toBe(true);
    // The child treeitem is owned by the group, not directly by the tree.
    expect(apple.parentElement).toBe(group);
    // No presentational role="none" wrapper sits between tree and treeitems.
    expect(screen.queryByRole('none')).toBeNull();
  });

  it('clicking a child treeitem selects only it, not its ancestor', async () => {
    // Because a parent treeitem DOM-contains its child group, a naive click
    // handler would bubble up and also select the ancestor. Selection must be
    // scoped to the clicked node.
    const user = userEvent.setup();
    const onSelect = mock((_id: string) => {});
    renderWithTheme(
      <TreeView nodes={nodes} defaultExpandedIds={['fruits']} onSelect={onSelect} />,
    );
    const apple = screen.getByRole('treeitem', { name: /Apple/ });
    await user.click(apple);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('apple');
    await waitFor(() => expect(apple.getAttribute('aria-selected')).toBe('true'));
    expect(
      screen.getByRole('treeitem', { name: /Fruits/ }).getAttribute('aria-selected'),
    ).toBe('false');
  });

  it('a keydown on a child does not also trigger its ancestor handler', async () => {
    // The keydown bubbles up to the ancestor treeitem; only the originating
    // treeitem should act, otherwise navigation/selection get overridden.
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['fruits']} />);
    const apple = screen.getByRole('treeitem', { name: /Apple/ });
    apple.focus();
    fireEvent.keyDown(apple, { key: 'ArrowDown' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: /Banana/ })),
    );
  });

  it('ArrowLeft/Right still move structurally on a disabled item (APG policy)', async () => {
    // A disabled item is focusable and supports structural navigation; only
    // selection is blocked on it.
    renderWithTheme(<TreeView nodes={nodes} defaultExpandedIds={['veggies']} />);
    const carrot = screen.getByRole('treeitem', { name: /Carrot/ });
    const potato = screen.getByRole('treeitem', { name: /Potato/ });
    const veggies = screen.getByRole('treeitem', { name: /Vegetables/ });

    // Land on the disabled item via ArrowDown.
    carrot.focus();
    fireEvent.keyDown(carrot, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(potato));

    // ArrowLeft on the disabled leaf must still move to the parent — the user is
    // not trapped on the disabled node.
    fireEvent.keyDown(potato, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement).toBe(veggies));
  });

  it('moves focus to the fallback item when an ancestor of the focused node collapses', async () => {
    // Three levels deep so we can collapse an ancestor (root) while a grandchild
    // is focused — the grandchild unmounts and DOM focus would drop to <body>.
    const deep: TreeNode[] = [
      {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'mid',
            label: 'Mid',
            children: [{ id: 'leaf', label: 'Leaf' }],
          },
        ],
      },
    ];

    function Controlled() {
      const [expandedIds, setExpandedIds] = React.useState<string[]>(['root', 'mid']);
      return (
        <>
          <button type="button" onClick={() => setExpandedIds([])}>
            collapse-all
          </button>
          <TreeView nodes={deep} expandedIds={expandedIds} onExpandedChange={setExpandedIds} />
        </>
      );
    }

    renderWithTheme(<Controlled />);
    const leaf = screen.getByRole('treeitem', { name: /Leaf/ });
    leaf.focus();
    expect(document.activeElement).toBe(leaf);

    // Externally collapse the root: both Mid and Leaf unmount while Leaf is the
    // focused/active item. Without recovery, focus would land on <body>.
    fireEvent.click(screen.getByText('collapse-all'));
    await waitFor(() => expect(screen.queryByRole('treeitem', { name: /Leaf/ })).toBeNull());

    // The effect re-targets DOM focus to the fallback (Root), not <body>.
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: /Root/ })),
    );
    expect(document.activeElement).not.toBe(document.body);
  });
});
