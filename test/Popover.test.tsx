import { describe, it, expect, afterEach } from 'bun:test';
import { screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { Popover } from '../src/components/Popover';

afterEach(cleanup);

describe('Popover', () => {
  it('is closed by default', () => {
    renderWithTheme(
      <Popover trigger={<button>Open</button>}>
        <p>Panel body</p>
      </Popover>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the content when the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Popover trigger={<button>Open</button>}>
        <p>Panel body</p>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    expect(screen.getByText('Panel body')).toBeTruthy();
  });

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Popover trigger={<button>Open</button>}>
        <p>Panel body</p>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <div>
        <Popover trigger={<button>Open</button>}>
          <p>Panel body</p>
        </Popover>
        <button>Outside</button>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
