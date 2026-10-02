# Loja RODRIGUES (userodrigues.com) — notas do projeto

## Tema oficial
- **Tema oficial: "RODRIGUES RLP TEMA OFICIAL"** — `gid://shopify/OnlineStoreTheme/210427904349`.
  Desde 02/10/2026 está **PUBLICADO (MAIN)** — a API não escreve em tema publicado.
- Para editar: `themeDuplicate` do tema publicado → editar a cópia → a usuária publica no admin.
  Cópia atual com as otimizações de velocidade: "RODRIGUES RLP OFICIAL - velocidade"
  `gid://shopify/OnlineStoreTheme/210568413533`.
- Este repositório (`shopify-theme/`) é uma linhagem antiga ("RODRIGUES Leve v2") e NÃO é a fonte
  do tema oficial. O tema oficial vive na Shopify; leia os arquivos de lá antes de editar.

## Sistema RLP (template `product.modelo-rodrigues`)
- Seções `rlp-produto`, `rlp-comparacao`, `rlp-beneficios`, `rlp-conteudo` + `video-reviews`.
- Todo o conteúdo vem de **metafields do produto, namespace `rlp`** (não de settings de seção),
  para servir qualquer produto com o mesmo layout.
- Benefícios em fotos: `rlp.img_1/2/3` (file_reference). As fotos já trazem o texto embutido —
  não preencher `rlp.legenda_N_*`.
- Cor das bolinhas de cor (swatches) deve vir sempre da Shopify (swatch da opção do produto).

## Idioma
- Idioma do site: **português do Brasil (pt-BR)**. Todo texto novo (tema, metafields, seções) deve ser
  escrito em pt-BR — não pt-PT ("pedido", não "encomenda"; "Por que", não "Porque"; "você").
- Loja (admin) ainda tem `en` como idioma principal; o domínio userodrigues.com já abre em pt-BR
  (defaultLocale do web presence). Trocar o idioma principal só é possível no admin
  (Configurações → Idiomas), não pela API.
- Cadastro de produtos/coleções/menus já está em pt-BR no texto ORIGINAL (não só em tradução). Backup do
  conteúdo original em inglês: `backups/produtos-original-antes-pt-BR.json` (para recriar a tradução `en`
  depois que o idioma principal for trocado no admin).
- Cores nativas (metaobject `shopify--color-pattern`) já renomeadas para pt-BR (Preto, Branco, Rosa…).
  Exceção: opção "Color"/"Black" do FlexFit (16405367652701) continua em inglês porque a Shopify bloqueia
  mudanças nessa opção enquanto houver variante sem SKU.
- Prazos do modelo RLP: entrega 5 a 7 dias úteis; troca de tamanho em 7 dias (não 30).
- Moeda EUR / loja em Portugal: manter fatos como "IVA incluído" e "MB Way".

## Shopify / API
- Upload de arquivos grandes de tema: `stagedUploadsCreate` (FILE, text/plain) → POST via python
  → `themeFilesUpsert` com `body: {type: URL, value: resourceUrl}` (job assíncrono; conferir md5).
  Peça >50 alvos de uma vez para a resposta ser salva em arquivo e evitar copiar assinaturas.
- Nomes literais de blocos em schema: máx. 25 caracteres (senão o import zip descarta o arquivo).
- Settings `richtext` exigem HTML com nó de topo `<p>`/`<ul>`/`<h*>`.

## Velocidade (PageSpeed)
- Modelo Rodrigues: `layout/theme.liquid` faz preload no <head> da imagem principal (srcset 400/600/800),
  da fonte Archivo e do `rodrigues-lp.css`. Só a imagem principal do produto tem fetchpriority=high
  (logo e capas de vídeo não). Galeria troca a foto removendo o `srcset` (rodrigues-lp.js).
- Não reinstalar apps que injetam script no site sem necessidade (Avada SEO foi removido do layout).

## Lições já aprendidas
- Nunca usar `overflow-x:hidden` em `.rlp` (ou outro wrapper que não seja root): no iOS cria um
  container de rolagem aninhado e a página "trava na hero". Usar `overflow-x:clip`. Sem
  `scroll-behavior:smooth` no wrapper.
- Swatch cinza = valor da opção sem swatch nativo + nome traduzido fora do mapa (ex.: tradução
  automática pt-BR "Nu"). Para vincular a opção Cor ao metafield `shopify.color-pattern`, todas as
  variantes precisam de SKU (as Nude estão sem). Metaobject cor "nude": `gid://shopify/Metaobject/1941701099869`.
