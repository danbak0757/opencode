export const WORK_MODE_STORAGE_KEY = "work-mode-preference"

export const WORK_MODES = ["Planowanie", "Diagnostyka", "Automat"] as const

export type WorkMode = (typeof WORK_MODES)[number]

export interface WorkModePreference {
  mode: WorkMode
}

export function isWorkMode(value: string): value is WorkMode {
  return WORK_MODES.some((mode) => mode === value)
}
