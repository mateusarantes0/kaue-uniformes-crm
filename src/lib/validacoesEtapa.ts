import { Orcamento, Coluna, Empresa } from '../types'

export interface ValidacaoResult {
  ok: boolean
  erros: string[]
}

const FORWARD_STAGES: Coluna[] = [
  'qualificacao', 'orcamento_enviado', 'negociacao', 'objecao', 'aguardando', 'vendido', 'despacho', 'sucesso',
]

const POST_ENVIADO_STAGES: Coluna[] = [
  'orcamento_enviado', 'negociacao', 'objecao', 'aguardando', 'vendido', 'despacho', 'sucesso',
]

export function validarMudancaColuna(
  orc: Orcamento,
  destino: Coluna,
  empresa?: Empresa
): ValidacaoResult {
  const erros: string[] = []

  // Saindo de "lead" (qualquer destino exceto lixo)
  if (orc.coluna === 'lead' && destino !== 'lixo') {
    if (!orc.nome?.trim()) erros.push('Nome do orçamento é obrigatório')
    if (!orc.empresaId) erros.push('Empresa é obrigatória')
    if (!orc.contatosIds?.length) erros.push('Ao menos 1 contato é obrigatório')
    if (!orc.responsavelId) erros.push('Responsável é obrigatório')
  }

  // qualificacao em diante (exceto perdido/lixo)
  if (FORWARD_STAGES.includes(destino)) {
    if (!orc.produto?.trim()) erros.push('Produto é obrigatório')
    if (!orc.quantidade || orc.quantidade <= 0) erros.push('Quantidade é obrigatória')
    if (!orc.dataEntregaDesejada) erros.push('Data de entrega desejada é obrigatória')
    if (!orc.condicaoPagamento?.trim()) erros.push('Condição de pagamento é obrigatória')
    if ((orc.quantidade ?? 0) > 0 && orc.quantidade! < 10 && !orc.justificativaQuantidadeMinima?.trim()) {
      erros.push('Justificativa para quantidade menor que 10 é obrigatória')
    }
  }

  // orcamento_enviado em diante
  if (POST_ENVIADO_STAGES.includes(destino)) {
    if (!orc.valor || orc.valor <= 0) erros.push('Valor deve ser maior que zero')
  }

  // objecao
  if (destino === 'objecao') {
    if (!orc.tipoObjecao) erros.push('Tipo de objeção é obrigatório')
    if (!orc.observacaoObjecao?.trim()) erros.push('Observação da objeção é obrigatória')
  }

  // aguardando, vendido, despacho, sucesso: empresa.razaoSocial + cnpj
  if (['aguardando', 'vendido', 'despacho', 'sucesso'].includes(destino)) {
    if (!empresa?.razaoSocial?.trim()) erros.push('Razão Social da empresa é obrigatória')
    if (!empresa?.cnpj?.trim()) erros.push('CNPJ da empresa é obrigatório')
  }

  // vendido: fechouPela (despacho/sucesso já vêm do vendido, campo já preenchido)
  if (destino === 'vendido') {
    if (!orc.fechouPela) erros.push('Campanha de fechamento é obrigatória')
  }

  // perdido
  if (destino === 'perdido') {
    if (!orc.tipoObjecao) erros.push('Tipo de objeção é obrigatório')
    if (!orc.observacaoObjecao?.trim()) erros.push('Observação da perda é obrigatória')
  }

  // lixo
  if (destino === 'lixo') {
    if (!orc.motivoDescarte?.trim()) erros.push('Motivo do descarte é obrigatório')
  }

  return { ok: erros.length === 0, erros }
}
