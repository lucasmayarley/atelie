// ============================================================
// UI HELPERS — componentes reutilizáveis
// ============================================================

function toast(msg, tipo = 'ok') {
  const t = document.createElement('div');
  t.className = `toast toast-${tipo}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

function loading(mostrar, msg = 'Carregando...') {
  let el = document.getElementById('loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.innerHTML = `<div class="loading-box"><div class="spinner"></div><span id="loading-msg"></span></div>`;
    document.body.appendChild(el);
  }
  document.getElementById('loading-msg').textContent = msg;
  el.style.display = mostrar ? 'flex' : 'none';
}

function confirmar(msg) { return window.confirm(msg); }

// Formata data ISO para dd/mm/aaaa
function fmtData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

// Retorna data de hoje em formato ISO
function hoje() { return new Date().toISOString().split('T')[0]; }

// Iniciais de um nome
function iniciais(nome) {
  if (!nome) return '?';
  return nome.trim().split(/\s+/).slice(0,2).map(p => p[0]).join('').toUpperCase();
}

// Status de cliente baseado no último pedido
function statusCliente(ultimoPedido) {
  if (!ultimoPedido) return { label: 'Sem pedidos', classe: 'status-inativa' };
  const dias = (Date.now() - new Date(ultimoPedido)) / 86400000;
  if (dias <= 365) return { label: 'Ativa', classe: 'status-ativa' };
  if (dias <= 730) return { label: 'Morna', classe: 'status-morna' };
  return { label: 'Inativa', classe: 'status-inativa' };
}

// Status de pedido
const STATUS_PEDIDO = {
  'aguardando_tecido': { label: 'Aguardando tecido', cor: '#E8A838' },
  'em_producao':       { label: 'Em produção',       cor: '#378ADD' },
  'pronto':            { label: 'Pronto',             cor: '#1D9E75' },
  'entregue':          { label: 'Entregue',           cor: '#888780' },
};

const STATUS_PAGAMENTO = {
  'pendente':   { label: 'Pendente',    cor: '#E24B4A' },
  'sinal':      { label: 'Sinal pago',  cor: '#E8A838' },
  'parcial':    { label: 'Parcial',     cor: '#378ADD' },
  'quitado':    { label: 'Quitado',     cor: '#1D9E75' },
};

function badgePedido(status) {
  const s = STATUS_PEDIDO[status] || { label: status, cor: '#888' };
  return `<span class="badge" style="background:${s.cor}20;color:${s.cor};border:0.5px solid ${s.cor}40">${s.label}</span>`;
}

function badgePagamento(status) {
  const s = STATUS_PAGAMENTO[status] || { label: status, cor: '#888' };
  return `<span class="badge" style="background:${s.cor}20;color:${s.cor};border:0.5px solid ${s.cor}40">${s.label}</span>`;
}

// Formata valor em reais
function fmtReais(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Navbar ativa
function setNavAtivo(pagina) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('ativo', el.dataset.page === pagina);
  });
}

// Renderiza a navbar inferior
function renderNav(pagina) {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const items = [
    { page: 'pedidos',      icon: '📋', label: 'Pedidos',     href: 'pedidos.html' },
    { page: 'clientes',     icon: '👥', label: 'Clientes',    href: 'clientes.html' },
    { page: 'grupos',       icon: '🏛', label: 'Grupos',      href: 'grupos.html' },
    { page: 'financeiro',   icon: '💰', label: 'Financeiro',  href: 'financeiro.html' },
    { page: 'configuracoes',icon: '⚙️', label: 'Config',      href: 'configuracoes.html' },
  ];
  nav.innerHTML = items.map(i => `
    <a href="${i.href}" class="nav-item${i.page === pagina ? ' ativo' : ''}" data-page="${i.page}">
      <span class="nav-icon">${i.icon}</span>
      <span class="nav-label">${i.label}</span>
    </a>`).join('');
}

// Verificação de login em todas as páginas protegidas
function protegerPagina(callback) {
  initGoogleAuth(() => {
    if (!isLoggedIn()) { window.location.href = 'index.html'; return; }
    loading(true, 'Carregando dados...');
    inicializarPlanilha().then(() => {
      loading(false);
      callback && callback();
    }).catch(e => {
      loading(false);
      toast('Erro ao conectar com Google Sheets. Tente novamente.', 'erro');
      console.error(e);
    });
  });
}
