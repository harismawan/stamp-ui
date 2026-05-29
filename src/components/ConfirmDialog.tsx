import { AlertTriangle } from 'lucide-react';
import styled from 'styled-components';
import { create } from 'zustand';
import { Button } from './Button';
import { Modal } from './Modal';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface Pending extends ConfirmOptions {
  resolve: (result: boolean) => void;
}

interface ConfirmStore {
  pending: Pending | null;
  open: (opts: ConfirmOptions) => Promise<boolean>;
  resolve: (result: boolean) => void;
}

const useConfirmStore = create<ConfirmStore>((set, get) => ({
  pending: null,
  open: (opts) =>
    new Promise<boolean>((resolve) => {
      const prev = get().pending;
      if (prev) prev.resolve(false);
      set({ pending: { ...opts, resolve } });
    }),
  resolve: (result) => {
    const p = get().pending;
    if (!p) return;
    p.resolve(result);
    set({ pending: null });
  },
}));

export function confirmDialog(opts: ConfirmOptions = {}): Promise<boolean> {
  return useConfirmStore.getState().open(opts);
}

const Body = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 20px;
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: ${(p) => p.theme.radii.md};
  border: 2px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.expenseSoft ?? p.theme.colors.surfaceMuted};
  color: ${(p) => p.theme.colors.expense ?? p.theme.colors.text};
`;

const Message = styled.div`
  font-size: 0.9375rem;
  line-height: 1.5;
  color: ${(p) => p.theme.colors.text};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export function ConfirmViewport() {
  const pending = useConfirmStore((s) => s.pending);
  const resolve = useConfirmStore((s) => s.resolve);
  const open = !!pending;

  return (
    <Modal open={open} onClose={() => resolve(false)} title={pending?.title ?? 'Are you sure?'}>
      <Body>
        <IconWrap>
          <AlertTriangle size={20} strokeWidth={2.5} />
        </IconWrap>
        <Message>{pending?.message ?? 'This action cannot be undone.'}</Message>
      </Body>
      <Actions>
        <Button type="button" $variant="outline" onClick={() => resolve(false)}>
          {pending?.cancelLabel ?? 'Cancel'}
        </Button>
        <Button
          type="button"
          $variant={pending?.destructive === false ? 'primary' : 'danger'}
          onClick={() => resolve(true)}
        >
          {pending?.confirmLabel ?? 'Delete'}
        </Button>
      </Actions>
    </Modal>
  );
}
