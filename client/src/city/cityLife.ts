/**
 * Lebende Stadt – NPCs für Darstellung (keine Spiellogik).
 */
import { CityTileKind } from '@kronenchronik/shared';

export type LifeKind =
  | 'farmer'
  | 'builder'
  | 'walker'
  | 'hunter'
  | 'merchant'
  | 'shepherd'
  | 'miller'
  | 'child'
  | 'cart'
  | 'dog'
  | 'sheep';

export type LifeActor = {
  id: string;
  kind: LifeKind;
  /** Start in Pixel relativ zur Map */
  x: number;
  y: number;
  /** Ziel / Bewegungsradius */
  tx: number;
  ty: number;
  delay: number;
  duration: number;
  label?: string;
};

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildCityLife(
  tiles: Array<{ x: number; y: number; kind: string; level: number; buildRemaining?: number }>,
  cell: number,
  seedName: string,
): LifeActor[] {
  const actors: LifeActor[] = [];
  let seed = seedName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const px = (x: number, y: number) => ({
    x: x * cell + cell / 2,
    y: y * cell + cell / 2,
  });

  const roads = tiles.filter((t) => t.kind === CityTileKind.ROAD);
  const farms = tiles.filter(
    (t) =>
      t.kind === CityTileKind.FARM ||
      t.kind === CityTileKind.VINEYARD ||
      t.kind === CityTileKind.SHEEP_FARM,
  );
  const buildingSites = tiles.filter((t) => t.buildRemaining && t.buildRemaining > 0);
  const houses = tiles.filter(
    (t) => t.kind === CityTileKind.HOUSE || t.kind === CityTileKind.NOBLE_HOUSE,
  );
  const mills = tiles.filter(
    (t) => t.kind === CityTileKind.MILL || t.kind === CityTileKind.WINDMILL,
  );
  const lumber = tiles.filter((t) => t.kind === CityTileKind.LUMBER_CAMP);
  const markets = tiles.filter((t) => t.kind === CityTileKind.MARKET);

  // Bauern auf Feldern
  for (const f of farms) {
    const p = px(f.x, f.y);
    seed += 3;
    actors.push({
      id: `farm-${f.x}-${f.y}`,
      kind: f.kind === CityTileKind.SHEEP_FARM ? 'shepherd' : 'farmer',
      x: p.x - 8,
      y: p.y + 4,
      tx: p.x + 10,
      ty: p.y - 6,
      delay: hash(seed) * 2,
      duration: 4 + hash(seed + 1) * 3,
      label: f.kind === CityTileKind.SHEEP_FARM ? 'Hirte' : 'Bauer',
    });
    if (f.kind === CityTileKind.SHEEP_FARM || hash(seed + 2) > 0.4) {
      actors.push({
        id: `sheep-${f.x}-${f.y}`,
        kind: 'sheep',
        x: p.x + 6,
        y: p.y + 8,
        tx: p.x - 10,
        ty: p.y + 2,
        delay: hash(seed + 4) * 3,
        duration: 5 + hash(seed + 5) * 2,
      });
    }
  }

  // Bauarbeiter an Baustellen
  for (const b of buildingSites) {
    const p = px(b.x, b.y);
    seed += 7;
    actors.push({
      id: `build-${b.x}-${b.y}`,
      kind: 'builder',
      x: p.x - 6,
      y: p.y + 6,
      tx: p.x + 6,
      ty: p.y - 4,
      delay: 0,
      duration: 2.2 + hash(seed) * 1.5,
      label: 'Bauarbeiter',
    });
    if (hash(seed + 1) > 0.5) {
      actors.push({
        id: `build2-${b.x}-${b.y}`,
        kind: 'builder',
        x: p.x + 8,
        y: p.y + 2,
        tx: p.x - 4,
        ty: p.y + 8,
        delay: 0.6,
        duration: 2.8,
      });
    }
  }

  // Passanten / Händler auf Straßen
  for (let i = 0; i < Math.min(roads.length, 10); i++) {
    const r = roads[Math.floor(hash(seed + i * 11) * roads.length)];
    if (!r) continue;
    const p = px(r.x, r.y);
    const next = roads.find((n) => Math.abs(n.x - r.x) + Math.abs(n.y - r.y) === 1) ?? r;
    const q = px(next.x, next.y);
    const kind: LifeKind =
      hash(seed + i) > 0.75 ? 'merchant' : hash(seed + i + 1) > 0.85 ? 'cart' : hash(seed + i + 2) > 0.7 ? 'child' : 'walker';
    actors.push({
      id: `road-${i}-${r.x}-${r.y}`,
      kind,
      x: p.x,
      y: p.y,
      tx: q.x,
      ty: q.y,
      delay: hash(seed + i * 3) * 4,
      duration: 3.5 + hash(seed + i * 5) * 4,
      label: kind === 'merchant' ? 'Händler' : kind === 'cart' ? 'Wagen' : undefined,
    });
  }

  // Jäger / Holzfäller nahe Holzlager
  for (const l of lumber) {
    const p = px(l.x, l.y);
    actors.push({
      id: `hunt-${l.x}-${l.y}`,
      kind: 'hunter',
      x: p.x - 12,
      y: p.y - 8,
      tx: p.x + 14,
      ty: p.y + 10,
      delay: hash(seed + 40) * 2,
      duration: 5,
      label: 'Jäger',
    });
  }

  // Müller
  for (const m of mills) {
    const p = px(m.x, m.y);
    actors.push({
      id: `miller-${m.x}-${m.y}`,
      kind: 'miller',
      x: p.x + 4,
      y: p.y + 8,
      tx: p.x - 6,
      ty: p.y + 4,
      delay: 1,
      duration: 4,
      label: 'Müller',
    });
  }

  // Kinder / Hunde bei Häusern
  for (let i = 0; i < Math.min(houses.length, 6); i++) {
    const h = houses[i];
    const p = px(h.x, h.y);
    if (hash(seed + i * 17) > 0.35) {
      actors.push({
        id: `child-${h.x}-${h.y}`,
        kind: 'child',
        x: p.x + 10,
        y: p.y + 6,
        tx: p.x - 8,
        ty: p.y + 12,
        delay: hash(seed + i) * 2,
        duration: 3,
      });
    }
    if (hash(seed + i * 19) > 0.55) {
      actors.push({
        id: `dog-${h.x}-${h.y}`,
        kind: 'dog',
        x: p.x - 10,
        y: p.y + 10,
        tx: p.x + 12,
        ty: p.y + 4,
        delay: 0.5,
        duration: 2.5,
      });
    }
  }

  // Marktstand-Händler
  for (const m of markets) {
    const p = px(m.x, m.y);
    actors.push({
      id: `mkt-${m.x}-${m.y}`,
      kind: 'merchant',
      x: p.x,
      y: p.y + 6,
      tx: p.x + 8,
      ty: p.y - 4,
      delay: 0.2,
      duration: 3.5,
      label: 'Markthändler',
    });
  }

  return actors.slice(0, 48); // Performance-Kappe
}

export function lifeGlyph(kind: LifeKind): string {
  switch (kind) {
    case 'farmer':
      return '🧑‍🌾';
    case 'builder':
      return '👷';
    case 'walker':
      return '🚶';
    case 'hunter':
      return '🏹';
    case 'merchant':
      return '🛒';
    case 'shepherd':
      return '🧙';
    case 'miller':
      return '🧑‍🍳';
    case 'child':
      return '🧒';
    case 'cart':
      return '🛒';
    case 'dog':
      return '🐕';
    case 'sheep':
      return '🐑';
    default:
      return '•';
  }
}
