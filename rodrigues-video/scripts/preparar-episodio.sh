#!/usr/bin/env bash
# Trata cor e áudio do vídeo bruto e gera a base do episódio MANTENDO o fps e a
# resolução da gravação (iPhone: 1080p/60 fps). Nada de converter para 30 fps.
# uso: scripts/preparar-episodio.sh <original.mp4> <diaNN>
set -euo pipefail
SRC="$1"; DIA="$2"; DEST="public/$DIA"
mkdir -p "$DEST"
# fps real do vídeo (r_frame_rate pode vir como 60/1 ou 60000/1001).
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of default=nw=1:nk=1 "$SRC" | head -1)
echo "fps original: $FPS"
# Cor: denoise MUITO leve (preserva detalhe), exposição/contraste sutis, neutraliza o
# amarelado, nitidez leve. Mantém o espaço de cor BT.709 das redes sociais.
G="hqdn3d=0.8:0.8:3:3,eq=contrast=1.06:brightness=0.02:saturation=1.05:gamma=1.05,colorbalance=rs=-0.02:bs=0.015:rh=-0.03:gh=-0.005:bh=0.03,unsharp=5:5:0.3"
# Voz: corta grave, reduz ruído, EQ de presença, compressão leve, -14 LUFS (redes sociais).
A="highpass=f=80,afftdn=nf=-45,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1.5:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9"
# Intermediário de altíssima qualidade (crf 12): a perda real só acontece no render final.
ffmpeg -v error -y -i "$SRC" -vf "fps=$FPS,$G,format=yuv420p" -af "$A" -ar 48000 \
  -c:v libx264 -preset fast -crf 12 -g 60 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -movflags +faststart "$DEST/base.mp4"
ffmpeg -v error -y -i "$SRC" -vn -ac 1 -ar 16000 "$DEST/audio16k.wav"
echo "ok: $DEST/base.mp4"
