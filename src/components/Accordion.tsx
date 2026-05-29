import React, { createContext, useContext, useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  baseId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <Accordion>`);
  }
  return ctx;
}

let accordionIdCounter = 0;

const StyledAccordion = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};
`;

export interface AccordionProps {
  type?: 'single' | 'multiple';
  children: React.ReactNode;
}

export function Accordion({ type = 'single', children }: AccordionProps) {
  const baseIdRef = useRef<string>('');
  if (!baseIdRef.current) {
    accordionIdCounter += 1;
    baseIdRef.current = `stamp-accordion-${accordionIdCounter}`;
  }

  const [openValues, setOpenValues] = useState<string[]>([]);

  const isOpen = useCallback((value: string) => openValues.includes(value), [openValues]);

  const toggle = useCallback(
    (value: string) => {
      setOpenValues((prev) => {
        const currentlyOpen = prev.includes(value);
        if (type === 'single') {
          return currentlyOpen ? [] : [value];
        }
        return currentlyOpen ? prev.filter((v) => v !== value) : [...prev, value];
      });
    },
    [type],
  );

  const ctx = useMemo<AccordionContextValue>(
    () => ({ isOpen, toggle, baseId: baseIdRef.current }),
    [isOpen, toggle],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <StyledAccordion>{children}</StyledAccordion>
    </AccordionContext.Provider>
  );
}

const Item = styled.div`
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  background: ${(p) => p.theme.colors.surface};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  overflow: hidden;
`;

const Header = styled.button<{ $open: boolean }>`
  appearance: none;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(p) => p.theme.space[3]};
  font-family: ${(p) => p.theme.font.body};
  font-weight: 800;
  font-size: 1rem;
  text-align: left;
  padding: ${(p) => p.theme.space[3]} ${(p) => p.theme.space[4]};
  border: none;
  background: ${(p) => (p.$open ? p.theme.colors.surfaceMuted : p.theme.colors.surface)};
  color: ${(p) => p.theme.colors.text};
  transition: background 80ms ${(p) => p.theme.easing.out};

  &:hover {
    background: ${(p) => p.theme.colors.surfaceMuted};
  }

  & svg {
    flex: none;
    transition: transform 80ms ${(p) => p.theme.easing.out};
    transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')});
  }
`;

const Region = styled.div`
  padding: ${(p) => p.theme.space[4]};
  border-top: 2px solid ${(p) => p.theme.colors.border};
  color: ${(p) => p.theme.colors.text};
`;

export interface AccordionItemProps {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
}

export function AccordionItem({ value, title, children }: AccordionItemProps) {
  const ctx = useAccordionContext('AccordionItem');
  const open = ctx.isOpen(value);
  const headerId = `${ctx.baseId}-header-${value}`;
  const regionId = `${ctx.baseId}-region-${value}`;

  return (
    <Item>
      <Header
        type="button"
        id={headerId}
        $open={open}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => ctx.toggle(value)}
      >
        <span>{title}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </Header>
      <Region role="region" id={regionId} aria-labelledby={headerId} hidden={!open}>
        {children}
      </Region>
    </Item>
  );
}
