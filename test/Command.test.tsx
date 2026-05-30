import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Command, type CommandItem } from '../src/components/Command';

afterEach(cleanup);

function makeItems(overrides: Partial<CommandItem>[] = []): CommandItem[] {
  const base: CommandItem[] = [
    { id: 'new', label: 'New file', keywords: ['create', 'add'], onSelect: () => {} },
    { id: 'open', label: 'Open file', onSelect: () => {} },
    { id: 'save', label: 'Save', shortcut: '⌘S', onSelect: () => {} },
  ];
  return base.map((item, i) => ({ ...item, ...(overrides[i] ?? {}) }));
}

describe('Command', () => {
  it('renders nothing when open=false', () => {
    renderWithTheme(<Command open={false} onClose={() => {}} items={makeItems()} />);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('shows items when open', async () => {
    renderWithTheme(<Command open onClose={() => {}} items={makeItems()} />);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: /New file/ })).toBeTruthy();
  });

  it('autofocuses the search input with combobox semantics', async () => {
    renderWithTheme(<Command open onClose={() => {}} items={makeItems()} />);
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('filters by label', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Command open onClose={() => {}} items={makeItems()} />);
    await user.type(screen.getByRole('combobox'), 'save');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('option', { name: /Save/ })).toBeTruthy();
  });

  it('filters by keyword', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Command open onClose={() => {}} items={makeItems()} />);
    await user.type(screen.getByRole('combobox'), 'create');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('option', { name: /New file/ })).toBeTruthy();
  });

  it('shows the empty text when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Command open onClose={() => {}} items={makeItems()} emptyText="Nothing here" />,
    );
    await user.type(screen.getByRole('combobox'), 'zzzzz');
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0));
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('renders the empty message OUTSIDE the listbox (no stray presentation child)', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Command open onClose={() => {}} items={makeItems()} emptyText="Nothing here" />,
    );
    await user.type(screen.getByRole('combobox'), 'zzzzz');
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0));

    const empty = screen.getByText('Nothing here');
    const listbox = screen.getByRole('listbox');
    // The empty message must not be a descendant of the listbox.
    expect(listbox.contains(empty)).toBe(false);
    // And it should be a real status element, not presentation.
    expect(empty.getAttribute('role')).toBe('status');
    // The listbox should own nothing while empty.
    expect(listbox.children).toHaveLength(0);
  });

  it('moves the active option with ArrowDown and ArrowUp via aria-activedescendant', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Command open onClose={() => {}} items={makeItems()} />);
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    const options = screen.getAllByRole('option');
    // First option active initially.
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id));
    expect(options[0].getAttribute('aria-selected')).toBe('true');

    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id));

    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[2].id));

    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id));
  });

  it('fires the active item onSelect and onClose on Enter', async () => {
    const user = userEvent.setup();
    const onSelect = mock(() => {});
    const onClose = mock(() => {});
    const items = makeItems([{ onSelect }]);
    renderWithTheme(<Command open onClose={onClose} items={items} />);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onSelect and onClose when an item is clicked', async () => {
    const onSelect = mock(() => {});
    const onClose = mock(() => {});
    const items = makeItems([{}, {}, { onSelect }]);
    renderWithTheme(<Command open onClose={onClose} items={items} />);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    fireEvent.click(screen.getByRole('option', { name: /Save/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onClose on Escape', async () => {
    const user = userEvent.setup();
    const onClose = mock(() => {});
    renderWithTheme(<Command open onClose={onClose} items={makeItems()} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeTruthy());
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders group headers in first-appearance order', async () => {
    const items: CommandItem[] = [
      { id: 'a', label: 'Alpha', group: 'Files', onSelect: () => {} },
      { id: 'b', label: 'Beta', group: 'Edit', onSelect: () => {} },
      { id: 'c', label: 'Gamma', group: 'Files', onSelect: () => {} },
    ];
    renderWithTheme(<Command open onClose={() => {}} items={items} />);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    expect(screen.getByText('Files')).toBeTruthy();
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('exposes grouping to AT via role="group" with an accessible name and owned options', async () => {
    const items: CommandItem[] = [
      { id: 'a', label: 'Alpha', group: 'Files', onSelect: () => {} },
      { id: 'b', label: 'Beta', group: 'Edit', onSelect: () => {} },
      { id: 'c', label: 'Gamma', group: 'Files', onSelect: () => {} },
    ];
    renderWithTheme(<Command open onClose={() => {}} items={items} />);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    // Each group is exposed as a role="group" named by its header.
    const filesGroup = screen.getByRole('group', { name: 'Files' });
    const editGroup = screen.getByRole('group', { name: 'Edit' });
    expect(filesGroup).toBeTruthy();
    expect(editGroup).toBeTruthy();

    // The group's aria-labelledby points at the real header element id.
    const labelledby = filesGroup.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const header = document.getElementById(labelledby as string);
    expect(header?.textContent).toBe('Files');

    // The group OWNS its options (they are descendants of the group element).
    const alpha = screen.getByRole('option', { name: /Alpha/ });
    const gamma = screen.getByRole('option', { name: /Gamma/ });
    const beta = screen.getByRole('option', { name: /Beta/ });
    expect(filesGroup.contains(alpha)).toBe(true);
    expect(filesGroup.contains(gamma)).toBe(true);
    expect(editGroup.contains(beta)).toBe(true);
    expect(filesGroup.contains(beta)).toBe(false);
  });

  it('renders ungrouped options directly under the listbox, before groups', async () => {
    const items: CommandItem[] = [
      { id: 'loose', label: 'Loose', onSelect: () => {} },
      { id: 'a', label: 'Alpha', group: 'Files', onSelect: () => {} },
    ];
    renderWithTheme(<Command open onClose={() => {}} items={items} />);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    const listbox = screen.getByRole('listbox');
    const loose = screen.getByRole('option', { name: /Loose/ });
    const group = screen.getByRole('group', { name: 'Files' });
    // Ungrouped option is a direct child of the listbox, not nested in a group.
    expect(loose.parentElement).toBe(listbox);
    expect(group.contains(loose)).toBe(false);
  });

  it('navigates in rendered (visual) order when grouped and ungrouped items are mixed', async () => {
    const user = userEvent.setup();
    // Source order interleaves grouped/ungrouped; rendered order is
    // ungrouped-first then groups. Keyboard order must follow the rendered order.
    const items: CommandItem[] = [
      { id: 'a', label: 'Alpha', group: 'Files', onSelect: () => {} },
      { id: 'loose1', label: 'LooseOne', onSelect: () => {} },
      { id: 'b', label: 'Beta', group: 'Edit', onSelect: () => {} },
      { id: 'loose2', label: 'LooseTwo', onSelect: () => {} },
    ];
    renderWithTheme(<Command open onClose={() => {}} items={items} />);
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    // getAllByRole returns options in DOM order:
    // LooseOne, LooseTwo (ungrouped), then Alpha (Files), then Beta (Edit).
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual([
      'LooseOne',
      'LooseTwo',
      'Alpha',
      'Beta',
    ]);

    // Active starts on the first rendered option.
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id));

    // ArrowDown must move highlight to the next *visual* option, not the next source item.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[2].id));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[3].id));

    // ArrowUp walks back up in the same visual order.
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[2].id));
  });

  it('skips a disabled item during navigation and selection', async () => {
    const user = userEvent.setup();
    const disabledSelect = mock(() => {});
    const lastSelect = mock(() => {});
    const onClose = mock(() => {});
    const items: CommandItem[] = [
      { id: 'one', label: 'One', onSelect: () => {} },
      { id: 'two', label: 'Two', disabled: true, onSelect: disabledSelect },
      { id: 'three', label: 'Three', onSelect: lastSelect },
    ];
    renderWithTheme(<Command open onClose={onClose} items={items} />);
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());

    const options = screen.getAllByRole('option');
    // ArrowDown should skip the disabled "Two" and land on "Three".
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(options[2].id));

    await user.keyboard('{Enter}');
    expect(lastSelect).toHaveBeenCalledTimes(1);
    expect(disabledSelect).not.toHaveBeenCalled();

    // Clicking the disabled item does nothing.
    fireEvent.click(options[1]);
    expect(disabledSelect).not.toHaveBeenCalled();
  });
});
