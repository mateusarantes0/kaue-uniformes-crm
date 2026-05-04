export type EntityType = 'orcamento' | 'pessoa' | 'empresa'

export type Coluna =
  | 'lead'
  | 'qualificacao'
  | 'orcamento_enviado'
  | 'negociacao'
  | 'objecao'
  | 'aguardando'
  | 'perdido'
  | 'vendido'
  | 'sucesso'
  | 'lixo'
  | 'sac'

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

export interface Pessoa {
  id: string
  nome: string
  empresaId?: string
  criadoEm: string
  atualizadoEm: string
  ownerId: string
}

export interface Empresa {
  id: string
  nome: string
  criadoEm: string
  atualizadoEm: string
  ownerId: string
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
  ultimoContatoEm?: string
  orcamentoEnviadoEm?: string
  dataFechamentoEsperada?: string
  proximaAtividade?: string
  vendidoEm?: string
  dataPerda?: string
  dataEntrega?: string
  origem?: Origem
  campanhaOfertada?: Campanha[]
  fechouPela?: Campanha
  tipoObjecao?: TipoObjecao
  observacaoObjecao?: string
  historico: HistoricoItem[]
  criadoEm: string
  criadoPor: string
  atualizadoEm: string
  atualizadoPor: string
  ownerId: string
}

export interface ColunaConfig {
  id: Coluna
  label: string
  emoji: string
  showTotal: boolean
}

export const COLUNAS: ColunaConfig[] = [
  { id: 'lead',              label: 'Lead',             emoji: '📋', showTotal: false },
  { id: 'qualificacao',      label: 'Qualificação',      emoji: '🎯', showTotal: false },
  { id: 'orcamento_enviado', label: 'Orçamento Enviado', emoji: '💼', showTotal: true  },
  { id: 'negociacao',        label: 'Negociação',        emoji: '🤝', showTotal: true  },
  { id: 'objecao',           label: 'Objeção',           emoji: '⚠️', showTotal: true  },
  { id: 'aguardando',        label: 'Aguardando',        emoji: '⏳', showTotal: false },
  { id: 'perdido',           label: 'Perdido',           emoji: '❌', showTotal: false },
  { id: 'vendido',           label: 'Vendido',           emoji: '✅', showTotal: true  },
  { id: 'sucesso',           label: 'Sucesso',           emoji: '🏆', showTotal: true  },
  { id: 'lixo',              label: 'Lixo',              emoji: '🗑️', showTotal: false },
  { id: 'sac',               label: 'SAC',               emoji: '🎧', showTotal: false },
]

export const COLUNA_LABELS: Record<Coluna, string> = {
  lead:              'Lead',
  qualificacao:      'Qualificação',
  orcamento_enviado: 'Orçamento Enviado',
  negociacao:        'Negociação',
  objecao:           'Objeção',
  aguardando:        'Aguardando',
  perdido:           'Perdido',
  vendido:           'Vendido',
  sucesso:           'Sucesso',
  lixo:              'Lixo',
  sac:               'SAC',
}

export const ORIGEM_LABELS: Record<Origem, string> = {
  base_clientes:    'Base de Clientes',
  blog:             'Blog',
  chat_site:        'Chat do Site',
  email_mkt:        'E-mail Marketing',
  evento:           'Evento',
  feira:            'Feira',
  formulario:       'Formulário',
  google_organico:  'Google Orgânico',
  google_ads:       'Google Ads',
  indicacao:        'Indicação',
  instagram_organico: 'Instagram Orgânico',
  landing_page:     'Landing Page',
  ligacao_recebida: 'Ligação Recebida',
  linkedin_organico: 'LinkedIn Orgânico',
  linkedin_ads:     'LinkedIn Ads',
  loja_fisica:      'Loja Física',
  marketplace:      'Marketplace',
  meta_ads:         'Meta Ads',
  parcerias:        'Parcerias',
  prospeccao_ativa: 'Prospecção Ativa',
  qr_code:          'QR Code',
  radio_tv:         'Rádio / TV',
  remarketing:      'Remarketing',
  representante:    'Representante',
  sms:              'SMS',
  tiktok_organico:  'TikTok Orgânico',
  tiktok_ads:       'TikTok Ads',
  whatsapp:         'WhatsApp',
  youtube_ads:      'YouTube Ads',
}

export const CAMPANHA_LABELS: Record<Campanha, string> = {
  dia_maes:        'Dia das Mães',
  dia_pais:        'Dia dos Pais',
  dia_criancas:    'Dia das Crianças',
  black_friday:    'Black Friday',
  cyber_monday:    'Cyber Monday',
  natal:           'Natal',
  ano_novo:        'Ano Novo',
  campanha_janeiro: 'Campanha de Janeiro',
  carnaval:        'Carnaval',
  pascoa:          'Páscoa',
  dia_consumidor:  'Dia do Consumidor',
  semana_cliente:  'Semana do Cliente',
}

export const TIPO_OBJECAO_LABELS: Record<TipoObjecao, string> = {
  preco:        'Preço',
  prazo:        'Prazo',
  concorrencia: 'Concorrência',
  sem_retorno:  'Sem retorno',
}
