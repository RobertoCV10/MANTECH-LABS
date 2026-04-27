// src/main/services/max/backup.ts
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

// Imports estáticos — sin await import() dinámico
import { getActivePlanGuid, restorePowerPlan } from './powerPlan'
import { isTelemetryRunning, enableTelemetry, disableTelemetry } from './winTelemetry'
import { getFocusAssistLevel, disableFocusAssist } from './notifications'
import { getGameModeStatus, restoreGameMode } from './gameMode'

import type { WindowsSnapshot, BackupMeta, GamingPreset, GamingPresetsData, GamingConfig } from './types'

const BACKUP_PATH = path.join(app.getPath('userData'), 'backup.json')
const BACKUP_META_PATH = path.join(app.getPath('userData'), 'backup-meta.json')
const PRESETS_PATH = path.join(app.getPath('userData'), 'gaming-presets.json')
const MASTER_BACKUP_PATH = path.join(app.getPath('userData'), 'master-backup.json')
const MASTER_BACKUP_META_PATH = path.join(app.getPath('userData'), 'master-backup-meta.json')
const MANTENIMIENTO_PATH = path.join(app.getPath('userData'), 'mantenimiento_progreso.json')

function getAppVersion(): string {
  return app.getVersion() ?? '1.0.0'
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function hasBackup(): boolean {
  if (!fs.existsSync(BACKUP_META_PATH) || !fs.existsSync(BACKUP_PATH)) return false
  try {
    const meta: BackupMeta = JSON.parse(fs.readFileSync(BACKUP_META_PATH, 'utf-8'))
    return meta.backupDone === true
  } catch {
    return false
  }
}

export function readBackup(): WindowsSnapshot | null {
  if (!fs.existsSync(BACKUP_PATH)) return null
  try {
    return JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8')) as WindowsSnapshot
  } catch {
    return null
  }
}

export function readBackupMeta(): BackupMeta | null {
  if (!fs.existsSync(BACKUP_META_PATH)) return null
  try {
    return JSON.parse(fs.readFileSync(BACKUP_META_PATH, 'utf-8')) as BackupMeta
  } catch {
    return null
  }
}

export async function createBackup(): Promise<BackupMeta> {
  if (hasBackup()) return readBackupMeta()!

  console.log('[Backup] Leyendo estado real de Windows...')

  const [powerPlanGuid, telemetryRunning, focusLevel, gameModeStatus] = await Promise.all([
    getActivePlanGuid().catch(() => 'balanced'),
    isTelemetryRunning().catch(() => true),
    getFocusAssistLevel().catch(() => 0),
    getGameModeStatus().catch(() => ({ gameModeEnabled: false, gameBarEnabled: true }))
  ])

  const snapshot: WindowsSnapshot = {
    powerPlanGuid,
    telemetryServicesRunning: telemetryRunning,
    focusAssistLevel: focusLevel,
    gameModeEnabled: gameModeStatus.gameModeEnabled,
    gameBarEnabled: gameModeStatus.gameBarEnabled
  }

  const meta: BackupMeta = {
    createdAt: Date.now(),
    version: getAppVersion(),
    backupDone: true
  }

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(snapshot, null, 2))
  fs.writeFileSync(BACKUP_META_PATH, JSON.stringify(meta, null, 2))

  console.log('[Backup] Snapshot guardado:', snapshot)
  return meta
}

// Crear un nuevo backup original (reemplaza el actual)
export async function createNewOriginalBackup(): Promise<BackupMeta> {
  console.log('[Backup] Creando nuevo backup original...')

  const [powerPlanGuid, telemetryRunning, focusLevel, gameModeStatus] = await Promise.all([
    getActivePlanGuid().catch(() => 'balanced'),
    isTelemetryRunning().catch(() => true),
    getFocusAssistLevel().catch(() => 0),
    getGameModeStatus().catch(() => ({ gameModeEnabled: false, gameBarEnabled: true }))
  ])

  const snapshot: WindowsSnapshot = {
    powerPlanGuid,
    telemetryServicesRunning: telemetryRunning,
    focusAssistLevel: focusLevel,
    gameModeEnabled: gameModeStatus.gameModeEnabled,
    gameBarEnabled: gameModeStatus.gameBarEnabled
  }

  const meta: BackupMeta = {
    createdAt: Date.now(),
    version: getAppVersion(),
    backupDone: true
  }

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(snapshot, null, 2))
  fs.writeFileSync(BACKUP_META_PATH, JSON.stringify(meta, null, 2))

  console.log('[Backup] Nuevo backup original guardado:', snapshot)
  return meta
}

export async function restoreBackup(): Promise<WindowsSnapshot> {
  const snapshot = readBackup()
  if (!snapshot) throw new Error('No existe backup para restaurar')

  console.log('[Backup] Restaurando configuración original...', snapshot)

  await Promise.allSettled([
    restorePowerPlan(snapshot.powerPlanGuid),
    snapshot.telemetryServicesRunning ? enableTelemetry() : disableTelemetry(),
    disableFocusAssist(snapshot.focusAssistLevel),
    restoreGameMode({
      gameModeEnabled: snapshot.gameModeEnabled,
      gameBarEnabled: snapshot.gameBarEnabled
    })
  ])

  console.log('[Backup] Restauración completada.')
  return snapshot
}

// ─── Presets Management ───────────────────────────────────────────────────────

export function getPresets(): GamingPreset[] {
  if (!fs.existsSync(PRESETS_PATH)) return []
  try {
    const data: GamingPresetsData = JSON.parse(fs.readFileSync(PRESETS_PATH, 'utf-8'))
    return data.presets || []
  } catch {
    return []
  }
}

export function savePresets(presets: GamingPreset[]): void {
  const data: GamingPresetsData = { presets }
  fs.writeFileSync(PRESETS_PATH, JSON.stringify(data, null, 2))
}

export function addPreset(name: string, config: GamingConfig): GamingPreset {
  const presets = getPresets()
  
  if (presets.length >= 3) {
    throw new Error('Máximo 3 presets permitidos')
  }
  
  const newPreset: GamingPreset = {
    id: generateId(),
    name,
    config,
    createdAt: Date.now()
  }
  
  presets.push(newPreset)
  savePresets(presets)
  
  return newPreset
}

export function updatePreset(id: string, name: string, config: GamingConfig): GamingPreset {
  const presets = getPresets()
  const index = presets.findIndex(p => p.id === id)
  
  if (index === -1) {
    throw new Error('Preset no encontrado')
  }
  
  presets[index] = {
    ...presets[index],
    name,
    config
  }
  
  savePresets(presets)
  return presets[index]
}

export function deletePreset(id: string): void {
  const presets = getPresets()
  const filtered = presets.filter(p => p.id !== id)
  
  if (filtered.length === presets.length) {
    throw new Error('Preset no encontrado')
  }
  
  savePresets(filtered)
}

// ─── Master Backup (solo lectura, se crea una vez) ─────────────────────────────────

export function hasMasterBackup(): boolean {
  if (!fs.existsSync(MASTER_BACKUP_META_PATH) || !fs.existsSync(MASTER_BACKUP_PATH)) return false
  try {
    const meta: BackupMeta = JSON.parse(fs.readFileSync(MASTER_BACKUP_META_PATH, 'utf-8'))
    return meta.backupDone === true
  } catch {
    return false
  }
}

export function readMasterBackup(): WindowsSnapshot | null {
  if (!fs.existsSync(MASTER_BACKUP_PATH)) return null
  try {
    return JSON.parse(fs.readFileSync(MASTER_BACKUP_PATH, 'utf-8')) as WindowsSnapshot
  } catch {
    return null
  }
}

export function readMasterBackupMeta(): BackupMeta | null {
  if (!fs.existsSync(MASTER_BACKUP_META_PATH)) return null
  try {
    return JSON.parse(fs.readFileSync(MASTER_BACKUP_META_PATH, 'utf-8')) as BackupMeta
  } catch {
    return null
  }
}

export async function createMasterBackup(): Promise<BackupMeta> {
  if (hasMasterBackup()) return readMasterBackupMeta()!

  console.log('[MasterBackup] Creando backup maestro...')

  const [powerPlanGuid, telemetryRunning, focusLevel, gameModeStatus] = await Promise.all([
    getActivePlanGuid().catch(() => 'balanced'),
    isTelemetryRunning().catch(() => true),
    getFocusAssistLevel().catch(() => 0),
    getGameModeStatus().catch(() => ({ gameModeEnabled: false, gameBarEnabled: true }))
  ])

  const snapshot: WindowsSnapshot = {
    powerPlanGuid,
    telemetryServicesRunning: telemetryRunning,
    focusAssistLevel: focusLevel,
    gameModeEnabled: gameModeStatus.gameModeEnabled,
    gameBarEnabled: gameModeStatus.gameBarEnabled
  }

  const meta: BackupMeta = {
    createdAt: Date.now(),
    version: getAppVersion(),
    backupDone: true
  }

  fs.writeFileSync(MASTER_BACKUP_PATH, JSON.stringify(snapshot, null, 2))
  fs.writeFileSync(MASTER_BACKUP_META_PATH, JSON.stringify(meta, null, 2))

  console.log('[MasterBackup] Backup maestro guardado:', snapshot)
  return meta
}

// ─── Apply Master Backup (restaurar Windows desde maestro) ────────────────────────

export async function applyMasterBackup(): Promise<WindowsSnapshot> {
  const snapshot = readMasterBackup()
  if (!snapshot) throw new Error('No existe backup maestro')

  console.log('[MasterBackup] Aplicando backup maestro a Windows...', snapshot)

  await Promise.allSettled([
    restorePowerPlan(snapshot.powerPlanGuid),
    snapshot.telemetryServicesRunning ? enableTelemetry() : disableTelemetry(),
    disableFocusAssist(snapshot.focusAssistLevel),
    restoreGameMode({
      gameModeEnabled: snapshot.gameModeEnabled,
      gameBarEnabled: snapshot.gameBarEnabled
    })
  ])

  console.log('[MasterBackup] Restauración completada.')
  return snapshot
}

// ─── Sync Original to Master (sincroniza backup original con maestro) ──────────────

export function syncOriginalToMaster(): void {
  const master = readMasterBackup()
  if (!master) {
    console.warn('[Backup] No hay master backup para sincronizar')
    return
  }

  const meta: BackupMeta = {
    createdAt: Date.now(),
    version: getAppVersion(),
    backupDone: true
  }

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(master, null, 2))
  fs.writeFileSync(BACKUP_META_PATH, JSON.stringify(meta, null, 2))

  console.log('[Backup] Original sincronizado con maestro:', master)
}

// ─── Clear Data (para factory reset) ──────────────────────────────────────────────

export function clearPresets(): void {
  if (fs.existsSync(PRESETS_PATH)) {
    fs.unlinkSync(PRESETS_PATH)
    console.log('[Factory] Presets eliminados')
  }
}

export function clearMantenimiento(): void {
  if (fs.existsSync(MANTENIMIENTO_PATH)) {
    fs.writeFileSync(MANTENIMIENTO_PATH, JSON.stringify({}, null, 2))
    console.log('[Factory] Progreso de mantenimiento reseteado')
  }
}