/* RODRIGUES Leve v2 — JavaScript único do tema (vanilla, sem dependências).
   Fonte legível. O arquivo publicado em assets/theme.js é a versão minificada (npm run build). */
(() => {
  const T = window.theme || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const on = (el, ev, sel, fn) => el.addEventListener(ev, (e) => {
    const t = e.target.closest(sel);
    if (t && el.contains(t)) fn(e, t);
  });
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const parse = (html) => new DOMParser().parseFromString(html, 'text/html');

  /* ---------- Dinheiro ---------- */
  const formatMoney = (cents, format = T.moneyFormat || '${{amount}}') => {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    const fmt = (n, dec, th = ',', ds = '.') => {
      if (isNaN(n) || n == null) return '0';
      n = (n / 100).toFixed(dec);
      const [i, d] = n.split('.');
      return i.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + th) + (d ? ds + d : '');
    };
    const m = format.match(/\{\{\s*(\w+)\s*\}\}/);
    if (!m) return format;
    let v;
    switch (m[1]) {
      case 'amount_no_decimals': v = fmt(cents, 0); break;
      case 'amount_with_comma_separator': v = fmt(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': v = fmt(cents, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': v = fmt(cents, 2, "'", '.'); break;
      case 'amount_with_space_separator': v = fmt(cents, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': v = fmt(cents, 0, ' ', ','); break;
      default: v = fmt(cents, 2);
    }
    return format.replace(m[0], v);
  };
  // money_without_trailing_zeros
  const formatMoneyShort = (cents) => formatMoney(cents).replace(/([.,])00(?!\d)/, '');
  T.formatMoney = formatMoney;

  /* ---------- Bloqueio de scroll / gavetas ---------- */
  const lock = (v) => document.body.classList.toggle('lock', v);
  const openPanel = (el) => { el.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open'))); lock(true); const f = $('[data-autofocus], .drawer__close', el); f && f.focus({ preventScroll: true }); };
  const closePanel = (el) => { el.classList.remove('is-open'); lock(false); setTimeout(() => { if (!el.classList.contains('is-open')) el.hidden = true; }, 300); };
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('.is-open[data-panel]').forEach(closePanel);
    document.documentElement.classList.remove('search-open');
    $$('details[open].menu__item, details[open].facet').forEach((d) => d.removeAttribute('open'));
  });
  on(document, 'click', '[data-panel-open]', (e, b) => { const p = document.getElementById(b.dataset.panelOpen); if (p) { e.preventDefault(); openPanel(p); } });
  on(document, 'click', '[data-panel-close]', (e, b) => { e.preventDefault(); closePanel(b.closest('[data-panel]')); });

  /* ---------- Carrinho ---------- */
  const cartSections = () => {
    const ids = $$('[data-cart-section]').map((el) => el.dataset.cartSection);
    if ($('#cart-icon-bubble')) ids.push('cart-icon-bubble');
    return [...new Set(ids)];
  };
  const renderSections = (sections) => {
    if (!sections) return;
    Object.entries(sections).forEach(([id, html]) => {
      if (!html) return;
      const doc = parse(html);
      if (id === 'cart-icon-bubble') {
        const src = $('#cart-icon-bubble', doc), dst = $('#cart-icon-bubble');
        if (src && dst) dst.innerHTML = src.innerHTML;
        return;
      }
      $$(`[data-cart-section="${id}"]`).forEach((dst) => {
        const src = $(`[data-cart-section="${id}"]`, doc);
        if (src) dst.innerHTML = src.innerHTML;
      });
    });
    document.dispatchEvent(new CustomEvent('cart:updated'));
  };
  const cartRequest = async (url, body) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...body, sections: cartSections(), sections_url: location.pathname }) });
    const data = await res.json();
    if (!res.ok || data.status) throw new Error(data.description || data.message || T.strings.cartError);
    return data;
  };
  const cartDrawer = () => $('#CartDrawer');
  const openCart = () => { const d = cartDrawer(); if (d) openPanel(d); };
  T.openCart = openCart;

  const changeLine = async (line, quantity, el) => {
    const item = el && el.closest('.cart-item');
    item && item.classList.add('is-loading');
    try {
      const data = await cartRequest(T.routes.cartChange + '.js', { line, quantity });
      renderSections(data.sections);
    } catch (err) {
      item && item.classList.remove('is-loading');
      const e = item && $('[data-line-error]', item);
      if (e) e.textContent = err.message; else alert(err.message);
    }
  };
  on(document, 'click', '[data-cart-remove]', (e, b) => { e.preventDefault(); changeLine(+b.dataset.cartRemove, 0, b); });
  on(document, 'change', '[data-cart-qty]', (e, i) => changeLine(+i.dataset.cartQty, Math.max(0, parseInt(i.value, 10) || 0), i));
  on(document, 'click', '[data-cart-open]', (e) => { if (cartDrawer() && T.cartType === 'drawer') { e.preventDefault(); openCart(); } });
  on(document, 'change', '[data-cart-note]', (e, t) => fetch(T.routes.cart + '/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: t.value }) }));
  on(document, 'submit', '[data-discount-form]', async (e, f) => {
    e.preventDefault();
    const code = f.elements.discount.value.trim();
    if (!code) return;
    const btn = $('button', f); btn.classList.add('is-loading');
    try { renderSections((await cartRequest(T.routes.cart + '/update.js', { discount: code })).sections); } catch (err) { alert(err.message); }
    btn.classList.remove('is-loading');
  });

  /* ---------- Quantidade +/- ---------- */
  on(document, 'click', '[data-qty-btn]', (e, b) => {
    e.preventDefault();
    const input = $('input', b.closest('.qty'));
    const step = +input.step || 1, min = input.min !== '' ? +input.min : 0, max = input.max ? +input.max : Infinity;
    const v = Math.min(max, Math.max(min, (+input.value || 0) + (b.dataset.qtyBtn === 'plus' ? step : -step)));
    if (v !== +input.value) { input.value = v; input.dispatchEvent(new Event('change', { bubbles: true })); }
  });

  /* ---------- Formulário de produto (AJAX) ---------- */
  const collectItems = (form) => {
    const fd = new FormData(form);
    const properties = {};
    for (const [k, v] of fd.entries()) {
      const m = k.match(/^properties\[(.+)\]$/);
      if (m && v !== '') properties[m[1]] = v;
    }
    const id = +fd.get('id');
    let quantity = +fd.get('quantity') || 1;
    // Quantity breaks: quantidade vem do rádio selecionado (pode estar fora do form via atributo form=)
    const qb = form.getAttribute("id") && document.querySelector(`input[type="radio"][name="quantity"][form="${form.getAttribute("id")}"]:checked`);
    if (qb) {
      quantity = +qb.value || 1;
      const selects = $$('[data-qb-unit]', qb.closest('.qb__opt'));
      if (selects.length) {
        const map = new Map();
        selects.forEach((u) => { const vid = +u.dataset.variantId || id; map.set(vid, (map.get(vid) || 0) + 1); });
        return [...map].map(([vid, q]) => ({ id: vid, quantity: q, properties }));
      }
    }
    return [{ id, quantity, properties }];
  };
  on(document, 'submit', 'form[data-product-form]', async (e, form) => {
    e.preventDefault();
    const btn = $('[type="submit"]', form) || $(`[type="submit"][form="${form.getAttribute("id")}"]`);
    const err = $('[data-form-error]', form.closest('[data-product-root]') || form);
    if (btn && btn.getAttribute('aria-disabled') === 'true') return;
    btn && btn.classList.add('is-loading');
    $$(`[form="${form.getAttribute("id")}"][type="submit"]`).forEach((b) => b.classList.add('is-loading'));
    if (err) err.hidden = true;
    try {
      const data = await cartRequest(T.routes.cartAdd + '.js', { items: collectItems(form) });
      if (form.dataset.skipCart === 'true') { location.href = '/checkout'; return; }
      if (T.cartType !== 'drawer' || !cartDrawer()) { location.href = T.routes.cart; return; }
      renderSections(data.sections);
      openCart();
    } catch (ex) {
      if (err) { err.textContent = ex.message; err.hidden = false; } else alert(ex.message);
    } finally {
      $$('.is-loading').forEach((b) => b.classList.remove('is-loading'));
    }
  });

  /* ---------- Sliders (scroll-snap) ---------- */
  const initSlider = (root) => {
    if (root._s) return; root._s = 1;
    const track = $('[data-slider-track]', root);
    if (!track) return;
    const prev = $('[data-slider-prev]', root), next = $('[data-slider-next]', root);
    const dots = $$('[data-slider-dot]', root);
    const counter = $('[data-slider-current]', root);
    const slides = () => Array.from(track.children).filter((c) => c.offsetParent !== null);
    const index = () => { const s = slides(); if (!s.length) return 0; const x = track.scrollLeft; let best = 0, d = Infinity; s.forEach((el, i) => { const dd = Math.abs(el.offsetLeft - track.offsetLeft - x); if (dd < d) { d = dd; best = i; } }); return best; };
    const go = (i) => { const s = slides(); const el = s[Math.max(0, Math.min(s.length - 1, i))]; if (el) track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: 'smooth' }); };
    const update = () => {
      const i = index(), max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2 && !root.hasAttribute('data-loop');
      if (next) next.disabled = track.scrollLeft >= max && !root.hasAttribute('data-loop');
      dots.forEach((d, n) => d.setAttribute('aria-current', n === i));
      if (counter) counter.textContent = i + 1;
      root.dispatchEvent(new CustomEvent('slider:change', { detail: i }));
    };
    let raf; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    const step = (dir) => { const s = slides(); const i = index(); if (root.hasAttribute('data-loop') && ((dir > 0 && track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) || (dir < 0 && track.scrollLeft <= 2))) return go(dir > 0 ? 0 : s.length - 1); const per = Math.max(1, Math.round(track.clientWidth / (s[0] ? s[0].offsetWidth : 1))); go(i + dir * (root.dataset.step === 'page' ? per : 1)); };
    prev && prev.addEventListener('click', () => step(-1));
    next && next.addEventListener('click', () => step(1));
    dots.forEach((d, n) => d.addEventListener('click', () => go(n)));
    root._go = go; root._index = index;
    const auto = +root.dataset.autoplay;
    if (auto) { let t = setInterval(() => step(1), auto * 1000); root.addEventListener('pointerenter', () => clearInterval(t)); }
    update();
  };

  /* ---------- Galeria de produto ---------- */
  const initGallery = (g) => {
    initSlider(g);
    const thumbs = $$('[data-thumb]', g);
    g.addEventListener('slider:change', (e) => {
      thumbs.forEach((t, n) => t.setAttribute('aria-current', n === e.detail));
      const t = thumbs[e.detail]; if (t) { const bar = t.parentElement; bar.scrollTo({ left: t.offsetLeft - bar.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' }); }
      $$('video', g).forEach((v) => v.pause());
    });
    thumbs.forEach((t, n) => t.addEventListener('click', () => g._go(n)));
    g._goMedia = (mediaId) => { const s = $$('[data-media-id]', $('[data-slider-track]', g)); const i = s.findIndex((el) => el.dataset.mediaId == mediaId); if (i > -1) g._go(i); };
  };
  on(document, 'click', '[data-deferred-media]', (e, b) => {
    const tpl = $('template', b.parentElement);
    if (!tpl) return;
    const node = tpl.content.firstElementChild.cloneNode(true);
    b.replaceWith(node);
    if (node.tagName === 'VIDEO') node.play();
  });

  /* ---------- Seletor de variantes ---------- */
  const initProduct = (root) => {
    if (root._p) return; root._p = 1;
    const json = $('[data-product-json]', root);
    if (!json) return;
    const product = JSON.parse(json.textContent);
    const form = $('form[data-product-form]', root);
    const idInput = form && form.elements.id;
    const picker = $('[data-variant-picker]', root);
    const gallery = $('[data-gallery]', root);
    const sticky = $('[data-sticky-atc]');
    const getOptions = () => product.options.map((_, i) => { const c = picker && ($(`[data-option-index="${i}"] input:checked`, picker) || $(`select[data-option-index="${i}"]`, picker)); return c ? c.value : null; });
    const find = (opts) => product.variants.find((v) => v.options.every((o, i) => opts[i] == null || o === opts[i]));
    const markAvailability = (opts) => {
      if (!picker) return;
      product.options.forEach((_, i) => {
        $$(`[data-option-index="${i}"] input`, picker).forEach((input) => {
          const test = opts.slice(); test[i] = input.value;
          const ok = product.variants.some((v) => v.available && v.options.every((o, j) => j > i ? true : o === test[j]));
          input.classList.toggle('is-unavailable', !ok);
        });
      });
    };
    const setButtons = (v) => {
      $$('[data-atc]', root.ownerDocument).forEach((b) => {
        if (!b.closest('[data-product-root]') && !b.closest('[data-sticky-atc]')) return;
        const label = $('[data-atc-label]', b) || b;
        const ok = v && v.available;
        b.setAttribute('aria-disabled', !ok);
        b.disabled = !ok;
        label.textContent = !v ? T.strings.unavailable : ok ? (b.dataset.label || T.strings.addToCart) : T.strings.soldOut;
      });
    };
    const updatePrices = (v) => {
      $$('[data-price-root]', root).forEach((p) => {
        const sale = $('.price__sale', p), cmp = $('.price__compare', p), badge = $('.badge--sale', p);
        const onSale = v.compare_at_price > v.price;
        if (sale) sale.textContent = formatMoney(v.price);
        p.classList.toggle('price--on-sale', onSale);
        if (cmp) { cmp.hidden = !onSale; cmp.lastChild.textContent = formatMoney(v.compare_at_price || 0); }
        if (badge) { badge.hidden = !onSale; if (onSale && badge.dataset.text) badge.textContent = badge.dataset.text.replace('[percentage]', Math.round((v.compare_at_price - v.price) * 100 / v.compare_at_price)); }
      });
      // Quantity breaks
      $$('[data-qb-option]', root).forEach((o) => {
        const q = +o.dataset.q, pct = +o.dataset.pct, fixed = +o.dataset.fixed;
        const price = Math.round(v.price * q * pct - fixed);
        const base = o.dataset.cmp === 'compare_price' && v.compare_at_price > v.price ? v.compare_at_price : v.price;
        const compare = base * q, saved = compare - price;
        const p = $('[data-qb-price]', o), c = $('[data-qb-compare]', o), cap = $('[data-qb-caption]', o);
        if (p) p.textContent = formatMoneyShort(price);
        if (c) c.textContent = compare > price ? formatMoneyShort(compare) : '';
        if (cap) cap.textContent = cap.dataset.text.replace('[amount_saved]', formatMoneyShort(saved)).replace('[amount_saved_rounded]', formatMoneyShort(Math.round(saved / 100) * 100));
      });
      $$('[data-sku]', root).forEach((s) => { s.textContent = v.sku || ''; });
    };
    const apply = (v, opts) => {
      markAvailability(opts);
      $$('[data-selected-value]', root).forEach((s) => { const i = +s.dataset.selectedValue; s.textContent = opts[i] || ''; });
      setButtons(v);
      if (!v) return;
      if (idInput) { idInput.value = v.id; idInput.dispatchEvent(new Event('change', { bubbles: true })); }
      $$('[data-qb-unit]', root).forEach((u) => { if (!u.dataset.touched) u.dataset.variantId = v.id; });
      updatePrices(v);
      if (sticky) { const sp = $('[data-sticky-price]', sticky); if (sp) { sp.textContent = formatMoney(v.price); } const ss = $('select', sticky); if (ss) ss.value = v.id; }
      if (gallery && v.featured_media && gallery._goMedia) gallery._goMedia(v.featured_media.id);
      if (root.dataset.updateUrl !== 'false') history.replaceState(null, '', `${product.url || location.pathname}?variant=${v.id}`);
    };
    picker && picker.addEventListener('change', () => { const o = getOptions(); apply(find(o), o); });
    // Seletores por unidade nos quantity breaks
    on(root, 'change', '[data-qb-unit] select', (e, s) => {
      const unit = s.closest('[data-qb-unit]');
      const opts = $$('select', unit).map((x) => x.value);
      const v = find(opts);
      unit.dataset.touched = 1;
      if (v) unit.dataset.variantId = v.id;
    });
    // Sticky: select de variante
    sticky && on(sticky, 'change', 'select', (e, s) => {
      const v = product.variants.find((x) => x.id == s.value);
      if (!v) return;
      if (picker) v.options.forEach((val, i) => { const inp = $$(`[data-option-index="${i}"] input`, picker).find((x) => x.value === val); if (inp) inp.checked = true; const sel = $(`select[data-option-index="${i}"]`, picker); if (sel) sel.value = val; });
      apply(v, v.options);
    });
    if (gallery) initGallery(gallery);
    const o = getOptions(); markAvailability(o);
  };

  /* ---------- Sticky add to cart ---------- */
  const initSticky = () => {
    const s = $('[data-sticky-atc]');
    if (!s) return;
    if (s.dataset.when === 'always') { s.classList.add('is-visible'); return; }
    const target = document.getElementById(s.dataset.target);
    if (!target || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(([e]) => s.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(target);
    on(s, 'click', '[data-sticky-scroll]', (e, b) => { e.preventDefault(); let el; try { el = document.querySelector(b.dataset.stickyScroll); } catch (_) {} (el || target).scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  };

  /* ---------- Galeria de vídeos (carrega só no clique / quando visível) ---------- */
  on(document, 'click', '[data-vplay]', (e, b) => {
    const item = b.closest('.vgallery__item'), v = $('video', item);
    if (!v.src) v.src = v.dataset.src;
    if (v.paused) {
      $$('.vgallery__item.is-playing video').forEach((o) => { if (o !== v) { o.pause(); o.closest('.vgallery__item').classList.remove('is-playing'); } });
      v.muted = false; v.play().catch(() => { v.muted = true; v.play(); });
      item.classList.add('is-playing');
    } else { v.pause(); item.classList.remove('is-playing'); }
  });
  on(document, 'click', '.vgallery__item.is-playing video', (e, v) => { v.pause(); v.closest('.vgallery__item').classList.remove('is-playing'); });
  // Vídeos em loop automático (autoplay): só carregam quando entram na tela
  const lazyVideos = () => {
    const vids = $$('video[data-lazy-autoplay]');
    if (!vids.length) return;
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else if (v.src) v.pause();
    }), { rootMargin: '200px' });
    vids.forEach((v) => io.observe(v));
  };

  /* ---------- Header ---------- */
  const initHeader = () => {
    const h = $('[data-sticky-header]');
    if (h && h.dataset.stickyHeader === 'on-scroll-up') {
      let last = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        h.classList.toggle('header-sticky--hidden', y > last && y > 200);
        last = y;
      }, { passive: true });
    }
    // Fecha dropdowns ao clicar fora
    document.addEventListener('click', (e) => { $$('details[open].menu__item, details[open].facet').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); }); });
  };
  on(document, 'click', '[data-search-open]', (e) => { e.preventDefault(); document.documentElement.classList.add('search-open'); const i = $('#SearchModal input[type="search"]'); i && setTimeout(() => i.focus(), 50); });
  on(document, 'click', '[data-search-close]', (e) => { e.preventDefault(); document.documentElement.classList.remove('search-open'); });
  const predictive = debounce(async (input) => {
    const box = $('[data-predictive]', input.form);
    if (!box) return;
    const q = input.value.trim();
    if (q.length < 2) { box.innerHTML = ''; return; }
    try {
      const r = await fetch(`${T.routes.search}?q=${encodeURIComponent(q)}&section_id=predictive-search&resources[limit]=6&resources[limit_scope]=each`);
      const doc = parse(await r.text());
      const c = $('#predictive-search-results', doc);
      box.innerHTML = c ? c.innerHTML : '';
    } catch (e) { box.innerHTML = ''; }
  }, 250);
  on(document, 'input', '[data-predictive-input]', (e, i) => predictive(i));

  /* ---------- Filtros / ordenação / localização ---------- */
  on(document, 'change', '[data-autosubmit]', (e, el) => { const f = el.form || el.closest('form'); f && (f.requestSubmit ? f.requestSubmit() : f.submit()); });
  on(document, 'submit', 'form[data-facets]', (e, f) => {
    // remove parâmetros vazios para URLs limpas
    $$('input, select', f).forEach((i) => { if (i.name && i.value === '' ) i.disabled = true; });
  });

  /* ---------- Envio estimado ---------- */
  const initShipping = () => $$('[data-ship]').forEach((el) => {
    const days = el.dataset.days.split(',').map((s) => s.trim()), months = el.dataset.months.split(',').map((s) => s.trim());
    const add = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
    const sfx = (n) => ([1, 21, 31].includes(n) ? 'st' : [2, 22].includes(n) ? 'nd' : [3, 23].includes(n) ? 'rd' : 'th');
    const p2 = (n) => String(n).padStart(2, '0');
    const f = (d) => {
      const wd = days[(d.getDay() + 6) % 7], dd = d.getDate(), mm = months[d.getMonth()], mo = d.getMonth() + 1;
      switch (el.dataset.format) {
        case 'day_dd_mm': return `${wd}, ${dd}. ${mm}`;
        case 'mm_dd': return `${mm} ${dd}${sfx(dd)}`;
        case 'dd_mm': return `${dd}. ${mm}`;
        case 'day_dd_mm_numeric': return `${wd}, ${p2(dd)}. ${p2(mo)}.`;
        case 'dd_mm_numeric': return `${p2(dd)}. ${p2(mo)}.`;
        default: return `${wd}, ${mm} ${dd}${sfx(dd)}`;
      }
    };
    $$('[data-ship-start]', el).forEach((s) => { s.textContent = f(add(+el.dataset.min)); });
    $$('[data-ship-end]', el).forEach((s) => { s.textContent = f(add(+el.dataset.max)); });
  });

  /* ---------- Compartilhar ---------- */
  on(document, 'click', '[data-share]', async (e, b) => {
    e.preventDefault();
    const url = b.dataset.share || location.href;
    if (navigator.share) { try { await navigator.share({ url, title: document.title }); } catch (_) {} return; }
    try { await navigator.clipboard.writeText(url); b.dataset.done = '1'; const s = $('[data-share-msg]', b.parentElement); if (s) s.hidden = false; } catch (_) {}
  });

  /* ---------- Modais (dialog nativo) ---------- */
  on(document, 'click', '[data-dialog-open]', (e, b) => { const d = document.getElementById(b.dataset.dialogOpen); if (d && d.showModal) { e.preventDefault(); d.showModal(); } });
  on(document, 'click', '[data-dialog-close]', (e, b) => b.closest('dialog').close());
  on(document, 'click', 'dialog', (e, d) => { if (e.target === d) d.close(); });

  /* ---------- Barra de anúncios rotativa ---------- */
  const initAnnouncements = () => $$('[data-rotate]').forEach((w) => {
    const items = Array.from(w.children);
    if (items.length < 2) return;
    let i = 0;
    setInterval(() => { items[i].classList.remove('is-active'); i = (i + 1) % items.length; items[i].classList.add('is-active'); }, 4500);
  });

  /* ---------- Reveal on scroll (opcional) ---------- */
  const initReveal = () => {
    const els = $$('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -60px' });
    els.forEach((e) => io.observe(e));
  };


  /* ---------- Produtos relacionados (carregados só perto da tela) ---------- */
  const initRecommendations = () => $$('[data-recommendations]').forEach((el) => {
    if (el._r || el.children.length) return; el._r = 1;
    const load = async () => {
      try {
        const doc = parse(await (await fetch(el.dataset.recommendations)).text());
        const src = $('[data-recommendations]', doc);
        if (src && src.innerHTML.trim()) el.innerHTML = src.innerHTML; else el.hidden = true;
      } catch (_) { el.hidden = true; }
    };
    if (!('IntersectionObserver' in window)) return load();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
  });

  const init = (scope = document) => {
    $$('[data-slider]', scope).forEach((s) => { if (!s.hasAttribute('data-gallery')) initSlider(s); });
    $$('[data-product-root]', scope).forEach(initProduct);
  };
  const boot = () => { init(); initRecommendations(); initSticky(); initHeader(); initShipping(); initAnnouncements(); lazyVideos(); initReveal(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();

  // Editor de temas
  document.addEventListener('shopify:section:load', (e) => { init(e.target); initRecommendations(); initShipping(); lazyVideos(); initReveal(); $$('.reveal', e.target).forEach((x) => x.classList.add('is-in')); });
  document.addEventListener('shopify:block:select', (e) => { const s = e.target.closest('[data-slider]'); if (s && s._go) s._go(Array.from(e.target.parentElement.children).indexOf(e.target)); });
})();
