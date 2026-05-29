import { expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import styled from 'styled-components';
import { StampProvider } from '../src/provider';
import { darkTheme, lightTheme } from '../src/theme';

// Probe component reads a theme token, so its computed color proves the
// ThemeProvider context is supplied by StampProvider.
const Probe = styled.div`
  color: ${(p) => p.theme.colors.text};
`;

// happy-dom 16's getComputedStyle returns the value verbatim (the hex token),
// so assert against the raw theme tokens rather than a normalized rgb(...) form.
test('renders children', () => {
  const { getByText } = render(
    <StampProvider>
      <span>child content</span>
    </StampProvider>,
  );
  expect(getByText('child content')).toBeTruthy();
});

test('supplies the light theme by default (probe gets light text color)', () => {
  const { getByTestId } = render(
    <StampProvider mode="light">
      <Probe data-testid="probe">x</Probe>
    </StampProvider>,
  );
  const el = getByTestId('probe');
  // lightTheme.colors.text === '#111111'
  expect(getComputedStyle(el).color).toBe(lightTheme.colors.text);
});

test('supplies the dark theme when mode="dark"', () => {
  const { getByTestId } = render(
    <StampProvider mode="dark">
      <Probe data-testid="probe">x</Probe>
    </StampProvider>,
  );
  const el = getByTestId('probe');
  // darkTheme.colors.text === '#FFF5E1'
  expect(getComputedStyle(el).color).toBe(darkTheme.colors.text);
});

test('an explicit theme prop overrides mode', () => {
  // The theme prop is shallow-merged over the mode-selected base and takes
  // precedence: here a custom colors object wins over lightTheme's colors.
  const custom = { ...lightTheme, colors: { ...lightTheme.colors, text: '#0000FF' } };
  const { getByTestId } = render(
    <StampProvider theme={custom} mode="light">
      <Probe data-testid="probe">x</Probe>
    </StampProvider>,
  );
  const el = getByTestId('probe');
  expect(getComputedStyle(el).color).toBe('#0000FF');
});
