# Tema para partilhar (editável)

Cópia do tema "RODRIGUES RLP - cinto + ajustes" preparada para instalar noutra loja Shopify.
No Shopify, o tema chama-se **TEMA PARA PARTILHAR (editável)**.

Arquivos alterados em relação ao tema original (estão nesta pasta):

- `sections/rlp-produto.liquid`, `rlp-beneficios.liquid`, `rlp-comparacao.liquid`, `rlp-conteudo.liquid`:
  todos os textos, imagens, descontos dos pacotes, tabela de medidas, FAQ e depoimentos agora
  são editáveis no editor do tema. Antes vinham só dos metafields do produto (rlp.*). Se um
  produto tiver o metafield preenchido, ele continua a ter prioridade naquele produto.
- `assets/rodrigues-lp.js`: textos dos pacotes e botões vêm da seção; o preço usa a moeda da loja.
- `templates/*.json`: sem vídeos, produtos, coleções e imagens da loja original.

Os modelos com nome de produtos da loja original foram reduzidos a um modelo básico vazio.

## Automação RLP (Claude)

- Os metafields `rlp.*` dos produtos continuam a funcionar e têm prioridade sobre o editor.
- Os 5 modelos RLP estão disponíveis: `modelo-rodrigues`, `mdl-rdg-acessorios`,
  `mdl-rdg-cal-alfaiataria`, `mod-rdg-lag-flexfit`, `kit4em1` (limpos, sem dados da loja original).
- Guia completo dos campos para o Claude: `snippets/rlp-guia-claude.liquid` (vai junto no .zip do tema).
