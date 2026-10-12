"""Compõe uma trilha de fundo original (sem direitos de terceiros) por síntese.

Estilo: beat "business / tech" suave — pads quentes, arpejo, baixo, bateria leve.
Cada episódio pode variar tom, andamento e progressão com --seed.

uso: python scripts/gerar-trilha.py <saida.wav> <duracao_s> [--seed N] [--bpm 96]
"""
import argparse

import numpy as np
import soundfile as sf

SR = 44100

ap = argparse.ArgumentParser()
ap.add_argument("saida")
ap.add_argument("duracao", type=float)
ap.add_argument("--seed", type=int, default=39)
ap.add_argument("--bpm", type=float, default=0)
args = ap.parse_args()
rng = np.random.default_rng(args.seed)

# Progressões (graus em semitons a partir da tônica menor) — todas soam "jornada/progresso".
PROGRESSOES = [
    [0, 8, 3, 10],  # i  VI III VII
    [0, 5, 8, 10],  # i  iv VI VII
    [0, 8, 5, 10],  # i  VI iv VII
    [0, 3, 8, 10],  # i III VI VII
]
prog = PROGRESSOES[rng.integers(len(PROGRESSOES))]
tonica = 45 + int(rng.integers(-2, 3))  # A2 ± alguns semitons
bpm = args.bpm or float(rng.choice([90, 94, 96, 100]))
beat = 60 / bpm
bar = 4 * beat
N = int(SR * args.duracao)
mix = np.zeros((N, 2))


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def acorde(grau):
    # Menor se o grau for i/iv, maior caso contrário (VI, III, VII).
    terca = 3 if grau in (0, 5) else 4
    r = tonica + 12 + grau
    return [r, r + terca, r + 7, r + 12 + (2 if grau else 0)]


def lowpass(x, cutoff):
    k = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += k * (v - acc)
        y[i] = acc
    return y


def add(sig, start, pan=0.0, gain=1.0):
    i0 = int(start * SR)
    if i0 >= N:
        return
    sig = sig[: N - i0] * gain
    mix[i0 : i0 + len(sig), 0] += sig * (1 - pan) * 0.5 ** 0.5 * 1.41 / 1.41
    mix[i0 : i0 + len(sig), 1] += sig * (1 + pan) * 0.5 ** 0.5 * 1.41 / 1.41


def env_adsr(n, a, d, s, r):
    e = np.full(n, s)
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[na : na + nd] = np.linspace(1, s, nd)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def pad(midis, dur):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for m in midis:
        for det in (-0.08, 0.0, 0.08):  # leve desafinação = largura
            f = hz(m + det)
            x += 2 * (t * f % 1) - 1  # serra
    x = lowpass(x / (len(midis) * 3), 1100)
    return x * env_adsr(len(t), 0.6, 0.4, 0.8, 0.8)


def pluck(m, dur=0.45):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return x * np.exp(-t * 7) * np.minimum(t / 0.004, 1)


def baixo(m, dur):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return x * env_adsr(len(t), 0.01, 0.2, 0.7, 0.08)


def kick():
    t = np.arange(int(0.4 * SR)) / SR
    f = 48 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def clap():
    t = np.arange(int(0.25 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = n - lowpass(n, 900)
    return n * np.exp(-t * 22) * 0.6


def hat():
    t = np.arange(int(0.06 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = n - lowpass(n, 6000)
    return n * np.exp(-t * 70) * 0.35


K, C, H = kick(), clap(), hat()
n_bars = int(np.ceil(args.duracao / bar)) + 1
padrao_arpejo = rng.permutation([0, 1, 2, 3, 2, 1, 3, 0])
pad_cache = {}
kick_times = []

for b in range(n_bars):
    t0 = b * bar
    grau = prog[b % 4]
    ac = acorde(grau)
    secao = "intro" if b < 2 else ("respiro" if b % 16 in (14, 15) else "cheio")
    if grau not in pad_cache:
        pad_cache[grau] = pad(ac, bar + 0.8)
    add(pad_cache[grau], t0, pan=-0.1, gain=0.55)
    # Arpejo (8 colcheias por compasso), alternando lados.
    if secao != "intro":
        for k in range(8):
            nota = ac[padrao_arpejo[k]] + 12
            add(pluck(nota), t0 + k * beat / 2, pan=0.35 if k % 2 else -0.35, gain=0.22)
    # Baixo nas cabeças de tempo 1 e 3 (+ antecipação).
    if secao != "intro":
        for k, d in ((0, beat * 1.5), (1.5, beat * 0.5), (2, beat * 2)):
            add(baixo(tonica + grau - 12 + 12, d * 0.95), t0 + k * beat, gain=0.5)
    # Bateria.
    if secao == "cheio":
        for k in (0, 2.5):
            add(K, t0 + k * beat, gain=0.8)
            kick_times.append(t0 + k * beat)
        for k in (1, 3):
            add(C, t0 + k * beat, gain=0.55)
        for k in range(8):
            add(H, t0 + k * beat / 2, pan=0.2, gain=0.5 if k % 2 else 0.3)

# "Pumping" leve nos pads (sidechain do bumbo) para dar movimento.
duck = np.ones(N)
for kt in kick_times:
    i0 = int(kt * SR)
    n = int(0.28 * SR)
    seg = 1 - 0.35 * np.exp(-np.arange(n) / SR * 12)
    duck[i0 : i0 + n] = np.minimum(duck[i0 : i0 + n], seg[: max(0, min(n, N - i0))])
mix *= duck[:, None]

# Fade in/out e normalização.
fi, fo = int(1.5 * SR), int(3.0 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
sf.write(args.saida, (mix * 0.89).astype(np.float32), SR)
print(f"ok: {args.saida} · {args.duracao:.1f}s · {bpm:.0f} BPM · tônica MIDI {tonica} · prog {prog}")
