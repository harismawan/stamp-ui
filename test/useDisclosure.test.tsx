import { describe, it, expect } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useDisclosure } from '../src/hooks/useDisclosure';

describe('useDisclosure', () => {
  it('defaults to closed', () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it('respects the initial argument', () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('open() sets isOpen true', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('close() sets isOpen false', () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle() flips isOpen', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('setOpen(value) sets an explicit state', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.setOpen(true));
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.setOpen(false));
    expect(result.current.isOpen).toBe(false);
  });
});
