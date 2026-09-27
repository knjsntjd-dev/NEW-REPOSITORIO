"""Gera os ficheiros do tema Shopify a partir de template/produto.html.

Saída (pasta shopify-tema/tema/):
  assets/rodrigues-lp.css        CSS do modelo, isolado em .rlp e com classes rlp-*
  assets/rodrigues-lp.js         JS do modelo (bundles, cores, tamanhos, carrinho)
  sections/rlp-produto.liquid    hero + compra + diferenciais (+ dock e guia)
  sections/rlp-comparacao.liquid comparação + benefícios
  sections/rlp-conteudo.liquid   tamanhos + depoimentos + CTA final + FAQ
  templates/product.modelo-rodrigues.json

O tema continua com o cabeçalho, rodapé e carrinho dele. As classes do modelo
levam o prefixo rlp- para não chocarem com o theme.css.
"""
import json, pathlib, re

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
SAIDA = AQUI / 'tema'
fonte = (RAIZ / 'template' / 'produto.html').read_text(encoding='utf-8')

# ═════════════════════════ CSS ═════════════════════════
css = fonte[fonte.index('<style>') + 7: fonte.index('</style>')]
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
urls = []
def guarda_url(m):
    urls.append(m.group(0)); return f'__URL{len(urls)-1}__'
css = re.sub(r'url\((?:"[^"]*"|\'[^\']*\'|[^)]*)\)', guarda_url, css)

CLASSES = set()
def renomeia_sel(sel):
    def r(m):
        CLASSES.add(m.group(1)); return '.rlp-' + m.group(1)
    return re.sub(r'\.([_a-zA-Z][\w-]*)', r, sel)

def escopo(sel):
    sel = renomeia_sel(sel.strip())
    if sel.startswith(':root'): return '.rlp' + sel[5:]
    if sel in ('html', 'body'): return '.rlp'
    for el in ('html ', 'body '):
        if sel.startswith(el): return '.rlp ' + sel[len(el):]
    return '.rlp ' + sel

def processa(bloco):
    out, i, n = [], 0, len(bloco)
    while i < n:
        j = bloco.find('{', i)
        if j < 0: out.append(bloco[i:]); break
        cab = bloco[i:j].strip()
        prof, k = 1, j + 1
        while prof:
            if bloco[k] == '{': prof += 1
            elif bloco[k] == '}': prof -= 1
            k += 1
        corpo = bloco[j + 1:k - 1]
        if cab.startswith('@font-face') or cab.startswith('@keyframes'):
            out.append(f'{cab}{{{corpo}}}')
        elif cab.startswith('@'):
            out.append(f'{cab}{{{processa(corpo)}}}')
        elif cab:
            out.append(','.join(escopo(s) for s in cab.split(',')) + '{' + corpo.strip() + '}')
        i = k
    return '\n'.join(out)

css = processa(css)
for n_, u in enumerate(urls):
    css = css.replace(f'__URL{n_}__', u)
# A fonte sai do CSS para um ficheiro próprio (o CSS fica 3x mais leve e a
# fonte é pedida em paralelo); o @font-face vai na secção, com asset_url.
m_font = re.search(r'@font-face\{.*?base64,([A-Za-z0-9+/=\s]+)\).*?\}', css, re.S)
import base64
FONTE_WOFF2 = base64.b64decode(re.sub(r'\s', '', m_font.group(1)))
css = css.replace(m_font.group(0), '')
css = re.sub(r'\n\s*\n+', '\n', css)
# O tema pode ter regras para elementos (h1, table, details…): o modelo manda.
css += '\n.rlp{display:block}\n.rlp h1,.rlp h2,.rlp h3{font-family:var(--font);text-transform:none}\n'

def cls(html):
    """Aplica o prefixo rlp- às classes do modelo dentro de class="…"."""
    def r(m):
        toks = [('rlp-' + t if t in CLASSES else t) for t in m.group(2).split()]
        return f'{m.group(1)}{" ".join(toks)}"'
    return re.sub(r'(class=\\?")([^"\\]*)"', r, html)

# ═════════════════════════ JS ══════════════════════════
js = fonte.split('<script>')[2].split('</script>')[0]
js = cls(js)
js = re.sub(r"(['\"])\.([_a-zA-Z][\w-]*)",
            lambda m: m.group(1) + '.' + ('rlp-' + m.group(2) if m.group(2) in CLASSES else m.group(2)), js)
for a, b in [("className = 'bundle' + (best ? ' best' : '')", "className = 'rlp-bundle' + (best ? ' rlp-best' : '')"),
             ("className = 'peca'", "className = 'rlp-peca'"),
             ("classList.add('in')", "classList.add('rlp-in')"),
             ("classList.toggle('on',", "classList.toggle('rlp-on',")]:
    assert a in js, a
    js = js.replace(a, b)
# Rastreio: o pixel da Shopify (app Facebook & Instagram) já cobre a loja.
js = re.sub(r"\n  /\* ═+\n     RASTREIO META.*?(?=\n\}\)\(\);\s*$)", '\n', js, flags=re.S)
assert 'fbq(' not in js, 'rastreio não foi removido'

# ═════════════════════ helpers Liquid ═════════════════════
ESTRELAS = '<span class="stars">' + '<svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>' * 5 + '</span>'
S = lambda k: '{{ section.settings.' + k + ' }}'
TABELA = '''{%- assign linhas = section.settings.tabela_medidas | newline_to_br | split: '<br />' -%}
{%- for l in linhas -%}{%- assign c = l | strip | split: '|' -%}{%- if c.size > 1 -%}
<tr><td>{{ c[0] | strip }}</td><td class="num">{{ c[1] | strip }}</td></tr>
{%- endif -%}{%- endfor -%}'''

def schema(nome, settings):
    return '{% schema %}\n' + json.dumps({'name': nome, 'tag': 'section', 'class': 'rlp-sec', 'settings': settings,
                                         'presets': [{'name': nome}]}, ensure_ascii=False, indent=2) + '\n{% endschema %}\n'
def t(id_, label, default, tipo='text'):
    d = {'type': tipo, 'id': id_, 'label': label}
    if default != '':
        d['default'] = default  # a Shopify recusa default vazio
    return d
def h(conteudo):
    return {'type': 'header', 'content': conteudo}

# ═══════════════════ secção 1: produto ═══════════════════
SEC1 = r'''{%- liquid
  assign p = product
  assign v0 = p.selected_or_first_available_variant
  assign cor_idx = -1
  assign tam_idx = -1
  for o in p.options_with_values
    assign n = o.name | downcase
    if n contains 'cor' or n contains 'color' or n contains 'colour'
      assign cor_idx = forloop.index0
      break
    endif
  endfor
  for o in p.options_with_values
    if forloop.index0 != cor_idx
      assign tam_idx = forloop.index0
      break
    endif
  endfor
  assign preco = v0.price | divided_by: 100.0
  assign preco_cmp = preco
  if v0.compare_at_price > v0.price
    assign preco_cmp = v0.compare_at_price | divided_by: 100.0
  endif
-%}
<link rel="preload" href="{{ 'rodrigues-lp-archivo.woff2' | asset_url }}" as="font" type="font/woff2" crossorigin>
<style>@font-face{font-family:'Archivo';font-style:normal;font-weight:100 900;font-display:swap;src:url({{ 'rodrigues-lp-archivo.woff2' | asset_url }}) format('woff2')}</style>
{{ 'rodrigues-lp.css' | asset_url | stylesheet_tag }}
<script>
  window.LOJA = {
    nome: {{ p.title | json }},
    categoria: {{ p.type | json }},
    dominio: {{ request.origin | json }},
    variantes: {
      {%- for vv in p.variants -%}{%- if vv.available -%}
      {%- capture k -%}{%- if cor_idx >= 0 -%}{{ vv.options[cor_idx] | handleize }}{%- else -%}unico{%- endif -%}|{%- if tam_idx >= 0 -%}{{ vv.options[tam_idx] }}{%- else -%}unico{%- endif -%}{%- endcapture -%}
      {{ k | json }}: {{ vv.id | json }},
      {%- endif -%}{%- endfor -%}
    },
    precoBase: {{ preco }},
    precoComparacao: {{ preco_cmp }},
    bundles: [
      { q: 1, off: 0, codigo: '' }
      {%- if section.settings.bundle_2 -%}, { q: 2, off: {{ section.settings.off_2 }}, codigo: {{ section.settings.codigo_2 | strip | json }} }{%- endif -%}
      {%- if section.settings.bundle_3 -%}, { q: 3, off: {{ section.settings.off_3 }}, codigo: {{ section.settings.codigo_3 | strip | json }} }{%- endif -%}
    ],
    moeda: {{ cart.currency.iso_code | json }},
    pixelId: '',
    capiUrl: ''
  };
</script>
<script src="{{ 'rodrigues-lp.js' | asset_url }}" defer></script>

<div class="rlp">
<section class="hero" id="comprar">
  <div class="wrap hero-grid">

    <div class="gallery">
      <div style="position:relative">
        <figure class="shot" id="mainShot" style="margin:0">
          {%- if p.featured_image -%}
          <img id="mainImg" src="{{ p.featured_image | image_url: width: 800 }}" alt="{{ p.featured_image.alt | default: p.title | escape }}" width="800" height="800" decoding="async" fetchpriority="high">
          {%- else -%}<img id="mainImg" alt="" width="800" height="800" hidden>{%- endif -%}
        </figure>
      </div>
      <div class="thumbs" id="thumbs">
        {%- assign n_img = 0 -%}
        {%- for m in p.media -%}{%- if m.media_type == 'image' and n_img < 5 -%}
        <figure class="shot" data-src="{{ m | image_url: width: 800 }}" {% if n_img == 0 %}aria-current="true"{% endif %} style="margin:0"><img src="{{ m | image_url: width: 200 }}" alt="{{ m.alt | escape }}" width="200" height="200" loading="lazy" decoding="async"></figure>
        {%- assign n_img = n_img | plus: 1 -%}
        {%- endif -%}{%- endfor -%}
      </div>
    </div>

    <div class="buy">
      {%- if section.settings.eyebrow != blank -%}<span class="eyebrow">{{ section.settings.eyebrow }}</span>{%- endif -%}
      <h1 style="margin-top:10px">{{ p.title }}</h1>

      {%- if section.settings.nota != blank -%}
      <div class="stars-row">
        ESTRELAS
        <span class="num">{{ section.settings.nota }}</span>
      </div>
      {%- endif -%}

      <div class="price-row">
        <span class="price num" id="precoAtual">{{ v0.price | money }}</span>
        <span class="price-old num" id="precoAntigo">{{ v0.compare_at_price | money }}</span>
        <span class="save-chip num" id="poupanca"></span>
      </div>
      <p class="tax-note">{{ section.settings.nota_preco }}</p>

      <ul class="benefits">
        {%- for i in (1..3) -%}
        {%- capture bt -%}beneficio_{{ i }}_titulo{%- endcapture -%}{%- capture bx -%}beneficio_{{ i }}_texto{%- endcapture -%}
        {%- if section.settings[bt] != blank -%}
        <li>
          <svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>
          <span><b>{{ section.settings[bt] }}</b>{% if section.settings[bx] != blank %} — {{ section.settings[bx] }}{% endif %}</span>
        </li>
        {%- endif -%}
        {%- endfor -%}
      </ul>

      <div class="opt"{% if cor_idx < 0 %} hidden{% endif %}>
        <div class="opt-head">
          <span class="lbl">{% if cor_idx >= 0 %}{{ p.options_with_values[cor_idx].name }}{% endif %}</span>
          <span class="val" id="corVal">{% if cor_idx >= 0 %}{{ v0.options[cor_idx] }}{% endif %}</span>
        </div>
        <div class="swatches" id="cores">
          {%- if cor_idx >= 0 -%}
          {%- for val in p.options_with_values[cor_idx].values -%}
            {%- liquid
              assign img = ''
              for vv in p.variants
                if vv.options[cor_idx] == val.name and vv.featured_image
                  assign img = vv.featured_image | image_url: width: 800
                  break
                endif
              endfor
              if img == blank and p.featured_image
                assign img = p.featured_image | image_url: width: 800
              endif
              assign sw = val.swatch.color
              if sw == blank
                assign nm = val.name | downcase
                case nm
                  when 'preto', 'black', 'negro'
                    assign sw = '#1A1A1A'
                  when 'branco', 'white', 'blanco'
                    assign sw = '#F4F2EE'
                  when 'nude', 'bege', 'beige', 'skin'
                    assign sw = '#E4CFB4'
                  when 'cinza', 'grey', 'gray'
                    assign sw = '#9A9A9A'
                  when 'azul', 'blue'
                    assign sw = '#2B4C8C'
                  when 'vermelho', 'red'
                    assign sw = '#B3262E'
                  when 'rosa', 'pink'
                    assign sw = '#E8A7B8'
                  when 'verde', 'green'
                    assign sw = '#3F6B45'
                  when 'castanho', 'marrom', 'brown'
                    assign sw = '#6B4A34'
                  else
                    assign sw = '#CCCCCC'
                endcase
              endif
              assign sel = false
              if val.name == v0.options[cor_idx]
                assign sel = true
              endif
            -%}
          <button type="button" class="sw" style="--sw:{{ sw }}" data-cor="{{ val.name | handleize }}" data-nome="{{ val.name | escape }}" data-img="{{ img }}" aria-pressed="{{ sel }}" aria-label="{{ val.name | escape }}"><i></i></button>
          {%- endfor -%}
          {%- else -%}
          <button type="button" class="sw" data-cor="unico" data-nome="" data-img="" aria-pressed="true"><i></i></button>
          {%- endif -%}
        </div>
      </div>

      <div class="opt"{% if tam_idx < 0 %} hidden{% endif %}>
        <div class="opt-head">
          <span class="lbl">{% if tam_idx >= 0 %}{{ p.options_with_values[tam_idx].name }}{% endif %}</span>
          {%- if section.settings.tabela_medidas != blank -%}<button type="button" class="link" id="abrirGuia">{{ section.settings.guia_link }}</button>{%- endif -%}
        </div>
        <div class="sizes" id="tamanhos">
          {%- if tam_idx >= 0 -%}
          {%- for val in p.options_with_values[tam_idx].values -%}
          <button type="button" class="size" data-size="{{ val.name | escape }}" aria-pressed="{% if val.name == v0.options[tam_idx] %}true{% else %}false{% endif %}">{{ val.name }}</button>
          {%- endfor -%}
          {%- else -%}
          <button type="button" class="size" data-size="unico" aria-pressed="true">Único</button>
          {%- endif -%}
        </div>
      </div>

      <div class="opt">
        <div class="bundle-head"><span class="lbl">{{ section.settings.bundle_titulo }}</span></div>
        <div class="bundles" id="bundles"></div>
      </div>

      <div class="opt" id="pecasWrap" hidden>
        <div class="bundle-head"><span class="lbl">Escolha cada peça</span></div>
        <div class="pecas" id="pecas"></div>
        <p class="pecas-nota">Pode misturar cores e tamanhos — cada peça segue como escolher aqui.</p>
      </div>

      <a class="cta" href="#" data-buy id="ctaPrincipal">Comprar — {{ v0.price | money }}</a>

      <ul class="assur">
        {%- if section.settings.garantia_1 != blank -%}<li>
          <svg viewBox="0 0 24 24"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>
          <span>{{ section.settings.garantia_1 }}</span>
        </li>{%- endif -%}
        {%- if section.settings.garantia_2 != blank -%}<li>
          <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>
          <span>{{ section.settings.garantia_2 }}</span>
        </li>{%- endif -%}
        {%- if section.settings.garantia_3 != blank -%}<li>
          <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          <span>{{ section.settings.garantia_3 }}</span>
        </li>{%- endif -%}
      </ul>
    </div>

  </div>
</section>

{%- if section.settings.dif_1_titulo != blank -%}
<section class="trust">
  <div class="wrap trust-grid">
    <div class="trust-cell rv">
      <svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
      <b>SS(dif_1_titulo)</b><span>SS(dif_1_texto)</span>
    </div>
    <div class="trust-cell rv">
      <svg viewBox="0 0 24 24"><path d="M4 14c3-6 13-6 16 0"/><path d="M12 4v3"/><circle cx="12" cy="16" r="3"/></svg>
      <b>SS(dif_2_titulo)</b><span>SS(dif_2_texto)</span>
    </div>
    <div class="trust-cell rv">
      <svg viewBox="0 0 24 24"><path d="M6 4v16M18 4v16"/><path d="M6 9h12M6 15h12"/></svg>
      <b>SS(dif_3_titulo)</b><span>SS(dif_3_texto)</span>
    </div>
    <div class="trust-cell rv">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 2"/></svg>
      <b>SS(dif_4_titulo)</b><span>SS(dif_4_texto)</span>
    </div>
  </div>
</section>
{%- endif -%}

<div class="dock" id="dock">
  <div class="dock-in">
    <div class="dock-info">
      <b>{{ p.title }}</b>
      <span id="dockResumo"></span>
    </div>
    <a class="cta" href="#" data-buy>Comprar</a>
  </div>
</div>

<dialog id="guia">
  <button type="button" class="dlg-close" id="fecharGuia" aria-label="Fechar">&times;</button>
  <div class="dlg-in">
    <span class="eyebrow">Guia rápido</span>
    <h3 style="margin:10px 0 8px">SS(guia_titulo)</h3>
    <p style="font-size:14px;color:var(--ink-2);line-height:1.7">SS(guia_texto)</p>
    <table>
      <thead><tr><th>Tamanho</th><th>SS(medida_nome)</th></tr></thead>
      <tbody>TABELA</tbody>
    </table>
  </div>
</dialog>
</div>
'''

SET1 = [
    h('Topo do produto'),
    t('eyebrow', 'Etiqueta acima do título', 'Categoria · Uso'),
    t('nota', 'Estrelas: texto ao lado (vazio = esconde)', '4,8/5 · mais de 10.000 clientes verificados'),
    t('nota_preco', 'Linha abaixo do preço', 'IVA incluído · Frete grátis em todas as encomendas'),
    t('beneficio_1_titulo', 'Benefício 1 — título', 'Benefício principal'),
    t('beneficio_1_texto', 'Benefício 1 — explicação', 'explicação curta'),
    t('beneficio_2_titulo', 'Benefício 2 — título', 'Benefício 2'),
    t('beneficio_2_texto', 'Benefício 2 — explicação', 'explicação curta'),
    t('beneficio_3_titulo', 'Benefício 3 — título', 'Benefício 3'),
    t('beneficio_3_texto', 'Benefício 3 — explicação', 'explicação curta'),
    h('Pacotes com desconto'),
    {'type': 'paragraph', 'content': 'Crie na Shopify (Descontos) um código com a MESMA porcentagem para cada pacote. Sem código, a página mostra o desconto mas o checkout cobra o preço cheio.'},
    t('bundle_titulo', 'Título dos pacotes', 'Compre mais, pague menos'),
    {'type': 'checkbox', 'id': 'bundle_2', 'label': 'Mostrar pacote de 2', 'default': True},
    {'type': 'range', 'id': 'off_2', 'label': 'Desconto do pacote de 2', 'min': 0, 'max': 50, 'step': 1, 'unit': '%', 'default': 10},
    t('codigo_2', 'Código de desconto do pacote de 2', ''),
    {'type': 'checkbox', 'id': 'bundle_3', 'label': 'Mostrar pacote de 3', 'default': True},
    {'type': 'range', 'id': 'off_3', 'label': 'Desconto do pacote de 3', 'min': 0, 'max': 50, 'step': 1, 'unit': '%', 'default': 15},
    t('codigo_3', 'Código de desconto do pacote de 3', ''),
    h('Garantias abaixo do botão'),
    t('garantia_1', 'Linha 1 (envio)', 'Envio em 24 h úteis · entrega em 3 a 6 dias úteis'),
    t('garantia_2', 'Linha 2 (trocas)', '30 dias para troca de tamanho ou devolução'),
    t('garantia_3', 'Linha 3 (pagamento)', 'Pagamento seguro — MB Way, cartão ou PayPal'),
    h('Faixa de diferenciais (vazio no 1 = esconde)'),
] + [x for i in range(1, 5) for x in (t(f'dif_{i}_titulo', f'Diferencial {i} — título', f'Diferencial {i}'),
                                       t(f'dif_{i}_texto', f'Diferencial {i} — detalhe', 'detalhe curto'))] + [
    h('Guia de medidas'),
    t('guia_link', 'Texto do link', 'Guia de medidas'),
    t('guia_titulo', 'Título do guia', 'Como medir'),
    t('guia_texto', 'Explicação', 'Passo a passo para medir. Em dúvida, escolha o maior.', 'textarea'),
    t('medida_nome', 'Nome da medida (coluna)', 'Cintura'),
    {'type': 'textarea', 'id': 'tabela_medidas', 'label': 'Tabela: uma linha por tamanho, no formato  Tamanho | medida',
     'default': 'S | 62 – 68 cm\nM | 68 – 74 cm\nL | 74 – 80 cm\nXL | 80 – 86 cm\nXXL | 86 – 92 cm\n3XL | 92 – 98 cm',
     'info': 'Deixe vazio para esconder o link do guia.'},
]

# ═══════════════ secção 2: comparação + benefícios ═══════════════
def linha_cmp(i):
    return f'''          <tr>
            <th scope="row">SS(criterio_{i})</th>
            <td class="hl"><span class="compare-badge ok" aria-label="Sim">✓</span></td>
            <td><span class="compare-badge mid" aria-label="Parcial">–</span></td>
            <td><span class="compare-badge no" aria-label="Não">✕</span></td>
          </tr>'''
SEC2 = '''<div class="rlp">
<section class="compare">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow">SS(cmp_eyebrow)</span>
      <h2>SS(cmp_titulo)</h2>
      <p class="lead">SS(cmp_texto)</p>
    </div>
    <div class="compare-wrap rv">
      <table class="compare-table">
        <colgroup><col class="lbl"><col class="hl-col"><col class="oth"><col class="oth"></colgroup>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" class="hl"><span class="compare-brand"><b>SS(cmp_nosso)</b><span>SS(cmp_marca)</span></span></th>
            <th scope="col">SS(cmp_col2)</th>
            <th scope="col">SS(cmp_col3)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">SS(criterio_estrelas)</th>
            <td class="hl"><span class="compare-stars" aria-label="5 de 5 estrelas"><span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="on">★</span></span></td>
            <td><span class="compare-stars" aria-label="3 de 5 estrelas"><span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="off">★</span><span class="off">★</span></span></td>
            <td><span class="compare-stars" aria-label="2 de 5 estrelas"><span class="on">★</span><span class="on">★</span><span class="off">★</span><span class="off">★</span><span class="off">★</span></span></td>
          </tr>
{%- for i in (1..5) -%}{%- capture k -%}criterio_{{ i }}{%- endcapture -%}{%- if section.settings[k] != blank -%}
LINHA
{%- endif -%}{%- endfor -%}
        </tbody>
      </table>
    </div>
  </div>
</section>

{%- if section.settings.img_1 != blank or section.settings.img_2 != blank or section.settings.img_3 != blank -%}
<section class="pillars">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow">SS(ben_eyebrow)</span>
      <h2>SS(ben_titulo)</h2>
      <p class="lead">SS(ben_texto)</p>
    </div>
    <div class="p-grid">
      {%- for i in (1..3) -%}{%- capture k -%}img_{{ i }}{%- endcapture -%}{%- assign im = section.settings[k] -%}
      {%- if im != blank -%}
      <article class="p-card rv">
        <figure class="shot" style="margin:0;aspect-ratio:{{ im.aspect_ratio }}">{{ im | image_url: width: 900 | image_tag: loading: 'lazy', widths: '400,600,900', sizes: '(min-width: 760px) 33vw, 100vw', alt: im.alt }}</figure>
      </article>
      {%- endif -%}{%- endfor -%}
    </div>
  </div>
</section>
{%- endif -%}
</div>
'''.replace('LINHA', linha_cmp('{{ i }}').replace('SS(criterio_{{ i }})', '{{ section.settings[k] }}'))

SET2 = [
    h('Comparação'),
    t('cmp_eyebrow', 'Etiqueta', 'Nós contra eles'),
    t('cmp_titulo', 'Título', 'Porque escolher o nosso produto'),
    t('cmp_texto', 'Texto', 'O problema dos produtos comuns numa frase. Como o seu produto resolve.', 'textarea'),
    t('cmp_nosso', 'Coluna em destaque — nome', 'PRODUTO'),
    t('cmp_marca', 'Coluna em destaque — marca', 'USE RODRIGUES'),
    t('cmp_col2', 'Coluna 2 (concorrente)', 'Comum'),
    t('cmp_col3', 'Coluna 3 (concorrente)', 'Barato'),
    t('criterio_estrelas', 'Linha com estrelas', 'Qualidade geral'),
] + [t(f'criterio_{i}', f'Critério {i} (vazio = esconde)', f'Critério {i}') for i in range(1, 6)] + [
    h('Benefícios (artes)'),
    t('ben_eyebrow', 'Etiqueta', 'Porque funciona'),
    t('ben_titulo', 'Título', 'Título da secção de benefícios'),
    t('ben_texto', 'Texto', 'Uma frase sobre porque o produto funciona.', 'textarea'),
    {'type': 'image_picker', 'id': 'img_1', 'label': 'Arte 1'},
    {'type': 'image_picker', 'id': 'img_2', 'label': 'Arte 2'},
    {'type': 'image_picker', 'id': 'img_3', 'label': 'Arte 3'},
]

# ═══════════ secção 3: tamanhos + depoimentos + CTA + FAQ ═══════════
SEC3 = '''{%- liquid
  assign p = product
  assign v0 = p.selected_or_first_available_variant
-%}
<div class="rlp">
{%- if section.settings.mostrar_tabela and section.settings.tabela_medidas != blank -%}
<section class="sizing">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow">Guia de tamanhos</span>
      <h2>SS(tam_titulo)</h2>
      <p class="lead">SS(tam_texto)</p>
    </div>
    <div class="sizing-grid rv">
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Tamanho</th><th>SS(medida_nome)</th></tr></thead>
          <tbody>TABELA</tbody>
        </table>
      </div>
      <p class="tbl-note">SS(tam_nota)</p>
    </div>
  </div>
</section>
{%- endif -%}

{%- if section.settings.dep_1_texto != blank -%}
<section class="reviews">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow num">SS(dep_eyebrow)</span>
      <h2>SS(dep_titulo)</h2>
    </div>
    <div class="r-grid rv">
      {%- for i in (1..3) -%}
      {%- capture kt -%}dep_{{ i }}_texto{%- endcapture -%}{%- capture kn -%}dep_{{ i }}_nome{%- endcapture -%}
      {%- if section.settings[kt] != blank -%}
      <article class="r-card">
        ESTRELAS
        <q>{{ section.settings[kt] }}</q>
        <p class="r-who"><b>{{ section.settings[kn] }}</b> · Compra verificada</p>
      </article>
      {%- endif -%}
      {%- endfor -%}
    </div>
  </div>
</section>
{%- endif -%}

<section class="final">
  <div class="wrap">
    <div class="final-box rv">
      <span class="eyebrow">SS(fim_eyebrow)</span>
      <h2>{{ p.title }}</h2>
      <p class="lead" style="margin-inline:auto">SS(fim_texto)</p>
      <div class="price-row">
        <span class="price num" data-final-preco>{{ v0.price | money }}</span>
        <span class="price-old num" data-final-antigo>{{ v0.compare_at_price | money }}</span>
      </div>
      <p class="tax-note" style="margin-bottom:6px">SS(fim_nota_preco)</p>
      <a class="cta" href="#comprar" data-buy id="ctaFinal">Comprar agora — {{ v0.price | money }}</a>
      <span class="seal">
        <svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
        SS(fim_selo)
      </span>
    </div>
  </div>
</section>

<section class="faq">
  <div class="wrap">
    <div class="faq-list rv">
      {%- for i in (1..6) -%}
      {%- capture kp -%}faq_{{ i }}_pergunta{%- endcapture -%}{%- capture kr -%}faq_{{ i }}_resposta{%- endcapture -%}
      {%- if section.settings[kp] != blank -%}
      <details>
        <summary>{{ section.settings[kp] }}</summary>
        <div class="faq-body">{{ section.settings[kr] }}</div>
      </details>
      {%- endif -%}
      {%- endfor -%}
    </div>
  </div>
</section>
</div>
'''
SET3 = [
    h('Tabela de tamanhos'),
    {'type': 'checkbox', 'id': 'mostrar_tabela', 'label': 'Mostrar secção de tamanhos', 'default': True},
    t('tam_titulo', 'Título', 'Encontre o seu tamanho'),
    t('tam_texto', 'Como medir', 'Como medir para escolher o tamanho. Em dúvida entre dois tamanhos, escolha o maior.', 'textarea'),
    t('medida_nome', 'Nome da medida (coluna)', 'Cintura'),
    {'type': 'textarea', 'id': 'tabela_medidas', 'label': 'Tabela: Tamanho | medida (uma por linha)',
     'default': 'S | 62 – 68 cm\nM | 68 – 74 cm\nL | 74 – 80 cm\nXL | 80 – 86 cm\nXXL | 86 – 92 cm\n3XL | 92 – 98 cm'},
    t('tam_nota', 'Nota abaixo da tabela', 'Se o tamanho não servir, trocamos nos primeiros 30 dias.'),
    h('Depoimentos (só avaliações reais)'),
    t('dep_eyebrow', 'Etiqueta', '4,8 / 5 · clientes verificados'),
    t('dep_titulo', 'Título', 'O que diz quem já usa'),
] + [x for i in range(1, 4) for x in (t(f'dep_{i}_texto', f'Depoimento {i}', '', 'textarea'),
                                       t(f'dep_{i}_nome', f'Depoimento {i} — nome e cidade', ''))] + [
    h('Chamada final'),
    t('fim_eyebrow', 'Etiqueta', 'Oferta por tempo limitado'),
    t('fim_texto', 'Texto', 'Escolha o tamanho, receba em casa e experimente sem risco durante 30 dias.', 'textarea'),
    t('fim_nota_preco', 'Linha abaixo do preço', 'IVA incluído · Frete grátis em todas as encomendas'),
    t('fim_selo', 'Selo', 'Garantia de satisfação · 30 dias'),
    h('Perguntas frequentes (vazio = esconde)'),
] + [x for i, (q, r) in enumerate([
        ('Qual tamanho devo escolher?', 'Veja o guia de medidas acima. Em dúvida entre dois tamanhos, escolha o maior.'),
        ('Quanto tempo demora a entrega?', 'Enviamos em 24 horas úteis. A entrega demora normalmente 3 a 6 dias úteis e recebe o código de rastreio por e-mail.'),
        ('Como funciona o desconto de quantidade?', 'Ao escolher 2 peças, o desconto de 10% aplica-se ao total; com 3 peças, 15%. O envio é grátis em qualquer encomenda.'),
        ('E se não servir?', 'Tem 30 dias para pedir troca de tamanho ou devolução. Basta responder ao e-mail da encomenda — tratamos do resto.'),
        ('', ''), ('', '')], 1)
     for x in (t(f'faq_{i}_pergunta', f'Pergunta {i}', q), t(f'faq_{i}_resposta', f'Resposta {i}', r, 'textarea'))]

# ═════════════════════════ montagem ═════════════════════════
def finaliza(liquid):
    liquid = liquid.replace('ESTRELAS', ESTRELAS).replace('TABELA', TABELA)
    liquid = re.sub(r'SS\((\w+)\)', lambda m: S(m.group(1)), liquid)
    return cls(liquid)

for p in ('assets', 'sections', 'templates'):
    (SAIDA / p).mkdir(parents=True, exist_ok=True)
(SAIDA / 'assets' / 'rodrigues-lp.css').write_text(css, encoding='utf-8')
(SAIDA / 'assets' / 'rodrigues-lp-archivo.woff2').write_bytes(FONTE_WOFF2)
(SAIDA / 'assets' / 'rodrigues-lp.js').write_text(js.strip() + '\n', encoding='utf-8')
(SAIDA / 'sections' / 'rlp-produto.liquid').write_text(finaliza(SEC1) + '\n' + schema('RLP · Produto e compra', SET1), encoding='utf-8')
(SAIDA / 'sections' / 'rlp-comparacao.liquid').write_text(finaliza(SEC2) + '\n' + schema('RLP · Comparação', SET2), encoding='utf-8')
(SAIDA / 'sections' / 'rlp-conteudo.liquid').write_text(finaliza(SEC3) + '\n' + schema('RLP · Tamanhos e FAQ', SET3), encoding='utf-8')

# Modelo de produto: secções RLP + as duas secções de vídeo do tema
vr_settings = {
    "caption": "AVALIAÇÕES VERIFICADAS", "heading": "Mais de 5.000 pessoas confiam em nós.", "heading_size": "h1",
    "subheading": "Confira nossas avaliações e veja por si mesmo!", "card_ratio": "9/16", "card_width": 370,
    "link_label": "Ver produto", "accent_color": "#3B82F6", "color_scheme": "custom",
    "custom_colors_background": "#FBFBF6", "custom_gradient_background": "", "custom_colors_text": "#121212",
    "padding_top": 48, "padding_bottom": 48}
modelo = {
    "sections": {
        "rlp_produto": {"type": "rlp-produto", "settings": {}},
        "videos_produto": {"type": "product-video-gallery", "name": "Videos Produto", "settings": {},
                           "blocks": {"video_1": {"type": "video", "settings": {"video_url": ""}},
                                      "video_2": {"type": "video", "settings": {"video_url": ""}},
                                      "video_3": {"type": "video", "settings": {"video_url": ""}}},
                           "block_order": ["video_1", "video_2", "video_3"]},
        "rlp_comparacao": {"type": "rlp-comparacao", "settings": {}},
        "videos_clientes": {"type": "video-reviews", "name": "Vídeos de clientes", "settings": vr_settings,
                            "blocks": {f"video_{i}": {"type": "video", "settings": {"video_url": "", "name": "", "verified": True,
                                                                                    "text": "", "product": "", "link": ""}} for i in range(1, 4)},
                            "block_order": [f"video_{i}" for i in range(1, 4)]},
        "rlp_conteudo": {"type": "rlp-conteudo", "settings": {}},
    },
    "order": ["rlp_produto", "videos_produto", "rlp_comparacao", "videos_clientes", "rlp_conteudo"],
}
(SAIDA / 'templates' / 'product.modelo-rodrigues.json').write_text(json.dumps(modelo, ensure_ascii=False, indent=2), encoding='utf-8')
print('classes com prefixo:', len(CLASSES))
for f in sorted(SAIDA.rglob('*')):
    if f.is_file(): print(f.relative_to(SAIDA), f.stat().st_size)
