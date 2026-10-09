# 咲耶インベーダー（SakuyaInvaders）

咲耶シリーズのブラウザゲーム。共通部分は [sakuya-kit](https://github.com/naonao1971/sakuya-kit) を使う。
公開先は https://invaders.naoblock.jp/ （GitHub Pages・`main` の直下）。企画と決まったことは `docs/PLAN.md`。

## 進め方（プロトは完成済み。ここからは PR で直す）

- 要望もバグも、**作業ブランチ → プルリクエスト**で直す。`main` に直接 push しない。マージは利用者が行う
- 1つの要望・バグにつき1つの PR。PR の説明には「何を直したか」と「どこを押して、何が起きれば OK か」を書く
- push する前に、sakuya-kit の自動プレイテストを通し、画面写真を自分の目で見る
  ```
  PWPATH=$(npm root -g)/playwright node <sakuya-kit>/.claude/skills/sakuyagamesskill/scripts/playtest.mjs \
    --game . --kit <sakuya-kit> --out <作業フォルダ>
  ```
  最後の行が `OK` でなければ PR を出さない
- 遊びの手触りに関わる変更（速さ・難しさ・UFO の間隔・レーザー）は、自動操縦で何回か通して、クリアできるか・CNP を何体救出できるかを確かめて PR に書く
- 実機で試してもらう URL: `https://raw.githack.com/naonao1971/SakuyaInvaders/<ブランチ>/index.html`

## sakuya-kit の版

- いまは `sakuya-kit@0.7.0`。`index.html` の `kit.js` と `kit.css` の2か所を、**必ず同じ版**にする（`sw.js` は書き換えない）
- sakuya-kit の新しい版が出たら、このタイトルにも版を上げる PR を出す（ほかの咲耶シリーズと一緒に）。
  kit の `CHANGELOG.md` を読み、このタイトルで設定の書き換えが要るか確かめてから上げる
- kit が受け持つ部品（操作・ポーズ・HUD・ランキング・結果画面・効果音など）のバグは、ここで直さず sakuya-kit 側で直す。
  直したら kit の版を上げ、この PR で版番号を上げる

## 触るときの注意

- タイトル画面・縦持ち案内・OGP の元は `keyvisual.jpg`
- `make-assets.mjs` で OGP や `<head>` を作り直すとアイコンも上書きされる。作り直したあとは `node tools/icon.mjs` でインベーダーのアイコンに戻す
- `gameId` は `invaders`（ランキングのシート名）。変えない
- `maxScore` は 99999。スコアの付け方を変えたら、スプレッドシートの `_games` の「スコア上限」と合わせる
- `window.kit = kit;` は消さない（playtest が使う）
