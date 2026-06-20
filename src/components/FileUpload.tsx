import * as React from 'react';
import styled from 'styled-components';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

export interface FileUploadProps {
  /** Controlled list of selected files. When provided, the component is controlled. */
  value?: File[];
  /** Initial files when uncontrolled. Defaults to `[]`. */
  defaultValue?: File[];
  /** Fired with the next file list whenever files are added or removed. */
  onChange?: (files: File[]) => void;
  /** Accept string, e.g. `"image/*,.pdf"`. Validated loosely against MIME/extension. */
  accept?: string;
  /** Allow more than one file. Defaults to `false` (a new file replaces the current one). */
  multiple?: boolean;
  /** Maximum size per file, in bytes. */
  maxSize?: number;
  /** Maximum number of files that may be held at once. */
  maxFiles?: number;
  /** Disable the whole control (blocks focus, click, drop and the input). */
  disabled?: boolean;
  /** Fired with the rejected files and a machine-readable reason. */
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** Dropzone prompt. Defaults to "Drag files here or click to browse". */
  label?: React.ReactNode;
  /** Optional id; an internal one is generated with `useId` otherwise. */
  id?: string;
  /**
   * Per-file upload progress as a percentage (0–100). Return `null`/`undefined`
   * for files that are not uploading. When a value below 100 is returned, the
   * row renders a progress bar (in place of the file size) and disables its
   * remove button until the upload settles.
   */
  progress?: (file: File, index: number) => number | null | undefined;
}

export interface FileUploadRejection {
  file: File;
  reason: FileUploadRejectReason;
}

export type FileUploadRejectReason = 'too-large' | 'too-many' | 'wrong-type';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[3]};
  width: 100%;
`;

const Zone = styled.div<{ $dragging: boolean; $disabled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${(p) => p.theme.space[2]};
  padding: ${(p) => p.theme.space[7]} ${(p) => p.theme.space[5]};
  text-align: center;
  font-family: ${(p) => p.theme.font.body};
  color: ${(p) => p.theme.colors.text};
  background: ${(p) =>
    p.$dragging ? p.theme.colors.primarySoft : p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => (p.$dragging ? p.theme.shadow.stamp : p.theme.shadow.none)};
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};
  transition: box-shadow 80ms ${(p) => p.theme.easing.out},
    background 80ms ${(p) => p.theme.easing.out};

  &:focus {
    outline: none;
    box-shadow: ${(p) => p.theme.shadow.stamp};
  }
`;

const Prompt = styled.span`
  font-size: 0.9375rem;
  font-weight: 700;
`;

const Hint = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSubtle};
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const FileList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const FileRow = styled.li`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  font-family: ${(p) => p.theme.font.body};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
`;

const Media = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  overflow: hidden;
  color: ${(p) => p.theme.colors.textMuted};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.xs};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Meta = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
  flex: 1;
  min-width: 0;
`;

const FileName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowBar = styled.span`
  display: block;
  width: 100%;
  height: 6px;
  overflow: hidden;
  background: ${(p) => p.theme.colors.surfaceMuted};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};

  > span {
    display: block;
    height: 100%;
    background: ${(p) => p.theme.colors.primary};
    transition: width 80ms ${(p) => p.theme.easing.out};
  }
`;

const FileSize = styled.span`
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSubtle};
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  margin: 0;
  color: ${(p) => p.theme.colors.textMuted};
  background: transparent;
  border: none;
  border-radius: ${(p) => p.theme.radii.xs};
  cursor: pointer;
  transition: color 80ms ${(p) => p.theme.easing.out},
    background 80ms ${(p) => p.theme.easing.out};

  &:hover {
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => p.theme.colors.surfaceSunken};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
`;

/** Humanize a byte count into B / KB / MB. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

/**
 * Loose `accept` match: each token is either a MIME type (with optional
 * wildcard like `image/*`) or a file extension (`.pdf`). Empty/undefined
 * accept matches everything.
 */
function matchesAccept(file: File, accept?: string): boolean {
  if (accept == null || accept.trim() === '') return true;
  const tokens = accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return name.endsWith(token);
    }
    if (token.endsWith('/*')) {
      const base = token.slice(0, token.indexOf('/'));
      return type.startsWith(`${base}/`);
    }
    return type === token;
  });
}

/**
 * Per-row media: an object-URL thumbnail for image files (revoked on unmount or
 * when the file changes), or the generic file glyph otherwise. Encapsulating the
 * URL lifecycle per row keeps creation/revocation correctly paired.
 */
const RowMedia: React.FC<{ file: File }> = ({ file }) => {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!file.type.startsWith('image/') || typeof URL?.createObjectURL !== 'function') {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <Media>
      {url != null ? (
        <img src={url} alt="" />
      ) : (
        <FileIcon size={18} strokeWidth={2.5} aria-hidden="true" />
      )}
    </Media>
  );
};

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  defaultValue = [],
  onChange,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  onReject,
  label = 'Drag files here or click to browse',
  id,
  progress,
}) => {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<File[]>(defaultValue);
  const files = isControlled ? (value as File[]) : uncontrolled;

  const commit = React.useCallback(
    (next: File[]) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const ingest = React.useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;

      const rejections: FileUploadRejection[] = [];
      // For single mode, a new accepted file replaces whatever is held, so the
      // running "accepted" set starts empty; for multi we merge onto current.
      const accepted: File[] = multiple ? [...files] : [];

      for (const file of incoming) {
        if (maxSize != null && file.size > maxSize) {
          rejections.push({ file, reason: 'too-large' });
          continue;
        }
        if (!matchesAccept(file, accept)) {
          rejections.push({ file, reason: 'wrong-type' });
          continue;
        }
        if (!multiple) {
          // Replace: only the last accepted file survives.
          accepted.length = 0;
          accepted.push(file);
          continue;
        }
        if (maxFiles != null && accepted.length >= maxFiles) {
          rejections.push({ file, reason: 'too-many' });
          continue;
        }
        accepted.push(file);
      }

      if (rejections.length > 0) onReject?.(rejections);

      // Single mode: if nothing passed validation, keep the current selection
      // rather than wiping it with an empty commit.
      if (!multiple && accepted.length === 0) return;

      const changed =
        accepted.length !== files.length ||
        accepted.some((f, i) => f !== files[i]);
      if (changed) commit(accepted);
    },
    [disabled, multiple, files, maxSize, accept, maxFiles, onReject, commit],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list != null) ingest(Array.from(list));
    // Reset so selecting the same file again re-fires change.
    e.target.value = '';
  };

  const openPicker = (e?: React.SyntheticEvent) => {
    if (disabled) return;
    // If the dropzone is nested inside a <label>, the browser's default action
    // forwards this click to the labelable file input — which we ALSO trigger
    // explicitly below, opening the OS picker twice. Cancelling the default
    // leaves only our click, so the component is safe to use inside a label.
    e?.preventDefault();
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    // dragleave fires when the cursor crosses into a child element (icon /
    // prompt / hint). Only clear the highlight when the pointer has actually
    // left the zone, not when it moves onto a descendant.
    const next = e.relatedTarget as Node | null;
    if (next != null && e.currentTarget.contains(next)) return;
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const list = e.dataTransfer?.files;
    if (list != null) ingest(Array.from(list));
  };

  const remove = (target: File) => {
    if (disabled) return;
    commit(files.filter((f) => f !== target));
  };

  const hint = multiple
    ? maxFiles != null
      ? `Up to ${maxFiles} files`
      : 'Multiple files allowed'
    : 'Single file';

  return (
    <Wrap>
      <Zone
        role="button"
        tabIndex={disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        aria-controls={inputId}
        $dragging={dragging}
        $disabled={disabled}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud size={28} strokeWidth={2.5} aria-hidden="true" />
        <Prompt>{label}</Prompt>
        <Hint>{hint}</Hint>
      </Zone>

      <HiddenInput
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        onChange={handleInputChange}
      />

      {files.length > 0 ? (
        <FileList>
          {files.map((file, i) => {
            const raw = progress?.(file, i);
            const pct =
              raw == null ? null : Math.max(0, Math.min(100, raw));
            const uploading = pct != null && pct < 100;
            return (
              <FileRow key={`${file.name}-${file.size}-${i}`}>
                <RowMedia file={file} />
                <Meta>
                  <FileName>{file.name}</FileName>
                  {uploading ? (
                    <RowBar
                      role="progressbar"
                      aria-valuenow={Math.round(pct)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span style={{ width: `${pct}%` }} />
                    </RowBar>
                  ) : null}
                </Meta>
                <FileSize>
                  {pct != null ? `${Math.round(pct)}%` : formatFileSize(file.size)}
                </FileSize>
                <RemoveButton
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  disabled={disabled || uploading}
                  onClick={() => remove(file)}
                >
                  <X size={16} strokeWidth={3} aria-hidden="true" />
                </RemoveButton>
              </FileRow>
            );
          })}
        </FileList>
      ) : null}
    </Wrap>
  );
};
