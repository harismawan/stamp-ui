import * as React from 'react';
import styled from 'styled-components';
import { Tag } from './Tag';

export interface TagInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  max?: number;
  validate?: (tag: string) => boolean;
  /** @default false */
  allowDuplicates?: boolean;
  /** @default ['Enter', ','] */
  delimiters?: string[];
  id?: string;
  /**
   * Accessible name for the inline text input. Kept independent of
   * `placeholder` so the textbox always has a stable name.
   * @default 'Add tags'
   */
  'aria-label'?: string;
  /**
   * Accessible name for the wrapping `role="group"`, so the grouping
   * semantics convey purpose to assistive technology.
   * @default 'Tags'
   */
  groupLabel?: string;
}

const Wrap = styled.div<{ $disabled?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  width: 100%;
  min-width: 0;
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 7px 10px;
  transition: box-shadow 80ms ${(p) => p.theme.easing.out};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'text')};

  &:focus-within {
    box-shadow: ${(p) => p.theme.shadow.stamp};
  }
`;

const InlineInput = styled.input`
  flex: 1;
  min-width: 80px;
  font-family: inherit;
  font-size: 1rem;
  color: ${(p) => p.theme.colors.text};
  background: transparent;
  border: none;
  padding: 4px 2px;

  &::placeholder {
    color: ${(p) => p.theme.colors.textSubtle};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const TagInput: React.FC<TagInputProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  max,
  validate,
  allowDuplicates = false,
  delimiters = ['Enter', ','],
  id: idProp,
  'aria-label': ariaLabel = 'Add tags',
  groupLabel = 'Tags',
}) => {
  const reactId = React.useId();
  const baseId = idProp ?? reactId;

  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(
    () => value ?? defaultValue ?? [],
  );
  const tags = isControlled ? (value ?? []) : uncontrolled;

  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commit = (next: string[]) => {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  };

  const canAdd = (tag: string): boolean => {
    if (tag === '') return false;
    if (max != null && tags.length >= max) return false;
    if (validate != null && !validate(tag)) return false;
    if (!allowDuplicates && tags.includes(tag)) return false;
    return true;
  };

  const addTag = () => {
    const tag = draft.trim();
    if (!canAdd(tag)) return;
    commit([...tags, tag]);
    setDraft('');
  };

  const removeAt = (index: number) => {
    if (disabled) return;
    commit(tags.filter((_, i) => i !== index));
  };

  const isDelimiterKey = (e: React.KeyboardEvent<HTMLInputElement>): boolean => {
    return delimiters.includes(e.key);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (isDelimiterKey(e)) {
      // Prevent the literal comma (or any printable delimiter) from being typed.
      e.preventDefault();
      addTag();
      return;
    }

    if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      e.preventDefault();
      commit(tags.slice(0, -1));
    }
  };

  const focusInput = () => {
    if (!disabled) inputRef.current?.focus();
  };

  return (
    <Wrap
      role="group"
      id={baseId}
      aria-label={groupLabel}
      $disabled={disabled}
      onMouseDown={(e) => {
        // Clicking blank wrapper area focuses the input without stealing focus
        // from an interactive child (e.g. a chip remove button).
        if (e.target === e.currentTarget) {
          e.preventDefault();
          focusInput();
        }
      }}
    >
      {tags.map((tag, index) => (
        <Tag key={`${tag}-${index}`} onRemove={disabled ? undefined : () => removeAt(index)}>
          {tag}
        </Tag>
      ))}
      <InlineInput
        ref={inputRef}
        id={`${baseId}-input`}
        type="text"
        value={draft}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </Wrap>
  );
};
