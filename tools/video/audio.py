# BGM（チップチューン）と効果音を合成して audio.wav を作る
import json, wave
import numpy as np

SR = 44100
TOTAL = 77.3
mix = np.zeros(int(SR * (TOTAL + 1)), dtype=np.float64)

def sq(f, d, duty=0.5, vol=0.2, slide=None):
    n = int(SR * d); t = np.arange(n) / SR
    fr = np.full(n, f) if slide is None else np.linspace(f, slide, n)
    ph = np.cumsum(fr) / SR
    w = np.where((ph % 1) < duty, 1.0, -1.0)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 3.0 / max(d, 1e-3))
    return w * env * vol

def tri(f, d, vol=0.25):
    n = int(SR * d); t = np.arange(n) / SR
    ph = (t * f) % 1
    w = 4 * np.abs(ph - 0.5) - 1
    env = np.minimum(1, t / 0.004) * np.clip(1 - t / d, 0, 1)
    return w * env * vol

def noise(d, vol=0.2, decay=8):
    n = int(SR * d); t = np.arange(n) / SR
    return np.random.uniform(-1, 1, n) * np.exp(-t * decay) * vol

def put(sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(mix): return
    j = min(len(mix), i + len(sig))
    mix[i:j] += sig[: j - i] * gain

def midi(m): return 440 * 2 ** ((m - 69) / 12)

# ---- BGM: 140BPM、Am - F - G - E のループ ----
BPM = 140; beat = 60 / BPM
prog = [(57, [69, 72, 76]), (53, [65, 69, 72]), (55, [67, 71, 74]), (52, [64, 68, 71])]
melody = [76, None, 79, 76, 74, 72, 74, None, 72, None, 69, 72, 74, None, 71, 68]
def bgm_gain(t):
    if t < 4: return 0.8
    if t < 26: return 0.55   # 説明中は控えめ
    if t < 63.8: return 0.5
    return 0.8
t = 0.0; bar = 0
while t < TOTAL - 0.5:
    root, chord = prog[bar % 4]
    g = bgm_gain(t)
    for b in range(8):  # 8分音符でベース
        put(tri(midi(root - 12 + (12 if b % 2 else 0)), beat / 2 * 0.9, 0.22), t + b * beat / 2, g)
    for b in range(8):  # アルペジオ
        put(sq(midi(chord[b % 3] + 12), beat / 2 * 0.8, 0.25, 0.045), t + b * beat / 2, g)
    if t >= 4:
        for b in range(4):
            put(noise(0.05, 0.08, 40), t + b * beat + beat / 2, g)
            if b % 2 == 0: put(sq(110, 0.08, 0.5, 0.12, 50), t + b * beat, g)
    if bar % 8 >= 4 and t > 26:
        for k in range(8):
            m = melody[(bar % 2) * 8 + k]
            if m: put(sq(midi(m), beat / 2 * 0.9, 0.5, 0.06), t + k * beat / 2, g)
    t += beat * 4; bar += 1
# 最後はフェードアウト
fade_n = int(SR * 2.5); end = int(SR * TOTAL)
mix[end - fade_n:end] *= np.linspace(1, 0, fade_n)
mix[end:] = 0

# ---- 効果音 ----
def sfx(name, at, g=1.0):
    if name == "shot": put(sq(1200, 0.06, 0.5, 0.05, 500), at, g)
    elif name == "hit": put(noise(0.12, 0.12, 25), at, g); put(sq(300, 0.1, 0.5, 0.05, 80), at, g)
    elif name == "pickup":
        for i, m in enumerate([84, 88, 91, 96]): put(sq(midi(m), 0.08, 0.5, 0.1), at + i * 0.06, g)
    elif name == "explode": put(noise(0.6, 0.35, 5), at, g)
    elif name in ("stage", "bonus"):
        for i, m in enumerate([72, 76, 79, 84]): put(sq(midi(m), 0.12, 0.25, 0.1), at + i * 0.09, g)
    elif name == "clear":
        for i, m in enumerate([72, 76, 79, 84, 79, 84, 88]): put(sq(midi(m), 0.16, 0.5, 0.1), at + i * 0.12, g)
    elif name == "tick": put(noise(0.015, 0.12, 200), at, g)
    elif name == "blip": put(sq(1500, 0.04, 0.5, 0.06), at, g)
    elif name == "chime":
        for i, m in enumerate([79, 84, 88]): put(sq(midi(m), 0.25, 0.5, 0.1), at + i * 0.08, g)

rng = np.random.default_rng(1)
# 入力のタイピング
for k in range(18): sfx("tick", 4.4 + k * 2.2 / 18)
sfx("blip", 7.0)
for at in (7.4, 7.9, 8.5, 9.3): sfx("blip", at, 0.6)
# コードを書く音（早送り）
t = 10.3
while t < 20.7:
    sfx("tick", t, 0.5); t += 0.045 + rng.random() * 0.03
for i in range(7): sfx("blip", 12 - 1.2 + 0.8 + i * 0.9 + 0.3, 0.7)  # チェック項目
# テスト
for i in range(7): sfx("blip", 22.3 + i * 0.35, 0.7)
sfx("chime", 25.0)
# できあがり
sfx("stage", 26.0)
# プレイの効果音（録画中に kit が鳴らしたタイミング）
ev = json.load(open("events.json"))
segs = [(0, 3, 26), (3, 8, 29), (13.6, 4, 37), (59, 5, 41), (120.5, 5, 46), (166, 12.8, 51)]
for name, ms in ev:
    s = ms / 1000
    for src, dur, out in segs:
        if src <= s < src + dur:
            sfx(name, out + (s - src), 0.8)
# スマホ: 時々ショット
for k in range(int(7 / 0.25)): sfx("shot", 63.8 + k * 0.25, 0.6)
# おわり
for i in range(4): sfx("blip", 71.2 + i * 0.45)
sfx("clear", 73.4)

mix /= max(1.0, np.max(np.abs(mix)) / 0.9)
pcm = (mix * 32767).astype(np.int16)
with wave.open("audio.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR)
