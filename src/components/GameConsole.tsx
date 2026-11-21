import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { Profile } from "../data/profile";
import {
  CAT_AREA, CAT_START, HEIGHT, MENU, START, STEP, TILE, WIDTH,
  buildThings, findPath, paginate, solidGrid, standSpots, thingAt, thingClicked,
  type Dir, type PanelId, type Pt, type Thing,
} from "../game/room";
import {
  drawAlert, drawCat, drawClockHands, drawPCScreen, drawPlayer, drawRoom, drawTVScreen, toClassicPalette,
} from "../game/sprites";
import { PanelContent } from "./GamePanels";

type Props = {
  profile: Profile;
  company?: { name: string; note: string };
  /** Start in the four-shade green palette. */
  classic?: boolean;
};

type Dialog = { pages: string[]; i: number; panel?: PanelId };

const STEP_MS = 150;
const CAT_STEP_MS = 320;
const KEY_DIR: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
};
const PREF_KEY = "hire-nikema:palette";

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A walkable pixel-art room inside a handheld-console frame.
 * Walk with arrows / WASD / D-pad, inspect things with A, open a shortcut menu with START.
 * Tapping or clicking a spot in the room walks there; tapping a thing walks over and inspects it.
 */
export function GameConsole({ profile, company, classic: classicInitial = false }: Props) {
  const things = useMemo(() => buildThings(profile, company), [profile, company]);
  const solid = useMemo(() => solidGrid(things), [things]);
  const name = profile.name.split(" ")[0].toUpperCase();

  const welcome = useMemo(() => {
    const intro = company
      ? [`Hi, ${company.name}!`, company.note]
      : [`Welcome to ${name}'s room!`];
    return [...intro, "Walk around and press A to look at things.", "Press START for a shortcut menu."].flatMap((l) => paginate(l));
  }, [company, name]);

  const [dialog, setDialog] = useState<Dialog | null>({ pages: welcome, i: 0 });
  // The typewriter count is tied to the page it was typed on, so a new page never
  // renders with the previous page's count (which would flash the full text).
  const [typedState, setTypedState] = useState<{ d: Dialog | null; n: number }>({ d: null, n: 0 });
  const [menu, setMenu] = useState<number | null>(null);
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [classic, setClassic] = useState(classicInitial);
  const [seen, setSeen] = useState<PanelId[]>([]);
  const [scale, setScale] = useState<number | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDialogElement>(null);

  // Mutable game state, read by the animation loop.
  const g = useRef({
    pos: START as Pt, from: START as Pt, dir: "down" as Dir, t: 1, steps: 0,
    held: null as Dir | null, turnUntil: 0,
    path: [] as Dir[], goal: null as null | { thing?: Thing; tile?: Pt },
    cat: { pos: CAT_START as Pt, from: CAT_START as Pt, t: 1, next: 2500 },
  });
  const ui = useRef({ dialog, menu, panel, classic });
  ui.current = { dialog, menu, panel, classic };

  // ---------- palette preference ----------
  useEffect(() => {
    if (classicInitial) return;
    try { if (localStorage.getItem(PREF_KEY) === "classic") setClassic(true); } catch { /* storage blocked */ }
  }, [classicInitial]);
  const toggleClassic = useCallback(() => {
    setClassic((c) => {
      try { localStorage.setItem(PREF_KEY, c ? "color" : "classic"); } catch { /* storage blocked */ }
      return !c;
    });
  }, []);

  // ---------- sizing: integer pixel scale where it fits ----------
  useEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      // On phones the console bleeds 12px into each page gutter (see .gb-wrap in global.css).
      const avail = w < 420 ? w + 24 - 22 : w - 78;
      setScale(avail >= 320 ? Math.min(3, Math.floor(avail / 160)) : Math.max(1.5, avail / 160));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---------- typewriter ----------
  const page = dialog ? dialog.pages[dialog.i] : "";
  const typed = typedState.d === dialog ? typedState.n : reducedMotion() ? page.length : 0;
  const setTyped = useCallback((n: number) => setTypedState({ d: dialog, n }), [dialog]);
  useEffect(() => {
    if (!dialog || reducedMotion()) return;
    setTypedState({ d: dialog, n: 0 });
    const id = setInterval(() => setTypedState((t) => {
      if (t.d !== dialog || t.n >= page.length) { clearInterval(id); return t; }
      return { ...t, n: t.n + 1 };
    }), 22);
    return () => clearInterval(id);
  }, [dialog, page]);

  // ---------- actions ----------
  const openPanel = useCallback((id: PanelId) => {
    setPanel(id);
    setSeen((s) => (s.includes(id) ? s : [...s, id]));
  }, []);

  const inspect = useCallback((thing: Thing) => {
    setDialog({ pages: thing.lines.flatMap((l) => paginate(l)), i: 0, panel: thing.panel });
  }, []);

  const frontThing = useCallback(() => {
    const s = g.current;
    const [dx, dy] = STEP[s.dir];
    return thingAt(things, s.pos[0] + dx, s.pos[1] + dy, s.cat.pos);
  }, [things]);

  const pressA = useCallback(() => {
    const { dialog: d, menu: m } = ui.current;
    if (d) {
      if (typed < d.pages[d.i].length) { setTyped(d.pages[d.i].length); return; }
      if (d.i < d.pages.length - 1) { setDialog({ ...d, i: d.i + 1 }); return; }
      setDialog(null);
      if (d.panel) openPanel(d.panel);
      return;
    }
    if (m !== null) {
      setMenu(null);
      const item = MENU[m];
      if (!item) return;
      const thing = things.find((t) => t.panel === item.panel);
      if (!thing || reducedMotion()) { openPanel(item.panel); return; }
      walkTo(thing);
      return;
    }
    const s = g.current;
    if (s.t < 1) return;
    const t = frontThing();
    if (t) inspect(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, setTyped, things, frontThing, inspect, openPanel]);

  const pressB = useCallback(() => {
    g.current.held = null;
    if (ui.current.dialog) setDialog(null);
    else if (ui.current.menu !== null) setMenu(null);
  }, []);

  const pressStart = useCallback(() => {
    if (ui.current.dialog) return;
    setMenu((m) => (m === null ? 0 : null));
    consoleRef.current?.focus();
  }, []);

  const moveMenu = (d: Dir) => {
    if (d === "up") setMenu((m) => (m === null ? m : (m + MENU.length) % (MENU.length + 1)));
    if (d === "down") setMenu((m) => (m === null ? m : (m + 1) % (MENU.length + 1)));
  };

  /** Walk to the nearest spot from which `thing` can be inspected, then inspect it. */
  function walkTo(thing: Thing) {
    const s = g.current;
    const spots = standSpots(thing, s.cat.pos);
    const here = spots.find((sp) => sp.at[0] === s.pos[0] && sp.at[1] === s.pos[1]);
    if (here) { s.dir = here.face; inspect(thing); return; }
    const path = findPath(solid, s.pos, spots.map((sp) => sp.at), [s.cat.pos]);
    if (path) { s.path = path; s.goal = { thing }; }
  }

  function walkToTile(tile: Pt) {
    const s = g.current;
    const path = findPath(solid, s.pos, [tile], [s.cat.pos]);
    if (path) { s.path = path; s.goal = { tile }; }
  }

  // ---------- input ----------
  const press = (d: Dir) => {
    const { dialog: dlg, menu: m } = ui.current;
    if (dlg) return;
    if (m !== null) { moveMenu(d); return; }
    const s = g.current;
    s.path = []; s.goal = null;
    if (s.held !== d) {
      s.held = d;
      if (s.dir !== d && s.t >= 1) { s.dir = d; s.turnUntil = performance.now() + 90; }
    }
  };
  const release = (d: Dir) => { if (g.current.held === d) g.current.held = null; };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onButton = (e.target as HTMLElement).tagName === "BUTTON";
    const d = KEY_DIR[e.key];
    if (d) { e.preventDefault(); if (!e.repeat) press(d); return; }
    if (onButton && (e.key === "Enter" || e.key === " ")) return;
    if (e.key === "Enter" || e.key === " " || e.key === "z" || e.key === "Z") { e.preventDefault(); if (!e.repeat) pressA(); }
    else if (e.key === "Escape" || e.key === "x" || e.key === "X" || e.key === "Backspace") { e.preventDefault(); pressB(); }
    else if (e.key === "m" || e.key === "M") { e.preventDefault(); pressStart(); }
    else if (e.key === "c" || e.key === "C") { e.preventDefault(); toggleClassic(); }
  };
  const onKeyUp = (e: React.KeyboardEvent) => { const d = KEY_DIR[e.key]; if (d) release(d); };

  const onScreenClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { dialog: dlg, menu: m } = ui.current;
    if (dlg) { pressA(); return; }
    if (m !== null) { setMenu(null); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const tx = Math.floor(((e.clientX - r.left) / r.width) * WIDTH / TILE);
    const ty = Math.floor(((e.clientY - r.top) / r.height) * HEIGHT / TILE);
    const s = g.current;
    const thing = thingClicked(things, tx, ty, s.cat.pos);
    if (thing) walkTo(thing);
    else walkToTile([tx, ty]);
  };

  const padProps = (d: Dir) => ({
    onPointerDown: (e: RPointerEvent<HTMLButtonElement>) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); press(d); },
    onPointerUp: () => release(d),
    onPointerCancel: () => release(d),
    onLostPointerCapture: () => release(d),
    // Keyboard activation of a D-pad button takes one step.
    onClick: (e: React.MouseEvent) => {
      if (e.detail !== 0) return;
      if (ui.current.menu !== null) { moveMenu(d); return; }
      if (!ui.current.dialog) { g.current.path = [d]; g.current.goal = null; }
    },
  });

  // ---------- loop ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const bg = document.createElement("canvas");
    bg.width = WIDTH; bg.height = HEIGHT;
    drawRoom(bg.getContext("2d")!);
    const reduce = reducedMotion();

    const blocked = (x: number, y: number, self: "player" | "cat") => {
      const s = g.current;
      if (x < 0 || y < 0 || x >= solid[0].length || y >= solid.length || solid[y][x]) return true;
      const other = self === "player" ? [s.cat.pos, s.cat.from] : [s.pos, s.from];
      return other.some(([ox, oy]) => ox === x && oy === y);
    };

    const tryMove = (d: Dir) => {
      const s = g.current;
      s.dir = d;
      const nx = s.pos[0] + STEP[d][0], ny = s.pos[1] + STEP[d][1];
      if (blocked(nx, ny, "player")) {
        const t = thingAt(things, nx, ny, s.cat.pos);
        // Walking into the door opens it once; holding the direction shouldn't reopen it.
        if (t?.id === "door") { s.held = null; inspect(t); }
        return false;
      }
      s.from = s.pos; s.pos = [nx, ny]; s.t = 0;
      return true;
    };

    let last = performance.now();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(canvas);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last);
      last = now;
      if (!visible) return;
      const s = g.current;
      const busy = Boolean(ui.current.dialog || ui.current.menu !== null || ui.current.panel);

      // player
      if (s.t < 1) {
        s.t = Math.min(1, s.t + dt / STEP_MS);
        if (s.t >= 1) { s.from = s.pos; s.steps++; }
      }
      if (s.t >= 1 && !busy) {
        if (s.path.length) {
          const d = s.path.shift()!;
          if (!tryMove(d)) {
            // Something moved into the way (the cat); plan again.
            const goal = s.goal;
            s.path = []; s.goal = null;
            if (goal?.thing) walkTo(goal.thing);
            else if (goal?.tile) walkToTile(goal.tile);
          }
        } else if (s.goal) {
          const goal = s.goal;
          s.goal = null;
          if (goal.thing) {
            const spot = standSpots(goal.thing, s.cat.pos).find((sp) => sp.at[0] === s.pos[0] && sp.at[1] === s.pos[1]);
            if (spot) { s.dir = spot.face; inspect(goal.thing); }
          }
        } else if (s.held && now >= s.turnUntil) {
          tryMove(s.held);
        }
      }

      // cat
      const c = s.cat;
      if (c.t < 1) {
        c.t = Math.min(1, c.t + dt / CAT_STEP_MS);
        if (c.t >= 1) c.from = c.pos;
      } else if (!busy && !s.goal) {
        c.next -= dt;
        if (c.next <= 0) {
          c.next = 2000 + Math.random() * 3500;
          const dirs = Object.values(STEP);
          const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
          const nx = c.pos[0] + dx, ny = c.pos[1] + dy;
          const inArea = nx >= CAT_AREA.x0 && nx <= CAT_AREA.x1 && ny >= CAT_AREA.y0 && ny <= CAT_AREA.y1;
          if (inArea && !blocked(nx, ny, "cat")) { c.from = c.pos; c.pos = [nx, ny]; c.t = 0; }
        }
      }

      // draw
      ctx.drawImage(bg, 0, 0);
      drawPCScreen(ctx, now);
      drawTVScreen(ctx, now, Boolean(profile.video.src));
      drawClockHands(ctx, now);

      const lerp = (a: Pt, b: Pt, t: number): Pt =>
        reduce ? b : [Math.round((a[0] + (b[0] - a[0]) * t) * TILE), Math.round((a[1] + (b[1] - a[1]) * t) * TILE)];
      const toPx = (p: Pt): Pt => (reduce ? [p[0] * TILE, p[1] * TILE] : p);
      const [px, py] = toPx(lerp(s.from, s.pos, s.t));
      const [cx, cy] = toPx(lerp(c.from, c.pos, c.t));
      const walking = s.t < 1 && !reduce;
      const pFrame = walking && s.t > 0.25 && s.t < 0.85 ? 1 + (s.steps % 2) : 0;
      const sprites = [
        { y: cy, draw: () => drawCat(ctx, cx, cy - 3, Math.floor(now / 160) % 25 === 0) },
        { y: py, draw: () => drawPlayer(ctx, px, py - 4, s.dir, pFrame, profile.avatar) },
      ].sort((a, b) => a.y - b.y);
      sprites.forEach((sp) => sp.draw());

      if (!busy && s.t >= 1 && !s.path.length) {
        const [dx, dy] = STEP[s.dir];
        const t = thingAt(things, s.pos[0] + dx, s.pos[1] + dy, c.pos);
        if (t && Math.floor(now / 400) % 4 !== 3) drawAlert(ctx, px + 4, Math.max(0, py - 15));
      }

      if (ui.current.classic) toClassicPalette(ctx);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [things, solid, profile]);

  // ---------- panel ----------
  useEffect(() => {
    const dlg = panelRef.current;
    if (!dlg) return;
    if (panel && !dlg.open) dlg.showModal();
    if (!panel && dlg.open) dlg.close();
  }, [panel]);

  const closePanel = () => {
    setPanel(null);
    g.current.held = null;
    consoleRef.current?.focus();
  };

  const panelMeta = MENU.find((m) => m.panel === panel);
  const total = MENU.length;
  const sayAll = dialog ? dialog.pages[dialog.i] : "";

  return (
    <div className="gb-wrap" ref={wrapRef}>
      <div
        className="gb"
        ref={consoleRef}
        tabIndex={0}
        role="group"
        aria-roledescription="game"
        aria-label={`${name}'s room. Arrow keys walk, Enter or Space inspects, M opens the menu.`}
        style={scale ? ({ "--s": scale } as React.CSSProperties) : undefined}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) g.current.held = null; }}
      >
        <div className="gb-bezel">
          <div className="gb-bezel-top" aria-hidden="true">
            <span className="gb-led" />
            <span>{classic ? "CLASSIC" : "COLOR"}</span>
          </div>
          <div className="gb-screen">
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              onClick={onScreenClick}
              role="img"
              aria-label="A pixel-art room with a bookshelf, a PC, a corkboard, a clock, a TV, a table with a notebook, a cat, and a door mat."
            />
            {dialog && (
              <div className="gb-text" onClick={pressA}>
                <span aria-hidden="true">{page.slice(0, typed)}</span>
                {typed >= page.length && <span className="gb-next" aria-hidden="true" />}
              </div>
            )}
            {menu !== null && (
              <div className="gb-menu" role="menu" aria-label="Shortcut menu">
                <div className="gb-menu-head" aria-hidden="true">SEEN {seen.length}/{total}</div>
                {[...MENU, { panel: null, label: "CLOSE", title: "Close" }].map((item, i) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className={i === menu ? "on" : undefined}
                    onMouseEnter={() => setMenu(i)}
                    onClick={() => { if (i === MENU.length) setMenu(null); else { setMenu(i); ui.current.menu = i; pressA(); } }}
                  >
                    {item.label}
                    {item.panel && seen.includes(item.panel) && <span className="sr-only"> (seen)</span>}
                  </button>
                ))}
              </div>
            )}
            <p className="sr-only" aria-live="polite">{menu !== null ? `Menu: ${[...MENU.map((m) => m.label), "CLOSE"][menu]}` : sayAll}</p>
          </div>
        </div>

        <div className="gb-brand" aria-hidden="true">PROPHET <i>POCKET</i></div>

        <div className="gb-controls">
          <div className="gb-dpad">
            <button type="button" className="up" aria-label="Up" {...padProps("up")} />
            <button type="button" className="left" aria-label="Left" {...padProps("left")} />
            <span className="mid" aria-hidden="true" />
            <button type="button" className="right" aria-label="Right" {...padProps("right")} />
            <button type="button" className="down" aria-label="Down" {...padProps("down")} />
          </div>
          <div className="gb-ab">
            <button type="button" className="b" aria-label="B: back" onClick={pressB}>B</button>
            <button type="button" className="a" aria-label="A: inspect" onClick={pressA}>A</button>
          </div>
        </div>
        <div className="gb-pills">
          <button type="button" onClick={toggleClassic} aria-pressed={classic} aria-label="Select: classic green palette">
            <i aria-hidden="true" />SELECT
          </button>
          <button type="button" onClick={pressStart} aria-expanded={menu !== null} aria-label="Start: shortcut menu">
            <i aria-hidden="true" />START
          </button>
        </div>
      </div>

      <p className="gb-help">
        <kbd>←↑↓→</kbd> walk · <kbd>Space</kbd> A · <kbd>Esc</kbd> B · <kbd>M</kbd> menu · or tap anything in the room
      </p>

      <dialog
        ref={panelRef}
        className="gb-panel"
        aria-labelledby="gb-panel-title"
        onClose={closePanel}
        onClick={(e) => { if (e.target === e.currentTarget) closePanel(); }}
      >
        {panel && (
          <div className="gb-panel-inner">
            <div className="gb-panel-head">
              <h2 id="gb-panel-title" tabIndex={-1} autoFocus>{panelMeta?.title}</h2>
              <button type="button" className="btn small" onClick={closePanel}>
                close <span aria-hidden="true">✕</span>
              </button>
            </div>
            <PanelContent id={panel} profile={profile} />
          </div>
        )}
      </dialog>
    </div>
  );
}
