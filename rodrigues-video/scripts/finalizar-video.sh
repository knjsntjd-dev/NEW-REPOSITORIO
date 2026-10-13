#!/usr/bin/env bash
# Encode final para redes sociais: 1080x1920, MANTÉM o fps do render (60), H.264 High, BT.709,
# 2 passadas, no MAIOR bitrate que cabe nos limites do ambiente (≤ ~88 MB por arquivo no GitHub).
# Se o vídeo não couber num arquivo só com bom bitrate, divide em partes iguais em quadros-chave.
# uso: scripts/finalizar-video.sh <render.mp4> <pasta_saida> <NOME>   -> NOME.mp4 ou NOME-parte1.mp4 ...
set -euo pipefail
IN="$1"; OUTDIR="$2"; NOME="$3"
mkdir -p "$OUTDIR"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
read -r PARTES KBPS < <(python3 - "$DUR" <<'PY'
import math,sys
d=float(sys.argv[1]); alvo=88e6      # bytes por arquivo
import os
partes=int(os.environ.get("PARTES") or max(1,math.ceil(d/75)))   # no máx. ~75 s por parte
kbps=min(14000,(partes*alvo*8/d-256_000)/1000)
print(partes,int(kbps))
PY
)
echo "duração ${DUR}s -> ${PARTES} parte(s), vídeo a ${KBPS} kb/s"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
COMUM=(-c:v libx264 -preset slow -profile:v high -level 4.2 -pix_fmt yuv420p -b:v ${KBPS}k -maxrate $((KBPS*14/10))k -bufsize $((KBPS*2))k
       -g 120 -keyint_min 120 -sc_threshold 0 -bf 2 -colorspace bt709 -color_primaries bt709 -color_trc bt709)
ffmpeg -v error -y -i "$IN" "${COMUM[@]}" -pass 1 -passlogfile "$TMP/p" -an -f null /dev/null
ffmpeg -v error -y -i "$IN" "${COMUM[@]}" -pass 2 -passlogfile "$TMP/p" -c:a aac -b:a 256k -movflags +faststart "$TMP/full.mp4"
if [ "$PARTES" -eq 1 ]; then
  mv "$TMP/full.mp4" "$OUTDIR/$NOME.mp4"
else
  # pontos de corte igualmente espaçados, ajustados ao quadro-chave seguinte (GOP de 2 s)
  CORTES=$(python3 - "$DUR" "$PARTES" <<'PY'
import sys
d=float(sys.argv[1]); n=int(sys.argv[2])
print(",".join(f"{round(d*i/n/2)*2:.1f}" for i in range(1,n)))
PY
)
  ffmpeg -v error -y -i "$TMP/full.mp4" -c copy -f segment -segment_times "$CORTES" -reset_timestamps 1 \
    -segment_format_options movflags=+faststart "$TMP/parte%d.mp4"
  i=1; for f in $(ls "$TMP"/parte*.mp4 | sort -V); do mv "$f" "$OUTDIR/$NOME-parte$i.mp4"; i=$((i+1)); done
fi
ls -la "$OUTDIR" | grep "$NOME"
