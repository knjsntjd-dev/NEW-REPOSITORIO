# Loja RODRIGUES (userodrigues.com) — notas do projeto

## Tema oficial
- **Tema oficial: "RODRIGUES RLP TEMA OFICIAL"** — `gid://shopify/OnlineStoreTheme/210427904349`.
  Desde 02/10/2026 está **PUBLICADO (MAIN)** — a API não escreve em tema publicado.
- Para editar: `themeDuplicate` do tema publicado → editar a cópia → a usuária publica no admin.
  Publicado (MAIN) desde ~19/11/2026: "RODRIGUES RLP - calc só na FlexFit" `gid://shopify/OnlineStoreTheme/211623346525`
  (linhagem: cinto + ajustes 210581127517 → sem calc 211610796381 → pedidos reais 211612565853 → selo dourado 211612631389 → calc só FlexFit).
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
- REGRA (08/11/2026, "salva na memória"): produto SEM tamanho não mostra a "Calculadora de tamanho".
  RESOLVIDO e CONFIRMADO pela usuária ("sumiu", Myliss OK) — é automático, não precisa ocultar nada por template.
  Para um produto novo ter calculadora, a opção precisa se chamar "Tamanho"/"Size". Histórico: antes, outra opção
  (ex.: Plugue) contava como tamanho no rlp-produto e o botão aparecia. Corrigido no código (08/11/2026) na cópia "RODRIGUES RLP - sem calc em s/ tamanho" `gid://shopify/OnlineStoreTheme/211610796381`
  (duplicada do MAIN 210581127517 a pedido dela): `calc-tamanho.liquid` só renderiza se o produto tiver opção cujo nome
  contém "tam" ou "size" (some com Plugue, Comprimento, só Cor). Ela PUBLICOU essa cópia em 08/11/2026 → é o MAIN atual.
- CALCULADORA SÓ NA FLEXFIT (08/11/2026, pedido dela): `calc-tamanho.liquid` só renderiza em produto com template
  `modelo-rodrigues` (FlexFit clássica + Zíper) E opção Tamanho/Size. Some no sutiã, calça, shorts, mocassim etc.
  Feito na cópia "RODRIGUES RLP - calc só na FlexFit" `gid://shopify/OnlineStoreTheme/211623346525` (PUBLICADO pela usuária).
- GUIA DE MEDIDAS SÓ COM TABELA (20/11/2026, pedido dela): rlp-produto sem tabela padrão — o botão "Guia de medidas"
  só aparece se o produto tiver `rlp.tabela_medidas` (sem tabela o botão fica no DOM com display:none, porque o
  rodrigues-lp.js faz getElementById('abrirGuia') sem checar). A linha da opção some se ela tiver 1 valor só E não
  houver tabela (ex.: "Envio de: Alemanha", "Conteúdo: 15 ml"). Cópia "RODRIGUES RLP - guia só com tabela"
  `gid://shopify/OnlineStoreTheme/212008173917` (PUBLICADO por ela em 20/11). theme_bash do MCP pediu permissão nova
  (conector precisa ser reconectado) — usei themeDuplicate + themeFilesUpsert.
- SEÇÃO "Guia de tamanhos" (rlp-conteudo, lá embaixo): ainda tem a tabela PADRÃO da cinta. Some só com
  `rlp.esconder_tamanhos`="sim" — colocar "sim" em TODO produto sem tabela própria (Núvia e Leggings feitos 21/11).
- BENEFÍCIOS EDITÁVEIS NO TEMA (23/11/2026, pedido dela): `rlp-beneficios.liquid` ganhou settings (eyebrow, título,
  texto) e blocos "Foto de benefício" (image_picker + título/texto opcionais, até 6). Prioridade: editor > metafields
  (rlp.ben_*, rlp.img_1..3 continuam valendo quando o editor está vazio). Cópia "RODRIGUES RLP - beneficios editaveis"
  `gid://shopify/OnlineStoreTheme/212073644381` (duplicada do MAIN 212008173917; aguardando ela publicar).
  Na mesma cópia: `ds-horizontal-ticker.liquid` virou "Faixa rolante (Ticker)" em pt-BR, com "Cores da faixa" →
  "Personalizada" (padrão p/ novas) + Cor de fundo / Cor do texto / degradê logo no topo; mesmos ids de setting
  (templates antigos continuam iguais) e a cor é aplicada também inline (background/color).
  A cópia "videos legging" (212008567133) ficou obsoleta: ela pôs os vídeos da legging no ultrascupp pelo editor.
- PACKS COM RÓTULO PRÓPRIO (24/11/2026, pedido dela p/ Núvia): metafields `rlp.bundle1_rotulo`/`bundle2_rotulo`/`bundle3_rotulo`
  (nome do card), `rlp.bundle1_sub` (texto do card 1, no lugar de "Para experimentar") e `rlp.bundle_unidade` ("por mês"
  no lugar de "por peça"). Vazio = padrão "1 peça / 2 peças". "Escolha cada peça" some em produto de variante única.
  Núvia: "Uso para 1/2/3 meses", sub1 "1 embalagem · 60 gomas", unidade "mês". Cópia "RODRIGUES RLP - packs em meses"
  `gid://shopify/OnlineStoreTheme/212088783197` (duplicada do MAIN 212073644381; PUBLICADA por ela em 24/11).
- PACK 6 MESES NÚVIA (24/11/2026, pedido dela: oferta 1 / 2 / 6 meses): o 3º pack ganhou campos próprios que têm
  prioridade sobre bundle3_*: `rlp.pack3_qtd` (number_integer), `pack3_off`, `pack3_codigo`, `pack3_rotulo`
  (o tema antigo ignora esses campos, então o site no ar não muda antes de publicar). JS usa `b.nome` do pack.
  Núvia: pack3 = 6 unidades, 25%, cupom NUVIA6 (DiscountCodeNode/2316375753053, mín. 6, só Núvia, não combina).
  NUVIA3 continua ativo (fica sem uso depois de publicar). Cópia "RODRIGUES RLP - pack 6 meses"
  `gid://shopify/OnlineStoreTheme/212088979805` (duplicada do MAIN 212088783197; PUBLICADA por ela em 24/11).
- SEÇÃO "Benefícios em card" (26/11/2026, pedido dela, ref. card verde da Núvia): arquivo `entregas/beneficios-card.liquid`
  (no repo). Seção independente: blocos Benefício (título/texto vazios = RLP beneficio_N; foto opcional à direita),
  cores/borda/raio/espaço/fontes editáveis. Em página RLP o JS move o card para ACIMA do `.rlp-price-row` (ou no lugar
  da lista) e esconde `.rlp-benefits`. Validado na Shopify (upsert no tema não publicado 212088783197, md5 896e0aaa…).
  Ela mesma instala: Editar código → sections → novo arquivo → depois "Adicionar seção" no template do produto.
  INSTALADO por mim (pedido dela, 26/11) na cópia "RODRIGUES RLP - beneficios card" `gid://shopify/OnlineStoreTheme/212165886301`
  (duplicada do MAIN 212088979805) — SÓ no template `nuvia` (seção `beneficios_card` logo após rlp_produto, 3 blocos vazios =
  RLP). PUBLICADO por ela (era MAIN em 27/11). Se aprovar, levar para os próximos produtos.
  Template nuvia (editado por ela) tem coisas FALSAS que avisei: ticker "VOGUE/FORBES/ELLE", "★★★★★ 1.578 avaliações",
  depoimentos com "Author", título "cheiro… lá embaixo" (odor = alegação proibida).
- PROVA SOCIAL REAL (08/11/2026): a FlexFit e a Calça mostravam "4,8/5 · mais de 10.000/5.000 clientes verificados"
  (default antigo do rlp-produto) — FALSO (loja tinha 946 clientes / 532 pedidos, 516 pagos). Trocado por
  "Mais de N pedidos realizados na loja": N = metafield da LOJA `shop.metafields.rlp.pedidos` (number_integer, hoje 500),
  pedidos pagos arredondados p/ baixo à centena. Rotina diária 03:17 Lisboa `trig_013EzGG9UUKxxR3H4TgSBEAU`
  (dispara nesta sessão) atualiza N — só aumenta. `rlp.nota` agora sem default: só nota REAL; "-"/vazio = linha de pedidos.
  `rlp.esconder_pedidos`="sim" esconde a linha num produto. FlexFit e Calça: nota="-".
  "RODRIGUES RLP - pedidos reais" (211612565853) foi PUBLICADO por ela em 08/11. Ela pediu estrelinhas amarelas junto:
  RECUSEI (5 estrelas + nº de pedidos = nota 5 implícita, avaliação falsa). Fiz selo dourado (pílula amarela + selo ✓)
  na cópia "RODRIGUES RLP - selo pedidos dourado" `gid://shopify/OnlineStoreTheme/211612631389` — PUBLICADO e APROVADO
  ("perfeito, incrível"). PADRÃO para todos os produtos: selo dourado com nº real de pedidos; estrelas só com nota real.
  Ainda falso nos templates: título do video-reviews "Mais de 5.000 pessoas confiam em nós" (settings de template).
- PACKS COM ÂNGULO DE PRESENTE (24/11/2026, "salve na memória", ela AMOU no VibraFlex): em produto novo que sirva de
  presente, usar rótulos `bundle1_rotulo` "1 <Nome>", `bundle1_sub` "Para você", `bundle2_rotulo` "2 <Nome> · você + 1 presente",
  `bundle3_rotulo` "3 <Nome> · presentes de <data>", `bundle_unidade` "unidade", bundle_titulo "Leve um para presentear e pague menos".
  AUTOMÁTICO: a rotina diária (trig_013EzGG9UUKxxR3H4TgSBEAU, renomeada "Rotina diária RODRIGUES (pedidos + datas)") troca o
  texto do 3º pack conforme a data (semana Black Friday → Natal até 25/12 → Ano Novo até 06/01 → Dia dos Namorados até 14/02
  → Dia do Pai até 19/03 → Dia da Mãe até o 1º domingo de maio → "para você e a família" → Natal a partir de 01/11).
  Para incluir um produto: pôr `rlp.rotulo_nome` no produto e acrescentar o gid na lista da LOJA
  `shop.metafields.rlp.datas_produtos` (list.product_reference). Hoje: VibraFlex, ShapeFlex, Body de Renda (26/11) e Escova Sonic Kids (28/11). Não usar em suplemento (Núvia = meses).
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
  Calculadora já some sozinha (sem opção Tamanho). Template ainda tem vídeos FlexFit com título "Avaliações verificadas ·
  Mais de 5.000 pessoas" (avisei: enganoso numa escova, ocultar) e coleção "modeladores" — usuária deve ajustar.
- Celimax The Vita-A Retinal Shot (16712124727645, handle `skin-cream`, template `retinol`, 19/11/2026): a usuária
  CONFIRMOU que é Celimax ORIGINAL (avisei: se não for, é falsificação; cosmético na UE precisa de pessoa responsável,
  CPNP e INCI). Fatos (marca/revendedores; site celimax.com bloqueado aqui): retinal 0,1% lipossomado, 3% Matrixyl 3000
  (palmitoyl tripeptide-1 + tetrapeptide-7), pantenol 1%, niacinamida (sem %), A-Shot™ (esponja hidrolisada, formigamento).
  Uso só à noite, noites alternadas nas 2 primeiras semanas, protetor solar de manhã; avisos de gravidez/olhos.
  NÃO usar os números "clínicos" da marca (-28,54% rugas etc.: medidos com o Retinol Shot Serum junto). Opção virou
  "Conteúdo: 15 ml" (era "Color: Eye Cream 15g"). Packs RETINAL2 (10%) / RETINAL3 (15%), só p/ esse produto. Preço €23,40
  (riscado €37,00). Template `retinol` tem vídeos de CABELO com "Avaliações verificadas · 5.000 pessoas" — usuária deve ocultar.
  Benefícios em fotos (subidas por mim via stagedUploads + fileCreate, 1254x1254): img_1 = 78139108295005 (poros/rugas,
  corrigida pela usuária p/ "Após 2 semanas" + fonte "uso combinado com Retinol Shot Serum"), img_2 = 78139108327773
  (microagulhas A-Shot, unidades corrigidas 0,015/0,25 mm e "WD"), img_3 = 78139108360541 (0,1% retinal + 3% Matrixyl).
  Pendente: foto da lista INCI da caixa para conferir a fórmula.
- Complexo Probiótico 20 Cepas (16714276405597, 20/11/2026): marca do fornecedor "Vita Elements Nature's Power",
  fabricante Saflia International GmbH (DE), envio da Alemanha. Fatos (listagem do fornecedor): 20 cepas, 60 mil milhões
  UFC (sem dizer se por cápsula ou por dose), inulina + FOS, 2 cáps/dia com refeição, 120 cáps = 60 dias, HPMC vegetal;
  não para grávidas/lactantes/crianças/adolescentes. Ângulo pedido: cansaço/fadiga/barriga inchada — NA UE probiótico
  NÃO tem alegação de saúde autorizada (Reg. 1924/2006): usei o ângulo só como identificação do público (eyebrow
  "Para quem sente a barriga pesada e o dia cansativo") e NENHUMA promessa de efeito; FAQ 1 diz que não trata.
  Concorrente Kijimea K53 Advance (53 cepas, biotina, 1 cáps/dia) — não copiar números dele. Opção virou "Envio de: Alemanha".
  Packs PROBIO2 (10%) / PROBIO3 (15%). Preço €32,40 (riscado €47,00). Template `probiotico` (criado pela usuária). Pendente: rótulo (UFC por dose, lista de cepas), notificação DGAV.
  Benefícios: ela mandou 3 MP4 (6–8 s, 1280x720); converti com ffmpeg em WebP ANIMADO (seção só aceita imagem):
  img_1 = 78157364887901 (intestino laranja→verde), img_2 = 78157364920669 (microbiota), img_3 = 78157364953437
  (operários "consertando" intestino escuro). Avisei: 1 e 3 sugerem que o produto CURA/repara o intestino = alegação
  de saúde implícita por imagem (Reg. 1924/2006); a 2 é a segura. ben_titulo "20 cepas e prebióticos numa só cápsula".
- Leggings Ultra Sculpt (15619710878045, handle `ultrasculpt`, template `ultrascupp` criado pela usuária, 20/11/2026):
  fatos tirados do template antigo `lagging`: 68% nylon/32% elastano, cós em camadas c/ reforço frontal em diamante,
  frente sem costura + camada dupla, costuras laterais/traseiras, respirável, cuidados de lavagem. S–XL, 4 cores.
  NÃO usei do template antigo: "4,8/5 · 10.000 clientes", garantia 30/60 dias (política real = troca 7 dias),
  depoimentos ("Nataly Trindade" etc.). Packs LEGGING2 (10%) / LEGGING3 (15%). Preço €31,77 (riscado €47,77).
  Vídeos: os 6 do `product_video_gallery` do template antigo foram para a seção `videos_produto` do ultrascupp
  (reativada) e os 2 `video-reviews` de CABELO foram ocultados — na cópia "RODRIGUES RLP - videos legging"
  `gid://shopify/OnlineStoreTheme/212008567133` (aguardando publicar). Sem tabela de medidas (guia some sozinho).
- Núvia gomas (16715050778973, template `nuvia`, 20/11/2026): goma probiótica feminina do AliExpress (China; listagem
  diz "Certification CPNP" — CPNP é de COSMÉTICO, goma é suplemento → precisa notificação DGAV). Fatos: complexo
  probiótico + extrato de abacaxi, sabor abacaxi, 60 gomas, validade 3 anos, local fresco e seco. DOSE confirmada
  pela usuária: 2 gomas/dia, 60 gomas = 30 porções = 30 dias. Referência dela: O Positiv URO
  ("odor & pH", "105.725 reviews", Forbes/People) — NÃO copiei alegações de pH/odor/candidíase/imunidade/urinário
  (proibidas na UE) nem avaliações/mídia. Título (escolhido por ela) "Núvia Gomas Vaginal Probiotic",
  opção "Conteúdo: 60 gomas". Packs NUVIA2/NUVIA3. Preço €32,70 (riscado €47,70). Pendente: rótulo (cepas, UFC, gelatina?).
  Benefícios em fotos (21/11): ela mandou 3. Subi só img_2 = 78164367049053 ("Mais conforto e confiança").
  SEGUREI a 1 ("Sua PPK com cheirinho de Pineapple" = promete mudar o odor íntimo, falso/enganoso) e a 3
  ("Equilíbrio do pH íntimo" = alegação de saúde proibida) — pedi para refazer o texto. Ela insistiu "só para teste": subi as duas só em Conteúdo → Arquivos
  (nuvia-teste-abacaxi 78164413677917, nuvia-teste-ph 78164413710685), depois ela pediu
  para ativar na página ("não estou rodando ainda"): coloquei o produto em RASCUNHO (DRAFT) e liguei img_1/img_3 de teste.
  23/11: ela mandou 3 novas (enzimas do abacaxi "destroem bactérias", "proteção de pH 24 h / cepa exclusiva",
  "equilibram o pH… e o olfato") — avisei que são alegações falsas/proibidas; a pedido dela, SÓ PARA TESTE com o produto
  em RASCUNHO: img_1 = 78215354122589, img_2 = 78215354155357, img_3 = 78215354188125.
  ANTES de reativar o produto, trocar as 3 por versões sem pH/odor/antibacteriano (ela disse que vai trocar).
- VibraFlex (16721418420573, handle `viflex`, template `vibraflex` criado pela usuária, 24/11/2026): massageador vibratório
  em anel, sem fio, modelado na oferta da Merach (NÃO usar marca Merach nem as fotos deles com "collective s").
  Fatos (listagem Merach que ela mandou): 6 níveis, cinta ajustável 69,3 in = 176 cm, 3 texturas (2 zonas lineares
  costas/coxas, 12 grupos de nós braços/panturrilhas/coxas, 1 nó grande pescoço/lombar), visor digital; braços, glúteos,
  cintura/abdômen, coxas, costas, panturrilhas. Bateria (imagem dela, 24/11): 1200 mAh, até 180 min sem fio, carga 3–4 h por USB-C. Sem variantes.
  Preço €37,70 (riscado €49,99). Packs VIBRA2 (10%) / VIBRA3 (15%), ângulo presente de Natal; rótulos "1 VibraFlex /
  2 VibraFlex · você + 1 presente / 3 VibraFlex · presentes de Natal", unidade "unidade". nota "-".
  FAQ diz que NÃO emagrece/celulite e não é aparelho médico. Descrição + SEO preenchidos. Sem img_1..3 (benefícios some).
  Template vibraflex tem vídeos de CABELO com "AVALIAÇÕES VERIFICADAS · Mais de 5.000 pessoas" e coleção "modeladores".
- ShapeFlex (16726294004061, handle `shapeflex-cinta-modeladora-de-alta-compressao-flexivel`, 25/11/2026): "upgrade 3.0"
  da FlexFit segundo a usuária — mais compressão, SEM AÇO (dado dela), mais confortável. Fornecedor (AliExpress, macroupta
  N709/N719/N708): poliéster, controle Firm, fino, waist cincher, fecho de colchetes. NÃO usar do fornecedor: "reduz 3–5
  polegadas", dor lombar, pós-parto. Tabela (cm, do fornecedor): XXS 55–65 / XS 62–70 / S 72–80 / M 78–86 / L 82–90 /
  XL 86–95 / XXL 90–98 / XXXL 95–103 (4XL–6XL existem na tabela, mas o produto não vende). Numeração DIFERENTE da FlexFit.
  Opções: "Cor" = Preto (modelo N709, 30 cm de ALTURA segundo ela — está na página: dif_3, criterio_4, descrição) / Nude (N708); as 8 variantes N719-Black foram APAGADAS a pedido dela; e
  "Tamanho" XXS→XXXL (renomeei "XS（old）"→"XS" e ordenei). Packs SHAPE2 (10%) / SHAPE3 (15%). €37,70 (riscado €65,00).
  nota "-", sem depoimentos. Descrição AliExpress trocada por pt-BR + SEO. Produto estava SEM template RLP (templateSuffix null).
- Body de Renda (16727527555421, handle `body-renda`, template `bodyrenda` criado pela usuária, 26/11/2026): body feminino
  de renda floral, manga longa, gola alta. Tamanhos S–XL (opção "Tamanho" criada 26/11, sem tabela de medidas → guia some). Material NÃO informado. Cores criadas
  por mim com swatch nativo (opção "Cor" ligada a shopify.color-pattern): Branco / Bordô / Marrom / Preto — criei o
  metaobject "Bordô" (2016330678621, #6E1E2B, taxonomia vermelho). Estoque 200 por variante + "continuar vendendo sem estoque" (CONTINUE), pedido dela 26/11. Fotos por cor (ordem dada por ela): Marrom 78269342450013, Preto 78269342482781, Branco 78269342515549, Bordô 78269658628445; cores reordenadas Marrom/Preto/Branco/Bordô (1ª foto = Marrom).
  Preço €27,70, riscado €39,57 (= 30% OFF, pedido dela). Packs BODY2 (10%) / BODY3 (15%), ângulo presente;
  rotulo_nome "Bodies" (bundle1 "1 Body de Renda"), incluído em datas_produtos. nota "-", esconder_tamanhos "sim".
  Banner dela diz "Até 30% OFF no primeiro pedido" — avisei que não existe desconto de primeiro pedido.
- North Flex™ EM INGLÊS (27/11, pedido dela: vai anunciar na EUROPA em inglês; só esse produto): título, descrição, SEO,
  TODOS os rlp.* (inclui packs "2 North Flex + 1 FREE"/"3 North Flex + 2 FREE", unidade "piece", nota_preco "VAT included ·
  Free shipping"), opções "Color"/"Size", títulos dos cupons NFLEX3/NFLEX5 ("North Flex · Buy 2, get 3/5") — tudo em inglês.
  Ela NÃO quis a tabela multi-colunas (cópia 212181582173 descartada). Ficam em pt-BR (código do tema, fixo p/ todos):
  botões Comprar/Adicionar, "Você economiza", "Escolha cada peça", selo "Mais de N pedidos", "Melhor custo-benefício",
  entrega estimada, carrinho lateral, checkout (idioma da loja). Ofereci versão do tema com rlp.idioma="en".
- TEMA BILÍNGUE (27/11, pedido dela: ela vai publicar o idioma `en` (/en) e traduzir pelo Translate & Adapt; idioma
  PRINCIPAL da loja agora é pt-BR; es publicado, en ainda não): cópia "RODRIGUES RLP - botoes em ingles"
  `gid://shopify/OnlineStoreTheme/212181975389` (duplicada do MAIN 212181320029 "bolinhas com foto"). Textos FIXOS do código
  trocam para inglês quando `request.locale.iso_code` = en: rlp-produto (Buy now, Add to cart, Choose each piece, selo
  "Over N orders placed in our store", defaults de nota/garantias/guia), rodrigues-lp.js (LOJA.en → dicionário TX: You save,
  per, Best value, Piece, Save, Adding…; preço "€27.70" em en), rlp-conteudo (Size guide, Verified purchase, Buy now,
  defaults de FAQ/fim) e entrega-estimada (datas no idioma da página). Em pt-BR fica IGUAL ao publicado.
  Textos de settings de seção e metafields traduz no Translate & Adapt. NÃO mexido: rlp-carrinho.js ("Remover"),
  rlp-comparacao (só aria-labels). → PUBLICADO por ela (MAIN em 27/11) e idioma `en` PUBLICADO.
  Traduções EN registradas por mim (translationsRegister, locale en) no template `northflex` do tema 212181975389:
  entrega estimada ("Order today and get it between…" / "Order within the next [tempo] and it ships today"), textos
  do carrinho lateral, "View product", "Complete your kit". Outros templates continuam só em pt (ela traduz no T&A).
  Template northflex dela tem video-reviews "Over 5,000 people trust us" (FALSO) e rlp_beneficios em inglês. LIÇÃO: Liquid não aceita \' em string com aspas simples — upsert por URL falha calado.
- North Flex™ (16729091998045, template `northflex`, 27/11/2026): regata de compressão MASCULINA (fornecedor SONECHOKI,
  poliéster), modelada no concorrente North Alpine "NorthPower" — para anunciar nos EUA (copy agressiva pedida). NÃO usei
  do concorrente: "colete iônico", "acelera perda de peso", "elimina gordurinhas", "2386 avaliações" (falso; FTC também
  pune). Ângulo honesto e agressivo: disfarça barriga/peito na hora, tronco alinhado; FAQ "Ele emagrece? Não".
  Opções "Cor" (AINDA códigos RUN807–RUN812 — perguntei os nomes) e "Tamanho" S→5XL (ordenado). Tabela (dela, 27/11), cm da peça
  "Peito · Comprimento · Ombro": S 80·60·34,5 … 5XL 104·75,5·38 (2XL/3XL viraram XXL/XXXL p/ bater com as variantes). €27,70 (riscado €32,95), custo ~€5,8–7,2/un.
  PACKS: "Compre 2, leve 3" (pack2_qtd 3, pack2_off 33.3334 decimal, chip "1 GRÁTIS", BXGY NFLEX3 2317267304797) e
  "Compre 3, leve 5" (pack3_qtd 5, off 40, chip "2 GRÁTIS", BXGY NFLEX5 2317267337565). bundle2/3_ativo="nao" para o
  tema publicado não mostrar packs errados antes de publicar a cópia nova.
- TEMA "RODRIGUES RLP - packs leve 3 e 5" `gid://shopify/OnlineStoreTheme/212180468061` (27/11, duplicado do MAIN
  212165886301 "beneficios card", que ela PUBLICOU): rlp-produto ganhou `rlp.pack2_*` (qtd/off/codigo/rotulo/chip) igual ao
  pack3_*, `pack2/pack3_chip` (texto do selo no lugar de "X% OFF") e pack aparece se `packN_qtd` estiver preenchido mesmo com
  bundleN_ativo="nao"; JS arredonda % (Math.round). Aguardando ela publicar.
  27/11 (pedido dela, ref. bundle do concorrente): NOVO VISUAL dos packs nessa mesma cópia — cards `.rlp-bx` (CSS inline no
  rlp-produto): fundo #EFEFEF + borda cinza, selecionado branco com borda preta 3px, radio preto, preço vermelho #8E1B1B,
  "Você economiza €X" (no pack 1 = comparação − preço), riscado embaixo, selo preto "MELHOR CUSTO-BENEFÍCIO" no último.
  Sem chips "Frete grátis só hoje"/"% OFF". Vale para TODOS os produtos RLP quando ela publicar. North Flex: rótulos
  "2 North Flex + 1 GRÁTIS" / "3 North Flex + 2 GRÁTIS". Preview: entregas/packs-novo-visual.png.
  → "packs leve 3 e 5" foi PUBLICADO por ela (MAIN em 27/11, aprovou o visual: "gostei, parabéns").
- BOLINHAS COM FOTO (27/11, pedido dela): cópia "RODRIGUES RLP - bolinhas com foto" `gid://shopify/OnlineStoreTheme/212181320029`
  (duplicada do MAIN 212180468061). Swatch de cor mostra a FOTO da variante (120x120 crop) quando `rlp.swatch_foto`="sim"
  ou automaticamente quando a cor não tem swatch/nome conhecido (cinza #CCCCCC) e a variante tem foto; "nao" desliga.
  North Flex: swatch_foto="sim". → PUBLICADO por ela (MAIN em 27/11).
- TABELA COM VÁRIAS COLUNAS + CM/IN (27/11, pedido dela, ref. tabela do fornecedor): cópia "RODRIGUES RLP - tabela colunas cm-in"
  `gid://shopify/OnlineStoreTheme/212181582173` (duplicada do MAIN 212181320029). Snippet novo `snippets/rlp-tabela-cols.liquid`
  (cópia em entregas/), usado no guia (rlp-produto) e na seção de tamanhos (rlp-conteudo) quando o produto tem
  `rlp.tabela_cols` (linhas "S | 60 | 80 | 34,5") + `rlp.tabela_titulos` ("Tamanho | Comprimento do corpo | …");
  `rlp.tabela_unidades`="sim" mostra botões CM/IN (converte ÷2,54, 1 casa). Sem tabela_cols = tabela antiga de 2 colunas.
  O tema publicado ignora tabela_cols. Ela DISSE que NÃO vai usar (27/11) — cópia descartada.
- Shorts modelador flexfit sem costura (16730976518493, template `shortsnovo`, 28/11/2026): modelado no concorrente
  Bella "Tuck-N-Lift". Fatos (fornecedor): elastano, cintura alta, sem costura, modela quadril/levanta glúteos, S–2XL,
  Preto/Nude, margem 1–2 cm. NÃO usei do concorrente: "4,7 · 1.544 avaliações", SuperStay™, corte a laser, "celulite fora
  de vista". 60 variantes bagunçadas → 10 (Cor Nude/Preto × Tamanho S/M/L/XL/2XL; IDs mantidos p/ DSers, pedido dela).
  Packs SHORT2 (10%, 2317606191453) / SHORT3 (15%, 2317606224221), só esse produto. €37,70 (riscado €53,59); custo €25,57
  → MARGEM BAIXA (avisei). Estoque 0 + CONTINUE. Tabela (dela, 28/11) em tabela_medidas "Cintura · Quadril · Comprimento (cm)": S 68–71·94–97·39 … 2XL 89–94·114–119·47 (XXL→2XL); esconder_tamanhos=nao. nota "-", FAQ "Ele emagrece? Não".
  Descrição AliExpress (dizia Denim/leggings) trocada por pt-BR + SEO.
- Calça Pantalona Toque de Linho com Cordão (16731074232669, 28/11/2026, SEM template RLP — templateSuffix null): título
  trocado por mim (era tradução do AliExpress). Fatos (fornecedor): algodão + poliéster (NÃO contém linho — "toque de linho"
  é só aspecto; FAQ "É de linho? Não"), sem elastano, cós com elástico e cordão, bolsos, perna larga até o tornozelo,
  solta. Fornecedor diz cintura "MID" (título dizia "cintura alta" → não usei). Opções "Cor" Cinza/Rosa/Verde-claro/Damasco/
  Azul-marinho × "Tamanho" S→XXXL (30 variantes, fotos já ligadas). Packs PANTALONA2 (10%, 2317610287453) / PANTALONA3 (15%,
  2317610320221). Sem tabela (esconder_tamanhos=sim). PREÇO NÃO MEXIDO: €42,95 com CUSTO €42,99 (prejuízo) e riscado
  inválido (€39,27 < preço; só GRAY/XL €53,40) — avisei, aguardando ela definir.
- Escova de Dentes Elétrica Infantil em U · Sonic Kids (16731081245021, 28/11/2026, SEM template RLP): título trocado por mim.
  Fatos (fornecedor, marca BALASHOV — não usar): cabeça em U de silicone grau alimentar, sônica, 2 modos, IPX7, carga 60 min,
  "até 15 dias" (dado do fabricante), 5 W, 3,2–3,7 V. NÃO usei: "99% de limpeza", "pasteurização 45°", nada de cárie/saúde.
  FAQ: não substitui dentista, supervisão de adulto. Opção única "Color" (6 valores mistos) DIVIDIDA em "Cor" Rosa/Azul/Verde ×
  "Idade" 2 a 6 anos / 6 a 12 anos (IDs das variantes mantidos). Botão de tamanho do rlp-produto mostra só a 1ª PALAVRA
  (split: ' ' | first) → aparecia "2"/"6"; corrigido por dados com ESPAÇO INQUEBRÁVEL (U+00A0) nos valores. Truque vale p/ qualquer opção — CONFIRMADO
  pela usuária ("agora foi"). Enviar como "\u00a0" nas variables JSON (digitado direto vira espaço comum e não funciona). €27,70 (riscado €38,40), custo €10,9–12,8. Packs ESCOVA2 (10%,
  2317615497565) / ESCOVA3 (15%, 2317615530333), ângulo presente/irmãos: rotulo_nome "Escovas", incluída em datas_produtos.
  nota "-", esconder_tamanhos "sim".
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
