const formatAmount = (value: number): string => {
  return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const CustomDot = (props: any) => {
  const { cx, cy, value } = props as { cx: number; cy: number; value: number };

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
