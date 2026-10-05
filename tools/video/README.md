# 紹介動画の作り方（参考）

1. `record-game.mjs` … ゲームを自動操縦で遊ばせて canvas を録画（webm）し、効果音のタイミングを events.json に残す
2. `editor.html` … 1コマずつ描く編集画面（タイトル・依頼・コード・テスト・プレイ・スマホ・まとめ）
3. `render.mjs` … editor.html を 30fps で JPEG に書き出す
4. `audio.py` … BGM と効果音を合成して audio.wav を作る（numpy）
5. ffmpeg で JPEG 連番と audio.wav を mp4 にまとめる

作ったときの作業フォルダ前提のパス（`../fonts` `seg/` など）が残っているので、作り直すときはパスを合わせる。
フォントは Google Fonts の Noto Sans JP・M PLUS 1 Code・DotGothic16。
