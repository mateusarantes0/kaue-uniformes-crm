// ============================================================
// NAVEGAÇÃO
// ============================================================
export type EntityType = 'orcamento' | 'pessoa' | 'empresa' | 'relatorios'

// ============================================================
// ENUMS COMPARTILHADOS
// ============================================================
export type UF =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO'

export const UFS: UF[] = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

// ============================================================
// ORÇAMENTO
// ============================================================
export type Coluna =
  | 'lead' | 'qualificacao' | 'orcamento_enviado' | 'negociacao'
  | 'objecao' | 'aguardando' | 'vendido' | 'despacho' | 'sucesso' | 'perdido' | 'lixo'

export type CondicaoPagamento = 'pix_avista' | 'boleto_avista' | 'pix_parcelado' | 'boleto_parcelado' | 'cartao_credito'
export const CONDICAO_PAGAMENTO_LABELS: Record<CondicaoPagamento, string> = {
  pix_avista: 'Pix à vista',
  boleto_avista: 'Boleto à vista',
  pix_parcelado: 'Pix parcelado',
  boleto_parcelado: 'Boleto parcelado',
  cartao_credito: 'Cartão de crédito',
}

export type CondicaoParcelamento = 'entrada_despacho' | 'parcelado'
export const CONDICAO_PARCELAMENTO_LABELS: Record<CondicaoParcelamento, string> = {
  entrada_despacho: 'Entrada e despacho',
  parcelado: 'Parcelado em X vezes',
}

export type Origem =
  | 'base_clientes' | 'blog' | 'chat_site' | 'email_mkt' | 'evento'
  | 'feira' | 'formulario' | 'google_organico' | 'google_ads'
  | 'indicacao' | 'instagram_organico' | 'landing_page'
  | 'ligacao_recebida' | 'linkedin_organico' | 'linkedin_ads'
  | 'loja_fisica' | 'marketplace' | 'meta_ads' | 'parcerias'
  | 'prospeccao_ativa' | 'qr_code' | 'radio_tv' | 'remarketing'
  | 'representante' | 'sms' | 'tiktok_organico' | 'tiktok_ads'
  | 'whatsapp' | 'youtube_ads'

export type Campanha =
  | 'dia_maes' | 'dia_pais' | 'dia_criancas' | 'black_friday'
  | 'cyber_monday' | 'natal' | 'ano_novo' | 'campanha_janeiro'
  | 'carnaval' | 'pascoa' | 'dia_consumidor' | 'semana_cliente'

export type TipoObjecao = 'preco' | 'prazo' | 'concorrencia' | 'sem_retorno'

export interface HistoricoItem {
  data: string
  texto: string
  usuarioId: string
}

export interface ItemAcao {
  id: string
  texto: string
  concluido: boolean
  criadoEm: string
}

export interface Orcamento {
  id: string
  nome: string
  responsavelId: string
  valor?: number
  empresaId?: string
  contatosIds: string[]
  coluna: Coluna
  probabilidade?: number
  probabilidadeEditadaManualmente?: boolean
  ultimoContatoEm?: string
  orcamentoEnviadoEm?: string
  dataFechamentoEsperada?: string
  vendidoEm?: string
  dataPerda?: string
  dataEntrega?: string
  origem?: Origem
  campanhaOfertada?: Campanha
  fechouPela?: Campanha
  tipoObjecao?: TipoObjecao
  observacaoObjecao?: string
  cenarioAtual?: string
  produto?: string
  quantidade?: number
  dataEntregaDesejada?: string
  dataSaida?: string
  condicaoPagamento?: CondicaoPagamento
  condicaoParcelamento?: CondicaoParcelamento
  detalheParcelamento?: string
  valorSinal?: number
  despachadoEm?: string
  justificativaQuantidadeMinima?: string
  motivoDescarte?: string
  arquivadoEm?: string
  itensAcao: ItemAcao[]
  historico: HistoricoItem[]
  criadoEm: string
  criadoPor: string
  atualizadoEm: string
  atualizadoPor: string
  ownerId: string
}

// ============================================================
// PESSOA
// ============================================================
export type TipoContato =
  | 'lead' | 'lead_qualificado' | 'cliente' | 'fornecedor'
  | 'colaborador' | 'transportadora' | 'motorista'
  | 'candidato_emprego' | 'prestador_servico' | 'representante'
  | 'terceirizado' | 'indicador' | 'spam' | 'outros'

export type Cargo =
  | 'dono' | 'socio' | 'ceo' | 'gerente' | 'coordenador' | 'supervisor'
  | 'comprador' | 'analista' | 'assistente' | 'financeiro' | 'contador'
  | 'administrativo' | 'vendedor' | 'representante_comercial'
  | 'consultor' | 'tecnico' | 'engenheiro' | 'operacional'
  | 'recepcionista' | 'secretaria'

export type GrauInfluencia = 'decisor' | 'influenciador' | 'operacional' | 'bloqueador'
export type Sexo = 'masculino' | 'feminino'
export type SimNaoNA = 'sim' | 'nao' | 'ainda_nao'

export interface Pessoa {
  id: string
  nome: string
  responsaveisIds: string[]
  telefone?: string
  empresasIds: string[]
  tipoContato?: TipoContato
  cargo?: Cargo
  grauInfluencia?: GrauInfluencia
  email?: string
  instagram?: string
  linkedin?: string
  etiquetas: string[]
  cpf?: string
  dataNascimento?: string
  sexo?: Sexo
  endereco?: string
  cidade?: string
  uf?: UF
  avaliouNoGoogle?: SimNaoNA
  pedimosIndicacao?: SimNaoNA
  indicacoes?: string
  criadoEm: string
  criadoPor: string
  atualizadoEm: string
  atualizadoPor: string
  ownerId: string
}

// ============================================================
// EMPRESA
// ============================================================
export type Segmento =
  | 'comercio_varejista' | 'comercio_atacadista' | 'industria'
  | 'servicos' | 'construcao_civil' | 'agronegocio'
  | 'saude' | 'educacao' | 'tecnologia' | 'transporte_logistica'
  | 'alimentacao' | 'eventos' | 'governo' | 'ong_terceiro_setor'
  | 'outros'

export type TipoCliente = 'ativo' | 'inativo' | 'inadimplente' | 'inoperante' | 'problematico'
export type GrupoEstrategico = 'g1' | 'g2' | 'g3' | 'g4' | 'g5'
export type Frequencia = 'anual' | 'semestral' | 'trimestral' | 'bimestral' | 'mensal' | 'quinzenal' | 'semanal'
export type StatusCliente = 'satisfeito' | 'insatisfeito'
export type PorteEmpresa = 'pequena' | 'media' | 'grande'

export interface Empresa {
  id: string
  nome: string
  responsaveisIds: string[]
  razaoSocial?: string
  cnpj?: string
  segmento?: Segmento
  tipoCliente?: TipoCliente
  grupoEstrategico?: GrupoEstrategico
  frequencia?: Frequencia
  statusCliente?: StatusCliente
  porteEmpresa?: PorteEmpresa
  site?: string
  email?: string
  instagram?: string
  linkedin?: string
  endereco?: string
  cidade?: string
  uf?: UF
  criadoEm: string
  criadoPor: string
  atualizadoEm: string
  atualizadoPor: string
  ownerId: string
}

// ============================================================
// LABELS
// ============================================================
export const PROBABILIDADE_POR_COLUNA: Record<Coluna, number> = {
  lead: 5, qualificacao: 15, orcamento_enviado: 35, negociacao: 55,
  objecao: 40, aguardando: 80, vendido: 100, despacho: 100, sucesso: 100,
  perdido: 0, lixo: 0,
}

export const COLUNA_LABELS: Record<Coluna, string> = {
  lead: 'Chegada Lead',
  qualificacao: 'Qualificação',
  orcamento_enviado: 'Orçamento Enviado',
  negociacao: 'Negociação',
  objecao: 'Objeção',
  aguardando: 'Aguardando',
  vendido: 'Vendido',
  despacho: 'Despacho',
  sucesso: 'Sucesso',
  perdido: 'Perdido',
  lixo: 'Lixo',
}

export const ORIGEM_LABELS: Record<Origem, string> = {
  base_clientes: 'Base de Clientes',
  blog: 'Blog',
  chat_site: 'Chat do Site',
  email_mkt: 'E-mail Marketing',
  evento: 'Evento',
  feira: 'Feira',
  formulario: 'Formulário',
  google_organico: 'Google (Orgânico)',
  google_ads: 'Google Ads',
  indicacao: 'Indicação',
  instagram_organico: 'Instagram (Orgânico)',
  landing_page: 'Landing Page',
  ligacao_recebida: 'Ligação Recebida',
  linkedin_organico: 'LinkedIn (Orgânico)',
  linkedin_ads: 'LinkedIn Ads',
  loja_fisica: 'Loja Física',
  marketplace: 'Marketplace',
  meta_ads: 'Meta Ads',
  parcerias: 'Parcerias',
  prospeccao_ativa: 'Prospecção Ativa',
  qr_code: 'QR Code',
  radio_tv: 'Rádio / TV',
  remarketing: 'Remarketing',
  representante: 'Representante Comercial',
  sms: 'SMS',
  tiktok_organico: 'TikTok (Orgânico)',
  tiktok_ads: 'TikTok Ads',
  whatsapp: 'WhatsApp',
  youtube_ads: 'YouTube Ads',
}

export const CAMPANHA_LABELS: Record<Campanha, string> = {
  dia_maes: 'Dia das Mães',
  dia_pais: 'Dia dos Pais',
  dia_criancas: 'Dia das Crianças',
  black_friday: 'Black Friday',
  cyber_monday: 'Cyber Monday',
  natal: 'Natal',
  ano_novo: 'Ano Novo',
  campanha_janeiro: 'Campanha Mês Janeiro',
  carnaval: 'Carnaval',
  pascoa: 'Páscoa',
  dia_consumidor: 'Dia do Consumidor',
  semana_cliente: 'Semana do Cliente',
}

export const TIPO_OBJECAO_LABELS: Record<TipoObjecao, string> = {
  preco: 'Preço',
  prazo: 'Prazo',
  concorrencia: 'Concorrência',
  sem_retorno: 'Sem retorno',
}

export const TIPO_CONTATO_LABELS: Record<TipoContato, string> = {
  lead: 'Lead',
  lead_qualificado: 'Lead Qualificado',
  cliente: 'Cliente',
  fornecedor: 'Fornecedor',
  colaborador: 'Colaborador',
  transportadora: 'Transportadora',
  motorista: 'Motorista',
  candidato_emprego: 'Candidato a Emprego',
  prestador_servico: 'Prestador de Serviço',
  representante: 'Representante',
  terceirizado: 'Terceirizado',
  indicador: 'Indicador',
  spam: 'Spam',
  outros: 'Outros',
}

export const CARGO_LABELS: Record<Cargo, string> = {
  dono: 'Dono / Proprietário',
  socio: 'Sócio',
  ceo: 'CEO / Diretor',
  gerente: 'Gerente',
  coordenador: 'Coordenador',
  supervisor: 'Supervisor',
  comprador: 'Comprador',
  analista: 'Analista',
  assistente: 'Assistente',
  financeiro: 'Financeiro',
  contador: 'Contador',
  administrativo: 'Administrativo',
  vendedor: 'Vendedor',
  representante_comercial: 'Representante Comercial',
  consultor: 'Consultor',
  tecnico: 'Técnico',
  engenheiro: 'Engenheiro',
  operacional: 'Operacional',
  recepcionista: 'Recepcionista',
  secretaria: 'Secretária',
}

export const GRAU_INFLUENCIA_LABELS: Record<GrauInfluencia, string> = {
  decisor: 'Decisor',
  influenciador: 'Influenciador',
  operacional: 'Operacional',
  bloqueador: 'Bloqueador',
}

export const SEXO_LABELS: Record<Sexo, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
}

export const SIM_NAO_NA_LABELS: Record<SimNaoNA, string> = {
  sim: 'Sim',
  nao: 'Não',
  ainda_nao: 'Ainda não',
}

export const SEGMENTO_LABELS: Record<Segmento, string> = {
  comercio_varejista: 'Comércio Varejista',
  comercio_atacadista: 'Comércio Atacadista',
  industria: 'Indústria',
  servicos: 'Serviços',
  construcao_civil: 'Construção Civil',
  agronegocio: 'Agronegócio',
  saude: 'Saúde',
  educacao: 'Educação',
  tecnologia: 'Tecnologia',
  transporte_logistica: 'Transporte e Logística',
  alimentacao: 'Alimentação',
  eventos: 'Eventos',
  governo: 'Governo',
  ong_terceiro_setor: 'ONG / Terceiro Setor',
  outros: 'Outros',
}

export const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  inadimplente: 'Inadimplente',
  inoperante: 'Inoperante',
  problematico: 'Problemático',
}

export const GRUPO_ESTRATEGICO_LABELS: Record<GrupoEstrategico, string> = {
  g1: 'G1', g2: 'G2', g3: 'G3', g4: 'G4', g5: 'G5',
}

export const FREQUENCIA_LABELS: Record<Frequencia, string> = {
  anual: 'Anual',
  semestral: 'Semestral',
  trimestral: 'Trimestral',
  bimestral: 'Bimestral',
  mensal: 'Mensal',
  quinzenal: 'Quinzenal',
  semanal: 'Semanal',
}

export const STATUS_CLIENTE_LABELS: Record<StatusCliente, string> = {
  satisfeito: 'Cliente Satisfeito',
  insatisfeito: 'Cliente Insatisfeito',
}

export const PORTE_EMPRESA_LABELS: Record<PorteEmpresa, string> = {
  pequena: 'Pequena',
  media: 'Média',
  grande: 'Grande',
}

// ============================================================
// CONFIGURAÇÃO DO KANBAN
// ============================================================
export interface ColunaConfig {
  id: Coluna
  label: string
  emoji: string
  showTotal: boolean
  borderColor: string
}

export const COLUNAS: ColunaConfig[] = [
  { id: 'lead',              label: 'Chegada Lead',      emoji: '📋', showTotal: false, borderColor: 'border-slate-400'  },
  { id: 'qualificacao',      label: 'Qualificação',      emoji: '🎯', showTotal: false, borderColor: 'border-slate-300'  },
  { id: 'orcamento_enviado', label: 'Orçamento Enviado', emoji: '💼', showTotal: true,  borderColor: 'border-amber-400'  },
  { id: 'negociacao',        label: 'Negociação',        emoji: '🤝', showTotal: true,  borderColor: 'border-purple-400' },
  { id: 'objecao',           label: 'Objeção',           emoji: '⚠️', showTotal: true,  borderColor: 'border-orange-400' },
  { id: 'aguardando',        label: 'Aguardando',        emoji: '⏳', showTotal: false, borderColor: 'border-yellow-400' },
  { id: 'vendido',           label: 'Vendido',           emoji: '✅', showTotal: true,  borderColor: 'border-green-600'  },
  { id: 'despacho',          label: 'Despacho',          emoji: '📦', showTotal: true,  borderColor: 'border-blue-400'   },
  { id: 'sucesso',           label: 'Sucesso',           emoji: '🌟', showTotal: true,  borderColor: 'border-green-400'  },
  { id: 'perdido',           label: 'Perdido',           emoji: '❌', showTotal: false, borderColor: 'border-red-500'    },
  { id: 'lixo',              label: 'Lixo',              emoji: '🗑️', showTotal: false, borderColor: 'border-slate-500'  },
]

export const COLUNA_BADGE_COLORS: Record<Coluna, { fg: string; bg: string }> = {
  lead:              { fg: 'text-slate-300',   bg: 'bg-slate-700/40' },
  qualificacao:      { fg: 'text-cyan-300',    bg: 'bg-cyan-500/15' },
  orcamento_enviado: { fg: 'text-amber-300',   bg: 'bg-amber-500/15' },
  negociacao:        { fg: 'text-violet-300',  bg: 'bg-violet-500/20' },
  objecao:           { fg: 'text-orange-300',  bg: 'bg-orange-500/15' },
  aguardando:        { fg: 'text-yellow-300',  bg: 'bg-yellow-500/15' },
  vendido:           { fg: 'text-green-400',   bg: 'bg-green-500/20' },
  despacho:          { fg: 'text-blue-300',    bg: 'bg-blue-500/20' },
  sucesso:           { fg: 'text-emerald-300', bg: 'bg-emerald-500/20' },
  perdido:           { fg: 'text-red-300',     bg: 'bg-red-500/20' },
  lixo:              { fg: 'text-slate-500',   bg: 'bg-slate-700/30' },
}

export const LIMITE_DIAS_POR_COLUNA: Record<Coluna, number | null> = {
  lead: 1,
  qualificacao: 2,
  orcamento_enviado: 5,
  negociacao: 15,
  objecao: 45,
  aguardando: null,
  vendido: null,
  despacho: null,
  sucesso: null,
  perdido: null,
  lixo: null,
}

export const TRANSICAO_VENCIMENTO: Partial<Record<Coluna, { destino: Coluna; tipoObjecao: TipoObjecao }>> = {
  lead: { destino: 'objecao', tipoObjecao: 'sem_retorno' },
  qualificacao: { destino: 'objecao', tipoObjecao: 'sem_retorno' },
  orcamento_enviado: { destino: 'objecao', tipoObjecao: 'sem_retorno' },
  negociacao: { destino: 'objecao', tipoObjecao: 'preco' },
  objecao: { destino: 'perdido', tipoObjecao: 'sem_retorno' },
}

export const COLUNA_BADGE: Record<Coluna, string> = {
  lead:              'bg-slate-700 text-slate-300',
  qualificacao:      'bg-slate-600 text-slate-200',
  orcamento_enviado: 'bg-amber-900/40 text-amber-400',
  negociacao:        'bg-purple-900/40 text-purple-400',
  objecao:           'bg-orange-900/40 text-orange-400',
  aguardando:        'bg-yellow-900/40 text-yellow-400',
  vendido:           'bg-green-900/40 text-green-400',
  despacho:          'bg-blue-900/40 text-blue-400',
  sucesso:           'bg-green-800/40 text-green-300',
  perdido:           'bg-red-900/40 text-red-400',
  lixo:              'bg-slate-800 text-slate-500',
}
