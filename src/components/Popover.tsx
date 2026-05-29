import * as React from 'react';
import styled from 'styled-components';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  type Placement,
} from '@floating-ui/react';

export interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  placement?: Placement;
}

const Panel = styled.div`
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  padding: ${(p) => p.theme.space[4]};
  font-family: ${(p) => p.theme.font.body};
  min-width: 200px;
  z-index: 1000;
  outline: none;
`;

export function Popover({ trigger, children, placement = 'bottom' }: PopoverProps) {
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const child = React.Children.only(trigger);

  return (
    <>
      {React.cloneElement(
        child,
        getReferenceProps({
          ref: refs.setReference,
          ...(child.props as Record<string, unknown>),
        }),
      )}
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <Panel
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              {children}
            </Panel>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
