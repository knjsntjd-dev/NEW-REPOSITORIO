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

## Qualidade de imagem — REGRA INEGOCIÁVEL (pedido do Rodrigues)
O iPhone grava **1080p a 60 fps**. Em 12/10 o DIA 39 saiu em 30 fps e comprimido: o Rodrigues reclamou de perda
de qualidade. A partir do DIA 40, SEMPRE editar como profissional:
- **Manter o fps original (60)**. Nunca usar `fps=30`. `scripts/preparar-episodio.sh` detecta o fps; a composição é
  registrada com `fps={60}` em `src/Root.tsx`.
- Animações são desenhadas em "tempo de 30 fps" e convertidas por `useFrame30()` (`src/tempo.ts`): mesma velocidade
  aprovada, mas com o dobro de quadros (mais suaves). Nunca usar `useCurrentFrame()` direto nos componentes de motion;
  atrasos em frames passados aos gráficos vêm de `entre(a, b)` (30 fps-equivalentes).
- Intermediário `base.mp4` em crf 12 (~1 GB / 2,5 min; só local). Denoise bem leve para não borrar.
- Render (master): `npx remotion render DiaNN out/DIANN-master.mp4 --crf=14 --jpeg-quality=100 --x264-preset=medium
  --audio-codec=aac --audio-bitrate=256k --concurrency=4` (≈ 13 s de render por 1 s de vídeo a 60 fps → ~30 min p/ 2,5 min).
- Encode final: `scripts/finalizar-video.sh out/DIANN-master.mp4 <pasta> DIANN-RODRIGUES`: 2 passadas, H.264 High, BT.709,
  60 fps, GOP 2 s, áudio AAC 256k, no MAIOR bitrate que cabe (~88 MB/arquivo). Se passar de ~75 s, divide em
  `-parte1.mp4`, `-parte2.mp4`… (corte em quadro-chave; emendar no CapCut). Vídeo de 146 s → 2 partes a ~9,6 Mbps.
- Entrega: GitHub bloqueia arquivo > 100 MB (push), upload de Release pela API e Git LFS neste ambiente; o chat aceita só
  30 MB (mandar prévia 720p). Por isso as partes vão na branch órfã `entregas`.

## Imagem: NÃO mexer no fundo (decisão do Rodrigues, 13/10)
Ele pediu a qualidade de imagem de criadoras como a Bruna (referência: fundo claro, pele iluminada). Testei separar a
pessoa do fundo (Robust Video Matting) + desfocar/clarear o ambiente: funcionou, mas ele **não quer**: "deixe o fundo
original". Ele vai melhorar a própria iluminação. Portanto:
- **Nunca separar, desfocar, trocar ou clarear o fundo.** Só correção global leve (exposição, balanço de branco,
  contraste, nitidez, ruído) igual em todos os quadros, sem alterar rosto/corpo.
- (O matting custava ~3 s de CPU por 1 s de vídeo — inviável mesmo se pedirem no futuro.)
- Se a imagem vier escura/amarelada, dizer ao Rodrigues no fim do episódio, em 1–2 linhas, o que ajuda na gravação
  (luz de frente e suave, de preferência de janela/ring light; evitar lâmpada amarela atrás; desligar LED vermelha).

## Entrega — SEM PRÉVIA (pedido do Rodrigues, 13/10)
"Para ser mais rápido não precisa gerar prévia aqui; salve o vídeo direto no GitHub, preciso o quanto antes."
Ao finalizar: **não gerar nem enviar prévia 720p no chat**. Publicar as partes 1080p60 na branch `entregas` e dar os
links `github.com/knjsntjd-dev/NEW-REPOSITORIO/blob/entregas/<arquivo>` ("View raw" no iPhone). Resposta curta.

## Áudio — qualidade de PODCAST (Shure Beta / SM7B), padrão desde o DIA 40
O áudio do iPhone vinha com ruído de ambiente e sem presença (agudos 30–50 dB abaixo dos médios). Cadeia oficial:
`scripts/voz-podcast.sh <video> <voz.wav> [cb|bd]` (modelos RNNoise em `models/`, de GregorR/rnnoise-models):
mono → high-pass 75 Hz → RNNoise (mix 0,9) → afftdn leve → EQ (grave +2,5 dB, lama 280 Hz −2,5, caixa 520 Hz −1,2,
presença 3,2 kHz +3,5, 5,5 kHz +2,5, brilho 9 kHz +3) → de-esser → 2 compressores → ganho FIXO para −14 LUFS →
limitador → **compensa a latência dos filtros (~40 ms) por correlação** (lip-sync).
Armadilhas medidas: (1) `acompressor makeup` é fator LINEAR (4 = +12 dB!) e levanta o ruído das pausas; (2) `loudnorm`
dinâmico também levanta pausas → usar ganho fixo; (3) `agate`/`compand` não funcionaram bem aqui — o RNNoise já
limpa; (4) `alimiter` precisa de `level=disabled`; (5) medir lip-sync após filtros FFT.
Trocar SÓ o áudio sem re-renderizar o vídeo: `node --experimental-strip-types scripts/exportar-timeline.mjs diaNN >
timeline.json` + `python scripts/montar-audio.py voz.wav timeline.json public/sfx out.wav` (remonta cortes + SFX no ffmpeg;
o render de áudio do Remotion não dá progresso e pode demorar como um render completo) → `mixar-musica-externa.sh`
→ regravar o áudio de cada parte com `-c:v copy` (parte1 com `-itsoffset 0.033`, como o vídeo dela).

## DIA 41 — pedidos do Rodrigues (valem daqui pra frente)
- **Imagem 100% original quando a gravação já está bem iluminada**: `GRADE=original CRF=10 scripts/preparar-episodio.sh`
  (só fixa 60 fps e converte faixa de cor; nada de cor/ruído/nitidez). Zooms contidos (`estilo.fator=0.5`, máx. ~1,1×)
  e suaves (`suave: true`) para não perder nitidez. Só o ÁUDIO é tratado (`voz-podcast.sh`).
- **Motion variado e atual**: pacote `src/components/motion-v2.tsx` — `NumeroRolante` (odômetro; larguras reais da
  Anton: dígitos 0,494 em, "1" 0,331 em), `BordaViva` (luz girando na borda), `CardRolante`, `IlhaDinamica`
  (Dynamic Island), `TituloMascara`, `Marcador` (marca-texto), `BentoResultados` (grade 2×2; esconder a legenda
  enquanto ela está na tela), `MetaAnel`, `Chips`, `BotaoSeguir` (cursor clica e vira "Seguindo"). Legenda
  `estilo="pilula"` (pílula dourada na palavra falada) e câmera com `impactos` (tremor curto nos números).
  Alternar entre o pacote v1 (DIA 39/40) e o v2 e recombinar para não repetir.
- **Música do Rodrigues mais baixa e "respirando" com a voz**: `DUCK_RATIO=4 DUCK_TH=0.04 scripts/mixar-musica-externa.sh
  <video> <musica> <saida> -22`.
- **Encode final qualidade-primeiro**: `finalizar-video.sh` mira ~16 Mbps (teto 18) e divide em partes ≤ 88 MB.

## Exposição adaptativa (DIA 40)
O DIA 40 veio MUITO escuro (YAVG ≈ 24–38 contra ≈ 100 do DIA 39: parede e blusa pretas, só o rosto iluminado).
`scripts/preparar-episodio.sh` mede o brilho médio e, abaixo de 65, usa curva que levanta só as sombras + denoise maior +
neutraliza o verde das sombras. Continua sendo correção GLOBAL: nada de separar fundo nem tocar no rosto.

## DIA 40 — pendências de confirmação com o Rodrigues
- "3.682 visitas" (fala) não bate com 3.478 + 184 = 3.662: foi exibido o número FALADO.
- ROI de hoje = 2,92 (Whisper entendeu "2 ponto 90 e 2"); ROI de ontem 1,34 veio do DIA 39.
- Mixagem: `mixar-musica-externa.sh` agora com `alimiter ... level=disabled` (o auto-nível subia +1,5 dB).

## Música de fundo — SEMPRE
O Rodrigues quer **música de fundo em todo episódio, sem direitos autorais**.
- Gerar trilha original por síntese: `python scripts/gerar-trilha.py public/diaNN/trilha.wav <duração> --seed NN`
  (o seed muda tom/andamento/progressão; usar o número do dia para variar entre episódios).
- Mixar no final: `scripts/mixar-musica.sh <video.mp4> <trilha.wav> <saida.mp4> <atraso_s>`.
  Ducking pela voz, trilha ≈ -31 LUFS sob a voz a -14 LUFS. Ajustar o atraso para a batida
  entrar na transição gancho → "DIA N" (a trilha tem 2 compassos de intro).
- Nunca usar música baixada de terceiros sem licença verificável.
- Os assets do Rodrigues vêm na Release do episódio (`diaNN-original`): vídeo bruto (`IMG_xxxx.mov`), música, SFX.
  O iPhone grava em taxa variável (≈ 59,99 fps): o script arredonda para 60.
- **SFX de venda Shopify** enviado pelo Rodrigues (`public/sfx/venda-shopify.wav`, recortado de "Shopify Sales Sound",
  que repete 5x): usar **UM único toque** por grupo de notificações (disparar uma vez quando a primeira notificação
  entra), nunca um por notificação nem em loop. Substitui o `venda.wav` sintético nas notificações.
- **Música enviada pelo Rodrigues** (ex.: DIA 40: "Epic No Copyright Trailer Music" de ArcticFoxMusic, 1min25s, anexada na
  Release `dia40-original`): ele confirmou que não tem direitos autorais e quer usá-la de fundo. Usar
  `scripts/mixar-musica-externa.sh <video> <musica.mp3> <saida.mp4>`: estende a música até a duração do vídeo
  (`scripts/estender-musica.sh`, repetição com crossfade), mantém **sempre abaixo da voz** (≈ -21 LUFS contra a voz a
  -14 LUFS, com ducking extra durante a fala) e fade in/out.
- **Entregar também a trilha separada em MP3** (`ffmpeg ... -af loudnorm=I=-14 -c:a libmp3lame -b:a 192k`):
  o Rodrigues coloca a música pelo CapCut. No DIA 39 a música mixada (-31 LUFS, grave forte)
  ficou inaudível no celular — se mixar aqui, deixar mais alta e com mais médios.

## Fluxo de um episódio
1. O vídeo bruto chega como asset de uma Release do GitHub deste repositório.
   Baixar com `gh api -H "Accept: application/octet-stream" repos/knjsntjd-dev/NEW-REPOSITORIO/releases/assets/<id>`
   (o `gh release download` usa GraphQL, que é bloqueado na sessão).
2. Vídeos do iPhone vêm com rotação 90° nos metadados: 1920×1080 no stream = vertical na tela.
3. `scripts/preparar-episodio.sh <original.mp4> <diaNN>` gera `public/<diaNN>/base.mp4`
   (fps original, cor e áudio tratados) e o WAV 16 kHz para a transcrição.
4. Transcrição: `scripts/transcrever.py` (Whisper turbo via sherpa-onnx; modelos do
   GitHub `k2-fsa/sherpa-onnx` releases `asr-models`, pois huggingface.co é bloqueado).
5. Montar o episódio em `src/episodios/DiaNN.tsx` reaproveitando `src/components/`.
6. Revisar quadros: `node scripts/stills.mjs DiaNN <frames...>` (gera `out/stills/`).
7. Renderizar master + finalizar (ver "Qualidade de imagem").
8. Música: gerar trilha + `scripts/mixar-musica.sh` (ver acima).
9. Entrega: prévia 720p no chat (≤ 30 MB) + partes 1080p60 na branch órfã `entregas`.

Na sessão em nuvem o download do Chrome do Remotion é bloqueado: passe
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
(ou `REMOTION_CHROME=...` para os scripts). Esse Chromium não decodifica H.264, por isso o
vídeo entra com `<OffthreadVideo>` (FFmpeg), não com `<Video>` de `@remotion/media`.

Mídia (`public/dia*/`, `out/`) não vai pro git — fica na Release.
