import { differenceInDays, parseISO } from 'date-fns'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function diasDesde(isoDate: string): number {
  return differenceInDays(new Date(), parseISO(isoDate))
}

export function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function stripMask(value: string): string {
  return value.replace(/\D/g, '')
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export function formatBRL(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return ''
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parseBRL(masked: string): number {
  const clean = masked.replace(/\./g, '').replace(',', '.')
  const n = Number(clean)
  return isNaN(n) ? 0 : n
}

export function formatDate(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR')
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const padded = digits.padStart(3, '0')
  const cents = padded.slice(-2)
  const intPart = padded.slice(0, -2).replace(/^0+/, '') || '0'
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withDots},${cents}`
}
