#!/usr/bin/env bash
# Mistura a trilha de fundo sob a voz, com "ducking" (a música abaixa quando
# há fala) e EQ que abre espaço para a voz. Copia o vídeo sem recodificar.
# Calibrado: trilha ≈ -31 LUFS sob a voz (-14 LUFS), ~17 dB abaixo.
# uso: scripts/mixar-musica.sh <video.mp4> <trilha.wav> <saida.mp4> [atraso_s] [volume_dB]
set -euo pipefail
VID="$1"; MUS="$2"; OUT="$3"; ATRASO="${4:-0}"; VOL="${5:--12}"
MS=$(python3 -c "print(int(float('$ATRASO')*1000))")
ffmpeg -v error -y -i "$VID" -i "$MUS" -filter_complex "
  [0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][sc];
  [1:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${MS}|${MS},
       highpass=f=70,equalizer=f=140:t=q:w=1:g=-4,equalizer=f=2500:t=q:w=1.4:g=-5,
       volume=${VOL}dB[mus];
  [mus][sc]sidechaincompress=threshold=0.1:ratio=2.5:attack=25:release=450:makeup=1[musduck];
  [voz][musduck]amix=inputs=2:duration=first:normalize=0,
       loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "ok: $OUT"
