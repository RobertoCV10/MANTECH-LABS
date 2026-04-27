// src/main/services/max/types.ts

export interface GamingConfig {
  ultraPower: boolean
  disableWinTelemetry: boolean
  silenceNotifications: boolean
  gameMode: boolean
}

export interface GamingResult {
  success: boolean
  applied: Partial<GamingConfig>
  errors: { feature: string; error: string }[]
}

/** Snapshot del estado real de Windows antes de cualquier modificación */
export interface WindowsSnapshot {
  /** GUID del plan de energía activo antes de activar max performance */
  powerPlanGuid: string
  /** true si DiagTrack estaba corriendo */
  telemetryServicesRunning: boolean
  /** 0 = desactivado, 1 = solo prioridad, 2 = solo alarmas */
  focusAssistLevel: number
  /** Estado de Game Mode en el registry */
  gameModeEnabled: boolean
  /** Estado de Game Bar en el registry */
  gameBarEnabled: boolean
}

export interface BackupMeta {
  createdAt: number
  /** Versión de la app al momento de crear el backup */
  version: string
  backupDone: boolean
}

export interface GamingPreset {
  id: string
  name: string
  config: GamingConfig
  createdAt: number
}

export interface GamingPresetsData {
  presets: GamingPreset[]
}

export interface MaxStatus {
  /** Estado actual real leído de Windows */
  currentConfig: GamingConfig
  /** Última config aplicada por el usuario (null si nunca aplicó) */
  lastGamingConfig: GamingConfig | null
  /** ¿Está el modo gaming activo en este momento? */
  gamingModeActive: boolean
  hasBackup: boolean
  backupMeta: BackupMeta | null
}

/** Respuesta IPC unificada para toda la aplicación */
export type IpcResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

/** Helper para crear respuestas IPC exitosas */
export function ipcSuccess<T>(data: T): IpcResponse<T> {
  return { success: true, data }
}

/** Helper para crear respuestas IPC de error */
export function ipcError(error: string, code?: string): IpcResponse {
  return { success: false, error, code }
}