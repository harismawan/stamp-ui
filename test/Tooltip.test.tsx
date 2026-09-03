import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../src/components/Tooltip';
import { renderWithTheme } from './util';

afterEach(cleanup);

describe('Tooltip', () => {
  it('is hidden by default', () => {
    renderWithTheme(
      <Tooltip content="Save changes">
        <button>Save</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows tooltip content when the trigger receives focus', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tooltip content="Save changes">
        <button>Save</button>
      </Tooltip>,
    );
    await user.tab();
    const trigger = screen.getByRole('button', { name: 'Save' });
    expect(document.activeElement).toBe(trigger);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
    expect(screen.getByRole('tooltip').textContent).toBe('Save changes');
  });

  it('links the trigger to the tooltip via aria-describedby when open', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tooltip content="Save changes">
        <button>Save</button>
      </Tooltip>,
    );
    await user.tab();
    await waitFor(() => {
      const tip = screen.getByRole('tooltip');
      const trigger = screen.getByRole('button', { name: 'Save' });
      expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);
    });
  });
});
