import * as LucideIcons from 'lucide-react';
import type { ComponentType } from 'react';
import styled from 'styled-components';

export const DEFAULT_ICONS = [
  'Star',
  'Heart',
  'Tag',
  'Folder',
  'Bookmark',
  'Bell',
  'Flag',
  'Home',
  'Settings',
  'Zap',
  'Smile',
  'Globe',
];

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number }>;

export interface IconPickerProps {
  value?: string;
  onChange: (name: string) => void;
  icons?: string[];
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${(p) => p.theme.space[2]};
`;

const Tile = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: ${(p) => p.theme.radii.sm};
  background: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.surface)};
  border: ${(p) => (p.$active ? '3px' : '2px')} solid ${(p) => p.theme.colors.border};
  color: ${(p) => p.theme.colors.text};
  cursor: pointer;
  transition: transform 80ms ${(p) => p.theme.easing.out};
  &:hover {
    transform: translate(-1px, -1px);
  }
`;

const registry = LucideIcons as unknown as Record<string, IconComponent>;

export function IconPicker({ value, onChange, icons = DEFAULT_ICONS }: IconPickerProps) {
  return (
    <Grid>
      {icons.map((name) => {
        const Icon = registry[name] ?? registry.CircleAlert;
        const active = value === name;
        return (
          <Tile
            key={name}
            type="button"
            $active={active}
            aria-pressed={active}
            aria-label={name}
            onClick={() => onChange(name)}
          >
            <Icon size={18} strokeWidth={2.2} />
          </Tile>
        );
      })}
    </Grid>
  );
}
