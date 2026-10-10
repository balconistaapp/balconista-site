'use strict';
/* Página de vendas do Balconista: botões, links e animações. Os endereços do painel ficam em CONFIG, logo abaixo. */

// Qual painel usar: a página de teste (site.…sslip.io) e o computador de quem edita (localhost) usam o painel de TESTE,
// para ninguém criar conta de verdade enquanto testa. Em balconista.app.br, o painel de verdade.
const TESTE = /(^|\.)sslip\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);
const PAINEL = TESTE ? 'https://179-236-243-185.sslip.io' : 'https://painel.balconista.app.br';

// ===== Configuração: troque aqui =====
const CONFIG = {
  brand: 'Balconista',            // nome do produto
  salesWhatsApp: '',              // seu WhatsApp de vendas com DDI e DDD, só números. Ex.: '5547999990000'
  checkoutLinks: {                // links de assinatura do Asaas/Stripe para cada plano (quando estiverem criados)
    Starter: '', Growth: '', Pro: '',
  },
  termsUrl: `${PAINEL}/termos`, privacyUrl: `${PAINEL}/privacidade`,
  loginUrl: `${PAINEL}/entrar`,            // tela de login do painel (quem já é cliente)
  signupUrl: `${PAINEL}/criar-conta`,      // onde o cliente cria a conta e começa o teste (vazio = usa os links acima ou o WhatsApp)
};

// Nome do produto em todos os lugares
document.querySelectorAll('[data-brand]').forEach(n => { n.textContent = CONFIG.brand; });
document.getElementById('year').textContent = new Date().getFullYear();

// Botões: plano -> link de assinatura; sem link, abre conversa no WhatsApp de vendas já com o plano escrito
const wa = (msg) => (CONFIG.salesWhatsApp ? `https://wa.me/${CONFIG.salesWhatsApp}?text=${encodeURIComponent(msg)}` : null);
document.querySelectorAll('[data-plan]').forEach(a => {
  const plan = a.dataset.plan;
  const href = (CONFIG.signupUrl && `${CONFIG.signupUrl}?plano=${plan.toLowerCase()}`) || CONFIG.checkoutLinks[plan] || wa(`Olá! Quero testar o ${CONFIG.brand} no plano ${plan}.`);
  if (href && CONFIG.signupUrl) a.href = href;
  else if (href) { a.href = href; a.target = '_blank'; a.rel = 'noopener'; }
  else a.href = '#planos';
});
// "Testar grátis" do topo, do início e do fim: direto para criar a conta
if (CONFIG.signupUrl) document.querySelectorAll('[data-cta="topo"],[data-cta="hero"],[data-cta="final"]').forEach(a => { a.href = CONFIG.signupUrl; });
document.querySelectorAll('[data-cta="contato"]').forEach(a => {
  const href = wa(`Olá! Quero saber mais sobre o ${CONFIG.brand}.`);
  if (href) { a.href = href; a.target = '_blank'; a.rel = 'noopener'; } else a.hidden = true;
});
// Termos de uso e política de privacidade (ficam no painel)
for (const [key, url] of [['termos', CONFIG.termsUrl], ['privacidade', CONFIG.privacyUrl]]) {
  document.querySelectorAll(`[data-link="${key}"]`).forEach(link => { if (url) link.href = url; else link.hidden = true; });
}

// Entrar (quem já contratou)
document.querySelectorAll('[data-login]').forEach(a => { a.href = CONFIG.loginUrl; });

// Celular do topo: troca a conversa conforme o tipo de negócio (mouse, toque ou teclado)
const CHATS = {
  food: { av: 'L', name: 'Lanchonete do Zé', float: '<b>🔔 Novo pedido no painel</b>Nº 1042 · R$ 54,00 · Pix<br>Entrega · 🖨 cupom impresso' },
  fix: { av: 'C', name: 'Conserta Fácil', float: '<b>🔧 3 avisos, nenhum digitado</b>Cada etapa da OS 318<br>avisada sozinha' },
  beauty: { av: 'S', name: 'Studio Bella', float: '<b>📅 Ana recebeu no WhatsApp</b>Novo agendamento<br>sex 10/10 · 10:30' },
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentChat = 'food';
function showChat(key, { animate = true } = {}) {
  if (key === currentChat) return;
  currentChat = key;
  document.querySelectorAll('.pill[data-show]').forEach(p => p.setAttribute('aria-pressed', String(p.dataset.show === key)));
  document.querySelectorAll('.chat[data-chat]').forEach(c => {
    const on = c.dataset.chat === key;
    c.hidden = !on;
    c.classList.remove('play');
    if (on && animate && !reduceMotion) {
      [...c.children].forEach((b, i) => b.style.setProperty('--i', i));
      void c.offsetWidth;   // reinicia a animação
      c.classList.add('play');
    }
  });
  document.getElementById('chat-av').textContent = CHATS[key].av;
  document.getElementById('chat-name').textContent = CHATS[key].name;
  const fl = document.getElementById('chat-float');
  fl.innerHTML = CHATS[key].float;
  fl.classList.remove('bump'); void fl.offsetWidth; fl.classList.add('bump');
  // mantém as abas "Para quem é" combinando com o exemplo escolhido
  document.getElementById({ food: 't-food', fix: 't-fix', beauty: 't-beauty' }[key])?.click();
}
let hoverTimer;
document.querySelectorAll('.pill[data-show]').forEach(p => {
  p.addEventListener('click', () => showChat(p.dataset.show));
  p.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => showChat(p.dataset.show), 120); });
  p.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
});

// Calculadora: quanto a loja deixa de vender por mês
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const PLAN_PRICE = 49.9;    // plano Starter
const WEEKS = 4;            // 4 semanas por mês: bate com a conta de cabeça e fica abaixo do real (por isso "pelo menos")
const vendas = (n) => `${n} ${n === 1 ? 'venda' : 'vendas'}`;
function calc() {
  const lost = Number(document.getElementById('calc-lost').value);
  const ticket = Number(document.getElementById('calc-ticket').value);
  const monthly = Math.round(lost * ticket * WEEKS);
  const toPay = Math.max(1, Math.ceil(PLAN_PRICE / ticket));          // vendas por mês que pagam o plano
  document.getElementById('calc-lost-out').textContent = vendas(lost);
  document.getElementById('calc-ticket-out').textContent = brl(ticket);
  document.getElementById('calc-loss').textContent = brl(monthly);
  // Só promete que o plano se paga quando o que escapa no mês cobre o preço dele (e nunca pede mais vendas do que escapam)
  const verdict = monthly < PLAN_PRICE
    ? `O plano Starter custa <strong>R$ 49,90</strong>, mais do que escapa nesse cenário. Com vendas de ${brl(ticket)}, ele se paga a partir de <strong>${vendas(Math.ceil(PLAN_PRICE / (ticket * WEEKS)))} recuperadas por semana</strong>.`
    : toPay <= Math.floor(lost * WEEKS)
      ? `O plano Starter custa <strong>R$ 49,90</strong>. Recuperando só <strong>${vendas(toPay)}</strong> por mês, ele já se paga.`
      : `O plano Starter custa <strong>R$ 49,90</strong>. Recuperando as vendas que escapam no mês, <strong>ele já se paga</strong>.`;
  document.getElementById('calc-verdict').innerHTML = verdict;
}
document.getElementById('calc-lost').addEventListener('input', calc);
document.getElementById('calc-ticket').addEventListener('input', calc);
calc();

// Abas "Para quem é"
const tabs = [...document.querySelectorAll('.seg-tabs [role="tab"]')];
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}));

// Voltar ao topo: aparece depois de descer uma tela; ao clicar, sobe e põe o foco no começo da página (teclado)
const toTop = document.getElementById('to-top');
const syncTop = () => toTop.classList.toggle('is-hidden', window.scrollY < window.innerHeight * 0.8);
syncTop();
window.addEventListener('scroll', syncTop, { passive: true });
toTop.addEventListener('click', (ev) => {
  ev.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  document.querySelector('.top .logo')?.focus({ preventScroll: true });
});
