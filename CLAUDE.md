# Loja RODRIGUES (userodrigues.com) — notas do projeto

## Tema oficial
- **Tema oficial: "RODRIGUES RLP TEMA OFICIAL"** — `gid://shopify/OnlineStoreTheme/210427904349`.
  Desde 02/10/2026 está **PUBLICADO (MAIN)** — a API não escreve em tema publicado.
- Para editar: `themeDuplicate` do tema publicado → editar a cópia → a usuária publica no admin.
  Publicado (MAIN) desde ~04/10/2026: "RODRIGUES RLP - cinto + ajustes" `gid://shopify/OnlineStoreTheme/210581127517`.
  A usuária prefere editar só por RLP (metafields/dados) e NÃO duplicar tema, salvo se pedir.
  SEMPRE conferir `themes{role}` antes de escrever — a usuária publica rascunhos sem avisar.
- Este repositório (`shopify-theme/`) é uma linhagem antiga ("RODRIGUES Leve v2") e NÃO é a fonte
  do tema oficial. O tema oficial vive na Shopify; leia os arquivos de lá antes de editar.

## Preferências da usuária (resumo)
- Editar produtos SÓ por RLP/dados (metafields, descrição, SEO, preços). Não duplicar tema nem mexer em template
  sem ela pedir; cada produto tem o seu template (mudar vídeos/seções de um não pode afetar outro).
- Quando algo só se resolve no código, explicar o passo a passo curto (ela mesma edita no "Editar código").
- Textos em pt-BR, copy forte focada nas qualidades do produto; não inventar dados técnicos, avaliações ou
  prazos. Avisar (sem bloquear) sobre riscos legais, ex.: preço riscado que nunca foi praticado.
- Respostas curtas e diretas, em português.
- REGRA (08/11/2026, "salva na memória"): em TODO produto novo SEM tamanho, a seção "Calculadora de tamanho" (calc_tamanho)
  deve ficar oculta/removida no template dele (a calculadora é da cinta). Atenção: se o produto tem outra opção
  (ex.: Plugue) o rlp-produto a trata como "tamanho" e o botão "Descobrir meu tamanho" APARECE mesmo assim.
  Como não escrevo em tema publicado, avisar a usuária para ocultar no editor (olho) ao criar/preencher o produto.
  RESOLVIDO no código (08/11/2026) na cópia "RODRIGUES RLP - sem calc em s/ tamanho" `gid://shopify/OnlineStoreTheme/211610796381`
  (duplicada do MAIN 210581127517 a pedido dela): `calc-tamanho.liquid` só renderiza se o produto tiver opção cujo nome
  contém "tam" ou "size" (some com Plugue, Comprimento, só Cor). Vale depois que ela PUBLICAR essa cópia.
- Packs padrão: 2 peças = 10%, 3 peças = 15%, com cupom próprio por produto (ex.: SUTIA2/3, MYLISS2/3).
- 08/11/2026: ela pediu para pôr "4,8/5 · 10.000 clientes" em todos os produtos novos. NÃO fazer: nota/nº de
  clientes inventados é avaliação falsa (proibida na UE). Usar só avaliações reais (app de reviews) ou nota de
  outra plataforma COM a fonte indicada (ex.: "4,8/5 no AliExpress"), se ela fornecer o dado.

## Sistema RLP (template `product.modelo-rodrigues`)
- Seções `rlp-produto`, `rlp-comparacao`, `rlp-beneficios`, `rlp-conteudo` + `video-reviews`.
- Todo o conteúdo vem de **metafields do produto, namespace `rlp`** (não de settings de seção),
  para servir qualquer produto com o mesmo layout.
- Benefícios em fotos: `rlp.img_1/2/3` (file_reference). As fotos já trazem o texto embutido —
  não preencher `rlp.legenda_N_*`.
  Desde 31/10/2026 (editado pela usuária no tema publicado) o card usa `imN.value.preview_image.aspect_ratio`,
  então cada foto aparece no próprio formato (antes caía no padrão 4:5 do CSS e cortava fotos quadradas).
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

## Convenções RLP para produtos que não são a FlexFit
- `rlp.nota` = "-" esconde as estrelas (produto sem avaliações) — NÃO inventar nota/depoimentos; `dep_*` vazio
  esconde a seção de depoimentos. `bundle2_ativo`/`bundle3_ativo` = "nao" desliga packs (e o bloco some se os dois
  estiverem desligados). Sem `img_1..3` a seção de benefícios em fotos some.
- Templates RLP: layout reconhece `modelo-rodrigues` e qualquer sufixo com `mdl-rdg` (preload + sem cart-drawer do tema).
- `mdl-rdg-cal-alfaiataria` = template da Calça Executive Sculpt (vídeos FlexFit, combo FlexFit/COMBO15, calculadora).
  `mdl-rdg-acessorios` = acessórios (sem vídeos, sem calculadora; Compre junto com a calça SEM desconto).
- Mocassim plataforma (16612050796893, handle `mocassim-feminino-plataforma`, template `mdl-rdg-acessorios`, criado como
  RASCUNHO de produto em 05/10/2026): textos RLP em pt-BR preenchidos via metafields com o tema publicado — dá para
  preencher produto/metafields mesmo com o tema online; só arquivos de tema são bloqueados. Tamanhos 35–43 seguem a
  numeração do fabricante (veste menor que o habitual): `tabela_medidas` mostra "cm · EU · BR". Packs desligados,
  sem estrelas/depoimentos. Variantes Marrom/Preto apontam para fotos ligadas pelo importador (conferir se a cor bate).
- FlexFit Zíper (16651465818461, handle `flexfit-ziper`, template `modelo-rodrigues`, 19/10/2026): versão de compressão
  mais firme, fecho com zíper, hastes de aço (dado do fornecedor), XS–XXXL por cintura (faixas do fornecedor se
  sobrepõem). Feito só por RLP/dados — a usuária NÃO quer duplicar tema. PACK2, PACK3 e COMBO15 passaram a incluir
  a Zíper (pack misto FlexFit + Zíper também vale). Sem estrelas/depoimentos próprios. ATENÇÃO: a calculadora
  do template modelo-rodrigues usa a tabela da FlexFit clássica (blocos do template, não metafield) e os
  vídeos do template são da FlexFit clássica.
- Depilador 4 em 1 (16654988935517, handle `kit-depilador`, template `kit4em1` criado pela usuária = cópia do
  modelo-rodrigues, 21/10/2026): é BARBEADOR/aparador (lâmina inox, corta rente) — não arranca pela raiz; não prometer
  pelo que demora a crescer. Bateria NiMH 600 mAh, até 60 min, carregar só em 5 V/1 A. Packs desligados,
  esconder_tamanhos=sim, sem estrelas. O template kit4em1 ainda tem vídeos da FlexFit e a calculadora (invisível,
  produto sem tamanho) — a usuária deve ocultar as seções de vídeo no editor.
- Shorts Modelador FlexFit Control (16473989120349, handle `controlflexfit`, template `mod-rdg-lag-flexfit` criado pela
  usuária, 31/10/2026): a usuária chama de "lag modeladora". Sem ficha do fornecedor nem SKU — copy usa só fatos
  (cintura às coxas, sem atrito, XS/S–6XL, preto/nude). Tabela de medidas PENDENTE (linha provisória "em atualização"),
  Preço €36,40 (riscado €47,70). Packs LIGADOS: incluído no PACK2/PACK3 com autorização da usuária (31/10/2026).
  A usuária NÃO quer menção a troca nessa página (garantia_2, fim_selo, faq etc. focam em qualidades do produto).
- Sutiã Tomara que Caia (16689996136797, template `sutia-tomara` criado pela usuária, 08/11/2026): nome original mantido.
  Fatos: sem alças, fecho frontal 3 níveis, estrutura reforçada, bojo removível, sem aro, decote plunge, taça 3/4,
  poliéster, Preto/Nude, S–XL. Não prometer "não escorrega". Tabela em cm (convertida do fornecedor): abaixo do
  busto S 60–84 / M 64–88 / L 68–92 / XL 72–96 cm. SEM peso (usuária não quer peso em tabela de sutiã).
  Packs LIGADOS com cupons próprios SUTIA2 (10%, mín. 2) e SUTIA3 (15%, mín. 3), só para o sutiã. Recusei pôr
  "4,8/5 · 10.000 clientes" (sem avaliações reais = avaliação falsa, proibida na UE); `nota` continua "-".
  Template tem calculadora (tabela da cinta) e vídeos FlexFit — usuária deve ocultar no editor.
- Escova Myliss 38 (16690246418781, template `myliss-38` criado pela usuária, 08/11/2026): escova modeladora/secadora 38 mm,
  íons negativos, 9 ajustes de temperatura, PTC duplo, 100–240 V, liso ou cacheado. Nome original mantido.
  Opção "Plugue" (UE/UK/AU/EUA) — botão mostra a 1ª palavra; guia de plugues no lugar da tabela de tamanhos.
  Copy "Viralizou no Brasil · Agora na Europa" (NÃO usar "exclusivo": não verificável). Os números do Kalodata
  (4,8/5, 23 mil vendas) eram de OUTRO anúncio (GOKOCO) — não usar como dado do produto. Packs desligados, `nota`="-".
  Preço €63,68 (riscado €110,40). Packs LIGADOS: cupons MYLISS2 (10%, mín. 2) e MYLISS3 (15%, mín. 3), só p/ a escova.
  Template tem calculadora (aparece mesmo: opção Plugue conta como tamanho)/vídeos FlexFit e coleção "modeladores" — usuária deve ajustar.
- Cinto Legacy Belt (16610465382749): material é PU (couro sintético) + metal — nunca escrever "couro genuíno".
  Opções já em pt-BR (Cor: Branco/Preto/Amarelo/Azul/Caramelo/Vermelho/Café; Comprimento: 105 cm).

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
- No modelo Rodrigues o layout NÃO renderiza o `cart-drawer` do tema (só o rlp-carrinho) — menos DOM.
- Apps instalados (out/2026) são de bastidor (DSers, Wiio, TeemDrop, Flow, Translate & Adapt, Messaging,
  emails Recovery, Section Store); nenhum app embed ativo em settings_data. Seções novas (compre-junto, calc,
  entrega, info-legal) não fazem requisição extra: CSS/JS inline e imagens lazy.
- PageSpeed API (cota diária esgotada) e os domínios da loja/CDN estão bloqueados neste ambiente → medir pelo
  pagespeed.web.dev com `?preview_theme_id=` do rascunho.

## Lições já aprendidas
- Nunca usar `overflow-x:hidden` em `.rlp`, `body` ou `.vr` (ou outro wrapper que não seja root): no iOS cria um
  container de rolagem aninhado e a página "trava na hero". Usar `overflow-x:clip`. Sem
  `scroll-behavior:smooth` no wrapper.
- Swatch cinza = valor da opção sem swatch nativo + nome traduzido fora do mapa (ex.: tradução
  automática pt-BR "Nu"). Para vincular a opção Cor ao metafield `shopify.color-pattern`, todas as
  variantes precisam de SKU (as Nude estão sem). Metaobject cor "nude": `gid://shopify/Metaobject/1941701099869`.
