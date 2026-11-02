#!/usr/bin/env bash
# Cadeia de voz estilo podcast/rádio (microfone dinâmico tipo Shure Beta/SM7B), a partir do áudio do iPhone.
# 1 mono -> 2 high-pass -> 3 redução de ruído (RNNoise) -> 4 EQ (corpo, sem "caixa", presença, brilho)
# -> 5 de-esser -> 6 compressão em 2 estágios -> 7 normaliza -14 LUFS -> estéreo duplo-mono.
# uso: scripts/voz-podcast.sh <entrada (vídeo ou áudio)> <saida.wav> [modelo_ruido=cb|bd]
set -euo pipefail
IN="$1"; OUT="$2"; M="${3:-cb}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
MODELO="$HERE/models/ruido-voz-cb.rnnn"; [ "$M" = bd ] && MODELO="$HERE/models/ruido-geral-bd.rnnn"
# ATENÇÃO: no acompressor do ffmpeg o "makeup" é fator LINEAR (4 = +12 dB!). Usar 1.5 (~+3,5 dB). Um makeup alto
# levanta o ruído das pausas; o RNNoise sozinho já leva a relação voz/ruído a ~45 dB.
NR="${NR:-0.9}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
# 1ª parte: limpeza + tom + compressão (sem normalizar)
ffmpeg -v error -y -i "$IN" -vn -af "
  pan=mono|c0=0.5*c0+0.5*c1,
  highpass=f=75:poles=2,
  arnndn=m=${MODELO}:mix=${NR},
  afftdn=nr=10:nf=-48:tn=1,
  lowshelf=f=140:g=2.5,
  equalizer=f=280:t=q:w=1.0:g=-2.5,
  equalizer=f=520:t=q:w=1.2:g=-1.2,
  equalizer=f=3200:t=q:w=0.9:g=3.5,
  equalizer=f=5500:t=q:w=1.0:g=2.5,
  highshelf=f=9000:g=3,
  deesser=i=0.3:f=0.5,
  acompressor=threshold=-24dB:ratio=3:attack=6:release=140:makeup=1.5:knee=4,
  acompressor=threshold=-14dB:ratio=2:attack=30:release=300:makeup=1,
  aformat=sample_rates=48000,pan=stereo|c0=c0|c1=c0" -ar 48000 "$TMP/chain.wav"
# 2ª parte: GANHO FIXO até -14 LUFS (o loudnorm dinâmico levanta o ruído das pausas) + limitador de picos
LUFS=$(ffmpeg -i "$TMP/chain.wav" -af ebur128 -f null - 2>&1 | grep -A12 Summary | awk '/^ +I:/{print $2}')
GAIN=$(python3 -c "print(round(-14-float('$LUFS'),2))")
ffmpeg -v error -y -i "$TMP/chain.wav" -af "volume=${GAIN}dB,alimiter=limit=0.89:level=disabled" -ar 48000 "$OUT"
# 3ª parte: COMPENSA A LATÊNCIA dos filtros (RNNoise/FFT/de-esser atrasam a voz ~40 ms = 2+ quadros a 60 fps,
# o que quebra o lip-sync). Mede o atraso por correlação dos envelopes e corta o excesso do início.
ffmpeg -v error -y -i "$IN" -vn -ac 1 -ar 16000 "$TMP/ref.wav"
ffmpeg -v error -y -i "$OUT" -vn -ac 1 -ar 16000 "$TMP/proc.wav"
LAG=$(python3 - "$TMP/ref.wav" "$TMP/proc.wav" <<'PY'
import subprocess,sys,numpy as np
w=32  # 2 ms a 16 kHz
def env(p):
    x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-f","f32le","-"],capture_output=True).stdout,dtype=np.float32)
    n=len(x)//w; return np.log10(np.sqrt((x[:n*w].reshape(n,w)**2).mean(1))+1e-4)
a,b=env(sys.argv[1]),env(sys.argv[2]); n=min(len(a),len(b)); a=a[:n]-a[:n].mean(); b=b[:n]-b[:n].mean()
c=lambda k:(a[max(0,k):n+min(0,k)]*b[max(0,-k):n-max(0,k)]).mean()
best=max(range(-60,61),key=c)  # k<0 => processada atrasada
print(max(0,-best)*0.002)
PY
)
echo "latência medida: ${LAG}s -> compensando"
ffmpeg -v error -y -i "$OUT" -af "atrim=start=${LAG},asetpts=PTS-STARTPTS,apad=pad_dur=${LAG}" -ar 48000 "$TMP/alinhada.wav"
mv "$TMP/alinhada.wav" "$OUT"
echo "voz: ${LUFS} LUFS -> ganho ${GAIN} dB"
