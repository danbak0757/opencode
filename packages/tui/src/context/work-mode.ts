export const WORK_MODE_STORAGE_KEY = "work-mode-preference"

export const WORK_MODES = ["Planning", "Diagnostics", "Automation"] as const

export type WorkMode = (typeof WORK_MODES)[number]

export interface WorkModePreference {
  mode: WorkMode
}

export function isWorkMode(value: string): value is WorkMode {
  return WORK_MODES.some((mode) => mode === value)
}

export function normalizeWorkMode(value: unknown): WorkMode | undefined {
  if (typeof value !== "string") return
  if (isWorkMode(value)) return value
  if (value === "Planowanie") return "Planning"
  if (value === "Diagnostyka") return "Diagnostics"
  if (value === "Automat") return "Automation"
}
