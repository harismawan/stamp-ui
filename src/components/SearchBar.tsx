import { Search, X } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';

export type SearchBarSize = 'md' | 'lg' | 'xl';

export interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fired on form submit (Enter) with the current value. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  $size?: SearchBarSize;
  clearable?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles: Record<SearchBarSize, { pad: string; font: string; icon: number }> = {
  md: { pad: '10px 16px', font: '0.9375rem', icon: 18 },
  lg: { pad: '13px 20px', font: '1rem', icon: 20 },
  xl: { pad: '17px 24px', font: '1.125rem', icon: 22 },
};

const Root = styled.form<{ $size: SearchBarSize }>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[2]};
  width: 100%;
  padding: ${(p) => sizeStyles[p.$size].pad};
  font-family: ${(p) => p.theme.font.body};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.pill};
  transition: box-shadow 80ms ${(p) => p.theme.easing.out};

  &:focus-within {
    box-shadow: ${(p) => p.theme.shadow.stamp};
  }
`;

const Field = styled.input<{ $size: SearchBarSize }>`
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: ${(p) => sizeStyles[p.$size].font};
  color: inherit;
  background: transparent;
  border: none;
  padding: 0;

  &::placeholder {
    color: ${(p) => p.theme.colors.textSubtle};
  }
  &:focus {
    outline: none;
  }
`;

const IconSlot = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: ${(p) => p.theme.colors.textSubtle};
`;

const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  color: ${(p) => p.theme.colors.textMuted};
  background: transparent;
  border: none;
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;

  &:hover {
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => p.theme.colors.surfaceMuted};
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.accent};
    outline-offset: 1px;
  }
`;

/**
 * Pill search composite — the oversized discovery-page centerpiece idiom.
 * Controlled when `value` is passed, otherwise uncontrolled via `defaultValue`.
 */
export function SearchBar({
  value,
  defaultValue = '',
  onChange,
  onSubmit,
  placeholder = 'Search',
  $size = 'md',
  clearable,
  disabled,
  className,
  style,
  ...rest
}: SearchBarProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value !== undefined ? value : inner;

  const set = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  return (
    <Root
      role="search"
      $size={$size}
      className={className}
      style={style}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(current);
      }}
    >
      <IconSlot aria-hidden="true">
        <Search size={sizeStyles[$size].icon} strokeWidth={2.5} />
      </IconSlot>
      <Field
        type="search"
        $size={$size}
        value={current}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
      {clearable && current.length > 0 ? (
        <ClearButton type="button" aria-label="Clear" onClick={() => set('')}>
          <X size={16} strokeWidth={2.5} aria-hidden="true" />
        </ClearButton>
      ) : null}
    </Root>
  );
}
