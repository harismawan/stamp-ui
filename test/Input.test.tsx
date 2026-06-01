import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FieldError,
  FieldLabel,
  FieldWrap,
  Input,
  Select,
  Textarea,
} from '../src/components/Input';
import { renderWithTheme } from './util';

describe('Input set', () => {
  afterEach(cleanup);

  it('Input renders a textbox and accepts a value', () => {
    renderWithTheme(<Input value="hello" onChange={() => {}} aria-label="name" />);
    const el = screen.getByLabelText('name') as HTMLInputElement;
    expect(el.value).toBe('hello');
  });

  it('Input fires onChange when typed into', async () => {
    const onChange = mock(() => {});
    renderWithTheme(<Input defaultValue="" onChange={onChange} aria-label="name" />);
    await userEvent.type(screen.getByLabelText('name'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('Select renders options', () => {
    renderWithTheme(
      <Select aria-label="pick" defaultValue="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const el = screen.getByLabelText('pick') as HTMLSelectElement;
    expect(el.value).toBe('b');
  });

  it('Textarea renders', () => {
    renderWithTheme(<Textarea aria-label="notes" defaultValue="x" />);
    expect((screen.getByLabelText('notes') as HTMLTextAreaElement).value).toBe('x');
  });

  it('FieldWrap, FieldLabel and FieldError render text', () => {
    renderWithTheme(
      <FieldWrap>
        <FieldLabel>Email</FieldLabel>
        <Input aria-label="email" />
        <FieldError>Required</FieldError>
      </FieldWrap>,
    );
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Required')).toBeTruthy();
  });

  it('clearable hides the clear button when the value is empty', () => {
    renderWithTheme(<Input clearable value="" onChange={() => {}} aria-label="q" />);
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  it('clearable shows the clear button when the value is non-empty', () => {
    renderWithTheme(<Input clearable value="abc" onChange={() => {}} aria-label="q" />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy();
  });

  it('clearable fires onClear when the clear button is clicked', async () => {
    const onClear = mock(() => {});
    renderWithTheme(
      <Input clearable value="abc" onChange={() => {}} onClear={onClear} aria-label="q" />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
