# Loja RODRIGUES (userodrigues.com) — notas do projeto

## Tema oficial
- **Tema oficial: "RODRIGUES RLP TEMA OFICIAL"** — `gid://shopify/OnlineStoreTheme/210427904349`.
  Toda alteração de tema deve ser feita nele (está em rascunho/unpublished; escrita via
  `themeFilesUpsert` só funciona em temas não publicados).
- Este repositório (`shopify-theme/`) é uma linhagem antiga ("RODRIGUES Leve v2") e NÃO é a fonte
  do tema oficial. O tema oficial vive na Shopify; leia os arquivos de lá antes de editar.

## Sistema RLP (template `product.modelo-rodrigues`)
- Seções `rlp-produto`, `rlp-comparacao`, `rlp-beneficios`, `rlp-conteudo` + `video-reviews`.
- Todo o conteúdo vem de **metafields do produto, namespace `rlp`** (não de settings de seção),
  para servir qualquer produto com o mesmo layout.
- Benefícios em fotos: `rlp.img_1/2/3` (file_reference). As fotos já trazem o texto embutido —
  não preencher `rlp.legenda_N_*`.
- Cor das bolinhas de cor (swatches) deve vir sempre da Shopify (swatch da opção do produto).

## Shopify / API
- Nomes literais de blocos em schema: máx. 25 caracteres (senão o import zip descarta o arquivo).
- Settings `richtext` exigem HTML com nó de topo `<p>`/`<ul>`/`<h*>`.

## Lições já aprendidas
- Nunca usar `overflow-x:hidden` em `.rlp` (ou outro wrapper que não seja root): no iOS cria um
  container de rolagem aninhado e a página "trava na hero". Usar `overflow-x:clip`. Sem
  `scroll-behavior:smooth` no wrapper.
- Swatch cinza = valor da opção sem swatch nativo + nome traduzido fora do mapa (ex.: tradução
  automática pt-BR "Nu"). Para vincular a opção Cor ao metafield `shopify.color-pattern`, todas as
  variantes precisam de SKU (as Nude estão sem). Metaobject cor "nude": `gid://shopify/Metaobject/1941701099869`.
