"""Gera template/produto.html a partir de corset/flexfit.html, trocando tudo
o que é do FlexFit por marcadores [ASSIM]. Correr de novo sempre que a página
do corset ganhar melhorias de layout que também devam ir para o modelo."""
import pathlib, re

raiz = pathlib.Path(__file__).resolve().parent.parent
s = (raiz / 'corset' / 'flexfit.html').read_text(encoding='utf-8')

def troca(velho, novo, n=1):
    global s
    c = s.count(velho)
    assert c == n, f'esperava {n}x, achei {c}x: {velho[:70]!r}'
    s = s.replace(velho, novo)

def troca_re(padrao, novo, minimo=1):
    global s
    s, c = re.subn(padrao, novo, s, flags=re.S)
    assert c >= minimo, f'regex sem resultado: {padrao[:70]!r}'

# ── Cabeçalho, título, metas ──────────────────────────────────
troca_re(r'<meta name="description" content="[^"]*">',
         '<meta name="description" content="[DESCRIÇÃO CURTA DO PRODUTO — até 155 caracteres]">')
troca('<meta property="og:title" content="Corset Modelador FlexFit">',
      '<meta property="og:title" content="[NOME DO PRODUTO]">')
troca_re(r'<meta property="og:description" content="[^"]*">',
         '<meta property="og:description" content="[3 BENEFÍCIOS EM UMA FRASE]">')
troca('<title>Corset Modelador FlexFit</title>', '<title>[NOME DO PRODUTO]</title>')
troca_re(r'<!--\n  ═+\n  RODRIGUES · Corset Modelador FlexFit.*?-->',
         '''<!--
  ═══════════════════════════════════════════════════════════
  RODRIGUES · MODELO DE PÁGINA DE PRODUTO
  Tudo o que aparece entre [colchetes] na página é para preencher.
  Guia completo: COMO-USAR.txt
  ═══════════════════════════════════════════════════════════
-->''')

# ── Bloco LOJA ────────────────────────────────────────────────
troca_re(r"  /\* IDs numéricos das variantes.*?\n  \},\n",
'''  /* Produto (usado no rastreio do Meta) */
  nome: '[NOME DO PRODUTO]',
  categoria: '[Categoria > Subcategoria]',

  /* IDs numéricos das variantes (Produtos → produto → variante → número no fim do URL).
     Formato: 'data-cor|data-size'. Os nomes à esquerda têm de ser iguais aos
     data-cor dos botões de cor e aos data-size dos botões de tamanho. */
  variantes: {
    'cor1|S': 'ID_VARIANTE', 'cor1|M': 'ID_VARIANTE', 'cor1|L': 'ID_VARIANTE',
    'cor1|XL': 'ID_VARIANTE', 'cor1|XXL': 'ID_VARIANTE', 'cor1|3XL': 'ID_VARIANTE',
    'cor2|S': 'ID_VARIANTE', 'cor2|M': 'ID_VARIANTE', 'cor2|L': 'ID_VARIANTE',
    'cor2|XL': 'ID_VARIANTE', 'cor2|XXL': 'ID_VARIANTE', 'cor2|3XL': 'ID_VARIANTE'
  },
''')
troca("  precoBase: 27.68,\n  precoComparacao: 39.40,",
      "  precoBase: 29.90,          /* [PREÇO] — exemplo */\n  precoComparacao: 49.90,    /* [PREÇO RISCADO] — exemplo */")
troca("{ q: 2, off: 10, codigo: 'PACK2' }", "{ q: 2, off: 10, codigo: '' }")
troca("{ q: 3, off: 15, codigo: 'PACK3' }", "{ q: 3, off: 15, codigo: '' }")

# ── JS: nada de FlexFit fixo no código ───────────────────────
troca("  var estado = { cor:'preto', corNome:'Preto', size:'M', bundle:0, pecas:[] };",
"""  /* Cor e tamanho iniciais = os botões marcados com aria-pressed="true" */
  var corIni  = document.querySelector('#cores [aria-pressed="true"]') || document.querySelector('#cores [data-cor]');
  var sizeIni = document.querySelector('#tamanhos [aria-pressed="true"]') || document.querySelector('#tamanhos [data-size]');
  var estado = { cor: corIni.getAttribute('data-cor'), corNome: corIni.getAttribute('data-nome'),
                 size: sizeIni.getAttribute('data-size'), bundle:0, pecas:[] };""")
troca("      content_name: 'Corset Modelador FlexFit',\n      content_category: 'Vestuario > Shapewear',",
      "      content_name: LOJA.nome,\n      content_category: LOJA.categoria,")
troca("|| 'flexfit' ]", "|| LOJA.nome ]")

# ── Cores das bolinhas: definidas no próprio botão ───────────
troca(".sw i{display:block;width:100%;height:100%;border-radius:50%}",
      ".sw i{display:block;width:100%;height:100%;border-radius:50%;background:var(--sw,#CCC)}")
troca_re(r"\.sw-preto i\{[^}]*\}\n\.sw-nude i\{[^}]*\}\n", "")
troca('<button class="sw sw-preto" data-cor="preto" data-nome="Preto" data-img="assets/img/flexfit-1.jpg" aria-pressed="true" aria-label="Preto">',
      '<button class="sw" style="--sw:#1A1A1A" data-cor="cor1" data-nome="[Cor 1]" data-img="assets/img/produto-1.jpg" aria-pressed="true" aria-label="[Cor 1]">')
troca('<button class="sw sw-nude" data-cor="nude" data-nome="Nude" data-img="assets/img/flexfit-nude.jpg" aria-pressed="false" aria-label="Nude">',
      '<button class="sw" style="--sw:#E4CFB4" data-cor="cor2" data-nome="[Cor 2]" data-img="assets/img/produto-4.jpg" aria-pressed="false" aria-label="[Cor 2]">')
troca('<span class="val" id="corVal">Preto</span>', '<span class="val" id="corVal">[Cor 1]</span>')

# ── Imagens ──────────────────────────────────────────────────
for velho, novo in [('promo-black-outubro.webp', 'produto-capa.webp'),
                    ('flexfit-nude.jpg', 'produto-4.jpg'),
                    ('flexfit-1.jpg', 'produto-1.jpg'), ('flexfit-2.jpg', 'produto-2.jpg'),
                    ('flexfit-3.jpg', 'produto-3.jpg')]:
    s = s.replace(velho, novo)
troca_re(r'(id="mainImg" src="[^"]*" )alt="[^"]*"', r'\1alt="[Descrição da foto principal]"')
troca('alt="Promoção Black Outubro"', 'alt="[Capa]"')
troca('alt="Vista frontal"', 'alt="[Foto 1]"')
troca('alt="Vista lateral"', 'alt="[Foto 2]"')
troca('alt="Grade de tamanhos FlexFit"', 'alt="[Foto 3]"')
troca('alt="Versão nude"', 'alt="[Foto 4]"')
troca_re(r'(<img src="assets/img/beneficio-\d\.jpg") alt="[^"]*"', r'\1 alt="[Benefício — o que a imagem mostra]"', 3)

# ── Textos visíveis ──────────────────────────────────────────
T = [
 ('<a href="#comprar" class="brand">FlexFit</a>', '<a href="#comprar" class="brand">[MARCA]</a>'),
 ('<span class="eyebrow">Shapewear · Modelagem diária</span>', '<span class="eyebrow">[Categoria · Uso]</span>'),
 ('<h1 style="margin-top:10px">Corset Modelador FlexFit</h1>', '<h1 style="margin-top:10px">[NOME DO PRODUTO]</h1>'),
 ('4,8/5 · mais de 10.000 clientes verificados', '[4,8]/5 · [nº] clientes verificados'),
 ('<b>Modelagem instantânea da cintura</b> — silhueta definida assim que veste', '<b>[Benefício principal]</b> — [explicação curta]'),
 ('<b>Suporte confortável para o dia a dia</b> — 9 hastes flexíveis que não dobram', '<b>[Benefício 2]</b> — [explicação curta]'),
 ('<b>Respirável e leve</b> — malha perfurada, invisível por baixo da roupa', '<b>[Benefício 3]</b> — [explicação curta]'),
 ('<b>Costura reforçada</b><span>Acabamento duplo que não enrola</span>', '<b>[Diferencial 1]</b><span>[detalhe curto]</span>'),
 ('<b>Tecido respirável</b><span>Malha perfurada, leve o dia todo</span>', '<b>[Diferencial 2]</b><span>[detalhe curto]</span>'),
 ('<b>3 níveis de ajuste</b><span>Colchetes que acompanham o conforto</span>', '<b>[Diferencial 3]</b><span>[detalhe curto]</span>'),
 ('<b>Discreto sob a roupa</b><span>Perfil fino, sem volume nas costuras</span>', '<b>[Diferencial 4]</b><span>[detalhe curto]</span>'),
 ('<h2>Porque escolher a FlexFit</h2>', '<h2>Porque escolher [o produto]</h2>'),
 ('A maioria das cintas obriga a escolher: aperta o suficiente para modelar ou é confortável o dia todo. A FlexFit foi pensada para não teres de escolher.',
  '[O problema dos produtos comuns numa frase.] [Como o seu produto resolve.]'),
 ('<b>FlexFit</b><span>USE RODRIGUES</span>', '<b>[PRODUTO]</b><span>USE RODRIGUES</span>'),
 ('<th scope="col">Cinta comum</th>', '<th scope="col">[Concorrente 1]</th>'),
 ('<th scope="col">Cinta ruim</th>', '<th scope="col">[Concorrente 2]</th>'),
 ('<th scope="row">Conforto o dia todo</th>', '<th scope="row">[Critério com estrelas]</th>'),
 ('<th scope="row">9 hastes flexíveis</th>', '<th scope="row">[Critério 1]</th>'),
 ('<th scope="row">3 níveis de ajuste</th>', '<th scope="row">[Critério 2]</th>'),
 ('<th scope="row">Invisível sob a roupa</th>', '<th scope="row">[Critério 3]</th>'),
 ('<th scope="row">Modela com conforto</th>', '<th scope="row">[Critério 4]</th>'),
 ('<th scope="row">Uso diário</th>', '<th scope="row">[Critério 5]</th>'),
 ('<h2>Construído para usar horas seguidas</h2>', '<h2>[Título da secção de benefícios]</h2>'),
 ('Cada detalhe tem uma função prática — nada aperta onde não deve, nada aparece onde não pode.', '[Uma frase sobre porque o produto funciona.]'),
 ('Meça a cintura natural — o ponto mais estreito do tronco — com a fita justa mas sem apertar. Em dúvida entre dois tamanhos, escolha o maior.</p>',
  '[Como medir para escolher o tamanho.] Em dúvida entre dois tamanhos, escolha o maior.</p>'),
 ('<th>Cintura natural</th>', '<th>[Medida]</th>'),
 ('<th>Cintura</th>', '<th>[Medida]</th>'),
 ('<span class="eyebrow num">4,8 / 5 · clientes verificados</span>', '<span class="eyebrow num">[4,8] / 5 · clientes verificados</span>'),
 ('<h2>Corset Modelador FlexFit</h2>', '<h2>[NOME DO PRODUTO]</h2>'),
 ('<summary>Nota-se por baixo da roupa?</summary>', '<summary>[Dúvida comum sobre o produto?]</summary>'),
 ('<b>Corset Modelador FlexFit</b>', '<b>[NOME DO PRODUTO]</b>'),
 ('<div class="f-brand">FlexFit</div>', '<div class="f-brand">[MARCA]</div>'),
 ('Shapewear pensado para o uso diário. Materiais respiráveis, acabamento discreto e apoio real ao cliente.', '[Uma frase sobre a marca.]'),
 ('<a href="#comprar">Comprar FlexFit</a>', '<a href="#comprar">Comprar [produto]</a>'),
 ('FlexFit. Todos os direitos reservados.', '[MARCA]. Todos os direitos reservados.'),
 ('<h3 style="margin:10px 0 8px">Como medir a cintura</h3>', '<h3 style="margin:10px 0 8px">[Como medir]</h3>'),
]
for v, n in T:
    troca(v, n, s.count(v) or 1)

troca_re(r'(<summary>\[Dúvida comum sobre o produto\?\]</summary>\s*<div class="faq-body">)[^<]*', r'\1[Resposta.]')
troca_re(r'(<summary>Qual tamanho devo escolher\?</summary>\s*<div class="faq-body">)\s*[^<]*', r'\1\n          [Como medir.] Em dúvida entre dois tamanhos, escolha o maior.\n          ')
troca_re(r'(<p style="font-size:14px;color:var\(--ink-2\);line-height:1\.7">)[^<]*', r'\1\n      [Passo a passo para medir.] Em dúvida, escolha o maior.\n    ')
troca_re(r'<q>[^<]*</q>', '<q>[Depoimento real de cliente — copie da Shopify, WhatsApp ou e-mail.]</q>', 3)
troca_re(r'<p class="r-who"><b>[^<]*</b> · [^·<]* · Compra verificada</p>', '<p class="r-who"><b>[Nome I.]</b> · [Cidade] · Compra verificada</p>', 3)
troca_re(r'<td class="num">\d+ ?– ?\d+ cm</td>', '<td class="num">[medida]</td>', 12)
s = s.replace('€ 27,68', '€ 29,90').replace('€ 39,40', '€ 49,90')
troca_re(r'<span id="dockResumo">[^<]*</span>', '<span id="dockResumo">[Cor 1] · M · 1 peça — € 29,90</span>')

# ── Sem secção de vídeos (UGC) no modelo ─────────────────────
troca_re(r'<!-- ═+ 4 · UGC / REELS.*?</section>\n\n', '')
troca_re(r'/\* ═+ UGC / REELS ═+ \*/\n.*?(?=\n/\* ═)', '')
troca_re(r"  /\* ── Reels: grelha fixa.*?(?=  /\* ── Guia de medidas)", '')
assert not re.search(r'ugcRow|class="reel|\.reel|<video', s), 'sobrou código dos vídeos'

# ── Verificação: não pode sobrar nada do FlexFit ─────────────
restos = [w for w in ('FlexFit', 'Corset', 'corset', 'flexfit', 'Shapewear', 'preto', 'nude', 'Nude', 'Preto', 'PACK2', 'PACK3',
                      '65534997', '65568867', 'Black Outubro', 'cintura', 'Cinta') if w in s]
assert not restos, f'Sobrou texto do FlexFit: {restos}'
(raiz / 'template' / 'produto.html').write_text(s, encoding='utf-8')
print('template/produto.html gerado,', len(s)//1024, 'KB')
