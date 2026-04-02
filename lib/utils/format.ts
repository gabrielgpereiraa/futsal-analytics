/**
 * Formata segundos como MM:SS ou HH:MM:SS
 */
export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours   = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return `${mm}:${ss}`
}

/**
 * Formata uma string de data ISO (YYYY-MM-DD) para pt-BR (DD/MM/YYYY)
 */
export function formatDate(isoDate: string): string {
  // Evita timezone offset adicionando T12:00:00 para garantir data correta
  const date = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat('pt-BR', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  }).format(date)
}

/**
 * Formata bytes para unidade legível (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
