(function(){
  'use strict';

  /* Cor e tamanho iniciais = os botões marcados com aria-pressed="true" */
  var corIni  = document.querySelector('#cores [aria-pressed="true"]') || document.querySelector('#cores [data-cor]');
  var sizeIni = document.querySelector('#tamanhos [aria-pressed="true"]') || document.querySelector('#tamanhos [data-size]');
  var estado = { cor: corIni.getAttribute('data-cor'), corNome: corIni.getAttribute('data-nome'),
                 size: sizeIni.getAttribute('data-size'), bundle:0, pecas:[] };

  function eur(v){
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
    var best = (i === LOJA.bundles.length - 1);
    /* Portes grátis em qualquer encomenda, sem valor mínimo.
       No pack de 1 peça o texto leva a urgência do dia. */
    var textoFrete = (b.q === 1) ? 'Frete grátis só hoje' : 'Frete grátis';
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'rlp-bundle' + (best ? ' rlp-best' : '');
    el.setAttribute('data-bundle', i);
    el.setAttribute('aria-pressed', i === estado.bundle ? 'true' : 'false');
    el.innerHTML =
      (best ? '<span class="rlp-best-tag">Melhor custo-benefício</span>' : '') +
      '<span class="rlp-radio"></span>' +
      '<span class="rlp-b-info">' +
        '<b>' + b.q + (b.q > 1 ? ' peças' : ' peça') + '</b>' +
        (b.q > 1 ? '<small class="rlp-num">' + eur(total / b.q) + ' por peça</small>' : '<small>Para experimentar</small>') +
        '<span class="rlp-b-chips">' +
          (b.off ? '<span class="rlp-chip rlp-off rlp-num">' + b.off + '% OFF</span>' : '') +
          (textoFrete ? '<span class="rlp-chip rlp-free">' + textoFrete + '</span>' : '') +
        '</span>' +
      '</span>' +
      '<span class="rlp-b-price">' +
        '<b class="rlp-num">' + eur(total) + '</b>' +
        (b.off ? '<s class="rlp-num">' + eur(cheio) + '</s>' : (b.q === 1 ? '<s class="rlp-num">' + eur(LOJA.precoComparacao) + '</s>' : '')) +
      '</span>';
    elBundles.appendChild(el);
  });

  /* ── Escolha peça a peça ──────────────────────────────────
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
    var linha = document.createElement('div');
    linha.className = 'rlp-peca';
    linha.innerHTML =
      '<span class="rlp-peca-n">Peça ' + (n + 1) + '</span>' +
      '<select data-campo="cor" data-peca="' + n + '" aria-label="Cor da peça ' + (n + 1) + '">' +
        CORES.map(function(c){ return '<option value="' + c.v + '">' + c.nome + '</option>'; }).join('') +
      '</select>' +
      '<select data-campo="size" data-peca="' + n + '" aria-label="Tamanho da peça ' + (n + 1) + '">' +
        TAMANHOS.map(function(t){ return '<option value="' + t.v + '">' + t.nome + '</option>'; }).join('') +
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

    /* Leva o fbclid do anúncio para o domínio da Shopify. Sem isto
       o pixel de lá não consegue ligar a compra ao clique no
       anúncio, e a venda fica sem atribuição no Gestor de Anúncios. */
    var clique = location.search.match(/[?&]fbclid=([^&]+)/);
    if (clique) params.push('fbclid=' + clique[1]);

    var url = LOJA.dominio.replace(/\/$/,'') + '/cart/' + itens;
    return params.length ? url + '?' + params.join('&') : url;
  }

  function resumoPecas(b){
    if (b.q === 1) return estado.corNome + ' · ' + nomeTam(estado.size) + ' · 1 peça';
    var iguais = true, partes = [];
    for (var i = 0; i < b.q; i++){
      var p = estado.pecas[i];
      if (p.cor !== estado.pecas[0].cor || p.size !== estado.pecas[0].size) iguais = false;
      partes.push(nomeCor(p.cor) + ' ' + nomeTam(p.size));
    }
    return iguais
      ? estado.corNome + ' · ' + nomeTam(estado.size) + ' · ' + b.q + ' peças'
      : partes.join(' + ');
  }

  function atualizar(){
    var b = LOJA.bundles[estado.bundle];
    sincronizarPecas();
    var total = precoBundle(b);
    var resumo = resumoPecas(b);

    txt('precoAtual', eur(total));
    txt('precoAntigo', b.off ? eur(precoCheio(b)) : eur(LOJA.precoComparacao));
    var pct = b.off || Math.round((1 - LOJA.precoBase / LOJA.precoComparacao) * 100);
    txt('poupanca', 'Poupa ' + pct + '%');
    txt('ctaPrincipal', 'Comprar — ' + eur(total));
    txt('ctaFinal', 'Comprar agora — ' + eur(total));
    txt('dockResumo', resumo + ' — ' + eur(total));
    document.querySelectorAll('[data-final-preco]').forEach(function(e){ e.textContent = eur(total); });
    document.querySelectorAll('[data-final-antigo]').forEach(function(e){ e.textContent = b.off ? eur(precoCheio(b)) : eur(LOJA.precoComparacao); });

    var url = urlCheckout();
    document.querySelectorAll('[data-buy]').forEach(function(a){ a.setAttribute('href', url); });
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

  atualizar();

  /* ── Guia de medidas ── */
  var guia = document.getElementById('guia');
  document.getElementById('abrirGuia').addEventListener('click', function(){
    if (guia.showModal) guia.showModal();
  });
  document.getElementById('fecharGuia').addEventListener('click', function(){ guia.close(); });
  guia.addEventListener('click', function(e){ if (e.target === guia) guia.close(); });

  /* ── Dock após o hero ── */
  var dock = document.getElementById('dock');
  var hero = document.querySelector('.rlp-hero');
  if ('IntersectionObserver' in window){
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
