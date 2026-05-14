import { Orcamento } from '../types'
import { LIMITE_DIAS_POR_COLUNA } from '../types'

export type StatusCard = 'verde' | 'amarelo' | 'vermelho' | 'neutro'

export function calcularStatusCard(orc: Orcamento): StatusCard {
  const limite = LIMITE_DIAS_POR_COLUNA[orc.coluna]
  if (limite === null) return 'neutro'

  const referencia = orc.ultimoContatoEm ?? orc.criadoEm
  const dias = Math.floor((Date.now() - new Date(referencia).getTime()) / 86400000)
  const restante = limite - dias

  if (restante < 0) return 'vermelho'
  if (restante <= 1) return 'amarelo'
  return 'verde'
}
