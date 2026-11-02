"""Gera os efeitos sonoros da série por síntese (sem licença de terceiros).

uso: python scripts/gerar-sfx.py public/sfx
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(39)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(n, attack, release):
    a = int(SR * attack)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[a:] = np.exp(-np.linspace(0, release, n - a))
    return e


def lowpass(x, cutoff):
    # Passa-baixa de 1 polo com corte variável (array ou escalar).
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.zeros_like(x)
    acc = 0.0
    for i, (v, c) in enumerate(zip(x, cutoff)):
        k = 1 - np.exp(-2 * np.pi * c / SR)
        acc += k * (v - acc)
        y[i] = acc
    return y


def save(name, x, peak=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    sf.write(out / f"{name}.wav", np.stack([x, x], axis=1).astype(np.float32), SR)


# Whoosh: ruído com filtro varrendo pra cima e pra baixo.
tt = t(0.55)
sweep = 300 + 5000 * np.sin(np.pi * tt / tt[-1]) ** 2
save("whoosh", lowpass(rng.standard_normal(len(tt)), sweep) * np.sin(np.pi * tt / tt[-1]) ** 1.5, 0.6)

# Impacto: grave com queda de pitch + estalo curto.
tt = t(0.9)
freq = 38 + 90 * np.exp(-tt * 18)
body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(tt), 0.002, 6)
click = lowpass(rng.standard_normal(len(tt)), 2500) * env(len(tt), 0.001, 60)
save("impact", body + 0.5 * click, 0.9)

# Notificação de venda: dois sinos (quinta + oitava).
tt = t(0.8)
bell = lambda f, d: (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tt)) * env(len(tt), 0.003, 7)
ding = bell(1318.5, 0) + np.concatenate([np.zeros(int(SR * 0.09)), bell(1975.5, 0)[: len(tt) - int(SR * 0.09)]])
save("venda", ding, 0.55)

# Tique de contador.
tt = t(0.05)
save("tick", np.sin(2 * np.pi * 2400 * tt) * env(len(tt), 0.0005, 40), 0.35)

# Pop suave para cards.
tt = t(0.18)
f = 500 + 900 * np.exp(-tt * 30)
save("pop", np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 22), 0.5)

# Riser curto antes do gancho final.
tt = t(1.4)
f = 200 + 1400 * (tt / tt[-1]) ** 2
riser = lowpass(rng.standard_normal(len(tt)), f * 3) * (tt / tt[-1]) ** 2
riser += 0.3 * np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / tt[-1]) ** 3
save("riser", riser, 0.5)
print("ok:", sorted(p.name for p in out.iterdir()))
