# 企画書: 咲耶インベーダー

## 決まったこと

| 項目 | 内容 |
|---|---|
| 日本語名 | 咲耶インベーダー |
| 主題 / 副題 | SAKUYA INVADERS / - SAVE 11 CNP - |
| gameId | `invaders`（ランキングのシート名。あとから変えない） |
| 元ネタ | スペースインベーダー |
| 中心の遊び | 編隊（5段×11列）を撃ち落とす。UFO に乗せられた CNP を撃って救出 |
| 操作 | 左右移動 ＋ A（ショット）。自動連射あり（タッチ端末は最初からオン） |
| ミス | 爆弾に当たると残機 -1（3機、5000点ごとに1UP） |
| 終わり方 | 3 WAVE 全滅でクリア / 地上まで降りられるか残機0でゲームオーバー |
| スコア | 30・20・10点 × WAVE数、UFO 500（2回目以降 200）、WAVE クリア 1000 × WAVE数、クリアボーナス |
| maxScore | 99999（仮。理論上の最高点を計算して決め直す） |
| kit | sakuya-kit 0.6.3、`layout: "ab"`、`offline: true`、共通 GAS |

## まだのこと（本番公開まで）

- [ ] 公開 URL を決める（例 `invaders.naoblock.jp`）と `CNAME`
- [ ] キービジュアル → `make-assets.mjs` で OGP・アイコン・manifest・`<head>` を作る
- [ ] maxScore を決めて、スプレッドシートの `_games` の「スコア上限」と合わせる
- [ ] 演出動画（clear.mp4 / gameover.mp4）を使うか決める
- [ ] シェアの文言とハッシュタグ
- [ ] 実機（iPhone・Android）で確認 → GitHub Pages で公開 → `_games` の「総合に含める」を TRUE
