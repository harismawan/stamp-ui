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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${(p) => p.theme.space[2]};
`;

const Swatch = styled.button<{ $bg: string; $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: ${(p) => p.theme.radii.sm};
  background: ${(p) => p.$bg};
  border: ${(p) => (p.$active ? '3px' : '2px')} solid ${(p) => p.theme.colors.border};
  color: #111;
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
