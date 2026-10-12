#!/usr/bin/env bash
# Trata cor e áudio do vídeo bruto e gera a base do episódio.
# uso: scripts/preparar-episodio.sh <original.mp4> <diaNN>
set -euo pipefail
SRC="$1"; DIA="$2"; DEST="public/$DIA"
mkdir -p "$DEST"
# Cor: denoise leve, exposição/contraste sutis, neutraliza o amarelado, nitidez leve.
G="hqdn3d=1.2:1.2:5:5,eq=contrast=1.07:brightness=0.025:saturation=1.06:gamma=1.06,colorbalance=rs=-0.02:bs=0.015:rh=-0.03:gh=-0.005:bh=0.03,unsharp=5:5:0.35"
# Voz: corta grave, reduz ruído, EQ de presença, compressão leve, -14 LUFS (redes sociais).
A="highpass=f=80,afftdn=nf=-45,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1.5:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9"
ffmpeg -v error -y -i "$SRC" -vf "fps=30,$G,format=yuv420p" -af "$A" -ar 48000 \
  -c:v libx264 -preset medium -crf 17 -g 30 -c:a aac -b:a 192k -movflags +faststart "$DEST/base.mp4"
ffmpeg -v error -y -i "$SRC" -vn -ac 1 -ar 16000 "$DEST/audio16k.wav"
echo "ok: $DEST/base.mp4"
