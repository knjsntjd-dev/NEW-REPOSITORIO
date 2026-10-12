# Projeto RODRIGUES — editor de vídeos da série

Leia `BRIEFING.md` antes de editar qualquer episódio: é o prompt mestre do cliente.

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

Na sessão em nuvem o download do Chrome do Remotion é bloqueado: passe
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
(ou `REMOTION_CHROME=...` para os scripts). Esse Chromium não decodifica H.264, por isso o
vídeo entra com `<OffthreadVideo>` (FFmpeg), não com `<Video>` de `@remotion/media`.

Mídia (`public/dia*/`, `out/`) não vai pro git — fica na Release.
