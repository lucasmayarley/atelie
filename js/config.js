// ============================================================
// CONFIGURAÇÃO — edite apenas este arquivo
// ============================================================
const CONFIG = {
  // 1. Crie um projeto no Google Cloud Console
  // 2. Ative a API do Google Sheets e Google Drive
  // 3. Crie credenciais OAuth 2.0 (Aplicativo da Web)
  // 4. Adicione a URL do seu GitHub Pages como origem autorizada
  // 5. Cole o Client ID abaixo
  CLIENT_ID: '197039872362-nq3f580952r3njgo2doggo691m1d12tm.apps.googleusercontent.com',

  // ID da planilha Google Sheets (parte da URL entre /d/ e /edit)
  SHEET_ID: 'SEU_SHEET_ID_AQUI',

  // Escopos necessários
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',

  // Nome do ateliê (aparece no sistema)
  NOME_ATELIE: 'Ateliê da Costura',

  // Abas da planilha
  ABAS: {
    CLIENTES: 'Clientes',
    GRUPOS: 'Grupos',
    GRUPOS_COMPONENTES: 'Grupos_Componentes',
    PEDIDOS: 'Pedidos',
    PEDIDOS_ITENS: 'Pedidos_Itens',
    PAGAMENTOS: 'Pagamentos',
    FINANCEIRO_SAIDAS: 'Financeiro_Saidas',
    FESTIVIDADES: 'Festividades',
    CONFIGURACOES: 'Configuracoes',
  }
};

// Medidas e quais são relevantes por tipo de peça
const MEDIDAS = [
  'Busto','Cintura','Quadril','Altura do busto','Altura da cintura',
  'Altura do quadril','Altura da cava','Entre cava frente','Entre cava costas',
  'Costado','Tamanho da manga','Largura da manga','Comprimento da blusa',
  'Comprimento do vestido','Cintura da saia','Altura do quadril (saia)','Comprimento da saia'
];

const MEDIDAS_POR_PECA = {
  'Vestido':     ['Busto','Cintura','Quadril','Altura do busto','Comprimento do vestido','Entre cava frente','Entre cava costas','Altura da cava'],
  'Blusa':       ['Busto','Cintura','Costado','Altura da cava','Entre cava frente','Entre cava costas','Tamanho da manga','Largura da manga','Comprimento da blusa'],
  'Saia':        ['Cintura da saia','Quadril','Altura do quadril (saia)','Comprimento da saia'],
  'Saia+Blusa':  ['Busto','Cintura','Quadril','Costado','Altura da cava','Entre cava frente','Entre cava costas','Tamanho da manga','Largura da manga','Comprimento da blusa','Cintura da saia','Altura do quadril (saia)','Comprimento da saia'],
  'Fardamento':  null, // null = todas
  'Outro':       null,
};

const TIPOS_FARDA = ['Vestido','Saia + Blusa','Só Saia','Só Blusa'];
const TIPOS_PECA  = ['Vestido','Blusa','Saia','Fardamento','Outro'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
