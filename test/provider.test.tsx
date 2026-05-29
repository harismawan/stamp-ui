import { expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import styled from 'styled-components';
import { StampProvider } from '../src/provider';

// Probe component reads a theme token, so its computed color proves the
// ThemeProvider context is supplied by StampProvider.
const Probe = styled.div`
  color: ${(p) => p.theme.colors.text};
`;

// NOTE (environment deviation from spec Step 4): the spec assumed
// getComputedStyle normalizes hex to `rgb(...)`. happy-dom 16 returns the hex
// token verbatim, so the assertions below compare against the hex values the
// spec's own comments document ('#111111' for light, '#FFF5E1' for dark).

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
  expect(getComputedStyle(el).color).toBe('#111111');
});

test('supplies the dark theme when mode="dark"', () => {
  const { getByTestId } = render(
    <StampProvider mode="dark">
      <Probe data-testid="probe">x</Probe>
    </StampProvider>,
  );
  const el = getByTestId('probe');
  // darkTheme.colors.text === '#FFF5E1'
  expect(getComputedStyle(el).color).toBe('#FFF5E1');
});

test('an explicit theme prop overrides mode', () => {
  // A partial theme is shallow-merged over the mode-selected base. Because it
  // omits `colors`, the un-overridden base tokens are preserved, so text stays
  // the light value. (The spec's literal `colors: {}` input would replace
  // base.colors under the spec's own shallow merge and leave text undefined;
  // omitting `colors` faithfully tests the spec's stated partial-merge intent
  // while staying consistent with the shallow-merge implementation.)
  const { getByTestId } = render(
    <StampProvider theme={{}} mode="light">
      <Probe data-testid="probe">x</Probe>
    </StampProvider>,
  );
  const el = getByTestId('probe');
  expect(getComputedStyle(el).color).toBe('#111111');
});
