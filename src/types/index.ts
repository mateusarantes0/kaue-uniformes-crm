export type Coluna =
  | 'lead'
  | 'qualificacao'
  | 'orcamento'
  | 'negociacao'
  | 'objecao'
  | 'aguardando'
  | 'perdido'
  | 'vendido'

export type Origem = 'whatsapp' | 'loja' | 'indicacao' | 'prospeccao' | 'instagram' | 'outros'
export type Prioridade = 'alta' | 'media' | 'baixa'
export type TipoObjecao = 'preco' | 'prazo' | 'concorrencia' | 'sem_retorno'
export type Etiqueta = 'lead' | 'lead_qualificado' | 'cliente' | 'outros' | 'lixo'

export interface HistoricoItem {
  data: string
  texto: string
}

export interface Cliente {
  id: string
  ownerId?: string
  // Identificação
  nome: string
  whatsapp: string
  origem: Origem
  indicadoPor?: string
  responsavel: string
  prioridade: Prioridade
  etiqueta?: Etiqueta
  // Pedido
  tipoUniforme?: string
  qtdPecas?: number
  valorEstimado?: number
  prazo?: string
  observacoes?: string
  // Orçamento
  dataEnvioOrcamento?: string
  dataLancamentoSistema?: string
  // Objeção
  tipoObjecao?: TipoObjecao
  observacaoObjecao?: string
  // Controle
  coluna: Coluna
  criadoEm: string
  ultimaInteracao: string
  historico: HistoricoItem[]
}

export interface ColunaConfig {
  id: Coluna
  label: string
  emoji: string
  showTotal: boolean
}

export const COLUNAS: ColunaConfig[] = [
  { id: 'lead',         label: 'Lead',             emoji: '📋', showTotal: false },
  { id: 'qualificacao', label: 'Qualificação',      emoji: '🎯', showTotal: false },
  { id: 'orcamento',    label: 'Orçamento Enviado', emoji: '💼', showTotal: true  },
  { id: 'negociacao',   label: 'Negociação',        emoji: '🤝', showTotal: true  },
  { id: 'objecao',      label: 'Objeção',           emoji: '⚠️', showTotal: true  },
  { id: 'aguardando',   label: 'Aguardando',        emoji: '⏳', showTotal: false },
  { id: 'perdido',      label: 'Perdido',           emoji: '❌', showTotal: false },
  { id: 'vendido',      label: 'Vendido',           emoji: '✅', showTotal: true  },
]

export const ORIGEM_LABELS: Record<Origem, string> = {
  whatsapp:   'WhatsApp',
  loja:       'Loja Física',
  indicacao:  'Indicação',
  prospeccao: 'Prospecção',
  instagram:  'Instagram',
  outros:     'Outros',
}

export const TIPO_OBJECAO_LABELS: Record<TipoObjecao, string> = {
  preco:        'Preço',
  prazo:        'Prazo',
  concorrencia: 'Concorrência',
  sem_retorno:  'Sem retorno',
}

export const ETIQUETA_CONFIG: Record<Etiqueta, { label: string; color: string; bg: string }> = {
  lead:            { label: 'Lead',           color: 'text-blue-400',   bg: 'bg-blue-900/40 border-blue-700'   },
  lead_qualificado:{ label: 'Lead Qualificado',color: 'text-cyan-400',  bg: 'bg-cyan-900/40 border-cyan-700'   },
  cliente:         { label: 'Cliente',         color: 'text-green-400', bg: 'bg-green-900/40 border-green-700' },
  outros:          { label: 'Outros',          color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600' },
  lixo:            { label: 'Lixo',            color: 'text-red-400',   bg: 'bg-red-900/40 border-red-700'     },
}
