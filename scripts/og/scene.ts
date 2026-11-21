// Draws the hero room into #room for the social card, using the same sprites as the site.
import { profile } from "../../src/data/profile";
import { CAT_START, HEIGHT, START, TILE, WIDTH } from "../../src/game/room";
import {
  ALERT_HEIGHT, drawAlert, drawCat, drawClockHands, drawPCScreen, drawPlayer, drawRoom, drawTVScreen,
} from "../../src/game/sprites";

const canvas = document.getElementById("room") as HTMLCanvasElement;
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx = canvas.getContext("2d")!;

drawRoom(ctx);
drawPCScreen(ctx, 0);
drawTVScreen(ctx, 0, Boolean(profile.video.src));
drawClockHands(ctx, 0);

const [cx, cy] = [CAT_START[0] * TILE, CAT_START[1] * TILE];
const [px, py] = [START[0] * TILE, START[1] * TILE];
drawPlayer(ctx, px, py - 4, "down", 0, profile.avatar);
drawCat(ctx, cx, cy - 3, false);
drawAlert(ctx, px + 4, py - 5 - ALERT_HEIGHT);

const text = (id: string, value: string) => { document.getElementById(id)!.textContent = value; };
text("name", profile.name);
document.getElementById("headline")!.replaceChildren(
  ...profile.headline.map((line) => Object.assign(document.createElement("span"), { textContent: line })),
);
text("status", profile.status);

(window as unknown as { ready: boolean }).ready = true;
