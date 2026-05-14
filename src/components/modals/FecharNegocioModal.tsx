import { useState } from 'react'
import { Campanha, TipoObjecao, CAMPANHA_LABELS, TIPO_OBJECAO_LABELS } from '../../types'

interface Props {
  onVendido: (fechouPela?: Campanha) => void
  onPerdido: (tipoObjecao: TipoObjecao, observacao?: string) => void
  onCancel: () => void
}

type Step = 'escolha' | 'vendido' | 'perdido'

export function FecharNegocioModal({ onVendido, onPerdido, onCancel }: Props) {
  const [step, setStep] = useState<Step>('escolha')
  const [fechouPela, setFechouPela] = useState<Campanha | ''>('')
  const [tipoObjecao, setTipoObjecao] = useState<TipoObjecao>('preco')
  const [observacao, setObservacao] = useState('')

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(2,6,16,0.80)] animate-kaue-fade"
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-xl w-full max-w-sm shadow-2xl animate-kaue-rise p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'escolha' && (
          <>
            <h2 className="text-base font-semibold text-white">Fechar Negócio</h2>
            <p className="text-sm text-slate-400">Qual foi o resultado deste orçamento?</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setStep('vendido')}
                className="py-3 rounded-xl border border-green-600/50 bg-green-900/20 text-green-300 font-semibold text-sm hover:bg-green-900/40 transition-colors"
              >
                🏆 Vendido
              </button>
              <button
                onClick={() => setStep('perdido')}
                className="py-3 rounded-xl border border-red-500/50 bg-red-900/20 text-red-300 font-semibold text-sm hover:bg-red-900/40 transition-colors"
              >
                😢 Perdido
              </button>
            </div>
            <button onClick={onCancel} className="btn-ghost w-full text-sm">Cancelar</button>
          </>
        )}

        {step === 'vendido' && (
          <>
            <button onClick={() => setStep('escolha')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              ← Voltar
            </button>
            <h2 className="text-base font-semibold text-white">Fechamento — Vendido</h2>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Fechou pela Campanha</label>
              <select
                className="input"
                value={fechouPela}
                onChange={(e) => setFechouPela(e.target.value as Campanha | '')}
                autoFocus
              >
                <option value="">— Nenhuma campanha —</option>
                {(Object.entries(CAMPANHA_LABELS) as [Campanha, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onCancel} className="btn-ghost flex-1">Cancelar</button>
              <button
                onClick={() => onVendido((fechouPela as Campanha) || undefined)}
                className="flex-1 bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🏆 Confirmar
              </button>
            </div>
          </>
        )}

        {step === 'perdido' && (
          <>
            <button onClick={() => setStep('escolha')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              ← Voltar
            </button>
            <h2 className="text-base font-semibold text-white">Motivo da Perda</h2>
            <div className="space-y-2">
              {(Object.keys(TIPO_OBJECAO_LABELS) as TipoObjecao[]).map((key) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-colors text-sm ${
                    tipoObjecao === key
                      ? 'border-red-500 bg-red-900/30 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="fechar-tipo"
                    value={key}
                    checked={tipoObjecao === key}
                    onChange={() => setTipoObjecao(key)}
                    className="accent-red-500"
                  />
                  {TIPO_OBJECAO_LABELS[key]}
                </label>
              ))}
            </div>
            <textarea
              className="input resize-none text-sm"
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observação (opcional)"
            />
            <div className="flex gap-2">
              <button onClick={onCancel} className="btn-ghost flex-1">Cancelar</button>
              <button
                onClick={() => onPerdido(tipoObjecao, observacao || undefined)}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                😢 Confirmar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
