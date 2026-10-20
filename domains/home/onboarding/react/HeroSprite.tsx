import { heroRects } from './heroEngine';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export function HeroSprite({
  gender,
  frame,
}: {
  gender: string;
  frame: number;
}) {
  return (
    <svg viewBox="0 0 20 26" shapeRendering="crispEdges" aria-hidden="true">
      {(heroRects(gender, frame) as Rect[]).map((rect, index) => (
        <rect key={index} {...rect} />
      ))}
    </svg>
  );
}
