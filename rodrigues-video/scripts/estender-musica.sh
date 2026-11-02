#!/usr/bin/env bash
# Estende uma música até a duração desejada repetindo-a com crossfade (sem corte seco)
# e termina com fade-out. uso: scripts/estender-musica.sh <musica.mp3> <duracao_s> <saida.wav> [crossfade_s=6]
set -euo pipefail
MUS="$1"; DUR="$2"; OUT="$3"; XF="${4:-6}"
MDUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MUS")
N=$(python3 -c "import math;m=float('$MDUR');x=float('$XF');d=float('$DUR');print(max(1,math.ceil((d-x)/(m-x))))")
FC=""; IN=""
for i in $(seq 0 $((N-1))); do FC+="[0:a]aformat=sample_rates=48000:channel_layouts=stereo[c$i];"; done
PREV="c0"
for i in $(seq 1 $((N-1))); do FC+="[$PREV][c$i]acrossfade=d=${XF}:c1=qsin:c2=qsin[x$i];"; PREV="x$i"; done
FO=$(python3 -c "print(max(0,float('$DUR')-3.5))")
FC+="[$PREV]atrim=0:${DUR},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.2,afade=t=out:st=${FO}:d=3.5[o]"
ffmpeg -v error -y -i "$MUS" -filter_complex "$FC" -map "[o]" "$OUT"
echo "ok: $OUT ($N repetições, ${DUR}s)"
