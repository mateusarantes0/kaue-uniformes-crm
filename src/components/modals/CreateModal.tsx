// Shared modal utilities — imported by all modal components

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

export function Section({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-accent uppercase tracking-wider pt-2 pb-1 border-t border-slate-700/60">
      {label}
    </p>
  )
}

export function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`bg-[#1E293B] rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-700 ${
          wide ? 'max-w-3xl' : 'max-w-md'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-[#1E293B] z-10">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
