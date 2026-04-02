'use client'

import { useEffect } from 'react'

type HotkeyHandler = (e: KeyboardEvent) => void

/**
 * Tags de input/edição onde as hotkeys ficam suspensas,
 * para não interferir na digitação do usuário.
 */
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (EDITABLE_TAGS.has(target.tagName)) return true
  if (target.isContentEditable)          return true
  return false
}

export interface HotkeyBinding {
  /** Tecla ou combinação. Ex: 'Space', 'Enter', 'j', 'Backspace' */
  key: string
  /** Se true, dispara mesmo dentro de campos editáveis */
  allowInInput?: boolean
  /** Se true, usa e.code em vez de e.key (útil para Space) */
  useCode?: boolean
  handler: HotkeyHandler
}

/**
 * Registra múltiplos bindings de hotkey no document.
 * Desmonta automaticamente ao desmontar o componente.
 */
export function useHotkeys(bindings: HotkeyBinding[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      for (const binding of bindings) {
        const key     = binding.useCode ? e.code : e.key
        const matches = key === binding.key ||
                        key.toLowerCase() === binding.key.toLowerCase()

        if (!matches) continue

        const inEditable = isEditableTarget(e.target)
        if (inEditable && !binding.allowInInput) continue

        binding.handler(e)
        return // primeiro match vence
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [bindings, enabled])
}
