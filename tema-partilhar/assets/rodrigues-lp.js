(function(){
  'use strict';

  /* Textos vindos da seção "RLP · Produto e compra" (editáveis no editor do tema) */
  var T = LOJA.textos || {};
  function t(k, padrao){ return (T[k] != null && T[k] !== '') ? String(T[k]) : padrao; }
  function tn(k, padrao, n){ return t(k, padrao).replace('[n]', n); }

  /* Cor e tamanho iniciais = os botões marcados com aria-pressed="true" */
  var corIni  = document.querySelector('#cores [aria-pressed="true"]') || document.querySelector('#cores [data-cor]');
  var sizeIni = document.querySelector('#tamanhos [aria-pressed="true"]') || document.querySelector('#tamanhos [data-size]');
  var estado = { cor: corIni.getAttribute('data-cor'), corNome: corIni.getAttribute('data-nome'),
                 size: sizeIni.getAttribute('data-size'), bundle:0, pecas:[] };

  /* Preço na moeda da loja (EUR mantém o formato "€ 29,90") */
  var fmtMoeda = null;
  if (LOJA.moeda && LOJA.moeda !== 'EUR'){
    try { fmtMoeda = new Intl.NumberFormat(document.documentElement.lang || 'pt-BR', { style: 'currency', currency: LOJA.moeda }); } catch(e){}
  }
  function eur(v){
    if (fmtMoeda) return fmtMoeda.format(v);
    return '€ ' + v.toFixed(2).replace('.', ',');
  }
  function precoBundle(b){
    return LOJA.precoBase * b.q * (1 - b.off/100);
  }
  function precoCheio(b){
    return LOJA.precoBase * b.q;
  }

  /* ── Bundles: gerados a partir da config ── */
  var elBundles = document.getElementById('bundles');
  LOJA.bundles.forEach(function(b, i){
    var total = precoBundle(b), cheio = precoCheio(b);
    var best = (i === LOJA.bundles.length - 1) && LOJA.bundles.length > 1;
    var textoFrete = (b.q === 1) ? t('frete1', '') : t('freteN', '');
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'rlp-bundle' + (best ? ' rlp-best' : '');
    el.setAttribute('data-bundle', i);
    el.setAttribute('aria-pressed', i === estado.bundle ? 'true' : 'false');
    var melhor = t('melhor', '');
    var porPeca = t('porPeca', 'por peça');
    var experimentar = t('experimentar', '');
    el.innerHTML =
      (best && melhor ? '<span class="rlp-best-tag">' + melhor + '</span>' : '') +
      '<span class="rlp-radio"></span>' +
      '<span class="rlp-b-info">' +
        '<b>' + b.q + ' ' + (b.q > 1 ? t('pecas', 'peças') : t('peca', 'peça')) + '</b>' +
        (b.q > 1 ? '<small class="rlp-num">' + eur(total / b.q) + ' ' + porPeca + '</small>' : (experimentar ? '<small>' + experimentar + '</small>' : '')) +
        '<span class="rlp-b-chips">' +
          (b.off ? '<span class="rlp-chip rlp-off rlp-num">' + tn('off', '[n]% OFF', b.off) + '</span>' : '') +
          (textoFrete ? '<span class="rlp-chip rlp-free">' + textoFrete + '</span>' : '') +
        '</span>' +
      '</span>' +
      '<span class="rlp-b-price">' +
        '<b class="rlp-num">' + eur(total) + '</b>' +
        (b.off ? '<s class="rlp-num">' + eur(cheio) + '</s>' : (b.q === 1 && LOJA.precoComparacao > LOJA.precoBase ? '<s class="rlp-num">' + eur(LOJA.precoComparacao) + '</s>' : '')) +
      '</span>';
    elBundles.appendChild(el);
  });

  /* ── Escolha peça a peça ──
     A partir de 2 unidades cada peça pode ter cor e tamanho
     próprios. O carrinho da Shopify aceita várias variantes no
     mesmo link: /cart/id1:1,id2:2 */
  var CORES = [].map.call(document.querySelectorAll('#cores [data-cor]'), function(b){
    return { v: b.getAttribute('data-cor'), nome: b.getAttribute('data-nome') };
  });
  var TAMANHOS = [].map.call(document.querySelectorAll('#tamanhos [data-size]'), function(b){
    return { v: b.getAttribute('data-size'), nome: b.getAttribute('data-nome') || b.getAttribute('data-size') };
  });
  var maxPecas = LOJA.bundles.reduce(function(m, b){ return Math.max(m, b.q); }, 1);
  for (var iP = 0; iP < maxPecas; iP++){
    estado.pecas.push({ cor: estado.cor, size: estado.size });
  }

  var elPecas   = document.getElementById('pecas');
  var pecasWrap = document.getElementById('pecasWrap');

  for (var n = 0; n < maxPecas; n++){
    var rotulo = tn('pecaN', 'Peça [n]', n + 1);
    var linha = document.createElement('div');
    linha.className = 'rlp-peca';
    linha.innerHTML =
      '<span class="rlp-peca-n">' + rotulo + '</span>' +
      '<select data-campo="cor" data-peca="' + n + '" aria-label="' + rotulo + '">' +
        CORES.map(function(c){ return '<option value="' + c.v + '">' + c.nome + '</option>'; }).join('') +
      '</select>' +
      '<select data-campo="size" data-peca="' + n + '" aria-label="' + rotulo + '">' +
        TAMANHOS.map(function(x){ return '<option value="' + x.v + '">' + x.nome + '</option>'; }).join('') +
      '</select>';
    elPecas.appendChild(linha);
  }

  function nomeCor(v){
    for (var i = 0; i < CORES.length; i++){ if (CORES[i].v === v) return CORES[i].nome; }
    return v;
  }
  function nomeTam(v){
    for (var i = 0; i < TAMANHOS.length; i++){ if (TAMANHOS[i].v === v) return TAMANHOS[i].nome; }
    return v;
  }

  /* A peça 1 é sempre a mesma seleção dos botões de cor/tamanho
     no topo — este par de funções mantém os dois lados iguais. */
  function aplicarNoTopo(p){
    var bc = document.querySelector('#cores [data-cor="' + p.cor + '"]');
    if (bc){
      document.querySelectorAll('#cores [data-cor]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      bc.setAttribute('aria-pressed','true');
      estado.cor = p.cor;
      estado.corNome = bc.getAttribute('data-nome');
      document.getElementById('corVal').textContent = estado.corNome;
      trocarFoto(bc.getAttribute('data-img'));
    }
    var bt = document.querySelector('#tamanhos [data-size="' + p.size + '"]');
    if (bt){
      document.querySelectorAll('#tamanhos [data-size]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      bt.setAttribute('aria-pressed','true');
      estado.size = p.size;
    }
  }

  function sincronizarPecas(){
    var q = LOJA.bundles[estado.bundle].q;
    pecasWrap.hidden = q < 2;
    estado.pecas[0].cor  = estado.cor;
    estado.pecas[0].size = estado.size;
    [].forEach.call(elPecas.children, function(l, i){
      l.hidden = i >= q;
      l.querySelector('[data-campo="cor"]').value  = estado.pecas[i].cor;
      l.querySelector('[data-campo="size"]').value = estado.pecas[i].size;
    });
  }

  elPecas.addEventListener('change', function(e){
    var s = e.target.closest('select');
    if (!s) return;
    var i = parseInt(s.getAttribute('data-peca'), 10);
    estado.pecas[i][s.getAttribute('data-campo')] = s.value;
    if (i === 0) aplicarNoTopo(estado.pecas[0]);
    atualizar();
  });

  /* ── Texto e links ── */
  function txt(id, v){ var e = document.getElementById(id); if (e) e.textContent = v; }
  var anoEl = document.getElementById('ano'); if (anoEl) anoEl.textContent = new Date().getFullYear();

  /* Junta as peças no formato do carrinho, somando as repetidas:
     duas peças iguais viram "id:2" em vez de "id:1,id:1". */
  function itensCarrinho(){
    var q = LOJA.bundles[estado.bundle].q;
    var ordem = [], contas = {};
    for (var i = 0; i < q; i++){
      var p  = estado.pecas[i];
      var id = LOJA.variantes[p.cor + '|' + p.size];
      if (!id) return '';
      if (!contas[id]){ contas[id] = 0; ordem.push(id); }
      contas[id]++;
    }
    return ordem.map(function(id){ return id + ':' + contas[id]; }).join(',');
  }

  function urlCheckout(){
    var b = LOJA.bundles[estado.bundle];
    var itens = itensCarrinho();
    if (!LOJA.dominio || !itens) return '#comprar';

    var params = [];
    if (b.codigo) params.push('discount=' + encodeURIComponent(b.codigo));

    /* Leva o fbclid do anúncio para o checkout (atribuição do pixel). */
    var clique = location.search.match(/[?&]fbclid=([^&]+)/);
    if (clique) params.push('fbclid=' + clique[1]);

    var url = LOJA.dominio.replace(/\/$/,'') + '/cart/' + itens;
    return params.length ? url + '?' + params.join('&') : url;
  }

  function resumoPecas(b){
    var un = function(q){ return q + ' ' + (q > 1 ? t('pecas', 'peças') : t('peca', 'peça')); };
    var cor = estado.corNome ? estado.corNome + ' · ' : '';
    if (b.q === 1) return cor + nomeTam(estado.size) + ' · ' + un(1);
    var iguais = true, partes = [];
    for (var i = 0; i < b.q; i++){
      var p = estado.pecas[i];
      if (p.cor !== estado.pecas[0].cor || p.size !== estado.pecas[0].size) iguais = false;
      partes.push(nomeCor(p.cor) + ' ' + nomeTam(p.size));
    }
    return iguais
      ? cor + nomeTam(estado.size) + ' · ' + un(b.q)
      : partes.join(' + ');
  }

  function atualizar(){
    var b = LOJA.bundles[estado.bundle];
    sincronizarPecas();
    var total = precoBundle(b);
    var resumo = resumoPecas(b);

    txt('precoAtual', eur(total));
    var temAntigo = b.off || LOJA.precoComparacao > LOJA.precoBase;
    txt('precoAntigo', b.off ? eur(precoCheio(b)) : (temAntigo ? eur(LOJA.precoComparacao) : ''));
    var pct = b.off || Math.round((1 - LOJA.precoBase / LOJA.precoComparacao) * 100);
    txt('poupanca', pct > 0 ? tn('economize', 'Economize [n]%', pct) : '');
    txt('ctaPrincipal', t('comprar', 'Comprar') + ' — ' + eur(total));
    txt('ctaFinal', t('comprarFinal', 'Comprar agora') + ' — ' + eur(total));
    txt('dockResumo', resumo + ' — ' + eur(total));
    document.querySelectorAll('[data-final-preco]').forEach(function(e){ e.textContent = eur(total); });
    document.querySelectorAll('[data-final-antigo]').forEach(function(e){ e.textContent = b.off ? eur(precoCheio(b)) : (temAntigo ? eur(LOJA.precoComparacao) : ''); });

    var url = urlCheckout();
    document.querySelectorAll('[data-buy]').forEach(function(a){ a.setAttribute('href', url); });
    try { document.dispatchEvent(new CustomEvent('rlp:mudou')); } catch(e){}
  }

  elBundles.addEventListener('click', function(e){
    var el = e.target.closest('[data-bundle]');
    if (!el) return;
    this.querySelectorAll('[data-bundle]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
    el.setAttribute('aria-pressed','true');
    estado.bundle = parseInt(el.getAttribute('data-bundle'), 10);
    atualizar();
  });

  /* ── Galeria ── */
  var mainShot = document.getElementById('mainShot');
  var mainImg  = document.getElementById('mainImg');
  function trocarFoto(src){
    if (!src) return;
    mainShot.setAttribute('data-ph', src);
    mainImg.style.display = '';
    mainImg.hidden = false;
    mainImg.removeAttribute('srcset');
    mainImg.src = src;
  }
  document.getElementById('thumbs').addEventListener('click', function(e){
    var fig = e.target.closest('[data-src]');
    if (!fig) return;
    this.querySelectorAll('[data-src]').forEach(function(f){ f.setAttribute('aria-current','false'); });
    fig.setAttribute('aria-current','true');
    trocarFoto(fig.getAttribute('data-src'));
  });

  /* ── Cor / tamanho ── */
  document.getElementById('cores').addEventListener('click', function(e){
    var b = e.target.closest('[data-cor]');
    if (!b) return;
    this.querySelectorAll('[data-cor]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
    b.setAttribute('aria-pressed','true');
    estado.cor = b.getAttribute('data-cor');
    estado.corNome = b.getAttribute('data-nome');
    document.getElementById('corVal').textContent = estado.corNome;
    trocarFoto(b.getAttribute('data-img'));
    atualizar();
  });
  document.getElementById('tamanhos').addEventListener('click', function(e){
    var b = e.target.closest('[data-size]');
    if (!b) return;
    this.querySelectorAll('[data-size]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
    b.setAttribute('aria-pressed','true');
    estado.size = b.getAttribute('data-size');
    atualizar();
  });

  /* ── Adicionar ao carrinho (carrinho lateral RLP) ── */
  function itensLista(){
    var q = LOJA.bundles[estado.bundle].q, contas = {}, ordem = [];
    for (var i = 0; i < q; i++){
      var p = estado.pecas[i], id = LOJA.variantes[p.cor + '|' + p.size];
      if (!id) return null;
      if (!contas[id]){ contas[id] = 0; ordem.push(id); }
      contas[id]++;
    }
    return ordem.map(function(id){ return { id: id, quantity: contas[id] }; });
  }
  window.RLP = {
    variante: function(){
      var id = LOJA.variantes[estado.cor + '|' + estado.size];
      if (!id) return null;
      var bc = document.querySelector('#cores [data-cor="' + estado.cor + '"]');
      return { id: id, price: Math.round(LOJA.precoBase * 100),
               label: (estado.corNome ? estado.corNome + ' · ' : '') + nomeTam(estado.size),
               img: bc ? bc.getAttribute('data-img') : '' };
    }
  };
  document.addEventListener('click', function(e){
    var comprar = e.target.closest('[data-buy]');
    var btn = comprar || e.target.closest('[data-add-cart]');
    if (!btn) return;
    var itens = itensLista(), b = LOJA.bundles[estado.bundle];
    if (!itens || !window.RLPCart) return; /* sem carrinho lateral: segue o link normal */
    e.preventDefault();
    if (comprar){
      /* Compra direta: soma ao carrinho (sem apagar o que já está lá) e vai ao checkout */
      if (btn.classList.contains('is-loading')) return;
      btn.classList.add('is-loading');
      window.RLPCart.add(itens, b.codigo ? { code: b.codigo, tipo: 'pack', q: b.q, productId: LOJA.produtoId } : null, { checkout: true })
        .catch(function(){ btn.classList.remove('is-loading'); location.href = urlCheckout(); });
      return;
    }
    var lbl = btn.querySelector('[data-add-cart-txt]'), antes = lbl ? lbl.textContent : '';
    btn.disabled = true; btn.classList.add('is-loading'); if (lbl) lbl.textContent = t('adicionando', 'Adicionando…');
    var fim = function(){ btn.disabled = false; btn.classList.remove('is-loading'); if (lbl) lbl.textContent = antes; };
    window.RLPCart.add(itens, b.codigo ? { code: b.codigo, tipo: 'pack', q: b.q, productId: LOJA.produtoId } : null)
      .then(fim, function(err){ fim(); alert((err && (err.description || err.message)) || t('erro', 'Não foi possível adicionar ao carrinho.')); });
  });

  atualizar();

  /* ── Guia de medidas ── */
  var guia = document.getElementById('guia');
  var abrirGuia = document.getElementById('abrirGuia');
  if (abrirGuia && guia){
    abrirGuia.addEventListener('click', function(){
      if (guia.showModal) guia.showModal();
    });
    document.getElementById('fecharGuia').addEventListener('click', function(){ guia.close(); });
    guia.addEventListener('click', function(e){ if (e.target === guia) guia.close(); });
  }

  /* ── Dock após o hero ── */
  var dock = document.getElementById('dock');
  var hero = document.querySelector('.rlp-hero');
  if ('IntersectionObserver' in window && dock && hero){
    new IntersectionObserver(function(entries){
      dock.classList.toggle('rlp-on', !entries[0].isIntersecting);
    }, { rootMargin:'-60% 0px 0px 0px' }).observe(hero);
  }

  /* ── Reveal por posição (não perde blocos em scroll rápido) ── */
  var rvs = Array.prototype.slice.call(document.querySelectorAll('.rlp-rv'));
  rvs.forEach(function(el, i){ el.style.transitionDelay = (i % 3) * 80 + 'ms'; });
  var agendado = false;
  function verificar(){
    agendado = false;
    var limite = window.innerHeight * 0.92;
    for (var i = rvs.length - 1; i >= 0; i--){
      if (rvs[i].getBoundingClientRect().top < limite){
        rvs[i].classList.add('rlp-in');
        rvs.splice(i, 1);
      }
    }
    if (!rvs.length){
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
    }
  }
  function pedir(){
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(verificar);
  }
  window.addEventListener('scroll', pedir, { passive:true });
  window.addEventListener('resize', pedir);
  window.addEventListener('load', pedir);
  verificar();


})();
