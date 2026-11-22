// The room's layout: a 10 x 9 tile grid (160 x 144 px, the size of a handheld screen).
// Rows 0-1 are the back wall. Things on the wall are inspected from the floor below them.
import type { Profile } from "../data/profile";

export const TILE = 16;
export const COLS = 10;
export const ROWS = 9;
export const WIDTH = COLS * TILE;
export const HEIGHT = ROWS * TILE;

export type Dir = "up" | "down" | "left" | "right";
export const STEP: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export type Pt = [number, number];

export type PanelId = "intro" | "projects" | "content" | "fit" | "now" | "how" | "fitcheck" | "contact" | "ask";

export type Thing = {
  id: string;
  /** Tiles the thing occupies. Facing one of these and pressing A inspects it. */
  tiles: Pt[];
  /** Extra tiles that count as a click on this thing (art that sits on the wall). */
  clickTiles?: Pt[];
  /** Whether the tiles block walking. Wall tiles and off-map tiles block anyway. */
  solid: boolean;
  lines: string[];
  panel?: PanelId;
};

/** Labels for the START menu, in the order they appear. */
export const MENU: { panel: PanelId; label: string; title: string }[] = [
  { panel: "intro", label: "INTRO TAPE", title: "Intro tape" },
  { panel: "projects", label: "PROJECTS", title: "Projects" },
  { panel: "fit", label: "LOOKING FOR", title: "What I'm looking for" },
  { panel: "content", label: "CONTENT", title: "Content & community" },
  { panel: "how", label: "HOW I WORK", title: "How I work" },
  { panel: "now", label: "NOW", title: "Now" },
  { panel: "fitcheck", label: "FIT CHECK", title: "Does this role fit?" },
  { panel: "contact", label: "CONTACT", title: "Let's talk" },
];

const range = (x0: number, x1: number, y0: number, y1: number): Pt[] => {
  const out: Pt[] = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push([x, y]);
  return out;
};

export function buildThings(p: Profile, company?: { name: string; agent?: boolean }): Thing[] {
  const name = p.name.split(" ")[0].toUpperCase();
  const phone: Thing[] = company?.agent ? [{
    id: "phone", tiles: [[1, 4]], solid: true, panel: "ask",
    lines: ["A red phone. Ask Nikema's AI guide about her work.", "Press A to chat or start a voice call."],
  }] : [];
  return [
    ...phone,
    {
      id: "tv", tiles: [[7, 2]], clickTiles: [[7, 1]], solid: true, panel: "intro",
      lines: p.video.src
        ? [`${name}'s intro tape is in the player.`, "Press A to watch it."]
        : [`A tape labeled INTRO. It's still being recorded.`, "The transcript is taped to the box. Press A to read it."],
    },
    {
      id: "pc", tiles: [[2, 2], [3, 2]], clickTiles: [[2, 1], [3, 1]], solid: true, panel: "projects",
      lines: [`${name} turned on the PC.`, "Accessing PROJECT storage..."],
    },
    {
      id: "shelf", tiles: range(0, 1, 1, 2), clickTiles: [[0, 0], [1, 0]], solid: true, panel: "content",
      lines: ["Tutorials, write-ups, and a few community awards."],
    },
    {
      id: "board", tiles: [[4, 1], [5, 1]], clickTiles: [[4, 0], [5, 0]], solid: true, panel: "fit",
      lines: ["Sticky notes on a corkboard.", "They say: WHAT I'M LOOKING FOR."],
    },
    {
      id: "clock", tiles: [[6, 1]], clickTiles: [[6, 0]], solid: true, panel: "now",
      lines: ["Tick, tock. Here's what's happening NOW."],
    },
    {
      id: "window", tiles: [[8, 1], [9, 1]], clickTiles: [[8, 0], [9, 0]], solid: true,
      lines: [`Sunny in ${p.location.split(",")[0]}.`, "The Bay Area is a short drive away."],
    },
    {
      id: "plant", tiles: [[9, 2]], solid: true,
      lines: [`A healthy fern. ${name} remembers to water it.`, "Mostly."],
    },
    {
      id: "fern", tiles: [[0, 8]], solid: true,
      lines: ["Another fern. This one is thriving out of spite."],
    },
    {
      id: "table", tiles: [[4, 5], [5, 5]], solid: true, panel: "how",
      lines: ["A notebook, open to a page titled HOW I WORK."],
    },
    {
      id: "door", tiles: [[4, 9], [5, 9]], clickTiles: [[4, 8], [5, 8]], solid: true, panel: "contact",
      lines: company
        ? [`Heading back to ${company.name}?`, `Take ${name} with you. Let's set up a chat.`]
        : ["Heading out?", `Let's set up a chat with ${name} first.`],
    },
    {
      id: "cat", tiles: [], solid: true, panel: "fitcheck",
      lines: ["PIXEL the cat: Mrrp?", "Show me a job post. I'll sniff out how well it fits."],
    },
  ];
}

export const START: Pt = [2, 5];
export const CAT_START: Pt = [8, 6];
/** Tiles the cat may wander over. */
export const CAT_AREA = { x0: 6, x1: 9, y0: 4, y1: 7 };
/** Decorative rug under the table. */
export const RUG = { x: 3, y: 4, w: 4, h: 3 };

export const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < COLS && y < ROWS;

export function solidGrid(things: Thing[]): boolean[][] {
  const g = Array.from({ length: ROWS }, (_, y) => Array.from({ length: COLS }, () => y < 2));
  for (const t of things) if (t.solid) for (const [x, y] of t.tiles) if (inMap(x, y)) g[y][x] = true;
  return g;
}

export function thingAt(things: Thing[], x: number, y: number, cat: Pt): Thing | undefined {
  if (cat[0] === x && cat[1] === y) return things.find((t) => t.id === "cat");
  return things.find((t) => t.tiles.some(([tx, ty]) => tx === x && ty === y));
}

export function thingClicked(things: Thing[], x: number, y: number, cat: Pt): Thing | undefined {
  return thingAt(things, x, y, cat) ?? things.find((t) => t.clickTiles?.some(([tx, ty]) => tx === x && ty === y));
}

/** Floor tiles you can stand on to inspect a thing, with the way you'd face. */
export function standSpots(thing: Thing, cat: Pt): { at: Pt; face: Dir }[] {
  const tiles = thing.id === "cat" ? [cat] : thing.tiles;
  const out: { at: Pt; face: Dir }[] = [];
  for (const [tx, ty] of tiles)
    for (const d of Object.keys(STEP) as Dir[]) {
      const [dx, dy] = STEP[d];
      out.push({ at: [tx - dx, ty - dy], face: d });
    }
  return out;
}

/** Breadth-first path over the grid. Returns the steps to take, or null. */
export function findPath(solid: boolean[][], from: Pt, goals: Pt[], blocked: Pt[] = []): Dir[] | null {
  const key = (x: number, y: number) => y * COLS + x;
  const goalSet = new Set(goals.filter(([x, y]) => inMap(x, y)).map(([x, y]) => key(x, y)));
  if (goalSet.size === 0) return null;
  const isBlocked = (x: number, y: number) =>
    !inMap(x, y) || solid[y][x] || blocked.some(([bx, by]) => bx === x && by === y);
  const prev = new Map<number, [number, Dir] | null>([[key(...from), null]]);
  const queue: Pt[] = [from];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    if (goalSet.has(key(x, y))) {
      const steps: Dir[] = [];
      let k = key(x, y);
      for (let p = prev.get(k); p; p = prev.get(k)) { steps.unshift(p[1]); k = p[0]; }
      return steps;
    }
    for (const d of Object.keys(STEP) as Dir[]) {
      const nx = x + STEP[d][0], ny = y + STEP[d][1];
      if (isBlocked(nx, ny) || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), [key(x, y), d]);
      queue.push([nx, ny]);
    }
  }
  return null;
}

/** Splits text into dialog pages that fit the text box: 3 lines of about 22 characters. */
export function paginate(text: string, perLine = 22, lines = 3): string[] {
  const rows: string[] = [];
  let row = "";
  for (const word of text.split(/\s+/)) {
    if (row && (row + " " + word).length > perLine) { rows.push(row); row = word; }
    else row = row ? row + " " + word : word;
  }
  if (row) rows.push(row);
  const pages: string[] = [];
  for (let i = 0; i < rows.length; i += lines) pages.push(rows.slice(i, i + lines).join("\n"));
  return pages;
}
