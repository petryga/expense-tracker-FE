import { formatAmount } from '../../../utils';

interface CustomDotProps {
  cx?: number;
  cy?: number;
  value?: number;
}

export const CustomDot = ({ cx, cy, value }: CustomDotProps) => {
  if (!cx || !cy || !value) return null;

  const textValue = `$${formatAmount(value)}`;
  const textWidth = textValue.length * 8.5;
  const textHeight = 22;

  return (
    <g>
      <rect
        x={cx - textWidth / 2}
        y={cy - textHeight - 10}
        width={textWidth}
        height={textHeight}
        fill="white"
        rx={5}
      />

      <text
        x={cx}
        y={cy}
        dy={-17}
        fill="#eeb12e"
        fontSize={13}
        textAnchor="middle"
        fontWeight="bold"
      >
        {textValue}
      </text>
    </g>
  );
};
