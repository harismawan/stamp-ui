import { Check } from 'lucide-react';
import styled from 'styled-components';

export const DEFAULT_SWATCHES = [
  '#111111',
  '#6B7280',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];

export interface ColorPickerProps {
  value?: string;
  onChange: (hex: string) => void;
  swatches?: string[];
}

// Relative luminance (WCAG-ish) of a hex color, 0 (black) .. 1 (white).
// Used to pick a contrasting check-mark color on each swatch.
function luminance(hex: string): number {
  const m = hex.replace('#', '');
  const full =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Dark swatches get a white check; light swatches get a near-black check so the
// 'selected' indicator stays visible regardless of the swatch color.
function checkColor(hex: string): string {
  return luminance(hex) < 0.5 ? '#fff' : '#111';
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${(p) => p.theme.space[2]};
`;

const Swatch = styled.button<{ $bg: string; $active: boolean; $check: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: ${(p) => p.theme.radii.sm};
  background: ${(p) => p.$bg};
  border: ${(p) => (p.$active ? '3px' : '2px')} solid ${(p) => p.theme.colors.border};
  color: ${(p) => p.$check};
  cursor: pointer;
  transition: transform 80ms ${(p) => p.theme.easing.out};
  &:hover {
    transform: translate(-1px, -1px);
  }
`;

export function ColorPicker({ value, onChange, swatches = DEFAULT_SWATCHES }: ColorPickerProps) {
  const cur = (value ?? '').toUpperCase();
  return (
    <Grid>
      {swatches.map((hex) => {
        const active = cur === hex.toUpperCase();
        return (
          <Swatch
            key={hex}
            type="button"
            $bg={hex}
            $active={active}
            $check={checkColor(hex)}
            aria-pressed={active}
            aria-label={hex}
            onClick={() => onChange(hex)}
          >
            {active && <Check size={16} strokeWidth={2.6} />}
          </Swatch>
        );
      })}
    </Grid>
  );
}
