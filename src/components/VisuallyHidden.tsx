import styled, { css } from 'styled-components';

/**
 * The standard clip-rect pattern: removed from the visual layer, kept in the
 * accessibility tree and still focusable.
 *
 * Exported as a `css` block because the components that need it hide a real
 * `<input>` underneath custom-painted UI, and `styled.input` can't extend a
 * styled `<span>`.
 */
export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

/** Screen-reader-only text, e.g. a label for an icon-only control. */
export const VisuallyHidden = styled.span`
  ${visuallyHidden}
`;
