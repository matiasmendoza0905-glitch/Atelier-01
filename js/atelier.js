// ATELIER · mejoras de interacción
// Escribe aquí el número de WhatsApp con código de país, sin "+" ni espacios. Ejemplo: '51999999999'
const WHATSAPP_NUMBER = '51983054061';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const waUrl = t => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;
function toast(msg) { let t = $('.toast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast', role: 'status' })); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2000); }

document.addEventListener('DOMContentLoaded', () => {
  // WhatsApp en encabezado y pie
  if (WHATSAPP_NUMBER) $$('.wa-link').forEach(a => { a.href = waUrl('Hola Atelier, quisiera consultar la disponibilidad de un vestuario.'); a.target = '_blank'; a.rel = 'noopener'; });

  // Encabezado: sombra, barra de progreso, menú móvil y desplegables
  const hd = $('.site-header'), bar = $('.progress');
  const onScroll = () => { const h = document.documentElement; hd?.classList.toggle('scrolled', scrollY > 30); if (bar) bar.style.transform = `scaleX(${scrollY / Math.max(1, h.scrollHeight - h.clientHeight)})`; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const nav = $('.site-nav'), tg = $('.nav-toggle');
  tg?.addEventListener('click', () => { const o = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', o); tg.textContent = o ? 'Cerrar' : 'Menú'; });
  $$('.dd > button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const d = b.parentElement, o = !d.classList.contains('open'); $$('.dd').forEach(x => { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); }); d.classList.toggle('open', o); b.setAttribute('aria-expanded', o); }));
  document.addEventListener('click', () => $$('.dd').forEach(x => x.classList.remove('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.dd').forEach(x => x.classList.remove('open')); nav?.classList.remove('open'); } });

  // Portada: titular por palabras + pantalla de carga una vez por sesión
  const h1 = $('.home-hero h1');
  if (h1 && !reduce) { let i = 0; const wrap = n => { if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(p => { if (!p.trim()) f.append(p); else { const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = p; f.append(s); } }); n.replaceWith(f); } else n.childNodes.forEach(wrap); }; [...h1.childNodes].forEach(wrap); }
  if ($('.home-hero') && !reduce && !sessionStorage.getItem('atelier-splash')) {
    sessionStorage.setItem('atelier-splash', '1');
    const s = Object.assign(document.createElement('div'), { className: 'splash', innerHTML: '<img src="' + $('.brand2 img').getAttribute('src') + '" alt="">' }); document.body.append(s);
    setTimeout(() => s.classList.add('out'), 1400); setTimeout(() => s.remove(), 2100);
  }

  // Aparición suave de tarjetas
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .12 });
    $$('.visual-card,.fact-card,.personality-grid article,.improvement-list article,.timeline article,.manual-card,.metric-grid article,.mission-grid article,.quick-links a,.logo-variants article,.col-card,.steps li,.audience-list article').forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--i', i % 4); io.observe(el); });
    const chat = $('.chat-demo'); if (chat) { const co = new IntersectionObserver(es => { if (es[0].isIntersecting) { $$('.chat-bubble', chat).forEach((b, i) => setTimeout(() => b.classList.add('on'), i * 900)); co.disconnect(); } }, { threshold: .3 }); co.observe(chat); }
  } else $$('.chat-bubble').forEach(b => b.classList.add('on'));

  // Carruseles
  $$('[data-carousel]').forEach(c => { const w = document.createElement('div'); w.className = 'car-btns'; w.innerHTML = '<button type="button" aria-label="Anterior">‹</button><button type="button" aria-label="Siguiente">›</button>'; c.after(w); const [p, n] = $$('button', w); p.onclick = () => c.scrollBy({ left: -320, behavior: 'smooth' }); n.onclick = () => c.scrollBy({ left: 320, behavior: 'smooth' }); });

  // Paleta: clic para copiar el HEX
  $$('.swatches article').forEach(a => { a.tabIndex = 0; a.setAttribute('role', 'button'); const hex = (a.textContent.match(/#[0-9a-f]{6}/i) || [getComputedStyle($('span', a)).backgroundColor])[0].toUpperCase(); a.setAttribute('aria-label', 'Copiar ' + hex); const go = () => navigator.clipboard?.writeText(hex).then(() => toast('Copiado ' + hex)).catch(() => toast(hex)); a.onclick = go; a.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });

  // Formulario de reserva → WhatsApp
  const col = new URLSearchParams(location.search).get('col'), sel = $('#col-select'); if (col && sel) sel.value = col;
  const f = $('#reserva-form');
  f?.addEventListener('submit', e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f)), o = $('#rsv-out');
    if (!d.nombre || !d.fecha || !d.talla) { o.textContent = 'Completa tu nombre, la fecha y la talla o edad para enviar la consulta.'; return; }
    const m = `Hola Atelier, soy ${d.nombre}. Quiero consultar disponibilidad para el ${d.fecha} (${d.evento}). Colección: ${d.col}. Talla o edad: ${d.talla}.${d.nota ? ' ' + d.nota : ''}`;
    if (WHATSAPP_NUMBER) { open(waUrl(m), '_blank', 'noopener'); o.textContent = 'Se abrió WhatsApp con tu mensaje.'; }
    else { o.innerHTML = 'Aún no se configuró el número de WhatsApp (variable WHATSAPP_NUMBER en js/atelier.js). Copia este mensaje:<textarea readonly rows="3"></textarea>'; $('textarea', o).value = m; }
  });

  // Galería: filtro por URL, contador y deslizar en móvil
  $$('[data-filter]').forEach(b => b.addEventListener('click', () => history.replaceState(null, '', '#' + b.dataset.filter)));
  if (location.hash) $(`[data-filter="${location.hash.slice(1)}"]`)?.click();
  const lb = $('.lightbox'); if (lb) {
    lb.setAttribute('aria-modal', 'true'); const img = $('figure img', lb), cap = $('figcaption', lb);
    new MutationObserver(() => { const v = $$('.gallery-item:not([hidden])'); cap.dataset.n = `${v.findIndex(x => x.dataset.image === img.getAttribute('src')) + 1} / ${v.length}`; }).observe(img, { attributes: true, attributeFilter: ['src'] });
    let x0; lb.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) $(dx > 0 ? '.lightbox-prev' : '.lightbox-next', lb).click(); });
  }

  // Manual: celebración al completar la lista
  const cks = $$('#brand-checklist input[type=checkbox]');
  cks.forEach(c => c.addEventListener('change', () => { if (!reduce && cks.every(k => k.checked)) { const r = c.getBoundingClientRect(); ['#3B50CF', '#FD7C00', '#089008', '#FFE401', '#F126F0'].forEach((col, k) => { for (let i = 0; i < 6; i++) { const d = document.createElement('i'); d.className = 'dot'; d.style.cssText = `background:${col};left:${r.left + 9}px;top:${r.top + 9}px;--x:${(Math.random() - .5) * 360}px;--y:${-60 - Math.random() * 220}px`; document.body.append(d); setTimeout(() => d.remove(), 1200); } }); toast('¡Lista completa! Tu pieza está lista para publicar.'); } }));
});
