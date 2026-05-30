import { describe, it, expect, afterEach, mock } from 'bun:test';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import { lightTheme } from '../src/theme';
import { FileUpload, type FileUploadRejection } from '../src/components/FileUpload';

afterEach(cleanup);

function makeFile(name: string, opts: { size?: number; type?: string } = {}) {
  const size = opts.size ?? 4;
  const file = new File([new Uint8Array(size)], name, {
    type: opts.type ?? 'text/plain',
  });
  return file;
}

function getFileInput(): HTMLInputElement {
  // The hidden file input is the only input[type=file] in the tree.
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe('FileUpload', () => {
  it('renders the default prompt and a dropzone button', () => {
    renderWithTheme(<FileUpload />);
    expect(screen.getByText('Drag files here or click to browse')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('renders a custom label prompt', () => {
    renderWithTheme(<FileUpload label="Upload your avatar" />);
    expect(screen.getByText('Upload your avatar')).toBeTruthy();
  });

  it('fires onChange with the selected file', async () => {
    const onChange = mock((_files: File[]) => {});
    renderWithTheme(<FileUpload onChange={onChange} />);
    const file = makeFile('hello.txt');
    await userEvent.upload(getFileInput(), file);
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    const next = onChange.mock.calls[0][0];
    expect(next).toHaveLength(1);
    expect(next[0].name).toBe('hello.txt');
    expect(screen.getByText('hello.txt')).toBeTruthy();
  });

  it('replaces the current file when multiple is false', async () => {
    const onChange = mock((_files: File[]) => {});
    renderWithTheme(<FileUpload onChange={onChange} />);
    await userEvent.upload(getFileInput(), makeFile('first.txt'));
    await waitFor(() => expect(screen.getByText('first.txt')).toBeTruthy());
    await userEvent.upload(getFileInput(), makeFile('second.txt'));
    await waitFor(() => expect(screen.getByText('second.txt')).toBeTruthy());
    expect(screen.queryByText('first.txt')).toBeNull();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toHaveLength(1);
    expect(last[0].name).toBe('second.txt');
  });

  it('merges files when multiple is true', async () => {
    const onChange = mock((_files: File[]) => {});
    renderWithTheme(<FileUpload multiple onChange={onChange} />);
    await userEvent.upload(getFileInput(), makeFile('a.txt'));
    await waitFor(() => expect(screen.getByText('a.txt')).toBeTruthy());
    await userEvent.upload(getFileInput(), makeFile('b.txt'));
    await waitFor(() => expect(screen.getByText('b.txt')).toBeTruthy());
    expect(screen.getByText('a.txt')).toBeTruthy();
  });

  it('rejects files over maxSize with reason too-large', async () => {
    const onChange = mock((_files: File[]) => {});
    const onReject = mock((_r: FileUploadRejection[]) => {});
    renderWithTheme(<FileUpload maxSize={10} onChange={onChange} onReject={onReject} />);
    await userEvent.upload(getFileInput(), makeFile('big.txt', { size: 50 }));
    await waitFor(() => expect(onReject).toHaveBeenCalledTimes(1));
    const rej = onReject.mock.calls[0][0];
    expect(rej).toHaveLength(1);
    expect(rej[0].reason).toBe('too-large');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects extra files over maxFiles with reason too-many', async () => {
    const onChange = mock((_files: File[]) => {});
    const onReject = mock((_r: FileUploadRejection[]) => {});
    renderWithTheme(
      <FileUpload multiple maxFiles={1} onChange={onChange} onReject={onReject} />,
    );
    await userEvent.upload(getFileInput(), [makeFile('one.txt'), makeFile('two.txt')]);
    await waitFor(() => expect(onReject).toHaveBeenCalledTimes(1));
    const rej = onReject.mock.calls[0][0];
    expect(rej.some((r) => r.reason === 'too-many')).toBe(true);
    const accepted = onChange.mock.calls[0][0];
    expect(accepted).toHaveLength(1);
  });

  it('rejects files that do not match accept with reason wrong-type', async () => {
    // Drive via drop: the native input would pre-filter on `accept`, so the
    // drop path is what exercises the component's own accept validation.
    const onChange = mock((_files: File[]) => {});
    const onReject = mock((_r: FileUploadRejection[]) => {});
    renderWithTheme(
      <FileUpload accept=".png,image/*" onChange={onChange} onReject={onReject} />,
    );
    const zone = screen.getByRole('button');
    const file = makeFile('notes.txt', { type: 'text/plain' });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    await waitFor(() => expect(onReject).toHaveBeenCalledTimes(1));
    expect(onReject.mock.calls[0][0][0].reason).toBe('wrong-type');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts files matching an extension token', async () => {
    const onChange = mock((_files: File[]) => {});
    renderWithTheme(<FileUpload accept=".txt" onChange={onChange} />);
    await userEvent.upload(getFileInput(), makeFile('readme.txt', { type: '' }));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0][0].name).toBe('readme.txt');
  });

  it('removes a file via the remove button and fires onChange without it', async () => {
    const onChange = mock((_files: File[]) => {});
    renderWithTheme(<FileUpload multiple onChange={onChange} />);
    await userEvent.upload(getFileInput(), [makeFile('keep.txt'), makeFile('drop.txt')]);
    await waitFor(() => expect(screen.getByText('drop.txt')).toBeTruthy());
    const removeBtn = screen.getByRole('button', { name: 'Remove drop.txt' });
    await userEvent.click(removeBtn);
    await waitFor(() => expect(screen.queryByText('drop.txt')).toBeNull());
    expect(screen.getByText('keep.txt')).toBeTruthy();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.map((f: File) => f.name)).toEqual(['keep.txt']);
  });

  it('supports controlled value', async () => {
    const file = makeFile('controlled.txt');
    renderWithTheme(<FileUpload value={[file]} />);
    expect(screen.getByText('controlled.txt')).toBeTruthy();
  });

  it('handles dropped files via the drop event', async () => {
    const onChange = mock((_files: File[]) => {});
    renderWithTheme(<FileUpload onChange={onChange} />);
    const zone = screen.getByRole('button');
    const file = makeFile('dropped.txt');
    fireEvent.dragOver(zone, { dataTransfer: { files: [file] } });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0][0].name).toBe('dropped.txt');
  });

  it('opens the picker on Enter/Space key press', async () => {
    renderWithTheme(<FileUpload />);
    const zone = screen.getByRole('button');
    const input = getFileInput();
    const clickSpy = mock(() => {});
    input.click = clickSpy;
    zone.focus();
    fireEvent.keyDown(zone, { key: 'Enter' });
    fireEvent.keyDown(zone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('disabled blocks selection, focus and the input', async () => {
    const onChange = mock((_files: File[]) => {});
    renderWithTheme(<FileUpload disabled onChange={onChange} />);
    const zone = screen.getByRole('button');
    expect(zone.getAttribute('aria-disabled')).toBe('true');
    expect(zone.tabIndex).toBe(-1);
    expect(getFileInput().disabled).toBe(true);
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile('x.txt')] } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the current single-mode file when a new drop is fully rejected', async () => {
    const onChange = mock((_files: File[]) => {});
    const onReject = mock((_r: FileUploadRejection[]) => {});
    renderWithTheme(
      <FileUpload maxSize={100} onChange={onChange} onReject={onReject} />,
    );
    // Grab the dropzone before any file row (also a button) is rendered.
    const zone = screen.getByRole('button');
    // Select a valid file first.
    await userEvent.upload(getFileInput(), makeFile('keep.txt', { size: 10 }));
    await waitFor(() => expect(screen.getByText('keep.txt')).toBeTruthy());
    expect(onChange).toHaveBeenCalledTimes(1);

    // Now drop an over-size file: it must be rejected without wiping keep.txt.
    fireEvent.drop(zone, {
      dataTransfer: { files: [makeFile('big.txt', { size: 500 })] },
    });
    await waitFor(() => expect(onReject).toHaveBeenCalledTimes(1));
    expect(onReject.mock.calls[0][0][0].reason).toBe('too-large');

    // The previously selected file survives and no empty commit was made.
    expect(screen.getByText('keep.txt')).toBeTruthy();
    expect(screen.queryByText('big.txt')).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(['keep.txt']);
  });

  it('keeps the dragging highlight when dragleave fires onto a child element', () => {
    renderWithTheme(<FileUpload />);
    const zone = screen.getByRole('button');
    // A descendant of the zone (the prompt label) — crossing onto it should not
    // strobe the highlight off.
    const child = screen.getByText('Drag files here or click to browse');

    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } });
    expect(getComputedStyle(zone).boxShadow).toBe(lightTheme.shadow.stamp);

    // dragleave with relatedTarget inside the zone must NOT clear dragging.
    // Note: `fireEvent.dragLeave(el, { relatedTarget })` does not propagate
    // relatedTarget under happy-dom (it is an init-only event property), so we
    // dispatch a native event whose constructor carries relatedTarget — exactly
    // what a real browser delivers as the cursor crosses onto a descendant.
    fireEvent(
      zone,
      new MouseEvent('dragleave', { bubbles: true, relatedTarget: child } as MouseEventInit),
    );
    expect(getComputedStyle(zone).boxShadow).toBe(lightTheme.shadow.stamp);

    // dragleave that truly exits the zone (relatedTarget outside) clears it.
    fireEvent(
      zone,
      new MouseEvent('dragleave', {
        bubbles: true,
        relatedTarget: document.body,
      } as MouseEventInit),
    );
    expect(getComputedStyle(zone).boxShadow).toBe(lightTheme.shadow.none);
  });

  it('clears the dragging highlight when dragleave has no relatedTarget (left the window)', () => {
    renderWithTheme(<FileUpload />);
    const zone = screen.getByRole('button');

    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } });
    expect(getComputedStyle(zone).boxShadow).toBe(lightTheme.shadow.stamp);

    // Leaving the window yields relatedTarget === null; the highlight must clear.
    fireEvent(zone, new MouseEvent('dragleave', { bubbles: true }));
    expect(getComputedStyle(zone).boxShadow).toBe(lightTheme.shadow.none);
  });

  it('ignores dragleave when disabled', () => {
    renderWithTheme(<FileUpload disabled />);
    const zone = screen.getByRole('button');
    // Disabled zones never enter the dragging state; firing dragleave must be a
    // no-op (and must not throw on the relatedTarget guard).
    expect(() =>
      fireEvent.dragLeave(zone, { relatedTarget: document.body }),
    ).not.toThrow();
    expect(getComputedStyle(zone).boxShadow).toBe(lightTheme.shadow.none);
  });
});
