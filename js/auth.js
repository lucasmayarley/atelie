// ============================================================
// AUTH — Google OAuth 2.0
// ============================================================
let tokenClient;
let accessToken = null;

function initGoogleAuth(onReady) {
  google.accounts.id.initialize({ client_id: CONFIG.CLIENT_ID });
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    callback: (resp) => {
      if (resp.error) { console.error(resp); return; }
      accessToken = resp.access_token;
      localStorage.setItem('atelie_token', accessToken);
      onReady && onReady();
    }
  });
  const saved = localStorage.getItem('atelie_token');
  if (saved) { accessToken = saved; onReady && onReady(); }
}

function requestLogin() {
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

function logout() {
  google.accounts.oauth2.revoke(accessToken, () => {});
  accessToken = null;
  localStorage.removeItem('atelie_token');
  window.location.href = 'index.html';
}

function isLoggedIn() { return !!accessToken; }

// ============================================================
// SHEETS — operações CRUD
// ============================================================
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function sheetsRequest(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE}/${CONFIG.SHEET_ID}${path}`, opts);
  if (r.status === 401) { accessToken = null; localStorage.removeItem('atelie_token'); window.location.href = 'index.html'; }
  return r.json();
}

// Lê todas as linhas de uma aba (retorna array de objetos usando 1ª linha como header)
async function lerAba(aba) {
  const data = await sheetsRequest(`/values/${aba}`);
  if (!data.values || data.values.length < 2) return [];
  const headers = data.values[0];
  return data.values.slice(1).map((row, i) => {
    const obj = { _linha: i + 2 };
    headers.forEach((h, j) => { obj[h] = row[j] || ''; });
    return obj;
  });
}

// Adiciona uma linha no final da aba
async function adicionarLinha(aba, obj) {
  const data = await sheetsRequest(`/values/${aba}`);
  const headers = data.values ? data.values[0] : Object.keys(obj);
  if (!data.values) await sheetsRequest(`/values/${aba}`, 'PUT', { values: [headers] });
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  await sheetsRequest(`/values/${aba}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, 'POST', { values: [row] });
}

// Atualiza uma linha específica (por número de linha _linha)
async function atualizarLinha(aba, obj) {
  const data = await sheetsRequest(`/values/${aba}`);
  const headers = data.values[0];
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  await sheetsRequest(`/values/${aba}!A${obj._linha}?valueInputOption=RAW`, 'PUT', { values: [row] });
}

// Inicializa as abas da planilha se ainda não existirem
async function inicializarPlanilha() {
  const meta = await sheetsRequest('');
  const abasExistentes = meta.sheets.map(s => s.properties.title);
  const HEADERS = {
    Clientes: ['ID','Nome','Telefone','Congregacao','Observacoes','DataCriacao','DataAtualizacaoMedidas',...MEDIDAS.flatMap(m=>[m+'_total',m+'_metade'])],
    Grupos: ['ID','Nome','Congregacao','Responsavel','TelResponsavel','MesFestividade','Observacoes','DataCriacao'],
    Grupos_Componentes: ['ID','GrupoID','ClienteID','DataEntrada'],
    Pedidos: ['ID','Tipo','GrupoID','ClienteID','TipoPeca','TipoFarda','Descricao','Tecido','QuemCompraTecido','Prazo','Status','PrecoUnitario','PrecoTotal','DataCriacao','DataFechamento','Observacoes'],
    Pedidos_Itens: ['ID','PedidoID','ClienteID','Status','DataEntrega','Observacoes'],
    Pagamentos: ['ID','PedidoID','Valor','Data','Forma','Status','Observacoes'],
    Financeiro_Saidas: ['ID','PedidoID','Descricao','Valor','Data','Categoria'],
    Festividades: ['ID','GrupoID','Descricao','Data','Ano','TipoFarda','Observacoes'],
    Configuracoes: ['Chave','Valor']
  };
  const abasFaltando = Object.keys(HEADERS).filter(a => !abasExistentes.includes(a));
  if (!abasFaltando.length) return;

  // Cria abas faltando
  await sheetsRequest(':batchUpdate', 'POST', {
    requests: abasFaltando.map(title => ({ addSheet: { properties: { title } } }))
  });
  // Adiciona headers
  for (const aba of abasFaltando) {
    await sheetsRequest(`/values/${aba}!A1?valueInputOption=RAW`, 'PUT', { values: [HEADERS[aba]] });
  }

  // Configurações padrão
  const cfgExist = await lerAba('Configuracoes');
  if (!cfgExist.length) {
    const defaults = [
      ['valor_hora', '50'],
      ['margem_lucro', '30'],
      ['nome_atelie', CONFIG.NOME_ATELIE],
      ['meses_inativo', '12'],
      ['meses_morno', '24'],
    ];
    for (const [k, v] of defaults) {
      await adicionarLinha('Configuracoes', { Chave: k, Valor: v });
    }
  }
}

// Helpers de ID único
function gerarID() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Config rápida
async function getConfig(chave) {
  const rows = await lerAba('Configuracoes');
  const row = rows.find(r => r.Chave === chave);
  return row ? row.Valor : null;
}

async function setConfig(chave, valor) {
  const rows = await lerAba('Configuracoes');
  const row = rows.find(r => r.Chave === chave);
  if (row) { row.Valor = valor; await atualizarLinha('Configuracoes', row); }
  else await adicionarLinha('Configuracoes', { Chave: chave, Valor: valor });
}
