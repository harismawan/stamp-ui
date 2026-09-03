import styled from 'styled-components';

export interface KbdProps extends React.ComponentPropsWithoutRef<'kbd'> {
  children?: React.ReactNode;
}

const Key = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.mono};
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surfaceSunken};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  white-space: nowrap;
`;

/** A single keycap, e.g. `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. */
export function Kbd({ children, ...rest }: KbdProps) {
  return <Key {...rest}>{children}</Key>;
}
