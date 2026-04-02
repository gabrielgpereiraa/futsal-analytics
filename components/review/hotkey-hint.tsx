'use client'

import { useEffect, useState } from 'react'
import type { EventType } from '@/lib/types'
import { EVENT_TYPE_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface HotkeyHintProps {
  activeType: EventType | null
}

/**
 * Exibe brevemente o tipo de evento ativado por hotkey.
 * Desaparece automaticamente após 1.5 s.
 */
export function HotkeyHint({ activeType }: HotkeyHintProps) {
  const [visible, setVisible] = useState(false)
  const [label,   setLabel]   = useState('')

  useEffect(() => {
    if (!activeType) return
    setLabel(EVENT_TYPE_LABELS[activeType])
    setVisible(true)

    const timer = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(timer)
  }, [activeType])

  return (
    <div
      className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none',
        'px-5 py-2.5 rounded-full bg-primary text-primary-foreground',
        'text-sm font-semibold shadow-lg transition-all duration-200',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
      aria-live="polite"
      aria-label={visible ? `Evento selecionado: ${label}` : ''}
    >
      {label}
    </div>
  )
}
