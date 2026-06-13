import React from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { Drawer, type DrawerSide } from './Drawer';

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  /** Fired by the apply button, before onClose. */
  onApply?: () => void;
  /** When given, renders the "reset all" button. */
  onResetAll?: () => void;
  title?: string;
  side?: DrawerSide;
  applyLabel?: string;
  resetAllLabel?: string;
  children: React.ReactNode;
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[5]};
`;

const FooterRow = styled.div`
  display: flex;
  gap: ${(p) => p.theme.space[3]};
  margin-top: ${(p) => p.theme.space[5]};
  padding-top: ${(p) => p.theme.space[4]};
  border-top: 2px solid ${(p) => p.theme.colors.borderSoft};

  & > * {
    flex: 1;
  }
`;

/**
 * Sectioned filter panel in a Drawer: per-section reset, global reset-all,
 * and an apply button that commits (onApply) then closes.
 */
export function FilterSheet({
  open,
  onClose,
  onApply,
  onResetAll,
  title = 'Filter',
  side = 'right',
  applyLabel = 'Apply',
  resetAllLabel = 'Reset all',
  children,
}: FilterSheetProps) {
  return (
    <Drawer open={open} onClose={onClose} side={side} title={title}>
      <Body>{children}</Body>
      <FooterRow>
        {onResetAll != null ? (
          <Button $variant="outline" onClick={onResetAll}>
            {resetAllLabel}
          </Button>
        ) : null}
        <Button
          onClick={() => {
            onApply?.();
            onClose();
          }}
        >
          {applyLabel}
        </Button>
      </FooterRow>
    </Drawer>
  );
}

export interface FilterSectionProps {
  title: string;
  /** When given, renders a small per-section reset button. */
  onReset?: () => void;
  resetLabel?: string;
  children: React.ReactNode;
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[3]};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(p) => p.theme.space[2]};
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => p.theme.colors.textMuted};
`;

export function FilterSection({
  title,
  onReset,
  resetLabel = 'Reset',
  children,
}: FilterSectionProps) {
  return (
    <Section>
      <SectionHead>
        <SectionTitle>{title}</SectionTitle>
        {onReset != null ? (
          <Button $variant="ghost" $size="sm" onClick={onReset}>
            {resetLabel}
          </Button>
        ) : null}
      </SectionHead>
      {children}
    </Section>
  );
}
