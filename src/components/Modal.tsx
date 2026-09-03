import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { X } from 'lucide-react';
import { useId } from 'react';
import styled from 'styled-components';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const Overlay = styled(FloatingOverlay)`
  background: ${(p) => p.theme.colors.overlay};
  display: grid;
  place-items: center;
  z-index: 50;
  padding: ${(p) => p.theme.space[5]};
  animation: rfade 120ms ${(p) => p.theme.easing.out};

  @keyframes rfade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Panel = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  box-shadow: ${(p) => p.theme.shadow.stampLg};
  width: 100%;
  max-width: ${(p) => (p.$size === 'lg' ? '720px' : p.$size === 'md' ? '600px' : '440px')};
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  animation: rrise 140ms ${(p) => p.theme.easing.out};

  @keyframes rrise {
    from {
      transform: translate(-4px, -4px);
    }
    to {
      transform: none;
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${(p) => p.theme.space[5]} ${(p) => p.theme.space[6]};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 800;
`;

const Body = styled.div`
  padding: ${(p) => p.theme.space[6]};
  overflow-y: auto;
`;

const CloseBtn = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  background: ${(p) => p.theme.colors.danger};
  color: ${(p) => p.theme.colors.surface};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  transition:
    transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out},
    background 80ms ${(p) => p.theme.easing.out};
  &:hover {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }
  &:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }
`;

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  const titleId = useId();
  const { refs, context } = useFloating({
    open,
    onOpenChange: (next) => {
      if (!next) onClose?.();
    },
  });
  // Escape only — the overlay's own click handler covers outside presses.
  const { getFloatingProps } = useInteractions([useDismiss(context, { outsidePress: false })]);

  if (!open) return null;
  return (
    <FloatingPortal>
      <Overlay lockScroll onClick={() => onClose?.()}>
        <FloatingFocusManager context={context}>
          <Panel
            ref={refs.setFloating}
            $size={size}
            {...getFloatingProps({
              onClick: (e) => e.stopPropagation(),
            })}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
          >
            <Header>
              <Title id={titleId}>{title}</Title>
              <CloseBtn type="button" onClick={() => onClose?.()} aria-label="Close">
                <X size={16} strokeWidth={2.5} />
              </CloseBtn>
            </Header>
            <Body>{children}</Body>
          </Panel>
        </FloatingFocusManager>
      </Overlay>
    </FloatingPortal>
  );
}
