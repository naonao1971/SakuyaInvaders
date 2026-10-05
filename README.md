# 咲耶インベーダー（SAKUYA INVADERS ─ SAVE 11 CNP）

インベーダーにさらわれた CNP 11体を救い出す、咲耶シリーズのブラウザゲームです。
共通部分は [咲耶ゲームフレームワーク（sakuya-kit）](https://github.com/naonao1971/sakuya-kit) 0.6.3 を使っています。

## 遊び方

- 攻めてくるインベーダーの編隊を撃ち落とす
- 上を飛ぶ UFO を撃つと、さらわれた CNP を1体救出できる（初めてのキャラは 500 点）
- 3 WAVE 守り切ればクリア。インベーダーが地上まで降りてきたら、または残機が無くなったらおしまい
- クリア時のボーナス: 残機 × 1000 ＋ 救出した CNP × 300

## 操作

| | |
|---|---|
| PC | ← → / A D で移動 ・ X / Space でショット ・ V 自動連射 ・ P 一時停止 ・ M 音 |
| スマホ（横持ち） | 左半分を押したまま左右に倒して移動 ・ A でショット ・ ⚙ で音・全画面・自動連射 |

## ファイル

| | |
|---|---|
| `index.html` | ゲーム本体（kit は jsDelivr の `sakuya-kit@0.6.3` から読む） |
| `sw.js` | 機内モードでも遊べるようにする Service Worker（kit の sw-core.js を読むだけ） |
| `docs/PLAN.md` | 企画書（決まったこと・まだのこと） |
| `promo/sakuya-invaders-making.mp4` | 「ゲーム、ポン出し。」紹介動画（77秒・1080p） |
| `tools/video/` | 紹介動画を作ったスクリプト（自動操縦の録画・編集画面・BGM） |

本作は CryptoNinja / CryptoNinja Partners の非公式ファンアートです。
