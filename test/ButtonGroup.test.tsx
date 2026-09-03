import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import { Button } from '../src/components/Button';
import { ButtonGroup } from '../src/components/ButtonGroup';
import { renderWithTheme } from './util';

afterEach(cleanup);

describe('ButtonGroup', () => {
  it('exposes a group role and renders every child', () => {
    renderWithTheme(
      <ButtonGroup aria-label="Text alignment">
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Text alignment' });
    expect(group).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('defaults to horizontal and reflects the orientation', () => {
    const { rerender } = renderWithTheme(
      <ButtonGroup>
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group').getAttribute('data-orientation')).toBe('horizontal');

    rerender(
      <ButtonGroup orientation="vertical">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group').getAttribute('data-orientation')).toBe('vertical');
  });
});
