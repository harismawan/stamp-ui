import styled, { css } from 'styled-components';

export const FieldWrap = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.space[2]};
`;

export const FieldLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
`;

const baseInput = css`
  font-family: inherit;
  font-size: 1rem;
  width: 100%;
  min-width: 0;
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 11px 14px;
  transition: box-shadow 80ms ${(p) => p.theme.easing.out};

  &::placeholder {
    color: ${(p) => p.theme.colors.textSubtle};
  }

  &:focus {
    outline: none;
    box-shadow: ${(p) => p.theme.shadow.stamp};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const Input = styled.input`
  ${baseInput};
`;

export const Select = styled.select`
  ${baseInput};
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 18px) 50%,
    calc(100% - 13px) 50%;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  padding-right: 36px;
`;

export const Textarea = styled.textarea`
  ${baseInput};
  min-height: 96px;
  resize: vertical;
`;

export const FieldError = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.danger};
`;
