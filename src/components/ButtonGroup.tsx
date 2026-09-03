import styled from 'styled-components';

export interface ButtonGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}

/**
 * Joins adjacent Buttons into one slab.
 *
 * Children are targeted by CSS rather than cloneElement because Button is a
 * `styled.button`, not a function component — so this also works with plain
 * buttons, anchors, or anything else you nest.
 *
 * Purely visual: for a group that tracks which option is chosen, use
 * SegmentedControl or ChipGroup.
 */
const Root = styled.div<{ $orientation: 'horizontal' | 'vertical' }>`
  display: inline-flex;
  flex-direction: ${(p) => (p.$orientation === 'vertical' ? 'column' : 'row')};
  align-items: stretch;
  width: fit-content;
  border-radius: ${(p) => p.theme.radii.md};
  /* One shadow for the whole slab: individually shadowed buttons would each
     cast onto their neighbour along the seam. */
  box-shadow: ${(p) => p.theme.shadow.stamp};

  & > * {
    box-shadow: none;
    border-radius: 0;
  }

  /* Two adjacent 2px borders read as a 4px seam — pull one back over the other. */
  & > * + * {
    ${(p) => (p.$orientation === 'vertical' ? 'margin-top: -2px;' : 'margin-left: -2px;')}
  }

  & > *:first-child {
    ${(p) =>
      p.$orientation === 'vertical'
        ? `border-top-left-radius: ${p.theme.radii.md};
           border-top-right-radius: ${p.theme.radii.md};`
        : `border-top-left-radius: ${p.theme.radii.md};
           border-bottom-left-radius: ${p.theme.radii.md};`}
  }

  & > *:last-child {
    ${(p) =>
      p.$orientation === 'vertical'
        ? `border-bottom-left-radius: ${p.theme.radii.md};
           border-bottom-right-radius: ${p.theme.radii.md};`
        : `border-top-right-radius: ${p.theme.radii.md};
           border-bottom-right-radius: ${p.theme.radii.md};`}
  }

  /* Buttons normally slide into their own shadow on press. Inside a group that
     would tear the seam open, so the slab stays put and only shifts colour. */
  & > *:hover,
  & > *:active {
    transform: none;
    box-shadow: none;
  }

  /* Keep the focused button's ring above its neighbours' borders. */
  & > *:focus-visible {
    position: relative;
    z-index: 1;
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }

  transition:
    transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};
`;

export function ButtonGroup({ orientation = 'horizontal', children, ...rest }: ButtonGroupProps) {
  return (
    <Root role="group" data-orientation={orientation} $orientation={orientation} {...rest}>
      {children}
    </Root>
  );
}
