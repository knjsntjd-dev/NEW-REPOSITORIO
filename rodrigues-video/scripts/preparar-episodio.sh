#!/usr/bin/env bash
# Trata cor e áudio do vídeo bruto e gera a base do episódio MANTENDO o fps e a
# resolução da gravação (iPhone: 1080p/60 fps). Nada de converter para 30 fps.
# uso: scripts/preparar-episodio.sh <original.mp4> <diaNN>
set -euo pipefail
SRC="$1"; DIA="$2"; DEST="public/$DIA"
mkdir -p "$DEST"
# fps real do vídeo (r_frame_rate pode vir como 60/1 ou 60000/1001).
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of default=nw=1:nk=1 "$SRC" | head -1)
# iPhone grava em taxa variável (ex.: 5404200/90071 ≈ 59,99): arredonda para o fps "de verdade".
FPS=$(python3 -c "
n,d=map(float,'$FPS'.split('/')); f=n/d
for alvo in (24,25,30,50,60,120):
    if abs(f-alvo)<0.6: f=alvo
print(f)")
echo "fps usado: $FPS"
# Exposição adaptativa: mede o brilho médio (YAVG) de amostras de 1 quadro/s. Vídeo normal -> correção leve;
# vídeo escuro (ambiente sem luz) -> curva que levanta SÓ as sombras + denoise maior + neutraliza o verde das
# sombras. Correção global, igual em todos os quadros; o fundo e o rosto não são separados nem alterados.
YAVG=$(ffmpeg -v error -ss 10 -t 60 -i "$SRC" -vf "fps=1,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -an -f null - 2>/dev/null \
  | awk -F= '/YAVG/{s+=$2;n++} END{printf "%.0f", (n? s/n : 100)}')
echo "brilho médio (YAVG): $YAVG"
if [ "${GRADE:-auto}" = "original" ]; then
  # IMAGEM 100% ORIGINAL (pedido do Rodrigues, DIA 41: "já foi gravado com boa iluminação"):
  # nenhuma correção de cor, ruído ou nitidez. Só converte faixa de cor (full -> tv) para o H.264 padrão.
  echo "modo ORIGINAL: sem tratamento de imagem"
  G="scale=in_range=auto:out_range=tv"
elif [ "$YAVG" -lt 65 ]; then
  echo "vídeo ESCURO -> curva de sombras"
  G="hqdn3d=2.5:2.5:7:7,curves=all='0/0 0.08/0.18 0.25/0.40 0.55/0.66 1/1',colorbalance=gs=-0.03:bs=0.01,eq=saturation=1.06,unsharp=5:5:0.3"
else
  # Cor: denoise MUITO leve (preserva detalhe), exposição/contraste sutis, neutraliza o amarelado, nitidez leve.
  G="hqdn3d=0.8:0.8:3:3,eq=contrast=1.06:brightness=0.02:saturation=1.05:gamma=1.05,colorbalance=rs=-0.02:bs=0.015:rh=-0.03:gh=-0.005:bh=0.03,unsharp=5:5:0.3"
fi
# Voz: corta grave, reduz ruído, EQ de presença, compressão leve, -14 LUFS (redes sociais).
A="highpass=f=80,afftdn=nf=-45,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1.5:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9"
# Intermediário de altíssima qualidade (crf 12): a perda real só acontece no render final.
ffmpeg -v error -y -i "$SRC" -vf "fps=$FPS,$G,format=yuv420p" -af "$A" -ar 48000 \
  -c:v libx264 -preset fast -crf ${CRF:-12} -g 60 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -movflags +faststart "$DEST/base.mp4"
ffmpeg -v error -y -i "$SRC" -vn -ac 1 -ar 16000 "$DEST/audio16k.wav"
echo "ok: $DEST/base.mp4"
