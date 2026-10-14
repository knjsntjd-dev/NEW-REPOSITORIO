#!/usr/bin/env bash
# Mixa uma música externa (mp3/wav) SOB a voz do vídeo, sempre mais baixa que a voz.
# - Estende a música até a duração do vídeo (repetição com crossfade) e dá fade in/out.
# - EQ abre espaço para a voz; ducking extra enquanto há fala.
# - Voz ≈ -14 LUFS; música ≈ -21 LUFS (7 dB abaixo) e mais baixa ainda durante a fala.
# uso: scripts/mixar-musica-externa.sh <video.mp4> <musica.mp3> <saida.mp4> [LUFS_musica=-19]
set -euo pipefail
VID="$1"; MUS="$2"; OUT="$3"; LM="${4:--19}"
HERE="$(cd "$(dirname "$0")" && pwd)"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VID")
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
"$HERE/estender-musica.sh" "$MUS" "$DUR" "$TMP/musica.wav" >/dev/null
ffmpeg -v error -y -i "$VID" -i "$TMP/musica.wav" -filter_complex "
  [0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][sc];
  [1:a]highpass=f=80,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=2800:t=q:w=1.3:g=-5,
       loudnorm=I=${LM}:TP=-2:LRA=7[mus];
  [mus][sc]sidechaincompress=threshold=0.05:ratio=2.5:attack=20:release=500:makeup=1[musduck];
  [voz][musduck]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.89:level=disabled[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "ok: $OUT"
