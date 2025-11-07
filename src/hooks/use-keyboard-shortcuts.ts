"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcutsOptions {
  onSearch?: () => void
  onNew?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onNavigate1?: () => void
  onNavigate2?: () => void
  onNavigate3?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onSearch,
  onNew,
  onEdit,
  onDelete,
  onNavigate1,
  onNavigate2,
  onNavigate3,
  onEscape,
  enabled = true,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Prevenir atalhos quando o usuário está digitando em inputs, textareas, etc.
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Permitir apenas Esc e / quando focado em input
        if (event.key === "Escape" && onEscape) {
          event.preventDefault()
          onEscape()
          return
        }
        if (event.key === "/" && onSearch) {
          event.preventDefault()
          onSearch()
          return
        }
        return
      }

      // Prevenir atalhos quando modais/dialogs estão abertos (exceto Esc)
      if (event.key !== "Escape" && document.querySelector("[role='dialog']")) {
        return
      }

      switch (event.key) {
        case "/":
          if (onSearch) {
            event.preventDefault()
            onSearch()
          }
          break
        case "n":
        case "N":
          if (onNew && !event.ctrlKey && !event.metaKey) {
            event.preventDefault()
            onNew()
          }
          break
        case "e":
        case "E":
          if (onEdit && !event.ctrlKey && !event.metaKey) {
            event.preventDefault()
            onEdit()
          }
          break
        case "Delete":
        case "Backspace":
          if (onDelete && !event.ctrlKey && !event.metaKey) {
            event.preventDefault()
            onDelete()
          }
          break
        case "1":
          if (onNavigate1 && !event.ctrlKey && !event.metaKey) {
            event.preventDefault()
            onNavigate1()
          }
          break
        case "2":
          if (onNavigate2 && !event.ctrlKey && !event.metaKey) {
            event.preventDefault()
            onNavigate2()
          }
          break
        case "3":
          if (onNavigate3 && !event.ctrlKey && !event.metaKey) {
            event.preventDefault()
            onNavigate3()
          }
          break
        case "Escape":
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
          break
      }
    },
    [enabled, onSearch, onNew, onEdit, onDelete, onNavigate1, onNavigate2, onNavigate3, onEscape]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}
