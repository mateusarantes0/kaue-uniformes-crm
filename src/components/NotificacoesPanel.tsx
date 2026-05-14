import { useEffect, useRef } from 'react'
import { useNotificacoesStore } from '../store/useNotificacoesStore'
import { useOrcamentoStore } from '../store/useOrcamentoStore'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const TIPO_ICON: Record<string, string> = {
  card_vencendo: '⚠️',
  card_vencido: '🔴',
  aguardando_pagamento: '💰',
  sistema: '🔔',
}

interface Props {
  onClose: () => void
}

export function NotificacoesPanel({ onClose }: Props) {
  const notificacoes = useNotificacoesStore((s) => s.notificacoes)
  const marcarComoLida = useNotificacoesStore((s) => s.marcarComoLida)
  const marcarTodasComoLidas = useNotificacoesStore((s) => s.marcarTodasComoLidas)
  const setModalDetalheId = useOrcamentoStore((s) => s.setModalDetalheId)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const handleClickNotificacao = (id: string, orcamentoId?: string) => {
    marcarComoLida(id)
    if (orcamentoId) {
      setModalDetalheId(orcamentoId)
      onClose()
    }
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <span className="text-sm font-semibold text-white">Notificações</span>
        <button
          onClick={marcarTodasComoLidas}
          className="text-xs text-slate-400 hover:text-accent transition-colors"
        >
          Marcar todas como lidas
        </button>
      </div>

      {/* Lista */}
      <div className="max-h-96 overflow-y-auto">
        {notificacoes.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500 text-sm">
            Nenhuma notificação
          </div>
        ) : (
          notificacoes.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClickNotificacao(n.id, n.orcamentoId)}
              className={`w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/40 transition-colors flex gap-3 ${
                !n.lida ? 'bg-slate-700/20' : ''
              }`}
            >
              <span className="text-base leading-none mt-0.5 flex-shrink-0">
                {TIPO_ICON[n.tipo] ?? '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${!n.lida ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {n.titulo}
                  </p>
                  <span className="text-[10px] text-slate-500 flex-shrink-0 mt-0.5">
                    {timeAgo(n.criadaEm)}
                  </span>
                </div>
                {n.mensagem && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.mensagem}</p>
                )}
              </div>
              {!n.lida && (
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
