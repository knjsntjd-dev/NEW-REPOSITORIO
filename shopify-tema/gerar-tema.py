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
# O conteúdo (textos, listas, artes) fica no METAFIELD do produto
# (namespace "rlp"), não nas definições da secção — assim um único
# ficheiro de tema serve qualquer produto, e dá para preencher os
# dados pela API mesmo com o tema já publicado (só as secções do
# tema exigem o tema estar por publicar).
ESTRELAS = '<span class="stars">' + '<svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>' * 5 + '</span>'

def M(chave, default=None):
    """Liquid que lê product.metafields.rlp.<chave>, com um texto de
    reserva quando o produto ainda não tem esse campo preenchido."""
    if default is None:
        return '{{ product.metafields.rlp.' + chave + ' }}'
    assert "'" not in default, default
    return "{{ product.metafields.rlp." + chave + " | default: '" + default + "' }}"

def MB(chave):
    """Acesso dinâmico product.metafields.rlp[chave] — chave é uma
    variável Liquid (usada dentro de laços)."""
    return '{{ product.metafields.rlp[' + chave + '] }}'

TABELA_PADRAO = 'S | 62 – 68 cm\nM | 68 – 74 cm\nL | 74 – 80 cm\nXL | 80 – 86 cm\nXXL | 86 – 92 cm\n3XL | 92 – 98 cm'
TABELA = ("{%- assign linhas = " + M('tabela_medidas', TABELA_PADRAO)[2:-2].strip()
          + " | newline_to_br | split: '<br />' -%}"
          + "{%- for l in linhas -%}{%- assign c = l | strip | split: '|' -%}{%- if c.size > 1 -%}"
          + "<tr><td>{{ c[0] | strip }}</td><td class=\"num\">{{ c[1] | strip }}</td></tr>"
          + "{%- endif -%}{%- endfor -%}")

def schema(nome, aviso):
    return ('{% schema %}\n' + json.dumps({
        'name': nome, 'tag': 'section', 'class': 'rlp-sec',
        'settings': [{'type': 'paragraph', 'content': aviso}],
        'presets': [{'name': nome}],
    }, ensure_ascii=False, indent=2) + '\n{% endschema %}\n')

AVISO = ('Os textos desta secção vêm do produto (Metafields → rlp), não daqui — '
         'assim servem para qualquer produto que use este modelo. Edite em '
         'Produtos → [o produto] → Metafields, ou peça para os preencherem por si.')

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
{{ 'rodrigues-lp-archivo.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: true }}
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
      {%- assign b2at = product.metafields.rlp.bundle2_ativo | default: 'sim' -%}
      {%- assign b3at = product.metafields.rlp.bundle3_ativo | default: 'sim' -%}
      {%- if b2at == 'sim' -%}, { q: 2, off: {{ product.metafields.rlp.bundle2_off | default: 10 }}, codigo: {{ product.metafields.rlp.bundle2_codigo | strip | json }} }{%- endif -%}
      {%- if b3at == 'sim' -%}, { q: 3, off: {{ product.metafields.rlp.bundle3_off | default: 15 }}, codigo: {{ product.metafields.rlp.bundle3_codigo | strip | json }} }{%- endif -%}
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
      {%- assign eyebrow = ''' + M('eyebrow', 'Categoria · Uso')[2:-2].strip() + r''' -%}
      {%- if eyebrow != blank -%}<span class="eyebrow">{{ eyebrow }}</span>{%- endif -%}
      <h1 style="margin-top:10px">{{ p.title }}</h1>

      {%- assign nota = ''' + M('nota', '4,8/5 · mais de 10.000 clientes verificados')[2:-2].strip() + r''' -%}
      {%- if nota != blank -%}
      <div class="stars-row">
        ESTRELAS
        <span class="num">{{ nota }}</span>
      </div>
      {%- endif -%}

      <div class="price-row">
        <span class="price num" id="precoAtual">{{ v0.price | money }}</span>
        <span class="price-old num" id="precoAntigo">{{ v0.compare_at_price | money }}</span>
        <span class="save-chip num" id="poupanca"></span>
      </div>
      <p class="tax-note">''' + M('nota_preco', 'IVA incluído · Frete grátis em todas as encomendas') + r'''</p>

      <ul class="benefits">
        {%- assign bp_padrao = 'Benefício principal|Benefício 2|Benefício 3' | split: '|' -%}
        {%- for i in (1..3) -%}
        {%- capture bt -%}beneficio_{{ i }}_titulo{%- endcapture -%}{%- capture bx -%}beneficio_{{ i }}_texto{%- endcapture -%}
        {%- assign titulo = product.metafields.rlp[bt] | default: bp_padrao[forloop.index0] -%}
        {%- assign texto = product.metafields.rlp[bx] | default: 'explicação curta' -%}
        {%- if titulo != blank -%}
        <li>
          <svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>
          <span><b>{{ titulo }}</b>{% if texto != blank %} — {{ texto }}{% endif %}</span>
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
                  when 'cinza', 'grey', 'gray', 'silver', 'prateado'
                    assign sw = '#9A9A9A'
                  when 'azul', 'blue', 'navy', 'marinho', 'azul-marinho'
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
          {%- assign tabela_txt = ''' + M('tabela_medidas', TABELA_PADRAO)[2:-2].strip() + r''' -%}
          {%- if tabela_txt != blank -%}<button type="button" class="link" id="abrirGuia">''' + M('guia_link', 'Guia de medidas') + r'''</button>{%- endif -%}
        </div>
        <div class="sizes" id="tamanhos">
          {%- if tam_idx >= 0 -%}
          {%- for val in p.options_with_values[tam_idx].values -%}
          {%- assign tam_label = val.name | split: ' ' | first -%}
          <button type="button" class="size" data-size="{{ val.name | escape }}" data-nome="{{ tam_label | escape }}" aria-pressed="{% if val.name == v0.options[tam_idx] %}true{% else %}false{% endif %}">{{ tam_label }}</button>
          {%- endfor -%}
          {%- else -%}
          <button type="button" class="size" data-size="unico" aria-pressed="true">Único</button>
          {%- endif -%}
        </div>
      </div>

      <div class="opt">
        <div class="bundle-head"><span class="lbl">''' + M('bundle_titulo', 'Compre mais, pague menos') + r'''</span></div>
        <div class="bundles" id="bundles"></div>
      </div>

      <div class="opt" id="pecasWrap" hidden>
        <div class="bundle-head"><span class="lbl">Escolha cada peça</span></div>
        <div class="pecas" id="pecas"></div>
        <p class="pecas-nota">Pode misturar cores e tamanhos — cada peça segue como escolher aqui.</p>
      </div>

      <a class="cta" href="#" data-buy id="ctaPrincipal">Comprar — {{ v0.price | money }}</a>

      <ul class="assur">
        {%- assign g1 = ''' + M('garantia_1', 'Envio em 24 h úteis · entrega em 3 a 6 dias úteis')[2:-2].strip() + r''' -%}
        {%- assign g2 = ''' + M('garantia_2', '30 dias para troca de tamanho ou devolução')[2:-2].strip() + r''' -%}
        {%- assign g3 = ''' + M('garantia_3', 'Pagamento seguro — MB Way, cartão ou PayPal')[2:-2].strip() + r''' -%}
        {%- if g1 != blank -%}<li>
          <svg viewBox="0 0 24 24"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>
          <span>{{ g1 }}</span>
        </li>{%- endif -%}
        {%- if g2 != blank -%}<li>
          <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>
          <span>{{ g2 }}</span>
        </li>{%- endif -%}
        {%- if g3 != blank -%}<li>
          <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          <span>{{ g3 }}</span>
        </li>{%- endif -%}
      </ul>
    </div>

  </div>
</section>

{%- assign dif1t = product.metafields.rlp.dif_1_titulo -%}
{%- if dif1t != blank -%}
<section class="trust">
  <div class="wrap trust-grid">
    {%- for i in (1..4) -%}
    {%- capture kt -%}dif_{{ i }}_titulo{%- endcapture -%}{%- capture kx -%}dif_{{ i }}_texto{%- endcapture -%}
    {%- assign dt = product.metafields.rlp[kt] -%}{%- assign dx = product.metafields.rlp[kx] -%}
    {%- if dt != blank -%}
    <div class="trust-cell rv">
      {%- case i -%}
        {%- when 1 -%}<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
        {%- when 2 -%}<svg viewBox="0 0 24 24"><path d="M4 14c3-6 13-6 16 0"/><path d="M12 4v3"/><circle cx="12" cy="16" r="3"/></svg>
        {%- when 3 -%}<svg viewBox="0 0 24 24"><path d="M6 4v16M18 4v16"/><path d="M6 9h12M6 15h12"/></svg>
        {%- else -%}<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 2"/></svg>
      {%- endcase -%}
      <b>{{ dt }}</b><span>{{ dx }}</span>
    </div>
    {%- endif -%}
    {%- endfor -%}
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
    <h3 style="margin:10px 0 8px">''' + M('guia_titulo', 'Como medir') + r'''</h3>
    <p style="font-size:14px;color:var(--ink-2);line-height:1.7">''' + M('guia_texto', 'Passo a passo para medir. Em dúvida, escolha o maior.') + r'''</p>
    <table>
      <thead><tr><th>Tamanho</th><th>''' + M('medida_nome', 'Cintura') + r'''</th></tr></thead>
      <tbody>TABELA</tbody>
    </table>
  </div>
</dialog>
</div>
'''

# ═══════════════ secção 2: comparação + benefícios ═══════════════
SEC2 = '''<div class="rlp">
<section class="compare">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow">''' + M('cmp_eyebrow', 'Nós contra eles') + '''</span>
      <h2>''' + M('cmp_titulo', 'Porque escolher o nosso produto') + '''</h2>
      <p class="lead">''' + M('cmp_texto', 'O problema dos produtos comuns numa frase. Como o seu produto resolve.') + '''</p>
    </div>
    <div class="compare-wrap rv">
      <table class="compare-table">
        <colgroup><col class="lbl"><col class="hl-col"><col class="oth"><col class="oth"></colgroup>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" class="hl"><span class="compare-brand"><b>''' + M('cmp_nosso', 'PRODUTO') + '''</b><span>''' + M('cmp_marca', 'USE RODRIGUES') + '''</span></span></th>
            <th scope="col">''' + M('cmp_col2', 'Comum') + '''</th>
            <th scope="col">''' + M('cmp_col3', 'Barato') + '''</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">''' + M('criterio_estrelas', 'Qualidade geral') + '''</th>
            <td class="hl"><span class="compare-stars" aria-label="5 de 5 estrelas"><span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="on">★</span></span></td>
            <td><span class="compare-stars" aria-label="3 de 5 estrelas"><span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="off">★</span><span class="off">★</span></span></td>
            <td><span class="compare-stars" aria-label="2 de 5 estrelas"><span class="on">★</span><span class="on">★</span><span class="off">★</span><span class="off">★</span><span class="off">★</span></span></td>
          </tr>
''' + '\n'.join(f'''          {{%- assign crit{i} = product.metafields.rlp.criterio_{i} | default: 'Critério {i}' -%}}
          {{%- if crit{i} != blank -%}}
          <tr>
            <th scope="row">{{{{ crit{i} }}}}</th>
            <td class="hl"><span class="compare-badge ok" aria-label="Sim">✓</span></td>
            <td><span class="compare-badge mid" aria-label="Parcial">–</span></td>
            <td><span class="compare-badge no" aria-label="Não">✕</span></td>
          </tr>
          {{%- endif -%}}''' for i in range(1, 6)) + '''
        </tbody>
      </table>
    </div>
  </div>
</section>

{%- assign im1 = product.metafields.rlp.img_1 -%}{%- assign im2 = product.metafields.rlp.img_2 -%}{%- assign im3 = product.metafields.rlp.img_3 -%}
{%- if im1 != blank or im2 != blank or im3 != blank -%}
<section class="pillars">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow">''' + M('ben_eyebrow', 'Porque funciona') + '''</span>
      <h2>''' + M('ben_titulo', 'Título da secção de benefícios') + '''</h2>
      <p class="lead">''' + M('ben_texto', 'Uma frase sobre porque o produto funciona.') + '''</p>
    </div>
    <div class="p-grid">
      {%- if im1 != blank -%}
      <article class="p-card rv">
        <figure class="shot" style="margin:0;aspect-ratio:{{ im1.aspect_ratio }}">{{ im1 | image_url: width: 900 | image_tag: loading: 'lazy', widths: '400,600,900', sizes: '(min-width: 760px) 33vw, 100vw', alt: im1.alt }}</figure>
        {%- assign l1t = product.metafields.rlp.legenda_1_titulo -%}{%- if l1t != blank -%}<h3>{{ l1t }}</h3><p>{{ product.metafields.rlp.legenda_1_texto }}</p>{%- endif -%}
      </article>
      {%- endif -%}
      {%- if im2 != blank -%}
      <article class="p-card rv">
        <figure class="shot" style="margin:0;aspect-ratio:{{ im2.aspect_ratio }}">{{ im2 | image_url: width: 900 | image_tag: loading: 'lazy', widths: '400,600,900', sizes: '(min-width: 760px) 33vw, 100vw', alt: im2.alt }}</figure>
        {%- assign l2t = product.metafields.rlp.legenda_2_titulo -%}{%- if l2t != blank -%}<h3>{{ l2t }}</h3><p>{{ product.metafields.rlp.legenda_2_texto }}</p>{%- endif -%}
      </article>
      {%- endif -%}
      {%- if im3 != blank -%}
      <article class="p-card rv">
        <figure class="shot" style="margin:0;aspect-ratio:{{ im3.aspect_ratio }}">{{ im3 | image_url: width: 900 | image_tag: loading: 'lazy', widths: '400,600,900', sizes: '(min-width: 760px) 33vw, 100vw', alt: im3.alt }}</figure>
        {%- assign l3t = product.metafields.rlp.legenda_3_titulo -%}{%- if l3t != blank -%}<h3>{{ l3t }}</h3><p>{{ product.metafields.rlp.legenda_3_texto }}</p>{%- endif -%}
      </article>
      {%- endif -%}
    </div>
  </div>
</section>
{%- endif -%}
</div>
'''

# ═══════════ secção 3: tamanhos + depoimentos + CTA + FAQ ═══════════
SEC3 = '''{%- liquid
  assign p = product
  assign v0 = p.selected_or_first_available_variant
-%}
<div class="rlp">
{%- assign tabela_txt = ''' + M('tabela_medidas', TABELA_PADRAO)[2:-2].strip() + ''' -%}
{%- if tabela_txt != blank -%}
<section class="sizing">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow">Guia de tamanhos</span>
      <h2>''' + M('tam_titulo', 'Encontre o seu tamanho') + '''</h2>
      <p class="lead">''' + M('tam_texto', 'Como medir para escolher o tamanho. Em dúvida entre dois tamanhos, escolha o maior.') + '''</p>
    </div>
    <div class="sizing-grid rv">
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Tamanho</th><th>''' + M('medida_nome', 'Cintura') + '''</th></tr></thead>
          <tbody>TABELA</tbody>
        </table>
      </div>
      <p class="tbl-note">''' + M('tam_nota', 'Se o tamanho não servir, trocamos nos primeiros 30 dias.') + '''</p>
    </div>
  </div>
</section>
{%- endif -%}

{%- assign dep1 = product.metafields.rlp.dep_1_texto -%}
{%- if dep1 != blank -%}
<section class="reviews">
  <div class="wrap">
    <div class="sec-head rv">
      <span class="eyebrow num">''' + M('dep_eyebrow', '4,8 / 5 · clientes verificados') + '''</span>
      <h2>''' + M('dep_titulo', 'O que diz quem já usa') + '''</h2>
    </div>
    <div class="r-grid rv">
      {%- for i in (1..3) -%}
      {%- capture kt -%}dep_{{ i }}_texto{%- endcapture -%}{%- capture kn -%}dep_{{ i }}_nome{%- endcapture -%}
      {%- assign dt = product.metafields.rlp[kt] -%}{%- assign dn = product.metafields.rlp[kn] -%}
      {%- if dt != blank -%}
      <article class="r-card">
        ESTRELAS
        <q>{{ dt }}</q>
        <p class="r-who"><b>{{ dn }}</b> · Compra verificada</p>
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
      <span class="eyebrow">''' + M('fim_eyebrow', 'Oferta por tempo limitado') + '''</span>
      <h2>{{ p.title }}</h2>
      <p class="lead" style="margin-inline:auto">''' + M('fim_texto', 'Escolha o tamanho, receba em casa e experimente sem risco durante 30 dias.') + '''</p>
      <div class="price-row">
        <span class="price num" data-final-preco>{{ v0.price | money }}</span>
        <span class="price-old num" data-final-antigo>{{ v0.compare_at_price | money }}</span>
      </div>
      <p class="tax-note" style="margin-bottom:6px">''' + M('fim_nota_preco', 'IVA incluído · Frete grátis em todas as encomendas') + '''</p>
      <a class="cta" href="#comprar" data-buy id="ctaFinal">Comprar agora — {{ v0.price | money }}</a>
      <span class="seal">
        <svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
        ''' + M('fim_selo', 'Garantia de satisfação · 30 dias') + '''
      </span>
    </div>
  </div>
</section>

<section class="faq">
  <div class="wrap">
    <div class="faq-list rv">
''' + '\n'.join(f'''      {{%- assign faqp{i} = product.metafields.rlp.faq_{i}_pergunta | default: {json.dumps(q, ensure_ascii=False)} -%}}
      {{%- assign faqr{i} = product.metafields.rlp.faq_{i}_resposta | default: {json.dumps(r, ensure_ascii=False)} -%}}
      {{%- if faqp{i} != blank -%}}
      <details>
        <summary>{{{{ faqp{i} }}}}</summary>
        <div class="faq-body">{{{{ faqr{i} }}}}</div>
      </details>
      {{%- endif -%}}''' for i, (q, r) in enumerate([
        ('Qual tamanho devo escolher?', 'Veja o guia de medidas acima. Em dúvida entre dois tamanhos, escolha o maior.'),
        ('Quanto tempo demora a entrega?', 'Enviamos em 24 horas úteis. A entrega demora normalmente 3 a 6 dias úteis e recebe o código de rastreio por e-mail.'),
        ('Como funciona o desconto de quantidade?', 'Ao escolher 2 peças, o desconto de 10% aplica-se ao total; com 3 peças, 15%. O envio é grátis em qualquer encomenda.'),
        ('E se não servir?', 'Tem 30 dias para pedir troca de tamanho ou devolução. Basta responder ao e-mail da encomenda — tratamos do resto.'),
        ('', ''), ('', '')], 1)) + '''
    </div>
  </div>
</section>
</div>
'''

# ═════════════════════════ montagem ═════════════════════════
def finaliza(liquid):
    return cls(liquid.replace('ESTRELAS', ESTRELAS).replace('TABELA', TABELA))

for p in ('assets', 'sections', 'templates'):
    (SAIDA / p).mkdir(parents=True, exist_ok=True)
(SAIDA / 'assets' / 'rodrigues-lp.css').write_text(css, encoding='utf-8')
(SAIDA / 'assets' / 'rodrigues-lp-archivo.woff2').write_bytes(FONTE_WOFF2)
(SAIDA / 'assets' / 'rodrigues-lp.js').write_text(js.strip() + '\n', encoding='utf-8')
(SAIDA / 'sections' / 'rlp-produto.liquid').write_text(finaliza(SEC1) + '\n' + schema('RLP · Produto e compra', AVISO), encoding='utf-8')
(SAIDA / 'sections' / 'rlp-comparacao.liquid').write_text(finaliza(SEC2) + '\n' + schema('RLP · Comparação', AVISO), encoding='utf-8')
(SAIDA / 'sections' / 'rlp-conteudo.liquid').write_text(finaliza(SEC3) + '\n' + schema('RLP · Tamanhos e FAQ', AVISO), encoding='utf-8')

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
