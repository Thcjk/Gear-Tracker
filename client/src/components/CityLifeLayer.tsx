import { useMemo } from 'react';
import { buildCityLife, lifeGlyph, type LifeActor } from '../city/cityLife';

type Tile = { x: number; y: number; kind: string; level: number; buildRemaining?: number };

export function CityLifeLayer({
  tiles,
  cell,
  seedName,
}: {
  tiles: Tile[];
  cell: number;
  seedName: string;
}) {
  const actors = useMemo(() => buildCityLife(tiles, cell, seedName), [tiles, cell, seedName]);

  return (
    <div className="city-life-layer" aria-hidden>
      {actors.map((a) => (
        <LifeSprite key={a.id} actor={a} />
      ))}
    </div>
  );
}

function LifeSprite({ actor }: { actor: LifeActor }) {
  const style = {
    ['--life-x' as string]: `${actor.x}px`,
    ['--life-y' as string]: `${actor.y}px`,
    ['--life-tx' as string]: `${actor.tx}px`,
    ['--life-ty' as string]: `${actor.ty}px`,
    ['--life-delay' as string]: `${actor.delay}s`,
    ['--life-dur' as string]: `${actor.duration}s`,
  } as React.CSSProperties;

  return (
    <div
      className={`life-actor life-${actor.kind}`}
      style={style}
      title={actor.label}
    >
      <span className="life-glyph">{lifeGlyph(actor.kind)}</span>
      {actor.kind === 'builder' && <span className="life-hammer" />}
      {actor.kind === 'farmer' && <span className="life-tool" />}
    </div>
  );
}
