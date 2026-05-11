import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'
import { ModalShell, Field } from './modals/CreateModal'

interface Props {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
  const changePassword = useAuthStore((s) => s.changePassword)

  const [current, setCurrent]     = useState('')
  const [next, setNext]           = useState('')
  const [confirm, setConfirm]     = useState('')
  const [authError, setAuthError] = useState('')
  const [saving, setSaving]       = useState(false)

  const newTooShort = next.length > 0 && next.length < 6
  const noMatch     = confirm.length > 0 && next !== confirm
  const canSave     = current && next.length >= 6 && next === confirm

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setAuthError('')
    const result = await changePassword(current, next)
    setSaving(false)
    if (result.ok) {
      toast.success('Senha alterada com sucesso!')
      onClose()
    } else {
      setAuthError(result.error ?? 'Erro ao alterar senha')
    }
  }

  return (
    <ModalShell title="Alterar Senha" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Senha atual">
          <input
            autoFocus
            className="input"
            type="password"
            placeholder="••••••••"
            value={current}
            onChange={(e) => { setCurrent(e.target.value); setAuthError('') }}
            disabled={saving}
          />
          {authError && <p className="text-red-400 text-xs mt-1">{authError}</p>}
        </Field>

        <Field label="Nova senha">
          <input
            className="input"
            type="password"
            placeholder="mínimo 6 caracteres"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            disabled={saving}
          />
          {newTooShort && <p className="text-red-400 text-xs mt-1">Mínimo de 6 caracteres</p>}
        </Field>

        <Field label="Confirmar nova senha">
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={saving}
          />
          {noMatch && <p className="text-red-400 text-xs mt-1">As senhas não coincidem</p>}
        </Field>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="btn-ghost" disabled={saving}>Cancelar</button>
          <button onClick={handleSave} disabled={!canSave || saving} className="btn-primary">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
