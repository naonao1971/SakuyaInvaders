// シリーズと同じテイストのアイコン（黒地・金の枠・金の縁取りとマゼンタの光のインベーダー）を書き出す。
// make-assets.mjs はアイコンも上書きするので、OGP を作り直したあとにリポジトリ直下で実行する:  node tools/icon.mjs
// playwright は PWPATH が無ければ /opt/node22 の場所を使う
import { createRequire } from "module"; import fs from "fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PWPATH || "/opt/node22/lib/node_modules/playwright");
const b = await chromium.launch(); const pg = await b.newPage();
const out = await pg.evaluate(() => {
  const SPR = ["00100000100","00010001000","00111111100","01101110110","11111111111","10111111101","10100000101","00011011000"];
  const BG = "#06070C", GOLD = "#E8C56A", MAG = "#FF2D9B";
  function draw(size) {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const x = c.getContext("2d");
    x.fillStyle = BG; x.fillRect(0, 0, size, size);
    const frame = Math.max(1, Math.round(size / 30));
    const px = Math.max(2, Math.floor(size * 0.6 / 11));           // 1ドットの大きさ
    const w = px * 11, h = px * 8;
    const ox = Math.round((size - w) / 2), oy = Math.round((size - h) / 2 + size * 0.01);
    const cells = [];
    SPR.forEach((r, yy) => [...r].forEach((v, xx) => v === "1" && cells.push([ox + xx * px, oy + yy * px])));
    const ol = size >= 64 ? Math.max(2, Math.round(size / 110)) : 0; // 金の縁
    // 光（マゼンタのにじみ）＋ 金の縁
    x.save();
    x.shadowColor = "rgba(255,45,155,0.75)"; x.shadowBlur = size / 10;
    x.fillStyle = ol ? GOLD : MAG;
    for (const [cx, cy] of cells) x.fillRect(cx - ol, cy - ol, px + ol * 2, px + ol * 2);
    x.restore();
    // 本体
    x.fillStyle = MAG;
    for (const [cx, cy] of cells) x.fillRect(cx, cy, px, px);
    x.strokeStyle = GOLD; x.lineWidth = frame;
    x.strokeRect(frame / 2, frame / 2, size - frame, size - frame);
    return c.toDataURL("image/png");
  }
  return Object.fromEntries([["apple-touch-icon.png",180],["icon-192.png",192],["icon-512.png",512],["favicon-32.png",32]].map(([n,s]) => [n, draw(s)]));
});
for (const [n, d] of Object.entries(out)) fs.writeFileSync(n, Buffer.from(d.split(",")[1], "base64"));
await b.close();
