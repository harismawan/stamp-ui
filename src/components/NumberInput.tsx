import { forwardRef, useEffect, useState } from 'react';
import { Input } from './Input';

export interface NumberInputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'> {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  thousandSep?: string;
  decimalSep?: string;
}

function formatThousand(raw: string | number | undefined, thousandSep: string): string {
  if (raw == null || raw === '') return '';
  const s = String(raw);
  const intPart = s.includes('.') ? s.split('.')[0] : s;
  const cleaned = intPart.replace(/[^\d-]/g, '');
  if (!cleaned || cleaned === '-') return cleaned;
  const neg = cleaned.startsWith('-');
  const body = cleaned.replace(/-/g, '');
  if (!body) return neg ? '-' : '';
  return (neg ? '-' : '') + body.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
}

function parseRaw(formatted: string): string {
  if (formatted == null || formatted === '') return '';
  const s = String(formatted);
  const neg = s.trim().startsWith('-');
  const digits = s.replace(/\D/g, '');
  if (!digits) return neg ? '-' : '';
  return (neg ? '-' : '') + digits;
}

/**
 * Text input that formats the integer part of a number with a thousand
 * separator (default '.'). Stores/emits the raw integer-string digits via
 * onChange({ target: { value } }). A typed-friendly, generalized replacement
 * for a money/number field. The decimalSep is accepted for API symmetry.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onChange, thousandSep = '.', decimalSep = ',', ...rest },
  ref,
) {
  void decimalSep;
  // Track the raw digit-string internally so masking survives a controlled
  // `value` that is not echoed back synchronously per keystroke. The buffer is
  // re-seeded whenever the incoming `value` prop diverges from it.
  const propRaw = parseRaw(value == null ? '' : String(value));
  const [raw, setRaw] = useState(propRaw);
  useEffect(() => {
    setRaw((prev) => (prev === propRaw ? prev : propRaw));
  }, [propRaw]);
  const display = formatThousand(raw, thousandSep);
  return (
    <Input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={(e) => {
        const next = parseRaw(e.target.value);
        setRaw(next);
        onChange?.({ target: { value: next } });
      }}
      {...rest}
    />
  );
});
