"use client"

import { useEffect } from "react"

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        // Se ctrl/meta/shift forem undefined, consideramos como "não importa"
        const ctrlMatch = shortcut.ctrl !== undefined ? e.ctrlKey === shortcut.ctrl : true
        const metaMatch = shortcut.meta !== undefined ? e.metaKey === shortcut.meta : true
        const shiftMatch = shortcut.shift !== undefined ? e.shiftKey === shortcut.shift : true
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && metaMatch && shiftMatch && keyMatch) {
          // Só previne default se for um atalho reconhecido
          e.preventDefault()
          shortcut.callback()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, enabled])
}
