// editor.html を 1 コマずつ描いて JPEG に書き出す。node render.mjs [preview 時刻,...]
import { createRequire } from "module";
import http from "http";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node22/lib/node_modules/playwright");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TYPES = { ".html": "text/html", ".jpg": "image/jpeg", ".ttf": "font/ttf", ".js": "text/javascript" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto(`http://localhost:${server.address().port}/edit/editor.html`);
const total = await page.evaluate(() => window.ready);
const stage = page.locator("#stage");
const preview = process.argv[2];
if (preview) {
  fs.mkdirSync("preview", { recursive: true });
  for (const t of preview.split(",").map(Number)) {
    await page.evaluate((t) => window.render(t), t);
    await stage.screenshot({ path: `preview/p_${t}.jpg`, type: "jpeg", quality: 85 });
  }
  console.log("total", total, JSON.stringify(await page.evaluate(() => window.TIMELINE.T)));
} else {
  fs.mkdirSync("frames", { recursive: true });
  const n = Math.ceil(total * 30);
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.render(t), i / 30);
    await stage.screenshot({ path: `frames/${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
    if (i % 300 === 0) console.log(i, "/", n);
  }
  console.log("done", n);
}
await browser.close();
server.close();
