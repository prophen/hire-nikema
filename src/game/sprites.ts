// Original pixel art for the room, drawn with rectangles and 16 x 16 character grids.
import { HEIGHT, RUG, TILE, WIDTH, type Dir } from "./room";

type Ctx = CanvasRenderingContext2D;

export const C = {
  ink: "#2a2230",
  white: "#f8f8f0",
  wall: "#efe2b8",
  wallStripe: "#e2d09c",
  trim: "#8a5a3a",
  trimDark: "#5e3a24",
  floor: "#d9a066",
  floorLine: "#b9814a",
  floorSeam: "#c48e56",
  wood: "#9a6034",
  woodDark: "#6e3f1e",
  woodLight: "#c08850",
  rugRed: "#c0504d",
  rugCream: "#f0d89a",
  sky: "#9fd4f4",
  cloud: "#ffffff",
  leaf: "#4a9a4a",
  leafDark: "#2e6e34",
  pot: "#c0603a",
  screen: "#20406a",
  screenText: "#6fe08a",
  tvScreen: "#7fd0e8",
  beige: "#e8e2d2",
  grey: "#a8a4b0",
  cork: "#c89a5a",
  yellow: "#f8e070",
  pink: "#f4a0b8",
  blue: "#9cc8f0",
  red: "#d0405a",
};

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
function box(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, line = C.ink) {
  rect(ctx, x, y, w, h, line);
  rect(ctx, x + 1, y + 1, w - 2, h - 2, fill);
}

// ---------- characters ----------
// k ink · s skin · h hair · c shirt · p pants · o shoes · w white

const HEAD_DOWN = [
  "................",
  "....kkkkkkkk....",
  "...khhhhhhhhk...",
  "..khhhhhhhhhhk..",
  "..khhhhhhhhhhk..",
  ".khhhsssssshhhk.",
  ".khhsssssssshhk.",
  ".khsskssssksshk.",
  ".khsskssssksshk.",
  "..kssssssssssk..",
  "...kksssssskk...",
];
const HEAD_UP = [
  "................",
  "....kkkkkkkk....",
  "...khhhhhhhhk...",
  "..khhhhhhhhhhk..",
  "..khhhhhhhhhhk..",
  ".khhhhhhhhhhhhk.",
  ".khhhhhhhhhhhhk.",
  ".khhhhhhhhhhhhk.",
  ".khhhhhhhhhhhhk.",
  "..khhhhhhhhhhk..",
  "...kkhhhhhhkk...",
];
const BODY_FRONT = [
  "..kcccccccccck..",
  ".ksccccccccccsk.",
  ".kskcccccccksk..",
];
const LEGS_FRONT = [
  ["...kpppkkpppk...", "...kook..kook..."],
  ["...kpppkkpppk...", "...kook...kkk..."],
  ["...kpppkkpppk...", "...kkk...kook..."],
];
const SIDE = [
  "................",
  ".....kkkkkkk....",
  "....khhhhhhhk...",
  "...khhhhhhhhhk..",
  "...khhhhhhhhhk..",
  "..khhhhhsssssk..",
  "..khhhhssssssk..",
  "..khhhsssssksk..",
  "..khhhsssssksk..",
  "...khhssssssk...",
  "....kkssssskk...",
  "....kccccccck...",
  "....kcccssck....",
  "....kccccccck...",
];
const LEGS_SIDE = [
  ["....kppppppk....", "....kook.kook..."],
  ["...kpppkkpppk...", "..kook....kook.."],
  ["....kppppppk....", ".....kookkk....."],
];

export type Avatar = { skin: string; hair: string; shirt: string; pants: string };

function grid(ctx: Ctx, rows: string[], x: number, y: number, pal: Record<string, string>, flip = false) {
  rows.forEach((row, r) => {
    for (let c = 0; c < 16; c++) {
      const ch = row[flip ? 15 - c : c];
      if (!ch || ch === ".") continue;
      const col = pal[ch];
      if (col) rect(ctx, x + c, y + r, 1, 1, col);
    }
  });
}

/** frame 0 = standing, 1 and 2 = walking. */
export function drawPlayer(ctx: Ctx, x: number, y: number, dir: Dir, frame: number, a: Avatar) {
  const pal = { k: C.ink, s: a.skin, h: a.hair, c: a.shirt, p: a.pants, o: C.ink, w: C.white };
  const bob = frame ? -1 : 0;
  // shadow
  ctx.globalAlpha = 0.25;
  rect(ctx, x + 3, y + 15, 10, 1, C.ink);
  ctx.globalAlpha = 1;
  if (dir === "left" || dir === "right") {
    grid(ctx, [...SIDE, ...LEGS_SIDE[frame]], x, y + bob, pal, dir === "left");
  } else {
    const head = dir === "up" ? HEAD_UP : HEAD_DOWN;
    grid(ctx, [...head, ...BODY_FRONT, ...LEGS_FRONT[frame]], x, y + bob, pal);
  }
}

const CAT = [
  "................",
  "................",
  "................",
  "...k......k.....",
  "..kgk....kgk....",
  "..kggkkkkggk....",
  "..kgggggggggk...",
  "..kggkgggkggk...",
  "..kgggwnwgggk...",
  "...kggwwwggk....",
  "...kgggggggk....",
  "..kgggwwwgggk...",
  "..kggwwwwwggk.k.",
  "..kgggggggggkkgk",
  "..kgwgggggwgkgk.",
  "...kkkkkkkkkkk..",
];
const CAT_BLINK = CAT.map((r, i) => (i === 7 ? "..kgggggggggk..." : r));

export function drawCat(ctx: Ctx, x: number, y: number, blink: boolean) {
  const pal = { k: C.ink, g: "#8c8c9c", w: C.white, n: "#e88aa0" };
  grid(ctx, blink ? CAT_BLINK : CAT, x, y, pal);
}

// The dot needs a white row under it, or it merges into the border and the "!" reads as cut off.
const ALERT = [
  ".kkkkk.",
  "kwwwwwk",
  "kwwkwwk",
  "kwwkwwk",
  "kwwkwwk",
  "kwwkwwk",
  "kwwwwwk",
  "kwwkwwk",
  "kwwwwwk",
  ".kkwkk.",
  "..kwk..",
  "...k...",
];
/** Height of the "!" balloon, tail included, so callers can sit it above the player. */
export const ALERT_HEIGHT = ALERT.length;

/** A small "!" balloon shown when the player faces something to inspect. */
export function drawAlert(ctx: Ctx, x: number, y: number) {
  grid(ctx, ALERT, x, y, { k: C.ink, w: C.white });
}

// ---------- room ----------

function drawWall(ctx: Ctx) {
  rect(ctx, 0, 0, WIDTH, 32, C.wall);
  for (let x = 2; x < WIDTH; x += 4) rect(ctx, x, 2, 1, 26, C.wallStripe);
  rect(ctx, 0, 0, WIDTH, 2, C.trimDark);
  rect(ctx, 0, 27, WIDTH, 5, C.trim);
  rect(ctx, 0, 27, WIDTH, 1, C.trimDark);
}

function drawFloor(ctx: Ctx) {
  rect(ctx, 0, 32, WIDTH, HEIGHT - 32, C.floor);
  for (let y = 32; y < HEIGHT; y += 8) {
    rect(ctx, 0, y, WIDTH, 1, C.floorLine);
    const off = ((y - 32) / 8) % 2 ? 4 : 12;
    for (let x = off; x < WIDTH; x += 16) rect(ctx, x, y + 1, 1, 7, C.floorSeam);
  }
}

function drawRug(ctx: Ctx) {
  const x = RUG.x * TILE + 2, y = RUG.y * TILE + 2, w = RUG.w * TILE - 4, h = RUG.h * TILE - 4;
  box(ctx, x, y, w, h, C.rugRed);
  rect(ctx, x + 4, y + 4, w - 8, h - 8, C.rugCream);
  for (let yy = y + 8; yy < y + h - 6; yy += 6)
    for (let xx = x + 8 + ((yy - y) % 12 ? 3 : 0); xx < x + w - 6; xx += 6) {
      rect(ctx, xx, yy, 2, 1, C.rugRed);
      rect(ctx, xx + 1, yy - 1, 1, 3, C.rugRed);
    }
}

function drawShelf(ctx: Ctx) {
  const x = 0, y = 6, w = 32, h = 42;
  box(ctx, x, y, w, h, C.wood);
  const books = [C.red, C.blue, C.yellow, C.leaf, C.pink, "#7a5ac0", C.white, C.rugRed];
  let n = 0;
  for (const sy of [10, 23, 36]) {
    rect(ctx, x + 2, sy, w - 4, 10, C.woodDark);
    let bx = x + 3;
    while (bx < x + w - 4) {
      const bw = 2 + (n % 3 === 0 ? 1 : 0);
      const bh = 7 + (n % 4 === 1 ? 2 : n % 5 === 2 ? 1 : 0);
      if (sy === 36 && bx > 18 && bx < 26) {
        // trophy
        rect(ctx, 20, 38, 6, 3, C.yellow);
        rect(ctx, 22, 41, 2, 3, C.yellow);
        rect(ctx, 21, 44, 4, 1, C.yellow);
        bx = 27;
        continue;
      }
      rect(ctx, bx, sy + 10 - bh, bw, bh, books[n % books.length]);
      rect(ctx, bx, sy + 10 - bh, bw, 1, C.ink);
      bx += bw + 1;
      n++;
    }
    rect(ctx, x + 1, sy + 10, w - 2, 2, C.woodLight);
  }
}

function drawPC(ctx: Ctx) {
  // desk
  box(ctx, 33, 35, 30, 13, C.wood);
  rect(ctx, 34, 36, 28, 3, C.woodLight);
  rect(ctx, 34, 39, 28, 1, C.woodDark);
  box(ctx, 50, 41, 10, 5, C.woodDark);
  rect(ctx, 54, 43, 2, 1, C.yellow);
  // tower
  box(ctx, 52, 21, 9, 15, C.beige);
  rect(ctx, 54, 24, 5, 1, C.grey);
  rect(ctx, 54, 26, 5, 1, C.grey);
  rect(ctx, 57, 31, 2, 2, C.leaf);
  // monitor
  box(ctx, 35, 18, 16, 15, C.beige);
  rect(ctx, 37, 20, 12, 10, C.screen);
  rect(ctx, 41, 33, 4, 2, C.grey);
  // keyboard
  box(ctx, 36, 35, 14, 3, C.grey);
}

export function drawPCScreen(ctx: Ctx, t: number) {
  rect(ctx, 37, 20, 12, 10, C.screen);
  rect(ctx, 38, 21, 7, 1, C.screenText);
  rect(ctx, 38, 23, 9, 1, C.screenText);
  rect(ctx, 38, 25, 5, 1, C.screenText);
  if (Math.floor(t / 500) % 2) rect(ctx, 38, 27, 2, 2, C.screenText);
}

function drawBoard(ctx: Ctx) {
  box(ctx, 66, 4, 28, 21, C.wood);
  rect(ctx, 68, 6, 24, 17, C.cork);
  for (const [x, y] of [[70, 9], [76, 15], [84, 8], [88, 18], [72, 19]]) rect(ctx, x, y, 1, 1, C.woodDark);
  const notes: [number, number, string][] = [[69, 7, C.yellow], [77, 8, C.pink], [85, 10, C.blue], [72, 15, C.blue], [81, 16, C.yellow]];
  for (const [x, y, c] of notes) {
    rect(ctx, x, y, 7, 6, c);
    rect(ctx, x + 1, y + 2, 5, 1, C.ink);
    rect(ctx, x + 1, y + 4, 3, 1, C.ink);
    rect(ctx, x + 3, y, 1, 1, C.red);
  }
}

function drawClock(ctx: Ctx) {
  rect(ctx, 100, 6, 8, 12, C.ink);
  rect(ctx, 99, 7, 10, 10, C.ink);
  rect(ctx, 101, 7, 6, 10, C.white);
  rect(ctx, 100, 8, 8, 8, C.white);
}

export function drawClockHands(ctx: Ctx, t: number) {
  rect(ctx, 101, 7, 6, 10, C.white);
  rect(ctx, 100, 8, 8, 8, C.white);
  rect(ctx, 104, 9, 1, 3, C.ink);
  const step = Math.floor(t / 1000) % 4;
  const [dx, dy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][step];
  rect(ctx, 104, 12, 1, 1, C.ink);
  rect(ctx, 104 + dx, 12 + dy, 1, 1, C.red);
  rect(ctx, 104 + dx * 2, 12 + dy * 2, 1, 1, C.red);
}

function drawWindow(ctx: Ctx) {
  box(ctx, 130, 4, 28, 22, C.white);
  rect(ctx, 132, 6, 24, 18, C.sky);
  rect(ctx, 136, 9, 8, 3, C.cloud);
  rect(ctx, 138, 8, 4, 1, C.cloud);
  rect(ctx, 147, 16, 6, 2, C.cloud);
  rect(ctx, 143, 6, 2, 18, C.white);
  rect(ctx, 132, 14, 24, 2, C.white);
  // curtains
  rect(ctx, 127, 3, 4, 24, C.red);
  rect(ctx, 157, 3, 3, 24, C.red);
  rect(ctx, 126, 2, 34, 2, C.trimDark);
}

function drawTV(ctx: Ctx) {
  // cabinet
  box(ctx, 112, 38, 16, 10, C.woodDark);
  rect(ctx, 114, 41, 12, 1, C.wood);
  box(ctx, 115, 43, 10, 3, C.grey);
  // set
  box(ctx, 113, 22, 14, 16, "#504858");
  rect(ctx, 117, 18, 1, 4, C.ink);
  rect(ctx, 122, 18, 1, 4, C.ink);
  rect(ctx, 115, 34, 2, 2, C.red);
  rect(ctx, 118, 35, 6, 1, C.grey);
}

export function drawTVScreen(ctx: Ctx, t: number, on: boolean) {
  rect(ctx, 115, 24, 10, 9, on ? C.tvScreen : C.screen);
  if (on) {
    // play triangle
    rect(ctx, 118, 26, 1, 5, C.white);
    rect(ctx, 119, 27, 1, 3, C.white);
    rect(ctx, 120, 28, 1, 1, C.white);
  } else {
    // static
    for (let i = 0; i < 8; i++) {
      const s = (Math.floor(t / 90) * 31 + i * 17) % 90;
      rect(ctx, 115 + (s % 10), 24 + Math.floor(s / 10), 1, 1, C.grey);
    }
  }
  rect(ctx, 115, 24, 2, 1, C.white);
}

function drawPlant(ctx: Ctx, x: number, y: number) {
  box(ctx, x + 4, y + 9, 8, 7, C.pot);
  rect(ctx, x + 4, y + 9, 8, 2, "#a04a2a");
  const leaves: [number, number, number, number][] = [[6, -6, 4, 8], [2, -2, 4, 6], [10, -2, 4, 6], [4, 2, 3, 6], [9, 2, 3, 6], [7, -9, 2, 4]];
  for (const [lx, ly, w, h] of leaves) box(ctx, x + lx, y + ly, w, h, C.leaf, C.leafDark);
}

function drawTable(ctx: Ctx) {
  box(ctx, 65, 82, 30, 12, C.woodLight);
  rect(ctx, 66, 90, 28, 3, C.wood);
  rect(ctx, 67, 94, 2, 2, C.woodDark);
  rect(ctx, 91, 94, 2, 2, C.woodDark);
  // notebook + pen
  box(ctx, 69, 81, 12, 8, C.white);
  rect(ctx, 75, 82, 1, 6, C.grey);
  for (const ly of [83, 85, 87]) { rect(ctx, 71, ly, 3, 1, C.blue); rect(ctx, 77, ly, 3, 1, C.blue); }
  rect(ctx, 82, 84, 1, 5, C.red);
  // mug
  box(ctx, 86, 82, 5, 6, C.red);
  rect(ctx, 91, 84, 1, 2, C.ink);
  rect(ctx, 87, 79, 1, 2, C.white);
  rect(ctx, 89, 78, 1, 2, C.white);
}

function drawMat(ctx: Ctx) {
  box(ctx, 66, 132, 28, 12, "#a03c3c");
  for (const ax of [72, 84]) {
    rect(ctx, ax, 135, 3, 1, C.rugCream);
    rect(ctx, ax + 1, 136, 1, 4, C.rugCream);
    rect(ctx, ax - 1, 138, 5, 1, C.rugCream);
    rect(ctx, ax, 139, 3, 1, C.rugCream);
  }
  rect(ctx, 64, 143, 32, 1, C.ink);
}

/** Draws everything that doesn't move, once, into a background canvas. */
export function drawRoom(ctx: Ctx) {
  drawWall(ctx);
  drawFloor(ctx);
  drawRug(ctx);
  drawMat(ctx);
  drawWindow(ctx);
  drawBoard(ctx);
  drawClock(ctx);
  drawShelf(ctx);
  drawPC(ctx);
  drawTV(ctx);
  drawPlant(ctx, 9 * TILE, 2 * TILE);
  drawPlant(ctx, 0, 8 * TILE);
  drawTable(ctx);
}

/**
 * The classic filter sorts colours by brightness, and the avatar's skin, shirt and pants all land
 * in the same middle shade, so the player reads as unclothed. Keep the skin, but light the shirt
 * and darken the pants so each part gets its own shade.
 */
export function classicAvatar(a: Avatar): Avatar {
  return { ...a, shirt: C.white, pants: C.ink };
}

/** Four shades of green, like the original handheld screen. */
const DMG = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]];

export function toClassicPalette(ctx: Ctx) {
  const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const s = DMG[l < 70 ? 0 : l < 145 ? 1 : l < 205 ? 2 : 3];
    d[i] = s[0]; d[i + 1] = s[1]; d[i + 2] = s[2];
  }
  ctx.putImageData(img, 0, 0);
}
