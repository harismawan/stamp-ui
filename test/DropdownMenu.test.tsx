import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Menu, MenuButton, MenuList, MenuItem } from '../src/components/DropdownMenu';

afterEach(cleanup);

function Example({ onSelect }: { onSelect: () => void }) {
  return (
    <Menu>
      <MenuButton>Actions</MenuButton>
      <MenuList>
        <MenuItem onSelect={onSelect}>Edit</MenuItem>
        <MenuItem onSelect={() => {}}>Duplicate</MenuItem>
        <MenuItem onSelect={() => {}}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}

describe('DropdownMenu', () => {
  it('is closed by default', () => {
    renderWithTheme(<Example onSelect={() => {}} />);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens and shows items when the button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Example onSelect={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('moves the active item with ArrowDown', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Example onSelect={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const items = screen.getAllByRole('menuitem');
      expect(items[0].tabIndex).toBe(0);
    });
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const items = screen.getAllByRole('menuitem');
      expect(items[1].tabIndex).toBe(0);
    });
  });

  it('fires onSelect and closes when an item is selected with Enter', async () => {
    const user = userEvent.setup();
    const onSelect = mock(() => {});
    renderWithTheme(<Example onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('fires onSelect and closes when an item is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = mock(() => {});
    renderWithTheme(<Example onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Example onSelect={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});
