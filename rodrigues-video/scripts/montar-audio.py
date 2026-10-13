"""Remonta a trilha de ÁUDIO de um episódio (voz tratada + efeitos sonoros) no ffmpeg, seguindo a mesma
linha do tempo do vídeo renderizado (cortes e posição dos SFX). Evita re-renderizar o vídeo quando só
o áudio muda.

uso: python montar-audio.py <voz.wav> <timeline.json> <pasta_sfx> <saida.wav>
  voz.wav      voz tratada, alinhada ao vídeo ORIGINAL (saída de voz-podcast.sh)
  timeline.json  saída de exportar-timeline.mjs
"""
import json
import subprocess
import sys

voz, tl_path, sfx_dir, saida = sys.argv[1:5]
tl = json.load(open(tl_path))
clips, sfx, dur = tl["clips"], tl["sfx"], tl["duracao"]

inputs = ["-i", voz]
chains = []
labels = []

# Cada clipe de fala: corta da voz original e posiciona na linha do tempo editada.
for i, c in enumerate(clips):
    fim = clips[i + 1]["out0"] if i + 1 < len(clips) else c["out0"] + (c["src1"] - c["src0"])
    d = min(c["src1"] - c["src0"], fim - c["out0"])
    ms = int(round(c["out0"] * 1000))
    chains.append(
        f"[0:a]atrim=start={c['src0']:.4f}:duration={d:.4f},asetpts=PTS-STARTPTS,"
        f"aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms}[v{i}]"
    )
    labels.append(f"[v{i}]")

# Efeitos sonoros (cada um com o volume definido no Dia*.tsx).
for j, s in enumerate(sfx):
    inputs += ["-i", f"{sfx_dir}/{s['som']}.wav"]
    ms = max(0, int(round(s["out"] * 1000)))
    chains.append(
        f"[{j + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={s['volume']},adelay={ms}|{ms}[s{j}]"
    )
    labels.append(f"[s{j}]")

fc = ";".join(chains) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{dur:.4f}[a]"
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[a]", "-ar", "48000", "-c:a", "pcm_s16le", saida],
    check=True,
)
print(f"ok: {saida} · {len(clips)} clipes · {len(sfx)} efeitos · {dur:.2f}s")
