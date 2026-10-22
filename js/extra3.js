document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // Manual: área de protección (altura de la letra A)
  const pb = $('#prot-btn');
  pb?.addEventListener('click', () => { const on = $('#prot').classList.toggle('on'); pb.setAttribute('aria-pressed', on); pb.textContent = on ? 'Ocultar área de protección' : 'Ver área de protección'; });

  // Manual: tamaño mínimo 2,5 cm (≈ 95 px en pantalla)
  const sz = $('#sz');
  if (sz) { const L = $('#sz-logo'), o = $('#sz-out'), f = () => { const v = +sz.value, cm = (v / 37.8).toFixed(1).replace('.', ','), ok = v >= 95; L.style.width = v + 'px'; o.textContent = `${cm} cm en pantalla · ${ok ? 'tamaño permitido' : 'por debajo del mínimo de 2,5 cm'}`; o.className = ok ? 'ok' : 'bad'; }; sz.addEventListener('input', f); f(); }

  // Copiar HEX
  $$('[data-hex]').forEach(b => b.addEventListener('click', () => navigator.clipboard?.writeText(b.dataset.hex).then(() => toast('Copiado ' + b.dataset.hex)).catch(() => toast(b.dataset.hex))));

  // Imágenes: revelado con "cortina" y desplazamiento suave
  const wipes = $$('.mosaic figure,.page-hero-image,.pn figure');
  if (!reduce && 'IntersectionObserver' in window) {
    wipes.forEach(w => w.classList.add('wipe'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
    wipes.forEach(w => io.observe(w));
    const heroImgs = $$('.page-hero-image img');
    if (heroImgs.length) addEventListener('scroll', () => { const y = scrollY * .06; heroImgs.forEach(i => i.style.translate = `0 ${y}px`); }, { passive: true });
  }
});
