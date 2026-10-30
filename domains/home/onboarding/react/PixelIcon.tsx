import type { CSSProperties } from 'react';
import { CY } from './pixelEngine';
import { catalogPixelRects, type PixelRect } from './catalogPixelIcons';

export function PixelIcon({
  name,
  className = '',
  style,
  title,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  const rects = catalogPixelRects(name) ?? (CY.px(name) as PixelRect[]);
  return (
    <span className={`px ${className}`} style={style} title={title}>
      <svg viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden="true">
        {rects.map((rect, index) => (
          <rect key={index} {...rect} />
        ))}
      </svg>
    </span>
  );
}
