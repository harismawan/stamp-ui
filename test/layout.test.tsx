import { describe, it, expect, afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';
import { renderWithTheme } from './util';
import { Box, Stack, HStack, VStack, Grid, Container } from '../src/components/layout';

afterEach(() => cleanup());

describe('layout primitives', () => {
  it('Box renders a div and forwards non-transient DOM props', () => {
    const { getByTestId } = renderWithTheme(
      <Box data-testid="box" $p={4} $bg="surface" $radius="md" />,
    );
    const el = getByTestId('box');
    expect(el.tagName).toBe('DIV');
    // transient style props must NOT leak to the DOM
    expect(el.hasAttribute('$p')).toBe(false);
    expect(el.hasAttribute('$bg')).toBe(false);
    const style = getComputedStyle(el);
    expect(style.padding).toBe('16px');
    expect(style.borderRadius).toBe('12px');
  });

  it('Stack defaults to column and applies gap + direction', () => {
    const { getByTestId } = renderWithTheme(
      <Stack data-testid="stack" $gap={3}>
        <div />
      </Stack>,
    );
    const el = getByTestId('stack');
    const style = getComputedStyle(el);
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('column');
    expect(style.gap).toBe('12px');
  });

  it('Stack with $direction row sets flex-direction row', () => {
    const { getByTestId } = renderWithTheme(
      <Stack data-testid="stack" $direction="row" $align="center" $justify="space-between">
        <div />
      </Stack>,
    );
    const style = getComputedStyle(getByTestId('stack'));
    expect(style.flexDirection).toBe('row');
    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('space-between');
  });

  it('HStack is a row Stack and VStack is a column Stack', () => {
    const { getByTestId } = renderWithTheme(
      <>
        <HStack data-testid="h">
          <div />
        </HStack>
        <VStack data-testid="v">
          <div />
        </VStack>
      </>,
    );
    expect(getComputedStyle(getByTestId('h')).flexDirection).toBe('row');
    expect(getComputedStyle(getByTestId('v')).flexDirection).toBe('column');
  });

  it('Grid sets grid-template-columns to repeat($cols, ...)', () => {
    const { getByTestId } = renderWithTheme(
      <Grid data-testid="grid" $cols={3} $gap={4}>
        <div />
      </Grid>,
    );
    const style = getComputedStyle(getByTestId('grid'));
    expect(style.display).toBe('grid');
    expect(style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    expect(style.gap).toBe('16px');
  });

  it('Container caps max-width and centers', () => {
    const { getByTestId } = renderWithTheme(
      <Container data-testid="c" $max={960}>
        <div />
      </Container>,
    );
    const style = getComputedStyle(getByTestId('c'));
    expect(style.maxWidth).toBe('960px');
    expect(style.marginLeft).toBe('auto');
    expect(style.marginRight).toBe('auto');
  });

  it('Container defaults to 1120px max-width', () => {
    const { getByTestId } = renderWithTheme(
      <Container data-testid="c">
        <div />
      </Container>,
    );
    expect(getComputedStyle(getByTestId('c')).maxWidth).toBe('1120px');
  });
});
