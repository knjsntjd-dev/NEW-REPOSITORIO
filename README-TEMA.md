# RODRIGUES Leve v2 — tema Shopify

O tema foi reconstruído do zero a partir do "RODRIGUES Leve v1" (Dawn 15.2 + seções DS). O objetivo é deixá-lo o mais leve possível sem perder nada da loja.

## Como instalar

1. Rode `npm run zip` nesta pasta. Isso gera o arquivo `rodrigues-leve-v2.zip`.
2. No painel da Shopify, abra **Loja virtual → Temas → Adicionar tema → Fazer upload do arquivo zip**.
3. Clique em **Pré-visualizar** e confira as páginas. Depois é só **Publicar**.

As configurações, templates e conteúdos da sua loja já vêm dentro do tema (`config/`, `templates/`, `sections/*.json`). Os schemas das seções são idênticos aos do tema anterior, então nada precisa ser reconfigurado.

## O que mudou (performance)

| | Tema v1 | Tema v2 |
|---|---|---|
| CSS que bloqueia a renderização | ~200 KB (rd-core + rd-product + rd-cart + estilos inline) | **1 arquivo, 10,7 KB gzip** |
| JavaScript | jQuery + ~20 arquivos (global.js, rd-core.js…) | **1 arquivo, 6 KB gzip, `defer`** |
| Arquivos em `assets/` | ~300 | 3 |
| Galeria de produto | slick/slider com JS pesado | scroll-snap nativo do navegador |
| Vídeos | — | nenhum MP4 é baixado ao carregar a página, só a capa (versão 480p no clique) |
| Produtos relacionados | renderizados no carregamento | carregam só quando o visitante chega perto deles |
| Script do 17track (rastreio) | carregado sempre | só quando o cliente clica em rastrear |
| Imagens | — | `srcset`/`sizes` em todas; a imagem principal (LCP) usa `fetchpriority="high"` e o resto usa `loading="lazy"` |

Medição com Lighthouse (mobile, com o mesmo throttling do PageSpeed) do tema isolado, sem apps e com imagens redimensionadas como o CDN da Shopify faz:

| Página | Performance | Acessibilidade |
|---|---|---|
| Home | 99 | 100 |
| Produto | 99 | 100 |
| Coleção | 100 | 100 |
| Carrinho | 100 | 100 |

## ⚠️ Apps e a nota final no PageSpeed

A nota da loja publicada soma o tema **e os apps** que a Shopify injeta via `content_for_header` (AVADA SEO, Ali Reviews, pixels, chat etc.). Essa parte o tema não controla. Se a nota ficar abaixo de 99 depois de publicar:

- Abra o PageSpeed → **Reduzir o JavaScript não usado** / **Tempo de execução do JavaScript** e veja quais domínios aparecem ali.
- Desative ou remova os apps que você não usa. O "App embeds" fica em *Personalizar → Configurações do tema → Incorporações de apps*.
- Envie as imagens com no máximo ~2000 px e use o banner principal em JPG/WebP.

## Estrutura do repositório

- `shopify-theme/`: o tema que vai para a Shopify.
- `src/theme.css` e `src/theme.js`: o código-fonte legível. O `npm run build` gera as versões minificadas em `assets/`.
- `tools/original-schemas/`: os schemas originais de cada seção. O build injeta esses schemas nas seções, e é isso que garante a compatibilidade com seus templates.
- `tools/check_compat.py`: confere se cada template/configuração bate com os schemas.

## Seções removidas (não usadas por nenhum template)

`featured-product`, `ds-bundle-deals`, `ds-vertical-ticker`, `quick-order-list`, `bulk-quick-order-list`, `wd-label`, `cart-notification-*`, `pickup-availability`. Nenhuma página da loja usa essas seções. Se precisar de alguma delas, peça que ela é recriada no mesmo padrão leve.
