import * as React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  title?: string;
  children: React.ReactNode;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${(p) => p.theme.colors.overlay};
  z-index: 1100;
  display: flex;
`;

const Panel = styled.div<{ $side: DrawerSide }>`
  position: fixed;
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.font.body};
  box-shadow: ${(p) => p.theme.shadow.stampLg};
  display: flex;
  flex-direction: column;
  z-index: 1101;
  outline: none;
  transition: transform 80ms ${(p) => p.theme.easing.out};

  ${(p) => {
    switch (p.$side) {
      case 'left':
        return `
          top: 0; left: 0; bottom: 0;
          width: min(360px, 90vw);
          border-right: 2px solid ${p.theme.colors.border};
        `;
      case 'top':
        return `
          top: 0; left: 0; right: 0;
          height: min(360px, 90vh);
          border-bottom: 2px solid ${p.theme.colors.border};
        `;
      case 'bottom':
        return `
          bottom: 0; left: 0; right: 0;
          height: min(360px, 90vh);
          border-top: 2px solid ${p.theme.colors.border};
        `;
      case 'right':
      default:
        return `
          top: 0; right: 0; bottom: 0;
          width: min(360px, 90vw);
          border-left: 2px solid ${p.theme.colors.border};
        `;
    }
  }}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: ${(p) => p.theme.space[4]};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
  font-weight: 800;
  font-size: 18px;
`;

const Body = styled.div`
  padding: ${(p) => p.theme.space[4]};
  overflow: auto;
  flex: 1;
`;

export function Drawer({ open, onClose, side = 'right', title, children }: DrawerProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <Overlay
      data-testid="drawer-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-side={side}
        $side={side}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && <Header>{title}</Header>}
        <Body>{children}</Body>
      </Panel>
    </Overlay>,
    document.body,
  );
}
