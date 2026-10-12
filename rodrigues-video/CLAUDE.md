# Projeto RODRIGUES — editor de vídeos da série

Leia `BRIEFING.md` antes de editar qualquer episódio: é o prompt mestre do cliente.

## Preferências aprovadas pelo Rodrigues (DIA 39 — "gostei")
O estilo do DIA 39 foi aprovado: é o padrão para os próximos episódios. Manter:
- Gancho com o resultado mais forte do episódio (trecho da própria fala) + contador 3D dourado
  + impacto; depois "DIA N · do zero aos 10K".
- Cards de vidro escuro com borda dourada sobre o peito (ZONA_CARD ≈ 1010 px), nunca no rosto;
  legendas palavra a palavra em Inter 900 maiúsculas (ZONA_LEGENDA ≈ 1450 px), branco + dourado
  nos números/palavras-chave; selo "DIA N · DO 0 AOS 10K" fixo no topo.
- Troca de enquadramento a cada frase, zoom fechado nos trechos de ênfase.
- Gráficos só com dados ditos no vídeo (sem inventar), SFX sintetizados (`scripts/gerar-sfx.py`).
- Encerramento: "Segue o perfil" + "Amanhã · DIA N+1".
- Variar a ordem/combinação dos componentes entre episódios para não repetir.

## Música de fundo — SEMPRE
O Rodrigues quer **música de fundo em todo episódio, sem direitos autorais**.
- Gerar trilha original por síntese: `python scripts/gerar-trilha.py public/diaNN/trilha.wav <duração> --seed NN`
  (o seed muda tom/andamento/progressão; usar o número do dia para variar entre episódios).
- Mixar no final: `scripts/mixar-musica.sh <video.mp4> <trilha.wav> <saida.mp4> <atraso_s>`.
  Ducking pela voz, trilha ≈ -31 LUFS sob a voz a -14 LUFS. Ajustar o atraso para a batida
  entrar na transição gancho → "DIA N" (a trilha tem 2 compassos de intro).
- Nunca usar música baixada de terceiros sem licença verificável.

## Fluxo de um episódio
1. O vídeo bruto chega como asset de uma Release do GitHub deste repositório.
   Baixar com `gh api -H "Accept: application/octet-stream" repos/knjsntjd-dev/NEW-REPOSITORIO/releases/assets/<id>`
   (o `gh release download` usa GraphQL, que é bloqueado na sessão).
2. Vídeos do iPhone vêm com rotação 90° nos metadados: 1920×1080 no stream = vertical na tela.
3. `scripts/preparar-episodio.sh <original.mp4> <diaNN>` gera `public/<diaNN>/base.mp4`
   (30 fps, cor e áudio tratados) e o WAV 16 kHz para a transcrição.
4. Transcrição: `scripts/transcrever.py` (Whisper turbo via sherpa-onnx; modelos do
   GitHub `k2-fsa/sherpa-onnx` releases `asr-models`, pois huggingface.co é bloqueado).
5. Montar o episódio em `src/episodios/DiaNN.tsx` reaproveitando `src/components/`.
6. Revisar quadros: `node scripts/stills.mjs DiaNN <frames...>` (gera `out/stills/`).
7. Renderizar: `npx remotion render DiaNN out/DIANN-RODRIGUES.mp4 --crf=18`.
8. Música: gerar trilha + `scripts/mixar-musica.sh` (ver acima).
9. Entrega: o chat aceita até 30 MB (mandar prévia 720p) e a API de upload de Release é
   bloqueada; a versão 1080p (2-pass ≤ 100 MB) vai na branch órfã `entregas`.

Na sessão em nuvem o download do Chrome do Remotion é bloqueado: passe
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
(ou `REMOTION_CHROME=...` para os scripts). Esse Chromium não decodifica H.264, por isso o
vídeo entra com `<OffthreadVideo>` (FFmpeg), não com `<Video>` de `@remotion/media`.

Mídia (`public/dia*/`, `out/`) não vai pro git — fica na Release.
