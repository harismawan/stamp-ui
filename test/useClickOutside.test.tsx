import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from '../src/hooks/useClickOutside';

// Testing Library does not auto-cleanup under bun:test, so stale DOM (and the
// document-level listeners this hook attaches) from a prior test would leak
// into the full suite. Matches the cleanup convention used across the repo.
afterEach(() => cleanup());

function Harness({ handler, enabled }: { handler: () => void; enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, handler, enabled);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        <button data-testid="child">child</button>
      </div>
      <div data-testid="outside">outside</div>
    </div>
  );
}

describe('useClickOutside', () => {
  it('fires handler on mousedown outside the ref', () => {
    const handler = mock(() => {});
    const { getByTestId } = render(<Harness handler={handler} />);
    fireEvent.mouseDown(getByTestId('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire on mousedown inside the ref', () => {
    const handler = mock(() => {});
    const { getByTestId } = render(<Harness handler={handler} />);
    fireEvent.mouseDown(getByTestId('inside'));
    fireEvent.mouseDown(getByTestId('child'));
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('fires on touchstart outside the ref', () => {
    const handler = mock(() => {});
    const { getByTestId } = render(<Harness handler={handler} />);
    fireEvent.touchStart(getByTestId('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const handler = mock(() => {});
    const { getByTestId } = render(<Harness handler={handler} enabled={false} />);
    fireEvent.mouseDown(getByTestId('outside'));
    expect(handler).toHaveBeenCalledTimes(0);
  });
});
