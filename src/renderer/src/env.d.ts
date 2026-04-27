// src/renderer/src/env.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'

export {}

declare global {
  // --- Domain Logic Types ---
  
  // Añade esta interfaz arriba para tener tipado estricto en el progreso
  interface MantenimientoProgreso {
    [id: string]: {
      lastCompleted: string | null;
      checklist: boolean[];
    }
  }

  interface GamingConfig {
    ultraPower: boolean
    disableWinTelemetry: boolean
    silenceNotifications: boolean
    gameMode: boolean
  }

  interface GamingResult {
    success: boolean
    applied: Partial<GamingConfig>
    errors: { feature: string; error: string }[]
  }

  interface MaxStatus {
    currentConfig: GamingConfig
    lastGamingConfig: GamingConfig | null
    gamingModeActive: boolean
    hasBackup: boolean
    backupMeta: { createdAt: number; version: string; backupDone: boolean } | null
  }

  interface GamingPreset {
    id: string
    name: string
    config: GamingConfig
    createdAt: number
  }

  interface BackupMeta {
    createdAt: number
    version: string
    backupDone: boolean
  }

  /**
   * Discriminated union for IPC responses.
   * Ensures 'data' is only accessible if 'success' is true.
   */
  type IpcResponse<T = void> = 
    | { success: true; data: T }
    | { success: false; error: string; code?: string }

  // --- Window API Surface ---

  interface Window {
    electron: ElectronAPI
    api: {
      // ── Telemetry & Events ─────────────────────────────────────────
      
      /** Returns an unsubscribe function to prevent memory leaks */
      onUpdateHardware: (callback: (data: HardwareSnapshot) => void) => (() => void)
      
      /** Triggered when the Sentinel executes an auto-optimization */
      onSentinelAction: (callback: (data: SentinelEvent) => void) => (() => void)

      // ── RAM Operations ─────────────────────────────────────────────
      
      ramOptimize: (type: 'standby' | 'working-set') => Promise<IpcResponse>

      // ── Config & Persistence (Typed) ───────────────────────────────
      
      /** * Suggestion: Replace 'string' with a union of allowed channels 
       * for better IntelliSense (e.g., 'update-sentinel-config')
       */
      sendConfig: (channel: string, config: any) => void
      
      /** Standardized invocation for generic data retrieval */
      invoke: <T = any>(channel: string, data?: any) => Promise<T>
      
      addToTotalSaved: (gb: number) => Promise<IpcResponse<{ newTotal: number }>>

      // ── Mantenimiento Service (Nuevas) ──────────────────────────────
      
      /** Recupera el historial de mantenimientos desde AppData */
      getMantenimientoProgreso: () => Promise<MantenimientoProgreso>

      /** Persiste el estado actual de los mantenimientos */
      saveMantenimientoProgreso: (progreso: MantenimientoProgreso) => Promise<IpcResponse>
      
      /** Resetea un mantenimiento específico */
      resetMantenimiento: (id: string) => Promise<IpcResponse>

      // ── Max Performance (Gaming Mode) ──────────────────────────────
      
      maxGetStatus: () => Promise<IpcResponse<MaxStatus>>
      maxApply: (config: GamingConfig) => Promise<IpcResponse<GamingResult>>
      maxRestore: () => Promise<IpcResponse>
      onMaxBackupCreated: (callback: (data: { createdAt: number }) => void) => (() => void)

      // ── Cierre de App con Consulta ──────────────────────────────────
      
      onCloseQuery: (callback: (data: { gamingModeActive: boolean; error?: string }) => void) => (() => void)
      sendCloseResponse: (response: { action: 'close' | 'maintain' | 'remove' | 'cancel' }) => Promise<IpcResponse>

      // ── Gaming Presets ──────────────────────────────────────────────
      
      maxGetPresets: () => Promise<IpcResponse<GamingPreset[]>>
      maxAddPreset: (data: { name: string; config: GamingConfig }) => Promise<IpcResponse<GamingPreset>>
      maxUpdatePreset: (data: { id: string; name: string; config: GamingConfig }) => Promise<IpcResponse<GamingPreset>>
      maxDeletePreset: (id: string) => Promise<IpcResponse>

      // ── Backup Original ──────────────────────────────────────────────
      
      maxCreateOriginalBackup: () => Promise<IpcResponse<BackupMeta>>

      // ── Factory Reset ──────────────────────────────────────────────────
      
      maxFactoryReset: () => Promise<IpcResponse>

      // ── Totales ─────────────────────────────────────────────────────
      
      getTotalSaved: () => Promise<IpcResponse<{ total: number }>>
      getTotalTempCleaned: () => Promise<IpcResponse<{ total: number }>>
      resetTotals: (data: { resetRam: boolean; resetTemp: boolean }) => Promise<IpcResponse<{ totalSaved: number; totalTempCleaned: number }>>

      // ── Notificaciones ───────────────────────────────────────────
      
      /** Listen for notifications from main process */
      onNotification: (callback: (data: { type: string; message: string; title?: string; persistent?: boolean }) => void) => () => void

       // --- Navegación desde Tray ---
      onNavigateToSettings: (callback: () => void) => () => void;
    }
  }

  // --- Supporting Sub-Types ---

  interface HardwareSnapshot {
    cpu: number
    cpuThreads: number[]
    ram: number
    ramRaw: string
    ramDetails?: {
      total: number
      active: number
      cache: number
      workingSet: number
      available: number
    }
    disks: unknown[]
  }

  interface SentinelEvent {
    type: 'auto-purge'
    freedGB: number
    timestamp: number
  }
}