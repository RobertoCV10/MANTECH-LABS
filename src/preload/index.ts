// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { GamingConfig } from '../main/services/max/types'

const api = {
  // --- TELEMETRÍA ---
  onUpdateHardware: (callback) => {
    const subscription = (_event, value) => callback(value)
    ipcRenderer.on('telemetria-cpu', subscription)
    return () => ipcRenderer.removeListener('telemetria-cpu', subscription)
  },

  // --- OPTIMIZACIÓN MANUAL ---
  ramOptimize: (type: string) => ipcRenderer.invoke('ram-optimize', type),

  // --- CONFIGURACIÓN Y PERSISTENCIA ---
  // Esta es la pieza clave que faltaba para el window.api.invoke
  invoke: (channel: string, data?: unknown) => ipcRenderer.invoke(channel, data),

  sendConfig: (channel: string, config: unknown) => ipcRenderer.send(channel, config),

  // --- ACCIONES DEL CENTINELA ---
  onSentinelAction: (callback: (data: unknown) => void) => {
    const subscription = (_event, data) => callback(data)
    ipcRenderer.on('sentinel-action-completed', subscription)
    return () => ipcRenderer.removeListener('sentinel-action-completed', subscription)
  },

  maxGetStatus: () =>
    ipcRenderer.invoke('max-get-status'),
 
  /** Aplica las optimizaciones seleccionadas (botón "Aplicar") */
  maxApply: (config: GamingConfig) =>
    ipcRenderer.invoke('max-apply', config),
 
  /** Restaura la configuración original de Windows (botón "Sí, restaurar") */
  maxRestore: () =>
    ipcRenderer.invoke('max-restore'),
 
  /** Listener: se dispara UNA VEZ en el primer arranque cuando se crea el backup */
  onMaxBackupCreated: (cb: (data: { createdAt: number }) => void) => {
    const sub = (_e: Electron.IpcRendererEvent, data: { createdAt: number }) => cb(data)
    ipcRenderer.on('max-backup-created', sub)
    return () => ipcRenderer.removeListener('max-backup-created', sub)
  },

  // --- CIERRE DE APP CON CONSULTA ---
  /** Listener para consulta de cierre (con o sin modo gaming activo) */
  onCloseQuery: (cb: (data: { gamingModeActive: boolean; error?: string }) => void) => {
    const sub = (_e: Electron.IpcRendererEvent, data: { gamingModeActive: boolean; error?: string }) => cb(data)
    ipcRenderer.on('close-query', sub)
    return () => ipcRenderer.removeListener('close-query', sub)
  },

  /** Enviar respuesta del usuario ante la consulta de cierre */
  sendCloseResponse: (response: { action: 'close' | 'maintain' | 'remove' | 'cancel' }) =>
    ipcRenderer.invoke('close-response', response),

  // --- GAMING PRESETS ---
  maxGetPresets: () => ipcRenderer.invoke('max-get-presets'),
  maxAddPreset: (data: { name: string; config: GamingConfig }) => ipcRenderer.invoke('max-add-preset', data),
  maxUpdatePreset: (data: { id: string; name: string; config: GamingConfig }) => ipcRenderer.invoke('max-update-preset', data),
  maxDeletePreset: (id: string) => ipcRenderer.invoke('max-delete-preset', id),

  // --- BACKUP ORIGINAL ---
  maxCreateOriginalBackup: () => ipcRenderer.invoke('max-create-original-backup'),

  // --- FACTORY RESET ---
  maxFactoryReset: () => ipcRenderer.invoke('max-factory-reset'),

  // --- TOTALES ---
  getTotalSaved: () => ipcRenderer.invoke('get-total-saved'),
  getTotalTempCleaned: () => ipcRenderer.invoke('get-total-temp-cleaned'),
  resetTotals: (data: { resetRam: boolean; resetTemp: boolean }) => ipcRenderer.invoke('reset-totals', data),

// --- MANTENIMIENTO ---
  getMantenimientoProgreso: () => 
    ipcRenderer.invoke('get-mantenimiento-progreso'),

  saveMantenimientoProgreso: (progreso: unknown) => 
    ipcRenderer.invoke('save-mantenimiento-progreso', progreso),

  resetMantenimiento: (id: string) => 
    ipcRenderer.invoke('reset-mantenimiento', id),

  onNotification: (callback: (data: { type: string; message: string; title?: string; persistent?: boolean }) => void) => {
    const subscription = (_event, data) => callback(data)
    ipcRenderer.on('notification', subscription)
    return () => ipcRenderer.removeListener('notification', subscription)
  },

  onNavigateToSettings: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on('navigate-to-settings', subscription)
    return () => ipcRenderer.removeListener('navigate-to-settings', subscription)
  },

  // --- AUTO-UPDATER ---
  onUpdateAvailable: (callback: (data: { version: string; releaseDate: string }) => void) => {
    const subscription = (_event, data) => callback(data)
    ipcRenderer.on('update-available', subscription)
    return () => ipcRenderer.removeListener('update-available', subscription)
  },

  onUpdateDownloaded: (callback: (data: { version: string }) => void) => {
    const subscription = (_event, data) => callback(data)
    ipcRenderer.on('update-downloaded', subscription)
    return () => ipcRenderer.removeListener('update-downloaded', subscription)
  },

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}