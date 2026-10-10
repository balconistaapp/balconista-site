'use strict';

/* Página de vendas do Balconista: botões, links, robô de demonstração e animações.
   Os endereços do painel ficam em CONFIG, logo abaixo. */
// ===== Configuração: troque aqui =====
const CONFIG = {
  signupUrl: 'https://painel.balconista.app.br/criar-conta', // criar conta e começar o teste. O plano vai em ?plano=starter|growth|pro
  loginUrl: 'https://painel.balconista.app.br/entrar',       // tela de login do painel (quem já é cliente)
  termsUrl: 'https://painel.balconista.app.br/termos',
  privacyUrl: 'https://painel.balconista.app.br/privacidade',
  salesWhatsApp: '',              // WhatsApp de vendas com DDI e DDD, só números. Ex.: '5547999990000'. Vazio = botões de contato escondidos
  // Depoimentos REAIS, com autorização do cliente. Vazio = bloco escondido.
  // Ex.: { quote: 'Texto do cliente', name: 'Nome', business: 'Negócio', city: 'Cidade/UF' }
  testimonials: [],
};

document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: n % 1 ? 2 : 0 });
const brl2 = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ico = (id) => `<svg class="ico" aria-hidden="true"><use href="#${id}"/></svg>`;

// Roda show/hide conforme o elemento entra e sai da tela
function onVisible(el, show, hide, threshold = 0.15) {
  if (!el) return;
  new IntersectionObserver(([e]) => (e.isIntersecting ? show() : hide && hide()), { threshold }).observe(el);
}
// Número que "conta" até o valor. Usa setTimeout (rAF para quando a aba não pinta).
function tween(el, to, { fmt = (v) => String(Math.round(v)), dur = 700, bump = true } = {}) {
  if (!el) return;
  const from = Number(el.dataset.v ?? to);
  el.dataset.v = to;
  if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  if (reduceMotion || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / dur);
    el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) setTimeout(step, 16);
  };
  step();
}

// ---------- links reais ----------
$$('[data-signup]').forEach((a) => {
  const plan = a.dataset.plan;
  a.href = plan ? `${CONFIG.signupUrl}?plano=${encodeURIComponent(plan)}` : CONFIG.signupUrl;
});
$$('[data-login]').forEach((a) => { a.href = CONFIG.loginUrl; });
$$('[data-contact]').forEach((a) => {
  if (!CONFIG.salesWhatsApp) { (a.closest('[data-contact-block], li') || a).hidden = true; return; }
  a.href = `https://wa.me/${CONFIG.salesWhatsApp}?text=${encodeURIComponent('Olá! Quero saber mais sobre o Balconista.')}`;
  a.target = '_blank'; a.rel = 'noopener';
});
$$('[data-no-contact]').forEach((a) => { a.hidden = Boolean(CONFIG.salesWhatsApp); });
// Termos de uso e política de privacidade (ficam no painel)
const legal = { termos: CONFIG.termsUrl, privacidade: CONFIG.privacyUrl };
$$('[data-legal]').forEach((a) => { const u = legal[a.dataset.legal]; if (u) a.href = u; else a.closest('li').hidden = true; });
// coluna do rodapé sem nenhum link visível some junto com o título
$$('.ftr__grid > div').forEach((col) => {
  const items = $$('li', col);
  if (items.length) col.hidden = items.every((li) => li.hidden);
});
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

if (CONFIG.testimonials.length) {
  const box = $('#quotes');
  CONFIG.testimonials.forEach((t) => {
    const fig = document.createElement('figure'); fig.className = 'quote';
    const bq = document.createElement('blockquote'); bq.textContent = `“${t.quote}”`;
    const cap = document.createElement('figcaption');
    const b = document.createElement('b'); b.textContent = t.name;
    cap.append(b, [t.business, t.city].filter(Boolean).join(' · '));
    fig.append(bq, cap); box.append(fig);
  });
  box.hidden = false;
  $('#honest').hidden = true;
}

// ---------- header + menu ----------
const hdr = $('#hdr');
const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
const burger = $('#burger');
const mnav = $('#mnav');
function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  $('use', burger).setAttribute('href', open ? '#i-x' : '#i-menu');
  mnav.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  hdr.classList.toggle('scrolled', open || window.scrollY > 8);
  if (open) $('a', mnav).focus();
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
$$('a', mnav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

// ---------- revelar ao rolar ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
$$('[data-reveal]').forEach((el) => io.observe(el));

// ---------- robozinho: molde + olhos que seguem o mouse ----------
const robotTpl = $('#robot-tpl');
$$('[data-robot]').forEach((slot) => slot.append(robotTpl.content.cloneNode(true)));
const robots = $$('[data-robot]');
function lookAt(x, y) {
  robots.forEach((r) => {
    const b = r.getBoundingClientRect();
    if (!b.width || b.bottom < 0 || b.top > innerHeight) return;
    const dx = x - (b.left + b.width / 2);
    const dy = y - (b.top + b.height * 0.45);
    const d = Math.hypot(dx, dy) || 1;
    const f = Math.min(1, d / 260);
    r.style.setProperty('--ex', `${(dx / d) * 4 * f}px`);
    r.style.setProperty('--ey', `${(dy / d) * 3.4 * f}px`);
  });
}
if (finePointer) {
  let lastLook = 0;
  document.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - lastLook < 40) return;
    lastLook = now; lookAt(e.clientX, e.clientY);
  }, { passive: true });
} else if (!reduceMotion) {
  // sem mouse: o robô olha em volta sozinho
  setInterval(() => robots.forEach((r) => {
    r.style.setProperty('--ex', `${rand(-4, 4)}px`);
    r.style.setProperty('--ey', `${rand(-3, 3)}px`);
  }), 2200);
}

// ---------- motor de conversa (demos roteirizadas) ----------
const TICKS = '<svg viewBox="0 0 16 11" aria-hidden="true"><use href="#ticks"/></svg>';
function bubble(m) {
  const el = document.createElement('div');
  if (m.from === 'sys') { el.className = 'msg msg--sys'; el.textContent = m.text; return el; }
  if (m.from === 'done') { el.className = 'msg msg--done'; el.innerHTML = ico('i-check'); el.append(m.text); return el; }
  el.className = `msg msg--${m.from}`;
  el.innerHTML = m.html; // conteúdo fixo, escrito neste arquivo
  if (m.t) {
    const t = document.createElement('span'); t.className = 't';
    t.innerHTML = m.from === 'out' ? `${m.t} ${TICKS}` : m.t;
    el.append(t);
  }
  return el;
}
function createPlayer(log, { onMsg } = {}) {
  let run = 0;
  const scroll = (smooth) => log.scrollTo({ top: log.scrollHeight, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  async function play(script, { instant = reduceMotion } = {}) {
    const id = ++run;
    log.replaceChildren();
    for (let i = 0; i < script.length; i++) {
      const m = script[i];
      if (!instant) {
        if (m.from === 'out') {
          await wait(m.pause ?? 350);
          if (id !== run) return false;
          const t = document.createElement('div'); t.className = 'typing'; t.setAttribute('aria-hidden', 'true');
          t.innerHTML = '<i></i><i></i><i></i>';
          log.append(t); scroll(true);
          await wait(m.typing ?? 950);
          t.remove();
        } else {
          await wait(m.pause ?? (m.from === 'in' ? 900 : 600));
        }
        if (id !== run) return false;
      }
      log.append(bubble(m));
      scroll(!instant);
      if (onMsg) onMsg(m, i);
    }
    return true;
  }
  return { play, stop: () => { run++; } };
}

// ---------- hero: parede de conversas ao fundo ----------
const WALL = [
  ['Pizzaria', ['in', 'Boa noite! Tem pizza meio a meio?'], ['out', 'Tem sim! Escolha o tamanho:\n1 - Média  2 - Grande'], ['in', '2'], ['out', 'Pedido nº 2087 confirmado ✅']],
  ['Barbearia', ['in', 'Consigo um corte hoje?'], ['out', 'Horários livres com o Bruno:\n1 - 16:00  2 - 18:30'], ['in', '2'], ['out', 'Agendado! ✅ Hoje às 18:30']],
  ['Assistência', ['in', 'Meu notebook já ficou pronto?'], ['out', 'OS 455 · Situação: em reparo'], ['out', 'Boa notícia! Seu notebook está pronto para retirada.']],
  ['Lanchonete', ['in', 'Vocês entregam no Centro?'], ['out', 'Entregamos! Taxa: R$ 6,00'], ['in', 'Quero 2 X-Salada'], ['out', 'Total: R$ 46,00\n1 - Pix  2 - Cartão']],
  ['Salão', ['in', 'Quanto é a escova?'], ['out', 'Escova — R$ 60,00. Quer marcar?'], ['in', 'Quero amanhã cedo'], ['out', 'Livre amanhã:\n1 - 09:00  2 - 10:30']],
  ['Açaí', ['in', 'Tem açaí de 500 ml?'], ['out', 'Tem! Adicionais:\n1 - Granola  2 - Leite em pó'], ['in', '1 e 2'], ['out', 'Anotado! Entrega ou retirada?']],
  ['Delivery', ['out', '🛵 Seu pedido nº 1051 saiu para entrega!'], ['in', 'Oba, obrigado!']],
  ['Barbearia', ['out', 'Lembrete: amanhã às 10:30.\n1 - Confirmo  2 - Remarcar'], ['in', '1'], ['out', 'Presença confirmada! 👊']],
  ['Hamburgueria', ['in', 'Ainda tá aberto?'], ['out', 'Aberto até 23h! Escolha:\n1 - Burgers  2 - Combos'], ['in', '2'], ['out', 'Combo família — R$ 89,90']],
  ['Celulares', ['out', 'O orçamento da OS 512 está pronto: troca de tela — R$ 390,00'], ['in', 'Pode fazer']],
];
const wall = $('#wall');
if (wall) {
  const cols = innerWidth < 640 ? 2 : innerWidth < 1100 ? 3 : 4;
  const groups = [...WALL].sort(() => Math.random() - 0.5);
  for (let c = 0; c < cols; c++) {
    const col = document.createElement('div'); col.className = 'wall__col';
    const track = document.createElement('div'); track.className = 'wall__track';
    track.style.setProperty('--dur', `${Math.round(rand(48, 72))}s`);
    track.style.setProperty('--delay', `${-Math.round(rand(0, 40))}s`);
    const mine = groups.filter((_, i) => i % cols === c);
    const build = () => mine.forEach(([tag, ...msgs]) => {
      const t = document.createElement('span'); t.className = 'wall__tag'; t.textContent = tag; track.append(t);
      msgs.forEach(([from, text]) => { const m = document.createElement('div'); m.className = `msg msg--${from}`; m.textContent = text; track.append(m); });
    });
    build(); build(); // duas cópias = loop sem emenda
    col.append(track); wall.append(col);
  }
  const heroEl = $('.hero');
  onVisible(heroEl, () => wall.classList.remove('paused'), () => wall.classList.add('paused'), 0);
  // paralaxe: celular, painel, avisos e fundo seguem o mouse
  if (finePointer && !reduceMotion) {
    heroEl.addEventListener('pointermove', (e) => {
      const b = heroEl.getBoundingClientRect();
      heroEl.style.setProperty('--px', (((e.clientX - b.left) / b.width) * 2 - 1).toFixed(3));
      heroEl.style.setProperty('--py', (((e.clientY - b.top) / b.height) * 2 - 1).toFixed(3));
    });
    heroEl.addEventListener('pointerleave', () => { heroEl.style.setProperty('--px', 0); heroEl.style.setProperty('--py', 0); });
  }
}

// ---------- hero: conversas em loop + avisos empilhando ----------
const HERO = [
  {
    av: 'L', name: 'Lanchonete do Zé', fx: 'order',
    toast: ['i-box', 'Novo pedido recebido', 'Nº {n} · R$ 54,00 · Pix · cupom impresso'],
    script: [
      { from: 'in', html: 'Boa noite! Ainda dá pra pedir? 🙏', t: '23:47', pause: 500 },
      { from: 'out', html: 'Olá, Carla! Bem-vinda à Lanchonete do Zé.\nEscolha uma categoria:\n<b>1</b> - Lanches\n<b>2</b> - Porções\n<b>3</b> - Bebidas', t: '23:47' },
      { from: 'in', html: '1', t: '23:47' },
      { from: 'out', html: '<span class="hl">Toda quarta: 20% off</span>\n<b>1</b> - X-Bacon <s>R$ 30,00</s> R$ 24,00\n<b>2</b> - X-Salada <s>R$ 25,00</s> R$ 20,00', t: '23:47' },
      { from: 'sys', text: 'quantidade, observação e Pix' },
      { from: 'out', html: '<b>Pedido nº {n} confirmado!</b>\n2x X-Bacon (sem cebola) — R$ 48,00\nEntrega — R$ 6,00\n<b>Total: R$ 54,00</b>\nTe aviso aqui quando sair. 😉', t: '23:49' },
      { from: 'done', text: 'Atendimento concluído', pause: 600 },
    ],
  },
  {
    av: 'S', name: 'Studio Bella', fx: 'agenda',
    toast: ['i-cal', 'Agendamento confirmado', 'Corte com Ana · amanhã 10:30'],
    script: [
      { from: 'in', html: 'Oi! Tem horário amanhã?', t: '21:05', pause: 500 },
      { from: 'out', html: 'Qual serviço?\n<b>1</b> - Corte feminino — R$ 80,00\n<b>2</b> - Escova — R$ 60,00\n<b>3</b> - Manicure — R$ 35,00', t: '21:05' },
      { from: 'in', html: '1', t: '21:05' },
      { from: 'out', html: 'Horários livres com a Ana amanhã:\n<b>1</b> - 10:30\n<b>2</b> - 14:00', t: '21:06' },
      { from: 'in', html: '1', t: '21:06' },
      { from: 'out', html: '<b>Agendado!</b> ✅\nCorte feminino com Ana, amanhã às 10:30.', t: '21:06' },
      { from: 'done', text: 'Horário na agenda', pause: 600 },
    ],
  },
  {
    av: 'C', name: 'Conserta Fácil', fx: 'notice',
    toast: ['i-bell', 'Cliente avisado', 'OS 318 pronta · aviso enviado sozinho'],
    script: [
      { from: 'out', html: 'Olá, Rafael! Recebemos seu iPhone 11. Sua ordem de serviço é a <b>nº 318</b>.', t: '09:40', pause: 300 },
      { from: 'in', html: 'E aí, já ficou pronto?', t: '11:12' },
      { from: 'out', html: '<b>OS 318</b> · Situação: <span class="hl">em reparo</span>\nAvisamos quando ficar pronto.', t: '11:12' },
      { from: 'sys', text: 'loja mudou a etapa no painel: pronto' },
      { from: 'out', html: 'Boa notícia, Rafael! Seu iPhone 11 (OS 318) está <b>pronto para retirada</b>.', t: '16:40' },
      { from: 'done', text: 'Cliente avisado sozinho', pause: 600 },
    ],
  },
];
const heroChat = $('#hero-chat');
if (heroChat) {
  const toasts = $('#toasts');
  let heroOn = true;
  let orderN = 1042;
  const k = { ped: 22, val: 1230, age: 9, avi: 31 };
  onVisible($('.hero'), () => { heroOn = true; }, () => { heroOn = false; }, 0.05);
  const until = async (cond) => { while (!cond()) await wait(300); };
  const fmtInt = (v) => String(Math.round(v));
  const fmtVal = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
  function toast([icon, title, sub]) {
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `<div class="notice__ic">${ico(icon)}</div><div><b></b><small></small></div>`;
    $('b', el).textContent = title;
    $('small', el).textContent = sub.replace('{n}', orderN);
    toasts.prepend(el);
    const all = $$('.toast:not(.out)', toasts);
    if (all.length > 3) { const old = all[all.length - 1]; old.classList.add('out'); setTimeout(() => old.remove(), 450); }
  }
  function effect(fx) {
    if (fx === 'order') {
      const list = $('#hero-orders');
      const li = document.createElement('li'); li.className = 'fresh';
      li.innerHTML = `<span class="num">${orderN}</span><span>2x X-Bacon · sem cebola</span><span class="val">R$ 54,00</span><span class="st st--new">Novo</span>`;
      list.prepend(li);
      if (list.children.length > 4) list.lastElementChild.remove();
      k.ped += 1; k.val += 54;
      tween($('#k-ped'), k.ped, { fmt: fmtInt }); tween($('#k-val'), k.val, { fmt: fmtVal });
      const bars = $$('#hero-spark i'); const last = bars[bars.length - 1];
      last.style.setProperty('--h', `${Math.min(100, parseFloat(last.style.getPropertyValue('--h')) + 8)}%`);
    }
    if (fx === 'agenda') { k.age += 1; tween($('#k-age'), k.age, { fmt: fmtInt }); }
    k.avi += 1; tween($('#k-avi'), k.avi, { fmt: fmtInt });
  }
  const player = createPlayer(heroChat);
  (async function loop() {
    await wait(reduceMotion ? 0 : 400);
    for (let i = 0; ; i = (i + 1) % HERO.length) {
      await until(() => heroOn && !document.hidden);
      const sc = HERO[i];
      $('#hero-av').textContent = sc.av;
      $('#hero-name').textContent = sc.name;
      const script = sc.script.map((m) => (m.html ? { ...m, html: m.html.replace('{n}', orderN) } : m));
      await player.play(script);
      effect(sc.fx); toast(sc.toast);
      if (sc.fx === 'order') orderN += 1;
      await wait(reduceMotion ? 6000 : 3200);
    }
  })();
}

// ---------- números que contam ----------
$$('[data-count]').forEach((el) => {
  const to = Number(el.dataset.count);
  const dec = Number(el.dataset.dec || 0);
  const fmt = (v) => (dec ? v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : String(Math.round(v)));
  el.dataset.v = 0; el.textContent = fmt(0);
  onVisible(el, () => { if (el.dataset.done) return; el.dataset.done = 1; tween(el, to, { fmt, dur: 1400, bump: false }); }, null, 0.6);
});

// ---------- calculadora ----------
const calc = $('#calc');
if (calc) {
  const pairs = [
    { num: $('#c-sales-n'), range: $('#c-sales'), err: $('#c-sales-err'), min: 0, max: 200, label: 'vendas' },
    { num: $('#c-ticket-n'), range: $('#c-ticket'), err: $('#c-ticket-err'), min: 1, max: 5000, label: 'valor' },
  ];
  const out = $('#c-out');
  const detail = $('#c-detail');
  const coins = $('#coins');
  let lastTotal = 800; let lastCoin = 0;
  const paint = (r) => { const p = ((r.value - r.min) / (r.max - r.min)) * 100; r.style.setProperty('--p', `${p}%`); };
  function burst(n) {
    if (reduceMotion || performance.now() - lastCoin < 220) return;
    lastCoin = performance.now();
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'coin';
      c.style.left = `${rand(8, 92)}%`; c.style.animationDelay = `${i * 70}ms`;
      coins.append(c); setTimeout(() => c.remove(), 1600 + i * 70);
    }
  }
  function validate(p) {
    const raw = p.num.value.trim().replace(',', '.');
    const v = Number(raw);
    let msg = '';
    if (raw === '' || Number.isNaN(v)) msg = 'Digite um número.';
    else if (v < p.min) msg = `O mínimo é ${p.min}.`;
    else if (v > p.max) msg = `O máximo é ${p.label === 'valor' ? brl(p.max) : p.max}.`;
    else if (p.label === 'vendas' && !Number.isInteger(v)) msg = 'Use um número inteiro de vendas.';
    p.err.textContent = msg;
    p.num.setAttribute('aria-invalid', String(Boolean(msg)));
    p.num.parentElement.classList.toggle('bad', Boolean(msg));
    return msg ? null : v;
  }
  function update() {
    const [s, t] = pairs.map(validate);
    if (s === null || t === null) { out.textContent = '—'; detail.textContent = 'Corrija o campo destacado para ver a estimativa.'; return; }
    const total = s * t * 4;
    out.textContent = brl(total);
    detail.textContent = `${s} ${s === 1 ? 'venda' : 'vendas'} × ${brl(t)} × 4 semanas`;
    if (total > lastTotal) burst(Math.min(6, 2 + Math.round((total - lastTotal) / 200)));
    lastTotal = total;
  }
  pairs.forEach((p) => {
    paint(p.range);
    p.range.addEventListener('input', () => { p.num.value = p.range.value; paint(p.range); update(); });
    p.num.addEventListener('input', () => {
      const v = Number(p.num.value.replace(',', '.'));
      if (!Number.isNaN(v)) { p.range.value = Math.min(Math.max(v, p.range.min), p.range.max); paint(p.range); }
      update();
    });
  });
  calc.addEventListener('submit', (e) => e.preventDefault());
  update();
}

// ---------- tour de 30 segundos (o "vídeo") ----------
const player = $('#player');
if (player) {
  const SCENE_MS = 6000;
  const scenes = $$('.scene', player);
  const chapters = $$('[data-ch]', player);
  const fills = $$('.ch-fill', player);
  const toggle = $('#player-toggle');
  const big = $('#player-big');
  const timeEl = $('#player-time');
  let cur = 0; let elapsed = 0; let playing = false; let last = 0; let timer = null;
  let userPaused = reduceMotion; let inView = false;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  function paint() {
    fills.forEach((f, k) => { f.style.width = `${k < cur ? 100 : k === cur ? (elapsed / SCENE_MS) * 100 : 0}%`; });
    timeEl.textContent = `${mmss((cur * SCENE_MS + elapsed) / 1000)} / ${mmss((scenes.length * SCENE_MS) / 1000)}`;
  }
  function show(i) {
    cur = i; elapsed = 0;
    scenes.forEach((s, k) => s.classList.toggle('on', k === i));
    const s = scenes[i]; s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');
    chapters.forEach((c, k) => (k === i ? c.setAttribute('aria-current', 'step') : c.removeAttribute('aria-current')));
    if (i === 3) {
      // motinho percorre o trajeto (animação do próprio SVG, acompanha a escala)
      const anim = $('#route-anim');
      if (anim && anim.beginElement && !reduceMotion) setTimeout(() => anim.beginElement(), 600);
      else if (anim) $('#route-bike').setAttribute('transform', 'translate(360 40)');
    }
    if (i === 4) {
      const tot = $('#tour-total'); const ord = $('#tour-orders');
      tot.dataset.v = 0; ord.dataset.v = 0;
      setTimeout(() => {
        tween(tot, 16776, { fmt: brl2, dur: 1800, bump: false });
        tween(ord, 295, { dur: 1800, bump: false });
      }, playing ? 300 : 0);
    }
    paint();
  }
  function setIcon(on) {
    const label = on ? 'Pausar tour' : 'Reproduzir tour';
    toggle.setAttribute('aria-label', label);
    $('use', toggle).setAttribute('href', on ? '#i-pause' : '#i-play');
  }
  function tick() {
    const now = performance.now(); elapsed += now - last; last = now;
    if (elapsed >= SCENE_MS) show((cur + 1) % scenes.length);
    paint();
  }
  function play() {
    if (playing) return;
    playing = true; player.classList.add('started'); player.classList.remove('paused');
    last = performance.now(); timer = setInterval(tick, 100); setIcon(true);
  }
  function pause() {
    playing = false; clearInterval(timer); player.classList.add('paused'); setIcon(false);
  }
  player.classList.add('paused');
  show(0);
  toggle.addEventListener('click', () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  big.addEventListener('click', () => { userPaused = false; play(); });
  $('#player-screen').addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); }
  });
  chapters.forEach((c, k) => c.addEventListener('click', () => {
    show(k);
    if (!reduceMotion) { userPaused = false; if (!playing) play(); else last = performance.now(); }
  }));
  onVisible(player, () => { inView = true; if (!userPaused) play(); }, () => { inView = false; if (playing) pause(); }, 0.45);
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); else if (!document.hidden && inView && !userPaused) play(); });
}

// ---------- demonstração roteirizada ----------
const SCENARIOS = {
  food: {
    av: 'L', name: 'Lanchonete do Zé',
    steps: ['Consulta o cardápio', 'Escolhe produto e quantidade', 'Informa observações', 'Confirma o pedido', 'Recebe o resumo do pedido'],
    script: [
      { from: 'in', html: 'Boa noite! Ainda dá pra pedir?', t: '23:47', step: 0, pause: 400 },
      { from: 'out', html: 'Olá, Carla! Escolha uma categoria:\n<b>1</b> - Lanches\n<b>2</b> - Porções\n<b>3</b> - Bebidas', t: '23:47', step: 0 },
      { from: 'in', html: '1', t: '23:47', step: 0 },
      { from: 'out', html: '<span class="hl">Toda quarta: 20% off</span>\n<b>1</b> - X-Bacon <s>R$ 30,00</s> R$ 24,00\n<b>2</b> - X-Salada <s>R$ 25,00</s> R$ 20,00\n<b>0</b> - Voltar', t: '23:47', step: 0, stage: 1 },
      { from: 'in', html: '1', t: '23:48', step: 1 },
      { from: 'out', html: 'X-Bacon. Quantas unidades?', t: '23:48', step: 1 },
      { from: 'in', html: '2', t: '23:48', step: 1, stage: 2 },
      { from: 'out', html: 'Alguma observação? Se não, responda <b>0</b>.', t: '23:48', step: 2 },
      { from: 'in', html: 'Sem cebola, por favor', t: '23:48', step: 2, stage: 3 },
      { from: 'out', html: '<b>Resumo do pedido</b>\n2x X-Bacon (sem cebola) — R$ 48,00\nEntrega — R$ 6,00\n<b>Total: R$ 54,00</b>\nPagamento: Pix (chave enviada abaixo)\n\n<b>1</b> - Confirmar  <b>2</b> - Alterar', t: '23:49', step: 3, stage: 4 },
      { from: 'in', html: '1', t: '23:49', step: 3 },
      { from: 'out', html: '<b>Pedido nº 1042 confirmado!</b> ✅\nTe aviso aqui quando sair para entrega.', t: '23:49', step: 4, stage: 5 },
      { from: 'done', text: 'Pedido no painel', step: 4, pause: 500 },
    ],
  },
  fix: {
    av: 'C', name: 'Conserta Fácil',
    steps: ['Consulta a ordem de serviço', 'Visualiza o orçamento', 'Recebe atualização de status', 'Recebe o aviso de pronto'],
    script: [
      { from: 'out', html: 'Olá, Rafael! Recebemos seu iPhone 11 aqui na Conserta Fácil. Sua ordem de serviço é a <b>nº 318</b>. Te avisamos por aqui a cada etapa.', t: '09:40', step: 0, stage: 1, pause: 300 },
      { from: 'in', html: 'Oi! Já tem alguma novidade?', t: '11:12', step: 0 },
      { from: 'out', html: '<b>OS 318</b> · iPhone 11\nSituação: <span class="hl">em análise</span>\nO orçamento sai ainda hoje.', t: '11:12', step: 0, stage: 2 },
      { from: 'sys', text: 'loja mudou a etapa no painel: orçamento pronto', step: 1 },
      { from: 'out', html: 'Rafael, o orçamento da OS 318 está pronto:\nTroca de bateria — <b>R$ 280,00</b>\nResponda esta mensagem para aprovar ou tirar dúvidas.', t: '15:02', step: 1, stage: 3 },
      { from: 'in', html: 'Pode fazer 👍', t: '15:20', step: 1 },
      { from: 'sys', text: 'loja mudou a etapa no painel: em reparo', step: 2 },
      { from: 'out', html: 'Seu iPhone 11 (OS 318) entrou em <span class="hl">reparo</span>. Avisamos quando ficar pronto.', t: '09:10', step: 2, stage: 4 },
      { from: 'sys', text: 'loja mudou a etapa no painel: pronto', step: 3 },
      { from: 'out', html: 'Boa notícia, Rafael! Seu iPhone 11 (OS 318) está <b>pronto para retirada</b> na Conserta Fácil.', t: '09:55', step: 3, stage: 5 },
      { from: 'in', html: 'Show! Passo aí às 17h 🙌', t: '10:12', step: 3 },
    ],
  },
  beauty: {
    av: 'S', name: 'Studio Bella',
    steps: ['Seleciona o serviço', 'Escolhe o profissional', 'Consulta os horários livres', 'Confirma o agendamento'],
    script: [
      { from: 'in', html: 'Oi! Quero marcar um horário', t: '21:05', step: 0, pause: 400 },
      { from: 'out', html: 'Qual serviço?\n<b>1</b> - Corte feminino — R$ 80,00\n<b>2</b> - Escova — R$ 60,00\n<b>3</b> - Manicure — R$ 35,00', t: '21:05', step: 0 },
      { from: 'in', html: '1', t: '21:05', step: 0, stage: 1 },
      { from: 'out', html: 'Com quem você prefere?\n<b>1</b> - Ana\n<b>2</b> - Bruno\n<b>0</b> - Sem preferência', t: '21:05', step: 1 },
      { from: 'in', html: '1', t: '21:06', step: 1, stage: 2 },
      { from: 'out', html: 'Horários livres com a Ana, sex 16/10:\n<b>1</b> - 10:30\n<b>2</b> - 14:00\n<b>3</b> - 17:30', t: '21:06', step: 2 },
      { from: 'in', html: '1', t: '21:06', step: 2, stage: 3 },
      { from: 'out', html: '<b>Agendado!</b> ✅\nCorte feminino com Ana, sex 16/10 às 10:30.\nPara remarcar ou cancelar, é só chamar aqui.', t: '21:06', step: 3, stage: 4 },
      { from: 'done', text: 'Horário na agenda', step: 3, pause: 500 },
    ],
  },
};
const demoChat = $('#demo-chat');
if (demoChat) {
  const stepsEl = $('#demo-steps');
  const tabs = $$('.tab');
  let current = 'food';
  let started = false;
  const setStage = (n) => { $$(`[data-pv="${current}"] [data-at]`).forEach((el) => el.classList.toggle('on', Number(el.dataset.at) <= n)); };
  const setStep = (k, finished = false) => {
    $$('li', stepsEl).forEach((li, i) => {
      li.classList.toggle('done', i < k || (finished && i === k));
      li.classList.toggle('now', i === k && !finished);
    });
  };
  const fillSteps = (key) => stepsEl.replaceChildren(...SCENARIOS[key].steps.map((s) => { const li = document.createElement('li'); li.textContent = s; return li; }));
  const demo = createPlayer(demoChat, {
    onMsg: (m, i) => {
      const sc = SCENARIOS[current];
      if (m.stage) setStage(m.stage);
      if (m.step !== undefined) setStep(m.step, i === sc.script.length - 1);
    },
  });
  function load(key, { instant } = {}) {
    current = key;
    const sc = SCENARIOS[key];
    tabs.forEach((t) => { const on = t.dataset.scenario === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $('#demo-stage').setAttribute('aria-labelledby', `tab-${key}`);
    $('#demo-av').textContent = sc.av;
    $('#demo-name').textContent = sc.name;
    $$('[data-pv]').forEach((p) => { p.hidden = p.dataset.pv !== key; });
    fillSteps(key); setStage(0); setStep(-1);
    demo.play(sc.script, instant ? { instant: true } : undefined);
  }
  tabs.forEach((t, idx) => {
    t.addEventListener('click', () => { started = true; load(t.dataset.scenario); });
    t.addEventListener('keydown', (e) => {
      let n = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (idx + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (idx - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); tabs[n].focus(); tabs[n].click(); }
    });
  });
  $('#demo-replay').addEventListener('click', () => { started = true; load(current); });
  $('#demo-skip').addEventListener('click', () => { started = true; load(current, { instant: true }); });
  fillSteps('food');
  onVisible($('#demo-stage'), () => { if (!started) { started = true; load('food'); } }, null, 0.35);
}

// ---------- robô de demonstração (conversa de verdade, no navegador) ----------
const bot = (() => {
  const w = $('#botw'); const log = $('#botw-log'); const form = $('#botw-form'); const input = $('#botw-input');
  const fab = $('#bot-fab'); const teaser = $('#bot-teaser');
  if (!w) return { open() {} };
  const MENU = {
    Lanches: [['X-Bacon', 24, 30], ['X-Salada', 20, 25], ['X-Tudo', 34]],
    Porções: [['Batata frita', 28], ['Calabresa acebolada', 36]],
    Bebidas: [['Refrigerante lata', 6], ['Suco natural', 9]],
  };
  const CATS = Object.keys(MENU);
  const SERVICES = [['Corte feminino', 80, '45 min'], ['Corte masculino', 45, '30 min'], ['Escova', 60, '40 min'], ['Manicure', 35, '40 min']];
  const PROS = { Ana: ['09:00', '10:30', '14:00', '16:30'], Bruno: ['11:00', '15:00', '17:30', '18:30'] };
  const DOW = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const OS_STAGES = [
    ['orçamento pronto', 'O orçamento da OS {os} está pronto:\nTroca de bateria — <b>R$ 280,00</b>\nResponda esta mensagem para aprovar ou tirar dúvidas.'],
    ['em reparo', 'Seu iPhone 11 (OS {os}) entrou em <b>reparo</b>. Avisamos quando ficar pronto.'],
    ['pronto', 'Boa notícia! Seu iPhone 11 (OS {os}) está <b>pronto para retirada</b>. 🎉'],
  ];
  let q = Promise.resolve(); let gen = 0; let orderN = 1043; let st; let opened = false;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const numbered = (items) => items.map((t, i) => `<b>${i + 1}</b> - ${t}`).join('\n');
  const chipsFor = (items, extra = []) => [...items.map((t, i) => ({ label: `${i + 1} - ${t.replace(/<[^>]+>/g, '')}`, value: String(i + 1) })), ...extra];
  const BACK = { label: '0 - Voltar ao início', value: 'menu' };
  const cartTotal = () => st.cart.reduce((s, it) => s + it.price * it.qty, 0) + (st.deliv === 'Entrega' ? 6 : 0);
  function reset() { st = { step: 'menu', cart: [], cat: null, item: null, obs: '', deliv: null, pay: null, change: 0, svc: null, pro: null, day: null, slot: null, os: null, osStage: 0, chips: [] }; }
  const scroll = () => log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  const clearChips = () => $$('.chips', log).forEach((c) => c.remove());
  function renderChips(chips) {
    if (!chips || !chips.length) return;
    const box = document.createElement('div'); box.className = 'chips';
    chips.forEach((c) => {
      let el;
      if (c.href) { el = document.createElement('a'); el.href = c.href; el.className = 'chip--cta'; }
      else { el = document.createElement('button'); el.type = 'button'; el.addEventListener('click', () => send(c.value, c.label)); }
      el.textContent = c.label;
      box.append(el);
    });
    log.append(box);
  }
  function say(html, chips) {
    const g = gen;
    if (chips) st.chips = chips;
    q = q.then(async () => {
      if (g !== gen) return;
      const t = document.createElement('div'); t.className = 'typing typing--in'; t.setAttribute('aria-hidden', 'true');
      t.innerHTML = '<i></i><i></i><i></i>';
      log.append(t); scroll();
      await wait(reduceMotion ? 120 : Math.min(1300, 450 + html.length * 6));
      t.remove();
      if (g !== gen) return;
      const el = document.createElement('div'); el.className = 'msg msg--in'; el.innerHTML = html;
      log.append(el); renderChips(chips); scroll();
    });
  }
  function sys(text, delay = 400) {
    const g = gen;
    q = q.then(async () => {
      await wait(reduceMotion ? 0 : delay);
      if (g !== gen) return;
      const el = document.createElement('div'); el.className = 'msg msg--sys'; el.textContent = text; log.append(el); scroll();
    });
  }
  const pause = (ms) => { q = q.then(() => wait(reduceMotion ? 0 : ms)); };
  function send(value, label) {
    const text = String(value ?? '').slice(0, 120);
    if (!text.trim()) return;
    clearChips();
    const el = document.createElement('div'); el.className = 'msg msg--out'; el.textContent = label || text;
    log.append(el); scroll();
    handle(text);
  }

  // --- fluxos ---
  function menu() {
    st.step = 'menu';
    say('Escolha o que você quer testar:\n' + numbered(['Pedir um lanche', 'Marcar um horário', 'Consultar uma OS', 'Ver os planos']),
      chipsFor(['Pedir um lanche', 'Marcar um horário', 'Consultar uma OS', 'Ver os planos']));
  }
  function start() {
    say('Oi! 👋 Eu sou o <b>robô de demonstração</b> do Balconista.\nVou te atender como atenderia um cliente da sua loja. Pode responder com o número da opção.');
    menu();
  }
  function foodCats() {
    st.step = 'food.cat';
    say('🍔 <b>Lanchonete do Zé</b>\nEscolha uma categoria:\n' + numbered(CATS) + '\n<b>0</b> - Voltar', chipsFor(CATS, [BACK]));
  }
  function foodItems() {
    st.step = 'food.item';
    const items = MENU[st.cat].map(([n, p, old]) => (old ? `${n} <s>${brl(old)}</s> ${brl2(p)}` : `${n} — R$ ${brl2(p)}`));
    const promo = st.cat === 'Lanches' ? '<span class="hl">Promo de quarta: 20% off</span>\n' : '';
    say(`${promo}<b>${st.cat}</b>\n${numbered(items)}\n<b>0</b> - Voltar`, chipsFor(MENU[st.cat].map(([n]) => n), [{ label: '0 - Voltar', value: '0' }]));
  }
  function foodQty() {
    st.step = 'food.qty';
    say(`${st.item[0]}. Quantas unidades?`, ['1', '2', '3', '4'].map((n) => ({ label: n, value: n })));
  }
  function foodMore() {
    st.step = 'food.more';
    const it = st.cart[st.cart.length - 1];
    say(`Adicionado: ${it.qty}x ${it.name} — R$ ${brl2(it.price * it.qty)} ✅\n\n<b>1</b> - Adicionar mais itens\n<b>2</b> - Finalizar pedido`,
      [{ label: '1 - Adicionar mais', value: '1' }, { label: '2 - Finalizar', value: '2' }]);
  }
  function foodObs() {
    st.step = 'food.obs';
    say('Alguma observação? (ex.: sem cebola)\nSe não tiver, responda <b>0</b>.', [{ label: 'Sem cebola', value: 'Sem cebola' }, { label: '0 - Sem observação', value: '0' }]);
  }
  function foodDeliv() {
    st.step = 'food.deliv';
    say('Entrega ou retirada?\n<b>1</b> - Entrega (R$ 6,00)\n<b>2</b> - Retirar no balcão', [{ label: '1 - Entrega', value: '1' }, { label: '2 - Retirada', value: '2' }]);
  }
  function foodPay() {
    st.step = 'food.pay';
    say('Forma de pagamento:\n' + numbered(['Pix', 'Cartão na entrega', 'Dinheiro']), chipsFor(['Pix', 'Cartão', 'Dinheiro']));
  }
  function foodSummary() {
    st.step = 'food.confirm';
    const lines = st.cart.map((it) => `${it.qty}x ${esc(it.name)} — R$ ${brl2(it.price * it.qty)}`);
    if (st.obs) lines.push(`Obs.: ${esc(st.obs)}`);
    if (st.deliv === 'Entrega') lines.push('Entrega — R$ 6,00');
    const total = cartTotal();
    let pay = st.pay;
    if (st.pay === 'Dinheiro' && st.change) pay += ` (troco para R$ ${brl2(st.change)}: R$ ${brl2(st.change - total)})`;
    say(`<b>Resumo do pedido</b>\n${lines.join('\n')}\n<b>Total: R$ ${brl2(total)}</b>\n${st.deliv} · ${pay}\n\n<b>1</b> - Confirmar\n<b>2</b> - Recomeçar o pedido`,
      [{ label: '1 - Confirmar', value: '1' }, { label: '2 - Recomeçar', value: '2' }]);
  }
  function foodConfirm() {
    const n = orderN++;
    st.step = 'food.done';
    say(`<b>Pedido nº ${n} confirmado!</b> ✅\nTe aviso por aqui quando ${st.deliv === 'Entrega' ? 'sair para entrega' : 'estiver pronto para retirar'}.`);
    sys(`na loja: pedido nº ${n} apareceu no painel e o cupom foi impresso`, 500);
    pause(1800);
    sys('a loja mudou o status no painel…', 200);
    say(st.deliv === 'Entrega' ? `🛵 Seu pedido nº ${n} <b>saiu para entrega</b>!` : `🛍️ Seu pedido nº ${n} está <b>pronto para retirar</b>!`,
      [{ label: '1 - Fazer outro pedido', value: '1' }, BACK, { label: 'Testar na minha loja', href: CONFIG.signupUrl }]);
    st.cart = []; st.obs = ''; st.change = 0;
  }
  function nextDays() {
    const out = []; const d = new Date();
    for (let i = 1; i <= 3; i++) {
      const x = new Date(d); x.setDate(d.getDate() + i);
      out.push(`${i === 1 ? 'amanhã' : DOW[x.getDay()]} ${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}`);
    }
    return out;
  }
  function beautySvc() {
    st.step = 'beauty.svc';
    say('✂️ <b>Studio Bella</b>\nQual serviço?\n' + numbered(SERVICES.map(([n, p, d]) => `${n} — R$ ${brl2(p)} · ${d}`)), chipsFor(SERVICES.map(([n]) => n), [BACK]));
  }
  function beautyPro() {
    st.step = 'beauty.pro';
    say('Com quem você prefere?\n<b>1</b> - Ana\n<b>2</b> - Bruno\n<b>3</b> - Sem preferência', chipsFor(['Ana', 'Bruno', 'Sem preferência']));
  }
  function beautyDay() {
    st.step = 'beauty.day';
    st.days = nextDays();
    say(`Para qual dia?\n${numbered(st.days)}`, chipsFor(st.days));
  }
  function beautySlot() {
    st.step = 'beauty.slot';
    const art = st.pro === 'Ana' ? 'a Ana' : 'o Bruno';
    say(`Horários livres com ${art}, ${st.day}:\n${numbered(PROS[st.pro])}`, chipsFor(PROS[st.pro]));
  }
  function beautyConfirm() {
    st.step = 'beauty.confirm';
    say(`Confirma?\n<b>${st.svc[0]}</b> com ${st.pro}, ${st.day} às ${st.slot}\nValor: R$ ${brl2(st.svc[1])}\n\n<b>1</b> - Confirmar\n<b>2</b> - Escolher outro horário`,
      [{ label: '1 - Confirmar', value: '1' }, { label: '2 - Outro horário', value: '2' }]);
  }
  function beautyDone() {
    st.step = 'beauty.remind';
    say(`<b>Agendado!</b> ✅\n${st.svc[0]} com ${st.pro}, ${st.day} às ${st.slot}.\nPara remarcar ou cancelar, é só chamar aqui.`);
    sys(`na loja: o horário entrou na agenda e ${st.pro} recebeu o aviso no WhatsApp`, 500);
    pause(1600);
    sys('exemplo do lembrete que o cliente recebe antes do horário:', 200);
    say(`⏰ Lembrete: ${st.day} às ${st.slot}, ${st.svc[0].toLowerCase()} com ${st.pro}.\n<b>1</b> - Confirmo\n<b>2</b> - Remarcar\n<b>3</b> - Cancelar`, chipsFor(['Confirmo', 'Remarcar', 'Cancelar']));
  }
  function fixAsk() {
    st.step = 'fix.ask';
    say('🔧 <b>Conserta Fácil</b>\nMe diga o número da sua ordem de serviço.\n(Na demonstração qualquer número funciona. Tente <b>318</b>.)', [{ label: '318', value: '318' }]);
  }
  function fixShow() {
    st.step = 'fix.next'; st.osStage = 0;
    say(`<b>OS ${st.os}</b> · iPhone 11\nSituação: <span class="hl">em análise</span>\nO orçamento sai ainda hoje.\n\n<b>1</b> - Simular o próximo aviso\n<b>0</b> - Voltar ao início`,
      [{ label: '1 - Próximo aviso', value: '1' }, BACK]);
  }
  function fixNext() {
    const [stage, msg] = OS_STAGES[st.osStage];
    sys(`a loja mudou a etapa no painel: ${stage}`, 200);
    const last = st.osStage === OS_STAGES.length - 1;
    say(msg.replace('{os}', esc(st.os)) + (last ? '' : '\n\n<b>1</b> - Simular o próximo aviso'),
      last ? [BACK, { label: 'Testar na minha loja', href: CONFIG.signupUrl }] : [{ label: '1 - Próximo aviso', value: '1' }, BACK]);
    st.osStage += 1;
    if (last) st.step = 'fix.done';
  }
  function plans() {
    st.step = 'plans';
    say('💳 <b>Planos</b> (todos com 7 dias grátis, sem cartão):\n\n<b>Starter</b> — R$ 49,90/mês\naté 500 pedidos ou agendamentos · 2 usuários\n\n<b>Growth</b> — R$ 89,90/mês ⭐\naté 1.500 · 5 usuários · todos os módulos\n\n<b>Pro</b> — R$ 149,90/mês\naté 5.000 · 15 usuários · mesas e garçons',
      [{ label: 'Começar 7 dias grátis', href: CONFIG.signupUrl }, { label: 'Ver os planos na página', value: '__plans' }, BACK]);
  }
  function handoff() {
    st.step = 'human';
    say('Pronto, chamei um atendente. 🙋\nNa loja de verdade, o robô <b>para de responder</b> nesta conversa e a sua equipe recebe o aviso no painel.\n(Aqui é demonstração: ninguém vai entrar 😉)', [{ label: 'Voltar ao robô', value: 'menu' }]);
  }
  function unknown() {
    say('Não entendi 🤔 Responda com o <b>número</b> de uma das opções.\nPara voltar ao início, digite <b>menu</b>.', st.chips);
  }

  function handle(raw) {
    const t = norm(raw);
    const n = /^\d{1,6}$/.test(t) ? Number(t) : null;
    if (t === '__plans') { close(); $('#planos').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    if (/atendente|humano|pessoa|falar com alguem/.test(t)) return handoff();
    if (/^(menu|inicio|recomecar|voltar ao robo|voltar ao inicio)$/.test(t)) return menu();
    if (st.step !== 'food.obs' && /(plano|preco|quanto custa|mensalidade)/.test(t)) return plans();
    switch (st.step) {
      case 'menu':
        if (n === 1 || /lanche|pedir|pedido|comida|fome/.test(t)) return foodCats();
        if (n === 2 || /horario|marcar|agenda|corte/.test(t)) return beautySvc();
        if (n === 3 || /\bos\b|ordem|conserto|assistencia/.test(t)) return fixAsk();
        if (n === 4) return plans();
        if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai)/.test(t)) { say('Oi! 😊'); return menu(); }
        return unknown();
      case 'food.cat':
        if (n === 0) return menu();
        if (n >= 1 && n <= CATS.length) { st.cat = CATS[n - 1]; return foodItems(); }
        return unknown();
      case 'food.item':
        if (n === 0) return foodCats();
        if (n >= 1 && n <= MENU[st.cat].length) { st.item = MENU[st.cat][n - 1]; return foodQty(); }
        return unknown();
      case 'food.qty':
        if (n >= 1 && n <= 20) { st.cart.push({ name: st.item[0], price: st.item[1], qty: n }); return foodMore(); }
        if (n !== null) { say('Dá para pedir de 1 a 20 unidades por vez.', st.chips); return undefined; }
        return unknown();
      case 'food.more':
        if (n === 1) return foodCats();
        if (n === 2) return foodObs();
        return unknown();
      case 'food.obs':
        st.obs = (t === '0' || /^(nao|nenhuma|sem observacao)$/.test(t)) ? '' : raw.trim().slice(0, 80);
        return foodDeliv();
      case 'food.deliv':
        if (n === 1 || n === 2) { st.deliv = n === 1 ? 'Entrega' : 'Retirada'; return foodPay(); }
        return unknown();
      case 'food.pay':
        if (n >= 1 && n <= 3) {
          st.pay = ['Pix', 'Cartão na entrega', 'Dinheiro'][n - 1];
          if (n === 3) { st.step = 'food.change'; say(`Total: R$ ${brl2(cartTotal())}. Troco para quanto?\nSe não precisar, responda <b>0</b>.`, [{ label: '0 - Sem troco', value: '0' }, { label: '100', value: '100' }]); return undefined; }
          return foodSummary();
        }
        return unknown();
      case 'food.change': {
        const v = Number(t.replace(',', '.').replace(/[^\d.]/g, ''));
        if (t === '0') { st.change = 0; return foodSummary(); }
        if (!Number.isFinite(v) || v <= 0) { say('Digite só o valor, por exemplo <b>100</b>.'); return undefined; }
        if (v < cartTotal()) { say(`Esse valor é menor que o total (R$ ${brl2(cartTotal())}). Digite outro valor ou <b>0</b>.`); return undefined; }
        st.change = v; return foodSummary();
      }
      case 'food.confirm':
        if (n === 1) return foodConfirm();
        if (n === 2) { st.cart = []; st.obs = ''; return foodCats(); }
        return unknown();
      case 'food.done':
        if (n === 1) return foodCats();
        if (n === 0) return menu();
        return unknown();
      case 'beauty.svc':
        if (n === 0) return menu();
        if (n >= 1 && n <= SERVICES.length) { st.svc = SERVICES[n - 1]; return beautyPro(); }
        return unknown();
      case 'beauty.pro':
        if (n >= 1 && n <= 3) {
          st.pro = n === 3 ? pick(['Ana', 'Bruno']) : ['Ana', 'Bruno'][n - 1];
          if (n === 3) say(`Sem problema! Separei os horários do${st.pro === 'Ana' ? 'a Ana' : ' Bruno'}.`);
          return beautyDay();
        }
        return unknown();
      case 'beauty.day':
        if (n >= 1 && n <= 3) { st.day = st.days[n - 1]; return beautySlot(); }
        return unknown();
      case 'beauty.slot':
        if (n >= 1 && n <= 4) { st.slot = PROS[st.pro][n - 1]; return beautyConfirm(); }
        return unknown();
      case 'beauty.confirm':
        if (n === 1) return beautyDone();
        if (n === 2) return beautyDay();
        return unknown();
      case 'beauty.remind':
        if (n === 1) { st.step = 'beauty.end'; say('Presença confirmada! Até lá 😊', [BACK, { label: 'Testar na minha loja', href: CONFIG.signupUrl }]); return undefined; }
        if (n === 2) return beautyDay();
        if (n === 3) { st.step = 'beauty.end'; say('Cancelado. O horário voltou a ficar livre na agenda.', [BACK]); return undefined; }
        return unknown();
      case 'fix.ask':
        if (n !== null) { st.os = String(n); return fixShow(); }
        say('Digite só os números da OS, por exemplo <b>318</b>.', st.chips); return undefined;
      case 'fix.next':
        if (n === 1) return fixNext();
        if (n === 0) return menu();
        return unknown();
      case 'human':
        say('(Na loja de verdade, quem responde agora é a sua equipe.)', [{ label: 'Voltar ao robô', value: 'menu' }]); return undefined;
      default:
        if (n === 0) return menu();
        return unknown();
    }
  }

  // --- abrir, fechar, recomeçar ---
  function open(flow) {
    w.hidden = false; fab.setAttribute('aria-expanded', 'true');
    if (teaser) teaser.hidden = true;
    try { sessionStorage.setItem('bot-seen', '1'); } catch (e) { /* sem storage */ }
    if (!opened) { opened = true; reset(); start(); }
    const map = { food: '1', beauty: '2', fix: '3', plans: '4' };
    if (flow && map[flow]) {
      // volta ao menu se preciso e "toca" a opção pelo visitante, na fila das mensagens
      if (st.step !== 'menu') menu();
      const labels = ['', 'Pedir um lanche', 'Marcar um horário', 'Consultar uma OS', 'Ver os planos'];
      q = q.then(() => send(map[flow], labels[map[flow]]));
    }
    if (finePointer) setTimeout(() => input.focus(), 50);
  }
  function close() { w.hidden = true; fab.setAttribute('aria-expanded', 'false'); }
  fab.addEventListener('click', () => (w.hidden ? open() : close()));
  $('#botw-close').addEventListener('click', () => { close(); fab.focus(); });
  $('#botw-reset').addEventListener('click', () => { gen++; q = Promise.resolve(); log.replaceChildren(); reset(); start(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!w.hidden) { close(); fab.focus(); } else if (!mnav.hidden) { setMenu(false); burger.focus(); }
  });
  $$('[data-open-bot]').forEach((b) => b.addEventListener('click', () => open(b.dataset.openBot || null)));
  $$('.bot-big').forEach((b) => b.addEventListener('click', () => open()));
  // convite discreto depois de alguns segundos (uma vez por visita)
  let seen = false;
  try { seen = sessionStorage.getItem('bot-seen') === '1'; } catch (e) { /* sem storage */ }
  if (teaser && !seen) {
    setTimeout(() => { if (w.hidden) teaser.hidden = false; }, 7000);
    $('#bot-teaser-x').addEventListener('click', () => { teaser.hidden = true; try { sessionStorage.setItem('bot-seen', '1'); } catch (e) { /* sem storage */ } });
  }
  return { open };
})();

// ---------- painel ao vivo (simulação) ----------
const liveBox = $('#live');
if (liveBox) {
  const NAMES = ['Carla', 'Marcos', 'Juliana', 'Rafael', 'Bruna', 'Diego', 'Patrícia', 'Lucas', 'Fernanda', 'João', 'Aline', 'Pedro', 'Camila', 'Thiago', 'Renata', 'Gustavo'];
  const ORDERS = [['2x X-Bacon', 48], ['1x Pizza G meio a meio', 72], ['3x Pastel · 1x Suco', 41.5], ['2x X-Salada · 1x Refri', 46], ['1x Porção de fritas', 28], ['1x Açaí 500 ml', 22], ['2x Hambúrguer artesanal', 64], ['1x Combo família', 89.9]];
  const FLOWS = {
    order: ['olhando o cardápio', 'escolhendo a quantidade', 'robô digitando…', 'confirmando o endereço', 'pedido confirmado ✓'],
    agenda: ['escolhendo o serviço', 'vendo horários livres', 'robô digitando…', 'horário marcado ✓'],
    os: ['consultando a OS', 'robô digitando…', 'situação enviada ✓'],
    human: ['digitou “atendente”', 'esperando a sua equipe'],
  };
  const slotsEl = $('#live-slots'); const feed = $('#live-feed'); const chart = $('#live-chart'); const clockEl = $('#live-clock');
  const toggleBtn = $('#live-toggle'); const speedBtn = $('#live-speed');
  const HOURS = [18, 19, 20, 21, 22, 23];
  let slots; let clock; let ped; let val; let avi; let byHour; let orderN = 1100; let osN = 320; let lastOrders = [];
  let timer = null; let userPaused = false; let fast = false; let inView = false;
  const fmtVal = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
  const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const slotEls = Array.from({ length: 8 }, () => {
    const el = document.createElement('div'); el.className = 'slotc free';
    el.innerHTML = '<span class="wa-av">·</span><div><b>livre</b><small>esperando cliente</small></div>';
    slotsEl.append(el); return el;
  });
  const barEls = HOURS.map((h) => {
    const d = document.createElement('div'); d.innerHTML = `<i></i><span>${h}h</span>`; chart.append(d); return d;
  });
  function newDay() {
    slots = Array(8).fill(null); clock = 19 * 60 + 10; ped = 18; val = 1012; avi = 41;
    byHour = [520, 492, 0, 0, 0, 0];
    tween($('#lk-ped'), ped, { bump: false }); tween($('#lk-val'), val, { fmt: fmtVal, bump: false }); tween($('#lk-avi'), avi, { bump: false });
    renderSlots(); renderChart();
  }
  function renderSlots() {
    slots.forEach((s, i) => {
      const el = slotEls[i];
      if (!s) { el.className = 'slotc free'; $('.wa-av', el).textContent = '·'; $('b', el).textContent = 'livre'; $('small', el).textContent = 'esperando cliente'; return; }
      const line = FLOWS[s.kind][s.stage];
      el.className = `slotc${s.kind === 'human' ? ' human' : ''}${line.includes('digitando') ? ' typing' : ''}${line.endsWith('✓') ? ' done' : ''}`;
      $('.wa-av', el).textContent = s.name[0];
      $('b', el).textContent = s.name;
      $('small', el).textContent = line;
    });
    tween($('#lk-conv'), slots.filter(Boolean).length, { bump: false });
  }
  function renderChart() {
    const hi = Math.max(600, ...byHour);
    const now = HOURS.indexOf(Math.floor(clock / 60));
    barEls.forEach((d, i) => { d.classList.toggle('now', i === now); $('i', d).style.setProperty('--h', `${Math.max(3, (byHour[i] / hi) * 100)}%`); });
  }
  function addFeed(kind, icon, html, sub) {
    const li = document.createElement('li'); li.className = `feed-i feed-i--${kind}`;
    li.innerHTML = `<span class="feed-i__ic">${ico(icon)}</span><div>${html}${sub ? `<small>${sub}</small>` : ''}</div><time>${hhmm(clock)}</time>`;
    feed.prepend(li);
    while (feed.children.length > 6) feed.lastElementChild.remove();
  }
  function aviso() { avi += 1; tween($('#lk-avi'), avi); }
  function complete(s) {
    if (s.kind === 'order') {
      const [items, v] = pick(ORDERS); const n = orderN++;
      ped += 1; val += v; lastOrders.push(n); if (lastOrders.length > 5) lastOrders.shift();
      const h = HOURS.indexOf(Math.floor(clock / 60)); if (h >= 0) byHour[h] += v;
      tween($('#lk-ped'), ped); tween($('#lk-val'), val, { fmt: fmtVal });
      addFeed('order', 'i-box', `<b>Pedido nº ${n}</b> · ${items}`, `${s.name} · R$ ${brl2(v)} · ${pick(['Pix', 'Pix', 'cartão', 'dinheiro'])} · cupom impresso`);
      aviso(); renderChart();
    } else if (s.kind === 'agenda') {
      addFeed('agenda', 'i-cal', `<b>Agendado:</b> ${pick(['Corte', 'Escova', 'Barba', 'Manicure'])} com ${pick(['Ana', 'Bruno', 'Carol'])}`, `${s.name} · ${pick(['amanhã', 'sábado'])} ${pick(['09:00', '10:30', '14:00', '16:30'])}`);
      aviso();
    } else if (s.kind === 'os') {
      addFeed('os', 'i-wrench', `<b>OS ${osN++}</b> · situação enviada ao cliente`, `${s.name} · ${pick(['em análise', 'orçamento pronto', 'pronto para retirada'])}`);
      aviso();
    }
  }
  function tick() {
    if (document.hidden) return;
    clock += 2;
    if (clock >= 24 * 60) { addFeed('day', 'i-clock', '<b>Novo dia simulado</b>', 'os números recomeçam'); newDay(); return; }
    clockEl.textContent = hhmm(clock);
    slots.forEach((s, i) => {
      if (!s) return;
      if (s.ttl !== undefined) { s.ttl -= 1; if (s.ttl <= 0) slots[i] = null; return; }
      if (Math.random() < 0.55) {
        s.stage += 1;
        const end = FLOWS[s.kind].length - 1;
        if (s.stage >= end) { s.stage = end; if (s.kind !== 'human') complete(s); s.ttl = s.kind === 'human' ? 4 : 2; }
      }
    });
    const free = slots.findIndex((s) => !s);
    if (free >= 0 && Math.random() < 0.6) {
      const r = Math.random();
      const kind = r < 0.55 ? 'order' : r < 0.75 ? 'agenda' : r < 0.9 ? 'os' : 'human';
      const busy = slots.filter(Boolean).map((s) => s.name);
      const s = { name: pick(NAMES.filter((x) => !busy.includes(x))), kind, stage: 0 };
      slots[free] = s;
      if (kind === 'human') addFeed('human', 'i-users', `<b>${s.name}</b> digitou “atendente”`, 'o robô pausou nesta conversa');
    }
    const roll = Math.random();
    if (roll < 0.12 && lastOrders.length) { addFeed('go', 'i-bike', `Pedido nº ${pick(lastOrders)} <b>saiu para entrega</b>`, 'aviso enviado sozinho'); aviso(); }
    else if (roll < 0.17 && lastOrders.length) addFeed('star', 'i-star', `Avaliação <b>${pick([5, 5, 5, 4])}/5</b> do pedido nº ${pick(lastOrders)}`, 'pedido e atendimento');
    else if (roll < 0.21) addFeed('cart', 'i-cart', `Carrinho não confirmado · ${pick(NAMES)}`, `R$ ${brl2(pick([18, 32, 46, 54]))} · vai para o relatório de desistências`);
    renderSlots(); renderChart();
  }
  function run() { if (timer) return; timer = setInterval(tick, fast ? 800 : 1600); liveBox.classList.remove('paused'); }
  function stop() { clearInterval(timer); timer = null; liveBox.classList.add('paused'); }
  function setToggle() {
    toggleBtn.setAttribute('aria-pressed', String(userPaused));
    $('use', toggleBtn).setAttribute('href', userPaused ? '#i-play' : '#i-pause');
    $('span', toggleBtn).textContent = userPaused ? 'Continuar' : 'Pausar';
  }
  toggleBtn.addEventListener('click', () => { userPaused = !userPaused; setToggle(); if (userPaused) stop(); else if (inView) run(); });
  speedBtn.addEventListener('click', () => {
    fast = !fast; speedBtn.setAttribute('aria-pressed', String(fast)); speedBtn.textContent = fast ? 'Velocidade normal' : 'Acelerar ×2';
    if (timer) { stop(); run(); }
  });
  newDay();
  addFeed('order', 'i-box', '<b>Pedido nº 1099</b> · 2x X-Bacon', 'Carla · R$ 48,00 · Pix · cupom impresso');
  onVisible(liveBox, () => { inView = true; if (!userPaused) run(); }, () => { inView = false; stop(); }, 0.2);
}

// ---------- recursos clicáveis ----------
// 1. conversas que andam + assumir conversa
const CONV_LINES = [
  ['Escolheu 2x X-Bacon', 'Informou: sem cebola', 'Pagamento: Pix', 'Pedido confirmado ✓'],
  ['Vendo o cardápio de porções', 'Escolheu batata frita', 'Confirmando endereço', 'Pedido confirmado ✓'],
  ['Confirmando endereço', 'Escolheu retirar no balcão', 'Pedido confirmado ✓', 'Recebeu “pronto para retirar”'],
];
const convs = $$('[data-conv]');
if (convs.length) {
  let k = 0; let timer = null;
  const step = () => {
    k += 1;
    convs.forEach((c, i) => {
      const small = $('small', c); small.textContent = CONV_LINES[i][(k + i) % CONV_LINES[i].length];
      c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
    });
  };
  onVisible(convs[0].parentElement, () => { if (!timer && !reduceMotion) timer = setInterval(step, 2200); }, () => { clearInterval(timer); timer = null; });
}
const handoffBtn = $('[data-handoff]');
if (handoffBtn) handoffBtn.addEventListener('click', () => {
  const human = handoffBtn.getAttribute('aria-pressed') !== 'true';
  handoffBtn.setAttribute('aria-pressed', String(human));
  handoffBtn.classList.toggle('conv--hand', human);
  $('small', handoffBtn).textContent = human ? 'Digitou “atendente” · toque para devolver ao robô' : 'Robô de volta · toque para assumir a conversa';
  $('.live', handoffBtn).textContent = human ? 'você' : 'robô';
});
// 2. promoção e cupom
const promoBtn = $('[data-promo]');
if (promoBtn) promoBtn.addEventListener('click', () => {
  const on = !promoBtn.classList.contains('on');
  promoBtn.classList.toggle('on', on); promoBtn.setAttribute('aria-checked', String(on));
  $('#menu-card').classList.toggle('promo-off', !on);
  $$('#menu-card b[data-full]').forEach((b) => { b.textContent = on ? b.dataset.promoPrice : b.dataset.full; b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip'); });
  const item = on ? 48 : 60;
  $('#receipt-item').textContent = brl2(item); $('#receipt-total').textContent = brl2(item + 6);
});
const printBtn = $('[data-print]');
if (printBtn) {
  let n = 1042;
  printBtn.addEventListener('click', () => {
    n += 1; $('#receipt-n').textContent = n;
    const r = $('#receipt'); r.classList.remove('printing'); void r.offsetWidth; r.classList.add('printing');
  });
}
// 3. agenda clicável
$$('[data-slot]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-slot].new').forEach((o) => { o.classList.remove('new'); o.textContent = 'livre'; o.setAttribute('aria-pressed', 'false'); });
  b.classList.add('new'); b.textContent = 'Você · Corte'; b.setAttribute('aria-pressed', 'true');
  const pro = b.dataset.pro; const art = pro === 'Bruno' ? 'o Bruno' : `a ${pro}`;
  const r = $('#remind');
  r.textContent = `Lembrete: amanhã às ${b.dataset.time}, corte com ${art}.\n1 - Confirmo  2 - Remarcar  3 - Cancelar`;
  r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash');
}));
// 4. ordem de serviço avançando
const OS_MSGS = [
  'Olá, Rafael! Recebemos seu iPhone 11. Sua ordem de serviço é a nº 318.',
  'Rafael, sua OS 318 está em análise. O orçamento sai ainda hoje.',
  'O orçamento da OS 318 está pronto: troca de bateria — R$ 280,00. Responda para aprovar ou tirar dúvidas.',
  'Seu iPhone 11 (OS 318) entrou em reparo. Avisamos quando ficar pronto.',
  'Boa notícia, Rafael! Seu iPhone 11 (OS 318) está pronto para retirada.',
];
const osBtn = $('[data-os-next]');
if (osBtn) {
  let s = 0;
  osBtn.addEventListener('click', () => {
    s = s >= OS_MSGS.length - 1 ? 0 : s + 1;
    $$('#os-tl li').forEach((li, i) => li.classList.toggle('on', i <= s));
    const m = $('#os-msg'); m.textContent = OS_MSGS[s]; m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash');
    osBtn.firstChild.textContent = s === OS_MSGS.length - 1 ? 'Recomeçar ' : 'Mudar para a próxima etapa ';
  });
}
// 5. lupa no print do painel
const zoom = $('#zoom');
if (zoom && finePointer) {
  zoom.addEventListener('pointerenter', () => zoom.classList.add('zooming'));
  zoom.addEventListener('pointerleave', () => zoom.classList.remove('zooming'));
  zoom.addEventListener('pointermove', (e) => {
    const b = zoom.getBoundingClientRect();
    zoom.style.setProperty('--zx', `${((e.clientX - b.left) / b.width) * 100}%`);
    zoom.style.setProperty('--zy', `${((e.clientY - b.top) / b.height) * 100}%`);
  });
}
// 6. permissões + histórico
$$('[data-perm]').forEach((b) => b.addEventListener('click', () => {
  const on = b.getAttribute('aria-checked') !== 'true';
  b.setAttribute('aria-checked', String(on)); $('.tog', b).classList.toggle('on', on);
  const logEl = $('#perm-log');
  const li = document.createElement('li'); li.className = 'new';
  const t = document.createElement('time'); t.textContent = 'agora';
  const sp = document.createElement('span'); sp.textContent = `Você ${on ? 'liberou' : 'bloqueou'} “${b.dataset.perm}” para ${b.dataset.who}`;
  li.append(t, sp); logEl.prepend(li);
  while (logEl.children.length > 4) logEl.lastElementChild.remove();
}));

// ---------- jornada: linha que avança ----------
const journey = $('#journey');
if (journey) {
  const steps = $$('.jstep', journey);
  const line = $('.journey__line', journey);
  const lit = new Set();
  const jio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const i = steps.indexOf(en.target);
      steps.slice(0, i + 1).forEach((s, k) => {
        if (lit.has(k)) return;
        lit.add(k);
        setTimeout(() => s.classList.add('on'), reduceMotion ? 0 : k * 260);
      });
      line.style.setProperty('--fill', String(Math.min(1, (Math.max(...lit) + 0.5) / steps.length)));
    });
  }, { threshold: 0.6 });
  steps.forEach((s) => jio.observe(s));
}

// ---------- efeitos de mouse: inclinação, botão magnético, brilho ----------
if (finePointer && !reduceMotion) {
  $$('[data-tilt]').forEach((el) => {
    const max = el.classList.contains('plan') ? 6 : 9;
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width; const y = (e.clientY - b.top) / b.height;
      el.style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
      el.classList.add('tilting');
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('tilting');
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    });
  });
  $$('[data-magnet]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2); const dy = e.clientY - (b.top + b.height / 2);
      el.style.setProperty('--mx', `${Math.max(-10, Math.min(10, dx * 0.18))}px`);
      el.style.setProperty('--my', `${Math.max(-8, Math.min(8, dy * 0.3))}px`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
  });
  const glow = $('#cursor-glow');
  document.addEventListener('pointermove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    glow.classList.add('on');
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('on'));
}

// ---------- CTA fixo no celular ----------
const sticky = $('#sticky');
if (sticky) {
  const targets = [$('#hero-ctas'), $('#final'), $('.ftr')].filter(Boolean);
  const visible = new Set([targets[0]]);
  // só aparece depois de rolar um pouco (no topo ele cobriria o título)
  const sync = () => {
    const show = visible.size === 0 && window.scrollY > innerHeight * 0.6;
    sticky.classList.toggle('show', show);
    sticky.setAttribute('aria-hidden', String(!show));
    $('a', sticky).tabIndex = show ? 0 : -1;
  };
  const sio = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
    sync();
  });
  targets.forEach((t) => sio.observe(t));
  window.addEventListener('scroll', sync, { passive: true });
}
