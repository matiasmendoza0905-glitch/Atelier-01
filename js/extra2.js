(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const EXT = ['webp', 'jpg', 'png', 'jpeg'], COL = ['#3B50CF', '#B85300', '#067006', '#A40BA3', '#3B50CF', '#B85300'];

/* Espacio para imagen: busca assets/ejemplos/<nombre>.webp|jpg|png|jpeg; si no existe, muestra el aviso */
function fillSlot(el) {
  const f = el.dataset.slot, hint = el.dataset.hint || ''; el.className = 'slot' + (el.hasAttribute('data-wide') ? ' wide' : ''); el.innerHTML = '';
  const urls = [`assets/ejemplos/${f}.webp`, (window.IMGMAP || {})[f], ...EXT.slice(1).map(e => `assets/ejemplos/${f}.${e}`)].filter(Boolean); const img = new Image(); let k = 0; img.alt = hint; img.loading = 'lazy';
  img.onerror = () => { if (++k < urls.length) img.src = urls[k]; else el.innerHTML = `<div class="slot-ph"><b>Aquí va tu imagen</b><span>assets/ejemplos/${f}.webp</span><small>${esc(hint)}</small></div>`; };
  img.onload = () => el.classList.add('has'); img.src = urls[0]; el.append(img);
}

/* Carrusel: botones, puntos, arrastre con mouse */
function enhance(c) {
  if (c.dataset.ok) return; c.dataset.ok = 1;
  let w = c.nextElementSibling; if (!w || !w.classList.contains('car-btns')) { w = document.createElement('div'); w.className = 'car-btns'; w.innerHTML = '<button type="button" aria-label="Anterior">‹</button><button type="button" aria-label="Siguiente">›</button>'; c.after(w); const [p, n] = $$('button', w); p.onclick = () => c.scrollBy({ left: -c.clientWidth * .8, behavior: 'smooth' }); n.onclick = () => c.scrollBy({ left: c.clientWidth * .8, behavior: 'smooth' }); }
  const kids = [...c.children], d = document.createElement('div'); d.className = 'dots'; d.innerHTML = kids.map((_, i) => `<button type="button" aria-label="Ir a ${i + 1}"></button>`).join(''); w.prepend(d);
  $$('button', d).forEach((b, i) => b.onclick = () => c.scrollTo({ left: kids[i].offsetLeft - c.offsetLeft, behavior: 'smooth' }));
  const upd = () => { const x = c.scrollLeft + c.clientWidth / 3; let a = 0; kids.forEach((k, i) => { if (k.offsetLeft - c.offsetLeft <= x) a = i; }); $$('button', d).forEach((b, i) => b.classList.toggle('on', i === a)); };
  c.addEventListener('scroll', upd, { passive: true }); upd();
  c.tabIndex = 0; c.addEventListener('keydown', e => { if (e.key === 'ArrowRight') c.scrollBy({ left: 300, behavior: 'smooth' }); if (e.key === 'ArrowLeft') c.scrollBy({ left: -300, behavior: 'smooth' }); });
  let x0, s0, drag = 0; c.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; x0 = e.clientX; s0 = c.scrollLeft; drag = 1; });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - x0; if (Math.abs(dx) > 5) { c.classList.add('drag'); c.scrollLeft = s0 - dx; } });
  addEventListener('pointerup', () => { drag = 0; setTimeout(() => c.classList.remove('drag'), 50); });
}

/* Explorador: rasgos / valores / tono, cada uno con 5 ejemplos y su imagen */
const card = (key, it, [k, t], n) => { const f = `${key}-${it.id}-${n + 1}`, h = (k === 'c' ? 'Captura de una conversación (Instagram, Facebook, TikTok o WhatsApp de Atelier) que muestre: ' : 'Foto o mockup de este ejemplo aplicado: ') + t;
  return `<article class="ex-card"><div data-slot="${f}" data-hint="${esc(h)}"></div><div class="ex-body"><span class="chip">${k === 'c' ? 'Conversación en redes' : 'Aplicación real'}</span><b>Ejemplo ${n + 1}</b><p>${esc(t)}</p></div></article>`; };
function explorer(host) {
  const key = host.dataset.explorer, D = MARCA[key];
  host.innerHTML = `<div class="tabs" role="tablist" aria-label="${esc(D.titulo)}">${D.items.map((it, i) => `<button type="button" role="tab" id="t-${key}-${i}" aria-selected="${!i}" aria-controls="p-${key}" data-i="${i}" style="--c:${COL[i % 6]}">${it.n}</button>`).join('')}</div><div class="panel" id="p-${key}" role="tabpanel"></div>`;
  const panel = $('.panel', host);
  const show = i => { const it = D.items[i]; $$('[role=tab]', host).forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
    panel.style.setProperty('--c', COL[i % 6]); panel.setAttribute('aria-labelledby', `t-${key}-${i}`);
    panel.innerHTML = `<div class="panel-head"><h3>${it.n}</h3><p>${esc(it.d)}</p><small>${it.ej.length} ejemplos · desliza, usa las flechas o arrastra</small></div><div data-carousel class="ex-row">${it.ej.map((e, n) => card(key, it, e, n)).join('')}</div>`;
    $$('[data-slot]', panel).forEach(fillSlot); enhance($('[data-carousel]', panel)); panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); };
  host.addEventListener('click', e => { const b = e.target.closest('[role=tab]'); if (b) show(+b.dataset.i); });
  host.addEventListener('keydown', e => { if (!['ArrowRight', 'ArrowLeft'].includes(e.key) || !e.target.matches('[role=tab]')) return; const t = $$('[role=tab]', host); let i = t.findIndex(b => b.getAttribute('aria-selected') === 'true'); i = (i + (e.key === 'ArrowRight' ? 1 : -1) + t.length) % t.length; show(i); t[i].focus(); });
  show(0);
}

/* Simulador de respuesta en la voz de Atelier */
function simulator(host) {
  const S = MARCA.simulador; let tk = 0;
  host.innerHTML = `<div class="sim"><div class="sim-menu" role="group" aria-label="Situaciones">${S.map((s, i) => `<button type="button" aria-pressed="${!i}" data-i="${i}">${esc(s.t)}</button>`).join('')}</div><div class="sim-phone"><div class="sim-top"><i></i><b>Atelier</b><small>en línea</small></div><div class="sim-chat" aria-live="polite"></div></div><aside class="sim-side"><h3></h3><p></p><div class="sim-tags"></div><div data-slot="tono-simulador" data-wide data-hint="Captura real de una conversación de Atelier con un cliente"></div></aside></div>`;
  const chat = $('.sim-chat', host), add = (cls, t) => { const b = document.createElement('div'); b.className = 'bub ' + cls; b.textContent = t; chat.append(b); chat.scrollTop = 9e4; return b; };
  const play = i => { const s = S[i], me = ++tk; $$('.sim-menu button', host).forEach((b, j) => b.setAttribute('aria-pressed', j === i)); chat.innerHTML = '';
    $('h3', host).textContent = s.t; $('.sim-side p', host).textContent = s.w; $('.sim-tags', host).innerHTML = s.tags.map(t => `<span>${t}</span>`).join('');
    add('cli', s.c); const dots = add('at typing', '···'); setTimeout(() => { if (me !== tk) return; dots.remove(); add('at', s.a); }, reduce ? 0 : 1100); };
  host.addEventListener('click', e => { const b = e.target.closest('.sim-menu button'); if (b) play(+b.dataset.i); }); fillSlot($('[data-slot]', host)); play(0);
}

/* Zoom para todas las imágenes del contenido */
const zoomable = im => im.closest('main') && !im.closest('a,button,.gallery-item,.lightbox,.zoom,.fly,.brand2') && !im.classList.contains('hero-video') && (!im.complete || im.naturalWidth > 80);
let zEl, zList = [], zi = 0, zLast;
function zShow(i) { zi = (i + zList.length) % zList.length; const im = zList[zi]; $('img', zEl).src = im.currentSrc || im.src; $('img', zEl).alt = im.alt; $('figcaption', zEl).textContent = `${im.alt || ''}  (${zi + 1} / ${zList.length})`; zEl.classList.remove('big'); }
function zOpen(im) {
  if (!zEl) { zEl = document.createElement('div'); zEl.className = 'zoom'; zEl.setAttribute('role', 'dialog'); zEl.setAttribute('aria-modal', 'true'); zEl.setAttribute('aria-label', 'Imagen ampliada');
    zEl.innerHTML = '<button class="z-x" type="button" aria-label="Cerrar">×</button><button class="z-p" type="button" aria-label="Anterior">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="z-n" type="button" aria-label="Siguiente">›</button>'; document.body.append(zEl);
    zEl.addEventListener('click', e => { if (e.target.closest('.z-p')) zShow(zi - 1); else if (e.target.closest('.z-n')) zShow(zi + 1); else if (e.target.closest('.z-x') || e.target === zEl || e.target.tagName === 'FIGURE') zClose(); else if (e.target.tagName === 'IMG') { const r = e.target.getBoundingClientRect(); e.target.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; zEl.classList.toggle('big'); } });
    let x0; zEl.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); zEl.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 60) zShow(zi + (d < 0 ? 1 : -1)); }); }
  zList = $$('main img').filter(zoomable); zShow(Math.max(0, zList.indexOf(im))); zLast = im; zEl.classList.add('open'); document.body.style.overflow = 'hidden'; $('.z-x', zEl).focus();
}
function zClose() { zEl.classList.remove('open', 'big'); document.body.style.overflow = ''; zLast?.focus?.(); }
document.addEventListener('click', e => { const im = e.target.closest('img'); if (im && zoomable(im)) { e.preventDefault(); zOpen(im); } });
document.addEventListener('keydown', e => { if (zEl?.classList.contains('open')) { if (e.key === 'Escape') zClose(); if (e.key === 'ArrowRight') zShow(zi + 1); if (e.key === 'ArrowLeft') zShow(zi - 1); } else if (e.key === 'Enter' && e.target.tagName === 'IMG' && zoomable(e.target)) zOpen(e.target); });
document.addEventListener('load', e => { const t = e.target; if (t.tagName === 'IMG' && zoomable(t)) { t.tabIndex = 0; t.setAttribute('role', 'button'); } }, true);

document.addEventListener('DOMContentLoaded', () => {
  $$('[data-explorer]').forEach(explorer); $$('[data-simulator]').forEach(simulator); $$('[data-slot]').forEach(el => { if (!el.classList.contains('slot')) fillSlot(el); });
  $$('main img').forEach(t => { if (zoomable(t) && t.complete) { t.tabIndex = 0; t.setAttribute('role', 'button'); } });
  // más carruseles (texto, tarjetas, cifras)
  $$('.personality-grid,.improvement-list,.audience-list,.metric-grid,.mission-grid,.card-grid.three').forEach(g => { if (g.children.length >= 4 && !g.closest('.strategy-document')) g.setAttribute('data-carousel', ''); });
  $$('[data-carousel]').forEach(enhance);
  // menú: píldora que se desliza entre opciones
  const nav = $('.site-nav'); if (nav && !reduce) {
    const pill = document.createElement('i'); pill.className = 'nav-pill'; nav.prepend(pill);
    const items = $$('.site-nav>a:not(.cta),.site-nav>.dd>button'), cur = items.find(a => a.hasAttribute('aria-current')) || items.find(b => b.parentElement.querySelector('[aria-current]'));
    const put = el => { if (!el) { pill.style.opacity = 0; return; } pill.style.cssText = `opacity:1;width:${el.offsetWidth}px;height:${el.offsetHeight}px;transform:translate(${el.offsetLeft}px,${el.offsetTop}px)`; };
    items.forEach(el => { el.addEventListener('mouseenter', () => put(el)); el.addEventListener('focus', () => put(el)); }); nav.addEventListener('mouseleave', () => put(cur)); addEventListener('load', () => put(cur)); put(cur);
  }
  // salida suave al cambiar de página
  document.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.origin !== location.origin || a.pathname === location.pathname) return; e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => location.href = a.href, 220); });
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));
  // índice flotante del plan
  const secs = $$('.strategy-section[id],[data-toc]'); if (secs.length) {
    const t = document.createElement('nav'); t.className = 'plan-toc'; t.setAttribute('aria-label', 'Índice del plan'); t.innerHTML = secs.map(s => `<a href="#${s.id}">${esc(($('h2', s) || {}).textContent || s.id)}</a>`).join(''); secs[0].before(t);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('a', t).forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id)); const a = $('a.on', t); if (a) t.scrollTo({ left: a.offsetLeft - 80, behavior: 'smooth' }); } }), { rootMargin: '-30% 0px -60% 0px' }); secs.forEach(s => io.observe(s));
  }
  // inclinación suave en tarjetas
  if (!reduce) $$('.col-card,.visual-card').forEach(c => { c.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transition = 'transform .08s'; c.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`; }); c.addEventListener('pointerleave', () => { c.style.transition = ''; c.style.transform = ''; }); });
});
})();
