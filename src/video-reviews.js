(() => {
  const X = [0, 0.64, 1.1, 1.44];
  const S = [1, 0.86, 0.74, 0.64];
  const RY = [0, 30, 42, 50];
  const TZ = [0, -50, -110, -170];

  function init(root) {
    if (root.dataset.vrInit) return;
    root.dataset.vrInit = '1';
    const stage = root.querySelector('[data-vr-stage]');
    const cards = [...root.querySelectorAll('[data-vr-card]')];
    const n = cards.length;
    if (!stage || !n) return;
    let cur = 0;
    let startX = null;
    let swiped = false;

    const stop = () => {
      root.querySelectorAll('.vr__video').forEach((v) => { v.pause(); v.remove(); });
      cards.forEach((c) => c.classList.remove('is-playing'));
    };

    const render = () => {
      cards.forEach((c, i) => {
        let o = (((i - cur) % n) + n) % n;
        if (o > n / 2) o -= n;
        const abs = Math.abs(o);
        const a = Math.min(abs, 3);
        c.style.setProperty('--x', Math.sign(o) * X[a]);
        c.style.setProperty('--s', S[a]);
        c.style.setProperty('--ry', (o > 0 ? -RY[a] : RY[a]) + 'deg');
        c.style.setProperty('--tz', TZ[a] + 'px');
        c.style.zIndex = 10 - a;
        c.dataset.a = abs > 3 ? 'h' : a;
        if (o) c.setAttribute('aria-hidden', 'true');
        else c.removeAttribute('aria-hidden');
        c.querySelectorAll('a,button').forEach((el) => { el.tabIndex = o ? -1 : 0; });
      });
    };

    const go = (i) => {
      cur = ((i % n) + n) % n;
      stop();
      render();
    };

    const play = (card) => {
      const src = card.dataset.src;
      if (!src) return;
      stop();
      const v = document.createElement('video');
      v.className = 'vr__video';
      v.src = src;
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.addEventListener('ended', stop);
      card.querySelector('.vr__media').appendChild(v);
      card.classList.add('is-playing');
      v.play().catch(() => {});
    };

    root._vrGo = go;
    root.querySelector('[data-vr-prev]')?.addEventListener('click', () => go(cur - 1));
    root.querySelector('[data-vr-next]')?.addEventListener('click', () => go(cur + 1));

    stage.addEventListener('click', (e) => {
      if (swiped) { swiped = false; e.preventDefault(); return; }
      const card = e.target.closest('[data-vr-card]');
      if (!card) return;
      const i = cards.indexOf(card);
      if (i !== cur) { e.preventDefault(); go(i); return; }
      if (e.target.closest('[data-vr-play]')) play(card);
    });

    stage.addEventListener('pointerdown', (e) => {
      swiped = false;
      startX = e.target.closest('.vr__video, .vr__arrow') ? null : e.clientX;
    }, { passive: true });
    stage.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const d = e.clientX - startX;
      startX = null;
      if (Math.abs(d) > 40) { swiped = true; go(cur + (d < 0 ? 1 : -1)); }
    }, { passive: true });
    stage.addEventListener('pointercancel', () => { startX = null; });

    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(cur - 1);
      else if (e.key === 'ArrowRight') go(cur + 1);
    });
  }

  const all = (scope) => (scope || document).querySelectorAll('[data-vr]').forEach(init);
  all();
  document.addEventListener('shopify:section:load', (e) => all(e.target));
  document.addEventListener('shopify:block:select', (e) => {
    const card = e.target.closest && e.target.closest('[data-vr-card]');
    const root = card && card.closest('[data-vr]');
    if (root && root._vrGo) root._vrGo([...root.querySelectorAll('[data-vr-card]')].indexOf(card));
  });
})();
