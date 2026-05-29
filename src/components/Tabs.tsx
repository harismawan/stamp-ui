import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  baseId: string;
  register: (value: string, disabled: boolean) => void;
  unregister: (value: string) => void;
  focusByValue: (value: string) => void;
  setTabRef: (value: string, el: HTMLButtonElement | null) => void;
  getOrderedValues: () => string[];
  isDisabled: (value: string) => boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <Tabs>`);
  }
  return ctx;
}

let tabsIdCounter = 0;

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onChange, children }: TabsProps) {
  const baseIdRef = useRef<string>('');
  if (!baseIdRef.current) {
    tabsIdCounter += 1;
    baseIdRef.current = `stamp-tabs-${tabsIdCounter}`;
  }

  // Preserve registration order of tab values for arrow navigation.
  const orderRef = useRef<string[]>([]);
  const refsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  // Track each tab's disabled state so arrow navigation can skip disabled tabs.
  const disabledRef = useRef<Map<string, boolean>>(new Map());

  const register = useCallback((v: string, disabled: boolean) => {
    if (!orderRef.current.includes(v)) {
      orderRef.current = [...orderRef.current, v];
    }
    disabledRef.current.set(v, disabled);
  }, []);

  const unregister = useCallback((v: string) => {
    orderRef.current = orderRef.current.filter((x) => x !== v);
    refsRef.current.delete(v);
    disabledRef.current.delete(v);
  }, []);

  const isDisabled = useCallback((v: string) => disabledRef.current.get(v) === true, []);

  const setTabRef = useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el) {
      refsRef.current.set(v, el);
    } else {
      refsRef.current.delete(v);
    }
  }, []);

  const focusByValue = useCallback((v: string) => {
    const el = refsRef.current.get(v);
    if (el) el.focus();
  }, []);

  const getOrderedValues = useCallback(() => orderRef.current.slice(), []);

  const ctx = useMemo<TabsContextValue>(
    () => ({
      value,
      onChange,
      baseId: baseIdRef.current,
      register,
      unregister,
      focusByValue,
      setTabRef,
      getOrderedValues,
      isDisabled,
    }),
    [value, onChange, register, unregister, focusByValue, setTabRef, getOrderedValues, isDisabled],
  );

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

const StyledTabList = styled.div`
  display: flex;
  gap: ${(p) => p.theme.space[2]};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
  margin-bottom: ${(p) => p.theme.space[4]};
`;

export interface TabListProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

export function TabList({ children, ...rest }: TabListProps) {
  return (
    <StyledTabList role="tablist" {...rest}>
      {children}
    </StyledTabList>
  );
}

const StyledTab = styled.button<{ $active: boolean }>`
  appearance: none;
  cursor: pointer;
  font-family: ${(p) => p.theme.font.body};
  font-weight: ${(p) => (p.$active ? 800 : 700)};
  font-size: 0.95rem;
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[4]};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-bottom: none;
  border-top-left-radius: ${(p) => p.theme.radii.md};
  border-top-right-radius: ${(p) => p.theme.radii.md};
  background: ${(p) => (p.$active ? p.theme.colors.surface : p.theme.colors.surfaceMuted)};
  color: ${(p) => (p.$active ? p.theme.colors.text : p.theme.colors.textMuted)};
  box-shadow: ${(p) => (p.$active ? p.theme.shadow.stampSm : p.theme.shadow.none)};
  transition: background 80ms ${(p) => p.theme.easing.out},
    color 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    color: ${(p) => p.theme.colors.text};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export interface TabProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'value'> {
  value: string;
  children: React.ReactNode;
}

export function Tab({ value, children, onClick, onKeyDown, disabled, ...rest }: TabProps) {
  const ctx = useTabsContext('Tab');
  const active = ctx.value === value;

  React.useEffect(() => {
    ctx.register(value, disabled === true);
    return () => ctx.unregister(value);
  }, [ctx, value, disabled]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) ctx.onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const order = ctx.getOrderedValues();
    const idx = order.indexOf(value);
    if (idx === -1) return;

    // Step over disabled tabs in the given direction (wrapping), so arrow
    // navigation never lands on a disabled tab. Returns null if no enabled
    // tab exists in that direction.
    const seekEnabled = (start: number, step: number): number | null => {
      for (let i = 1; i <= order.length; i += 1) {
        const candidate = (start + step * i + order.length * order.length) % order.length;
        if (!ctx.isDisabled(order[candidate])) return candidate;
      }
      return null;
    };
    // Scan from one end inward for the first/last enabled tab (Home/End).
    const firstEnabled = (step: number): number | null => {
      const begin = step > 0 ? 0 : order.length - 1;
      for (let i = 0; i < order.length; i += 1) {
        const candidate = begin + step * i;
        if (!ctx.isDisabled(order[candidate])) return candidate;
      }
      return null;
    };

    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIdx = seekEnabled(idx, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIdx = seekEnabled(idx, -1);
    } else if (e.key === 'Home') {
      nextIdx = firstEnabled(1);
    } else if (e.key === 'End') {
      nextIdx = firstEnabled(-1);
    } else {
      return;
    }
    e.preventDefault();
    if (nextIdx !== null) {
      const nextValue = order[nextIdx];
      ctx.onChange(nextValue);
      ctx.focusByValue(nextValue);
    }
  };

  return (
    <StyledTab
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      $active={active}
      ref={(el) => ctx.setTabRef(value, el)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </StyledTab>
  );
}

const StyledTabPanel = styled.div`
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.border};
    outline-offset: 2px;
  }
`;

export interface TabPanelProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'value'> {
  value: string;
  children: React.ReactNode;
}

export function TabPanel({ value, children, ...rest }: TabPanelProps) {
  const ctx = useTabsContext('TabPanel');
  const active = ctx.value === value;
  return (
    <StyledTabPanel
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      hidden={!active}
      tabIndex={0}
      {...rest}
    >
      {children}
    </StyledTabPanel>
  );
}
