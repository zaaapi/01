"use client"

import { AppState } from "@/types"
import { seedData } from "./seed-data"

const STORAGE_KEY = "livia_data_v1"

export function getLocalData(): AppState {
  if (typeof window === "undefined") {
    return seedData
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      setLocalData(seedData)
      return seedData
    }
    return JSON.parse(data) as AppState
  } catch (error) {
    console.error("Erro ao carregar dados locais:", error)
    return seedData
  }
}

export function setLocalData(data: AppState): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Erro ao salvar dados locais:", error)
  }
}

export function resetLocalData(): void {
  if (typeof window === "undefined") {
    return
  }

  setLocalData(seedData)
}

export function clearLocalData(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Erro ao limpar dados locais:", error)
  }
}

