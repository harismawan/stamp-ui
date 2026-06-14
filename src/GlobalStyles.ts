import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
  }

  body {
    font-family: ${(p) => p.theme.font.body};
    background: ${(p) => p.theme.colors.bg};
    color: ${(p) => p.theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
    transition: background 200ms ${(p) => p.theme.easing.out},
      color 200ms ${(p) => p.theme.easing.out};
  }

  a {
    color: ${(p) => p.theme.colors.accentDark};
    text-decoration: none;
    transition: color 120ms ${(p) => p.theme.easing.out};
    /*
     * Hover darkens to the body text color (theme-aware: ink on cream ~18:1,
     * cream-white on dark ~17:1) so links stay highly readable. No underline.
     */
    &:hover {
      color: ${(p) => p.theme.colors.text};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  button:focus-visible, a:focus-visible, input:focus-visible,
  select:focus-visible, textarea:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.border};
    outline-offset: 2px;
  }

  /*
   * Composite search controls (SearchBar) wrap the input in a rounded pill that
   * casts its own :focus-within ring. The bare input is rectangular, so a
   * focus-visible outline would draw a rect poking outside the pill. Suppress
   * it here; the pill's focus-within affordance stands in (submit button keeps
   * its own outline).
   */
  [role="search"] input:focus-visible {
    outline: none;
  }

  h1, h2, h3, h4 {
    margin: 0;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.125rem; }

  p { margin: 0; }

  ::selection {
    background: ${(p) => p.theme.colors.primary};
    color: ${(p) => p.theme.colors.primaryInk};
  }

  /* Saweria-flavored cream "tape" dot pattern under hero sections. */
  .stamp-noise {
    position: relative;
    isolation: isolate;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image: radial-gradient(
          circle at 1px 1px,
          ${(p) => p.theme.colors.borderStrong} 1px,
          transparent 0
        );
      background-size: 18px 18px;
      opacity: 0.5;
      z-index: -1;
    }
  }

  .money {
    font-family: ${(p) => p.theme.font.mono};
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
`;
