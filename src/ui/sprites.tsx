import { HERO, type SpriteData } from './sprite-data';

export function Sprite({
  data,
  size,
  className = '',
}: {
  data: SpriteData;
  /** Width in CSS pixels; the height follows the grid. */
  size: number;
  className?: string;
}) {
  const width = data.rows[0]!.length;
  const height = data.rows.length;
  return (
    <svg
      className={`sprite ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={(size * height) / width}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {data.rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={data.colors[cell]} />
          ),
        ),
      )}
    </svg>
  );
}

export function Avatar({ size = 48 }: { size?: number }) {
  return <Sprite data={HERO} size={size} className="avatar" />;
}
