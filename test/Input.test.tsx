import { describe, it, expect, mock, afterEach } from 'bun:test';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './util';
import {
  Input,
  Select,
  Textarea,
  FieldWrap,
  FieldLabel,
  FieldError,
} from '../src/components/Input';

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
});
