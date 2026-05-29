import * as React from 'react';
import styled from 'styled-components';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  type Placement,
} from '@floating-ui/react';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: Placement;
  children: React.ReactElement;
}

const TooltipBubble = styled.div`
  background: ${(p) => p.theme.colors.text};
  color: ${(p) => p.theme.colors.bg};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  padding: ${(p) => p.theme.space[1]} ${(p) => p.theme.space[2]};
  font-family: ${(p) => p.theme.font.body};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  max-width: 240px;
  z-index: 1000;
`;

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const child = React.Children.only(children);

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
          <TooltipBubble
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {content}
          </TooltipBubble>
        </FloatingPortal>
      )}
    </>
  );
}
