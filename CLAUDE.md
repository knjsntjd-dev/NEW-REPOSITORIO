# Loja RODRIGUES (userodrigues.com) — notas do projeto

## Tema oficial
- **Tema oficial: "RODRIGUES RLP TEMA OFICIAL"** — `gid://shopify/OnlineStoreTheme/210427904349`.
  Desde 02/10/2026 está **PUBLICADO (MAIN)** — a API não escreve em tema publicado.
- Para editar: `themeDuplicate` do tema publicado → editar a cópia → a usuária publica no admin.
  Publicado (MAIN) em 03/10/2026: "RODRIGUES RLP OFICIAL - velocidade" `gid://shopify/OnlineStoreTheme/210568413533`.
  Rascunho atual (carrinho lateral + combo + correção de rolagem iOS): "RODRIGUES RLP - carrinho + combo"
  `gid://shopify/OnlineStoreTheme/210575556957`.
- Este repositório (`shopify-theme/`) é uma linhagem antiga ("RODRIGUES Leve v2") e NÃO é a fonte
  do tema oficial. O tema oficial vive na Shopify; leia os arquivos de lá antes de editar.

## Sistema RLP (template `product.modelo-rodrigues`)
- Seções `rlp-produto`, `rlp-comparacao`, `rlp-beneficios`, `rlp-conteudo` + `video-reviews`.
- Todo o conteúdo vem de **metafields do produto, namespace `rlp`** (não de settings de seção),
  para servir qualquer produto com o mesmo layout.
- Benefícios em fotos: `rlp.img_1/2/3` (file_reference). As fotos já trazem o texto embutido —
  não preencher `rlp.legenda_N_*`.
- Cor das bolinhas de cor (swatches) deve vir sempre da Shopify (swatch da opção do produto).

## Carrinho lateral e combo (modelo Rodrigues)
- Seção `rlp-carrinho` ("Carrinho lateral") + `assets/rlp-carrinho.js`: gaveta leve via AJAX
  (`/cart.js`, `/cart/add.js`, `/cart/change.js`), API `window.RLPCart.add(itens, cupom, opts)`.
  Intercepta o clique no ícone do carrinho (`#cart-icon-bubble`, `a[href="/cart"]`) só nas páginas que têm a seção.
  Cupom guardado em localStorage `rlp_cupom` e só vai para `/checkout?discount=` se o carrinho ainda cumprir a regra.
- Botões `[data-add-cart]` (abaixo do CTA e no dock) adicionam sem sair da página; `[data-buy]` adiciona e vai
  ao checkout mantendo o carrinho existente.
- Seção **`compre-junto`** ("Compre junto") + snippet `compre-junto-item`: independente do RLP e de metafields.
  A usuária escolhe os produtos como BLOCOS (até 4) no editor; produto da página entra fixo (opcional).
  Desconto mostrado (%), "vale para" (extras/todos) e código de desconto são settings da seção; o desconto
  real tem que existir em Descontos no admin. Itens levam a propriedade `_combo` = código.
  No template modelo-rodrigues: bloco = Calça Executive Sculpt, 15%, código `COMBO15`
  (BXGY: compre FlexFit, 15% na calça — só vale para esse par).
- `rlp-combo` (metafields `rlp.combo_*`) foi DESATIVADA (arquivo virou stub sem presets); a usuária não quer combo via RLP.
- Carrinho lateral também tem: blocos "Nível de prêmio" (barra com até 3 níveis; sem blocos usa `frete_meta`)
  e "Oferta no carrinho" (`upsell_produtos`, product_list) — sugere produtos que ainda não estão no carrinho.
  O prêmio real (brinde, frete) tem que existir como desconto automático no admin.
- Frete já é grátis em todos os pedidos (não usar a barra para frete). Prêmios atuais (criados 03/10/2026, ativos):
  desconto automático "10% OFF em pedidos a partir de €70" (DiscountAutomaticNode/2305597538653) e
  "15% OFF em pedidos a partir de €100" (…/2305597571421) — classe ORDER, combinam com produto e frete, não entre si.
  COMBO15 passou a combinar com descontos de pedido; PACK2/PACK3 etc. não combinam com nada (vale o maior).
  A barra usa `items_subtotal_price` (antes do desconto do pedido) e o carrinho mostra a linha do desconto.

## Conversão (seções novas, sem app)
- `calc-tamanho` ("Calculadora de tamanho"): blocos por tamanho com faixa da medida 1 (cintura cm) e
  medida 2 (peso kg). O botão entra no `[data-calc-slot]` ao lado do "Guia de medidas" do rlp-produto e clica no
  `#tamanhos [data-size]` correspondente (apelidos com "/", ex.: "3XL / XXXL"). FlexFit: tamanhos por peso no nome
  da variante (S 37.5–50 kg … XXXL 77.5–90 kg) e cintura da tabela `rlp.tabela_medidas`.
- `entrega-estimada` ("Entrega estimada"): datas em dias úteis (fuso Europe/Lisbon, horário de corte, feriados PT
  em MM-DD ou AAAA-MM-DD; feriados móveis precisam ser atualizados por ano). Vai para o `[data-eta-slot]` abaixo
  dos botões de compra.
- `info-legal` ("Informações legais", só no grupo footer): Livro de Reclamações + texto RAL (CNIACC). Obrigatório em PT.
- Template modelo-rodrigues: rlp_produto → entrega_estimada → calc_tamanho → compre_junto → …

- Nome de seção no schema: máx. 25 caracteres — se passar, `themeFilesUpsert` (URL) termina o job sem erro
  e o arquivo simplesmente não é criado. Upsert com body TEXT é síncrono e útil para testar.
- `themeFilesDelete` é bloqueado pela política do MCP (sobrou `sections/zz-teste-a.liquid` vazio no rascunho).

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
- Nunca usar `overflow-x:hidden` em `.rlp`, `body` ou `.vr` (ou outro wrapper que não seja root): no iOS cria um
  container de rolagem aninhado e a página "trava na hero". Usar `overflow-x:clip`. Sem
  `scroll-behavior:smooth` no wrapper.
- Swatch cinza = valor da opção sem swatch nativo + nome traduzido fora do mapa (ex.: tradução
  automática pt-BR "Nu"). Para vincular a opção Cor ao metafield `shopify.color-pattern`, todas as
  variantes precisam de SKU (as Nude estão sem). Metaobject cor "nude": `gid://shopify/Metaobject/1941701099869`.
