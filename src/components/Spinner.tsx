import styled, { keyframes, useTheme } from 'styled-components';

export interface SpinnerProps extends React.ComponentPropsWithoutRef<'span'> {
  size?: number;
  thickness?: number;
  label?: string;
}

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrap = styled.span<{ $size: number }>`
  display: inline-flex;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  vertical-align: middle;
  flex-shrink: 0;
  position: relative;
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  animation: ${rotate} 1.8s linear infinite;
  transform-origin: 50% 50%;
  overflow: visible;
`;

// SVG donut wedge path: outer arc + line + inner arc + close.
function wedge(
  startDeg: number,
  endDeg: number,
  rOuter: number,
  rInner: number,
  cx = 32,
  cy = 32,
): string {
  const s = ((startDeg - 90) * Math.PI) / 180;
  const e = ((endDeg - 90) * Math.PI) / 180;
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const x1 = cx + rOuter * Math.cos(s);
  const y1 = cy + rOuter * Math.sin(s);
  const x2 = cx + rOuter * Math.cos(e);
  const y2 = cy + rOuter * Math.sin(e);
  const x3 = cx + rInner * Math.cos(e);
  const y3 = cy + rInner * Math.sin(e);
  const x4 = cx + rInner * Math.cos(s);
  const y4 = cy + rInner * Math.sin(s);
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}

// Segment angles. Gap of 3deg between wedges. Uneven sizes for organic look.
const GAP = 3;
const SEGMENTS = [
  { from: 0, to: 130 },
  { from: 130, to: 215 },
  { from: 215, to: 295 },
  { from: 295, to: 360 },
];

export function Spinner({ size = 18, thickness = 3, label = 'Loading', ...rest }: SpinnerProps) {
  const theme = useTheme();
  const rOuter = 28;
  const rInner = rOuter - (thickness / size) * 64 * 1.6;
  const innerR = Math.max(10, rInner);
  const strokeW = Math.max(1.2, (1.5 / size) * 64);

  const palette = ['#D08A4A', '#E5826F', '#A875D6', '#7BBF9C'];

  return (
    <Wrap role="status" aria-label={label} $size={size} {...rest}>
      <Svg viewBox="0 0 64 64" aria-hidden="true">
        {SEGMENTS.map((seg, i) => (
          <path
            key={i}
            d={wedge(seg.from + GAP / 2, seg.to - GAP / 2, rOuter, innerR)}
            fill={palette[i]}
            stroke={theme.colors.border}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </Wrap>
  );
}
