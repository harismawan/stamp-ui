import { forwardRef, useEffect, useState } from 'react';
import { Input } from './Input';

export interface NumberInputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'> {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  thousandSep?: string;
  decimalSep?: string;
}

/**
 * Reduce a string to its signed integer digits ('-' optional, digits only).
 * The caller is responsible for having already discarded any fractional part;
 * this is the single source of truth for digit/sign extraction.
 */
function keepIntegerDigits(s: string): string {
  const neg = s.trim().startsWith('-');
  const digits = s.replace(/\D/g, '');
  if (!digits) return neg ? '-' : '';
  return (neg ? '-' : '') + digits;
}

/**
 * Normalize the controlled `value` prop into a raw integer-digit string.
 * The prop is an ordinary number-like value, so a decimal separator ('.' for
 * JS numbers, or the configured decimalSep) splits off a fractional part that
 * this integer-only field intentionally drops — e.g. 1234.56 -> "1234".
 */
function propToRaw(value: string | number | undefined, decimalSep: string): string {
  if (value == null || value === '') return '';
  let s = String(value);
  // Split at the first decimal boundary and discard the fractional digits.
  const dot = s.indexOf('.');
  const sep = decimalSep ? s.indexOf(decimalSep) : -1;
  const cut = dot === -1 ? sep : sep === -1 ? dot : Math.min(dot, sep);
  if (cut !== -1) s = s.slice(0, cut);
  return keepIntegerDigits(s);
}

/**
 * Normalize what the user typed into the field back into raw integer digits.
 * The displayed value only ever contains digits, a sign and thousand
 * separators (never a decimal), so every non-digit is stripped.
 */
function inputToRaw(formatted: string): string {
  if (formatted == null || formatted === '') return '';
  return keepIntegerDigits(String(formatted));
}

/**
 * Group a raw integer-digit string into thousands for display.
 */
function formatThousand(raw: string, thousandSep: string): string {
  if (!raw || raw === '-') return raw;
  const neg = raw.startsWith('-');
  const body = neg ? raw.slice(1) : raw;
  if (!body) return neg ? '-' : '';
  return (neg ? '-' : '') + body.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
}

/**
 * Integer-only text input that groups the value with a thousand separator
 * (default '.'). Stores/emits the raw integer-digit string via
 * onChange({ target: { value } }). A typed-friendly, generalized replacement
 * for a money/number field.
 *
 * Decimals are out of scope: this field formats and emits integers only. If a
 * non-integer value is supplied (e.g. 1234.56), the fractional part is dropped
 * (-> "1234") rather than merged into the integer. The decimalSep prop is
 * accepted for API symmetry and is honoured when splitting off that fractional
 * part from the incoming value.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onChange, thousandSep = '.', decimalSep = ',', ...rest },
  ref,
) {
  // Track the raw digit-string internally so masking survives a controlled
  // `value` that is not echoed back synchronously per keystroke. The buffer is
  // re-seeded whenever the incoming `value` prop diverges from it.
  const propRaw = propToRaw(value, decimalSep);
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
        const next = inputToRaw(e.target.value);
        setRaw(next);
        onChange?.({ target: { value: next } });
      }}
      {...rest}
    />
  );
});
