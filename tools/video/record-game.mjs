// 咲耶インベーダーを自動操縦で遊ばせて、canvas をそのまま録画する（webm）＋効果音のタイミングを記録
import { createRequire } from "module";
import http from "http";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("/opt/node22/lib/node_modules/playwright");

const GAME = path.resolve(process.argv[2]);
const KIT = "/home/user/naonao1971/sakuya-kit";
const OUT = path.resolve(process.argv[3]);
const MODE = process.argv[4] || "pc"; // pc | mobile
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json" };
const type = (p) => TYPES[path.extname(p)] || "application/octet-stream";

const server = http.createServer((req, res) => {
  const p = path.join(GAME, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  let body = fs.readFileSync(p);
  if (p.endsWith(".html")) body = body.toString().replace("window.kit = kit;", "window.kit = kit; window.__game = game;");
  res.writeHead(200, { "content-type": type(p) });
  res.end(body);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/index.html`;

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctxOpts = MODE === "mobile"
  ? { ...devices["iPhone 14 Pro Max landscape"], viewport: { width: 932, height: 430 }, deviceScaleFactor: 1 }
  : { viewport: { width: 1280, height: 800 } };
const ctx = await browser.newContext(ctxOpts);
await ctx.route(/https:\/\/cdn\.jsdelivr\.net\/gh\/naonao1971\/sakuya-kit@[^/]+\/.*/, (r) => {
  const p = new URL(r.request().url()).pathname.replace(/^\/gh\/naonao1971\/sakuya-kit@[^/]+\//, "");
  const f = path.join(KIT, p);
  if (!fs.existsSync(f)) return r.fulfill({ status: 404 });
  r.fulfill({ body: fs.readFileSync(f), contentType: type(f), headers: { "access-control-allow-origin": "*" } });
});
await ctx.route("https://script.google.com/**", (r) => r.fulfill({ json: { records: [], overall: [] } }));
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto(BASE);
await page.waitForFunction(() => window.kit && kit.cnp.chars.every((c) => c.ready !== false));
await page.waitForTimeout(800);

// 自動操縦（ページの中で動かす）
await page.evaluate(() => {
  const press = (code, down) => window.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { code, key: code, bubbles: true }));
  const held = { ArrowLeft: false, ArrowRight: false };
  const hold = (code, on) => { if (held[code] !== on) { held[code] = on; press(code, on); } };
  window.__events = [];
  window.__t0 = null;
  const t = () => (window.__t0 == null ? 0 : performance.now() - window.__t0);
  for (const n of ["shot", "hit", "pickup", "explode", "stage", "bonus", "clear", "gameOver"]) {
    const orig = kit.sfx[n].bind(kit.sfx);
    kit.sfx[n] = (...a) => { window.__events.push([n, t()]); return orig(...a); };
  }
  window.__bot = setInterval(() => {
    const g = window.__game;
    if (kit.phase !== "playing" || !g || !g.ship) { hold("ArrowLeft", false); hold("ArrowRight", false); return; }
    const s = g.ship;
    let tx = s.x;
    const alive = g.inv.filter((e) => e.alive);
    if (g.ufo && g.ufo.x > 40 && g.ufo.x < 920) {
      tx = g.ufo.x + g.ufo.dir * 2.2 * 34;
    } else if (alive.length) {
      // いちばん低い列の中で一番近い敵
      const near = alive.reduce((a, b) => (Math.abs(a.x - s.x) < Math.abs(b.x - s.x) ? a : b));
      tx = near.x + g.dir * 6;
    }
    // 爆弾をよける
    const danger = g.bombs.find((b) => b.y > 330 && Math.abs(b.x - s.x) < 34);
    if (danger) tx = s.x + (danger.x > s.x ? -120 : 120);
    if (tx < 50) tx = 50;
    if (tx > 910) tx = 910;
    const dx = tx - s.x;
    hold("ArrowLeft", dx < -4);
    hold("ArrowRight", dx > 4);
    if (Math.abs(dx) < 12 && !danger && g.shots.length < 2) { press("KeyX", true); press("KeyX", false); }
    if (!kit.autoFire.on) kit.autoFire.set(true);
  }, 16);
});

if (MODE === "mobile") {
  // スマホは数秒の様子だけ（タップでスタート → スティックとAボタン）
  await page.waitForTimeout(1500);
  const btn = page.locator(".sk-start, button:has-text('スタート')").first();
  await btn.tap().catch(() => page.evaluate(() => kit.start()));
  await page.evaluate(() => { window.__t0 = performance.now(); });
  const shots = [];
  const ts = Date.now();
  let i = 0;
  while (Date.now() - ts < 10000) {
    const f = path.join(OUT, `m${String(i++).padStart(4, "0")}.jpg`);
    await page.screenshot({ path: f, type: "jpeg", quality: 90 });
    shots.push([path.basename(f), Date.now() - ts]);
  }
  fs.writeFileSync(path.join(OUT, "frames.json"), JSON.stringify(shots));
  await page.close();
  await ctx.close();
  await browser.close();
  server.close();
  process.exit(0);
}

// canvas を録画
await page.evaluate(() => {
  const c = document.getElementById("game");
  const stream = c.captureStream(60);
  const rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 14e6 });
  window.__chunks = [];
  rec.ondataavailable = (e) => e.data.size && window.__chunks.push(e.data);
  window.__rec = rec;
  rec.start(1000);
  window.__t0 = performance.now();
});
await page.waitForTimeout(3000); // タイトル画面
await page.keyboard.press("Enter");
await page.evaluate(() => window.__events.push(["start", performance.now() - window.__t0]));
const t0 = Date.now();
while (Date.now() - t0 < 300000) {
  const ph = await page.evaluate(() => kit.phase);
  if (ph === "over") break;
  await page.waitForTimeout(500);
}
const result = await page.evaluate(() => ({ phase: kit.phase, result: kit.result, wave: __game.wave }));
console.log(JSON.stringify(result));
await page.evaluate(() => window.__events.push(["over", performance.now() - window.__t0]));
await page.waitForTimeout(7000);
const b64 = await page.evaluate(async () => {
  await new Promise((r) => { __rec.onstop = r; __rec.stop(); });
  const blob = new Blob(__chunks, { type: "video/webm" });
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
});
fs.writeFileSync(path.join(OUT, "game.webm"), Buffer.from(b64, "base64"));
fs.writeFileSync(path.join(OUT, "events.json"), JSON.stringify(await page.evaluate(() => __events)));
await browser.close();
server.close();
