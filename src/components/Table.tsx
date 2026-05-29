import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  overflow: hidden;
  font-family: ${(p) => p.theme.font.body};
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surface};
`;

export const THead = styled.thead`
  background: ${(p) => p.theme.colors.surfaceMuted};
`;

export const TBody = styled.tbody``;

export const Tr = styled.tr`
  transition: background 80ms ${(p) => p.theme.easing.out};

  tbody &:hover {
    background: ${(p) => p.theme.colors.surfaceSunken};
  }
`;

export const Th = styled.th`
  text-align: left;
  font-weight: 800;
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
  color: ${(p) => p.theme.colors.text};
  white-space: nowrap;
`;

export const Td = styled.td`
  text-align: left;
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  border-bottom: 1px solid ${(p) => p.theme.colors.borderSoft};
  color: ${(p) => p.theme.colors.text};

  tr:last-child & {
    border-bottom: none;
  }
`;
