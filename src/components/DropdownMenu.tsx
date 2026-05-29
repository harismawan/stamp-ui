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
  useListNavigation,
  useInteractions,
  useListItem,
  FloatingList,
  FloatingPortal,
  FloatingFocusManager,
  type Placement,
} from '@floating-ui/react';

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  getReferenceProps: (props?: React.HTMLProps<Element>) => Record<string, unknown>;
  getFloatingProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  getItemProps: (props?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  refs: ReturnType<typeof useFloating>['refs'];
  floatingStyles: React.CSSProperties;
  context: ReturnType<typeof useFloating>['context'];
  listRef: React.MutableRefObject<Array<HTMLElement | null>>;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const ctx = React.useContext(MenuContext);
  if (!ctx) {
    throw new Error('DropdownMenu compound components must be used within <Menu>');
  }
  return ctx;
}

export interface MenuProps {
  children: React.ReactNode;
  placement?: Placement;
}

export function Menu({ children, placement = 'bottom-start' }: MenuProps) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
  ]);

  const value = React.useMemo<MenuContextValue>(
    () => ({
      open,
      setOpen,
      activeIndex,
      setActiveIndex,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      refs,
      floatingStyles,
      context,
      listRef,
    }),
    [open, activeIndex, getReferenceProps, getFloatingProps, getItemProps, refs, floatingStyles, context],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

const TriggerButton = styled.button`
  font-family: ${(p) => p.theme.font.body};
  font-weight: 800;
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  cursor: pointer;
  transition: transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.stampSm};
  }
  &:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: ${(p) => p.theme.shadow.none};
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export interface MenuButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton({ children, ...rest }, ref) {
    const { refs, getReferenceProps } = useMenuContext();
    return (
      <TriggerButton
        type="button"
        ref={(node) => {
          refs.setReference(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...getReferenceProps(rest)}
      >
        {children}
      </TriggerButton>
    );
  },
);

const List = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  padding: ${(p) => p.theme.space[1]};
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[1]};
  z-index: 1000;
  outline: none;
`;

export interface MenuListProps {
  children: React.ReactNode;
}

export function MenuList({ children }: MenuListProps) {
  const { open, refs, floatingStyles, context, getFloatingProps, listRef, setActiveIndex } =
    useMenuContext();
  if (!open) return null;
  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false}>
        <List ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
          <FloatingList elementsRef={listRef}>{children}</FloatingList>
        </List>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

const Item = styled.div<{ $active: boolean }>`
  font-family: ${(p) => p.theme.font.body};
  font-weight: 700;
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
  background: ${(p) => (p.$active ? p.theme.colors.primarySoft : 'transparent')};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: ${(p) => p.theme.space[2]} ${(p) => p.theme.space[3]};
  cursor: pointer;
  user-select: none;
  outline: none;
`;

export interface MenuItemProps {
  onSelect: () => void;
  children: React.ReactNode;
}

export function MenuItem({ onSelect, children }: MenuItemProps) {
  const { activeIndex, getItemProps, setOpen } = useMenuContext();
  const { ref, index } = useListItem();
  const isActive = activeIndex === index;

  const handleSelect = () => {
    onSelect();
    setOpen(false);
  };

  return (
    <Item
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      $active={isActive}
      ref={ref}
      {...getItemProps({
        onClick: handleSelect,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
        },
      })}
    >
      {children}
    </Item>
  );
}
