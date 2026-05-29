import * as React from 'react';
import styled from 'styled-components';

export interface StepDef {
  label: string;
  description?: string;
}

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperProps {
  steps: StepDef[];
  active: number;
  orientation?: StepperOrientation;
}

type StepStatus = 'complete' | 'active' | 'upcoming';

const List = styled.ol<{ $orientation: StepperOrientation }>`
  display: flex;
  flex-direction: ${(p) => (p.$orientation === 'vertical' ? 'column' : 'row')};
  align-items: ${(p) => (p.$orientation === 'vertical' ? 'stretch' : 'flex-start')};
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: ${(p) => p.theme.font.body};
`;

const Item = styled.li<{ $orientation: StepperOrientation; $last: boolean }>`
  display: flex;
  flex-direction: ${(p) => (p.$orientation === 'vertical' ? 'row' : 'column')};
  align-items: ${(p) => (p.$orientation === 'vertical' ? 'flex-start' : 'center')};
  flex: ${(p) => (p.$orientation === 'horizontal' && !p.$last ? '1' : '0 0 auto')};
  gap: ${(p) => p.theme.space[2]};
  position: relative;
`;

const Circle = styled.span<{ $status: StepStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: ${(p) => p.theme.radii.pill};
  border: 2px solid ${(p) => p.theme.colors.border};
  box-shadow: ${(p) => p.theme.shadow.stampSm};
  font-weight: 800;
  font-size: 15px;
  background: ${(p) => {
    switch (p.$status) {
      case 'complete':
        return p.theme.colors.success;
      case 'active':
        return p.theme.colors.primary;
      default:
        return p.theme.colors.surface;
    }
  }};
  color: ${(p) => {
    switch (p.$status) {
      case 'complete':
        return p.theme.colors.bg;
      case 'active':
        return p.theme.colors.primaryInk;
      default:
        return p.theme.colors.textMuted;
    }
  }};
`;

const Connector = styled.span<{
  $orientation: StepperOrientation;
  $done: boolean;
}>`
  flex: 1;
  align-self: ${(p) => (p.$orientation === 'vertical' ? 'stretch' : 'center')};
  background: ${(p) => (p.$done ? p.theme.colors.success : p.theme.colors.borderSoft)};
  ${(p) =>
    p.$orientation === 'vertical'
      ? `width: 2px; min-height: 24px; margin-left: 17px;`
      : `height: 2px; min-width: 24px;`}
`;

const Labels = styled.div<{ $orientation: StepperOrientation }>`
  display: flex;
  flex-direction: column;
  text-align: ${(p) => (p.$orientation === 'vertical' ? 'left' : 'center')};
  gap: 2px;
`;

const Label = styled.span<{ $status: StepStatus }>`
  font-weight: ${(p) => (p.$status === 'upcoming' ? 600 : 800)};
  font-size: 14px;
  color: ${(p) =>
    p.$status === 'upcoming' ? p.theme.colors.textMuted : p.theme.colors.text};
`;

const Description = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.textSubtle};
`;

const StepRow = styled.div<{ $orientation: StepperOrientation }>`
  display: flex;
  flex-direction: ${(p) => (p.$orientation === 'vertical' ? 'column' : 'row')};
  align-items: ${(p) => (p.$orientation === 'vertical' ? 'flex-start' : 'center')};
  ${(p) => (p.$orientation === 'horizontal' ? `width: 100%; justify-content: center;` : '')}
  gap: ${(p) => p.theme.space[2]};
`;

function statusOf(index: number, active: number): StepStatus {
  if (index < active) return 'complete';
  if (index === active) return 'active';
  return 'upcoming';
}

export function Stepper({ steps, active, orientation = 'horizontal' }: StepperProps) {
  return (
    <List $orientation={orientation}>
      {steps.map((step, index) => {
        const status = statusOf(index, active);
        const isLast = index === steps.length - 1;
        return (
          <Item
            key={step.label}
            $orientation={orientation}
            $last={isLast}
            data-status={status}
            aria-current={status === 'active' ? 'step' : undefined}
          >
            <StepRow $orientation={orientation}>
              <Circle $status={status}>{index + 1}</Circle>
              <Labels $orientation={orientation}>
                <Label $status={status}>{step.label}</Label>
                {step.description && <Description>{step.description}</Description>}
              </Labels>
            </StepRow>
            {!isLast && (
              <Connector
                $orientation={orientation}
                $done={index < active}
                aria-hidden="true"
              />
            )}
          </Item>
        );
      })}
    </List>
  );
}
