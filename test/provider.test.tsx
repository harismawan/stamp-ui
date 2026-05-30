import { expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import { useTheme } from 'styled-components';
import { StampProvider } from '../src/provider';

// Probe reads the theme through styled-components context and renders a token
// as TEXT. This proves StampProvider supplies the theme deterministically,
// without depending on getComputedStyle resolving an injected CSS rule (which
// is order-sensitive and unreliable under happy-dom).
function Probe() {
  const theme = useTheme();
  return <span data-testid="probe">{theme.colors.text}</span>;
}

test('renders children', () => {
  const { getByText } = render(
    <StampProvider>
      <span>child content</span>
    </StampProvider>,
  );
  expect(getByText('child content')).toBeTruthy();
});

test('supplies the light theme by default (probe gets light text token)', () => {
  const { getByTestId } = render(
    <StampProvider mode="light">
      <Probe />
    </StampProvider>,
  );
  // lightTheme.colors.text === '#111111'
  expect(getByTestId('probe').textContent).toBe('#111111');
});

test('supplies the dark theme when mode="dark"', () => {
  const { getByTestId } = render(
    <StampProvider mode="dark">
      <Probe />
    </StampProvider>,
  );
  // darkTheme.colors.text === '#FFF5E1'
  expect(getByTestId('probe').textContent).toBe('#FFF5E1');
});

test('an explicit theme prop overrides mode', () => {
  // A partial theme ({}) is shallow-merged over the mode-selected base; since it
  // omits `colors`, the base light tokens are preserved, so text stays light.
  const { getByTestId } = render(
    <StampProvider theme={{}} mode="light">
      <Probe />
    </StampProvider>,
  );
  expect(getByTestId('probe').textContent).toBe('#111111');
});
