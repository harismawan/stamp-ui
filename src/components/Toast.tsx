import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import styled, { keyframes } from 'styled-components';
import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info' | 'warn';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  msg: string;
  duration?: number;
}

interface ToastInput {
  kind: ToastKind;
  msg: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (toast: ToastInput) => void;
  dismiss: (id: number) => void;
}

let id = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const tid = ++id;
    set({ toasts: [...get().toasts, { id: tid, ...toast }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== tid) });
    }, toast.duration ?? 4000);
  },
  dismiss: (tid) => set({ toasts: get().toasts.filter((t) => t.id !== tid) }),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().push({ kind: 'success', msg }),
  error: (msg: string) => useToastStore.getState().push({ kind: 'error', msg }),
  info: (msg: string) => useToastStore.getState().push({ kind: 'info', msg }),
  warn: (msg: string) => useToastStore.getState().push({ kind: 'warn', msg }),
};

const slide = keyframes`
  from { transform: translateY(12px); opacity: 0; }
  to { transform: none; opacity: 1; }
`;

const Stack = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
  pointer-events: none;
`;

const Pill = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: ${(p) => p.theme.radii.md};
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  box-shadow: ${(p) => p.theme.shadow.stamp};
  color: ${(p) => p.theme.colors.text};
  font-size: 0.9375rem;
  font-weight: 600;
  animation: ${slide} 160ms ${(p) => p.theme.easing.out};
  pointer-events: auto;
  min-width: 240px;
`;

const ColoredPill = styled(Pill)<{ $kind: ToastKind }>`
  background: ${(p) =>
    p.$kind === 'success'
      ? p.theme.colors.incomeSoft
      : p.$kind === 'error'
        ? p.theme.colors.expenseSoft
        : p.$kind === 'warn'
          ? p.theme.colors.primarySoft
          : p.theme.colors.surface};
`;

const iconMap: Record<ToastKind, ComponentType<{ size?: number }>> = {
  success: CheckCircle2,
  error: XCircle,
  warn: AlertTriangle,
  info: Info,
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <Stack aria-live="polite">
      {toasts.map((t) => {
        const Icon = iconMap[t.kind] ?? iconMap.info;
        return (
          <ColoredPill key={t.id} $kind={t.kind}>
            <Icon size={18} />
            <span>{t.msg}</span>
          </ColoredPill>
        );
      })}
    </Stack>
  );
}
