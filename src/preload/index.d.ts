// src/renderer/src/env.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'

export {}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // Telemetría y Listeners
      onUpdateHardware: (callback: (data: unknown) => void) => () => void;
      onSentinelAction: (callback: (data: unknown) => void) => () => void;

      // Acciones Directas
      ramOptimize: (type: string) => Promise<{ success: boolean }>;
      sendConfig: (channel: string, config: unknown) => void;

      // EL QUE TE FALTA: Para llamar a funciones con retorno (como get-config o add-to-total)
      invoke: (channel: string, data?: unknown) => Promise<unknown>;

      // --- Mantenimiento ---
      getMantenimientoProgreso: () => Promise<any>;
      saveMantenimientoProgreso: (progreso: any) => Promise<{ success: boolean }>;
      resetMantenimiento: (id: string) => Promise<{ success: boolean }>;

      // --- Max Performance ---
      maxGetStatus: () => Promise<any>;
      maxApply: (config: any) => Promise<any>;
      maxRestore: () => Promise<any>;
      onMaxBackupCreated: (callback: (data: { createdAt: number }) => void) => () => void;

      // --- Cierre de App con Consulta ---
      onCloseQuery: (callback: (data: { gamingModeActive: boolean; error?: string }) => void) => () => void;
      sendCloseResponse: (response: { action: 'close' | 'maintain' | 'remove' | 'cancel' }) => Promise<any>;

      // --- Gaming Presets ---
      maxGetPresets: () => Promise<any>;
      maxAddPreset: (data: { name: string; config: any }) => Promise<any>;
      maxUpdatePreset: (data: { id: string; name: string; config: any }) => Promise<any>;
      maxDeletePreset: (id: string) => Promise<any>;

      // --- Backup Original ---
      maxCreateOriginalBackup: () => Promise<any>;

      // --- Factory Reset ---
      maxFactoryReset: () => Promise<any>;

      // --- Totales ---
      getTotalSaved: () => Promise<any>;
      getTotalTempCleaned: () => Promise<any>;
      resetTotals: (data: { resetRam: boolean; resetTemp: boolean }) => Promise<any>;

      // --- Notificaciones ---
      onNotification: (callback: (data: { type: string; message: string; title?: string; persistent?: boolean }) => void) => () => void;

      // --- Navegación desde Tray ---
      onNavigateToSettings: (callback: () => void) => () => void;
    }
  }
}