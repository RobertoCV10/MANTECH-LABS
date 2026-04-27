// src/main/services/max/index.ts
//
// Orquestador del modo gaming. Expone la API que consume main/index.ts
// via los handlers IPC. Usa Promise.allSettled en enable() para que
// un fallo individual no bloquee el resto de las optimizaciones.

import { enablePowerPlan, restorePowerPlan, isPowerPlanActive } from './powerPlan'
import { disableTelemetry, enableTelemetry, isTelemetryRunning } from './winTelemetry'
import { enableFocusAssist, disableFocusAssist, isNotificationsSilenced } from './notifications'
import { enableGameMode, restoreGameMode, getGameModeStatus } from './gameMode'
import { readBackup } from './backup'
import type { GamingConfig, GamingResult } from './types'

/**
 * Aplica las optimizaciones seleccionadas por el usuario.
 * Corre cada módulo en paralelo — si uno falla, los demás continúan.
 * Los errores se reportan en GamingResult.errors sin lanzar excepción.
 */
export async function enable(config: GamingConfig): Promise<GamingResult> {
  const result: GamingResult = {
    success: false,
    applied: {},
    errors: []
  }

  const tasks: Promise<void>[] = []

  if (config.ultraPower) {
    tasks.push(
      enablePowerPlan()
        .then(() => { result.applied.ultraPower = true })
        .catch((e) => {
          result.errors.push({ feature: 'ultraPower', error: String(e) })
        })
    )
  }

  if (config.disableWinTelemetry) {
    tasks.push(
      disableTelemetry()
        .then(() => { result.applied.disableWinTelemetry = true })
        .catch((e) => {
          result.errors.push({ feature: 'disableWinTelemetry', error: String(e) })
        })
    )
  }

  if (config.silenceNotifications) {
    tasks.push(
      enableFocusAssist()
        .then(() => { result.applied.silenceNotifications = true })
        .catch((e) => {
          result.errors.push({ feature: 'silenceNotifications', error: String(e) })
        })
    )
  }

  if (config.gameMode) {
    tasks.push(
      enableGameMode()
        .then(() => { result.applied.gameMode = true })
        .catch((e) => {
          result.errors.push({ feature: 'gameMode', error: String(e) })
        })
    )
  }

  await Promise.allSettled(tasks)

  // Éxito si al menos una feature se aplicó sin error
  result.success = Object.keys(result.applied).length > 0
  return result
}

/**
 * Revierte SOLO las features que se habían activado, usando el backup como referencia.
 * Se llama desde before-quit (silencioso) o desde max-restore (con confirmación).
 * Para restore completo al original, usar backup.restoreBackup() directamente.
 * 
 * @throws Error si alguna restauración falla (especialmente por permisos/UAC)
 */
export async function disable(): Promise<{ success: boolean; errors: string[] }> {
  console.log('[MaxService.disable()] Starting disable...')
  const snapshot = readBackup()
  console.log('[MaxService.disable()] Snapshot:', snapshot)
  const errors: string[] = []

  // Ejecutar cada restauración individualmente y capturar errores
  try {
    console.log('[MaxService.disable()] Restoring power plan...')
    // Restaura el plan de energía que había antes
    if (snapshot) {
      await restorePowerPlan(snapshot.powerPlanGuid)
    } else {
      await restorePowerPlan('381b4222-f694-41f0-9685-ff5bb260df2e') // fallback: Balanced
    }
    console.log('[MaxService.disable()] Power plan restored')
  } catch (e) {
    console.error('[MaxService.disable()] Power plan error:', e)
    errors.push(`Power Plan: ${String(e)}`)
  }

  try {
    // Restaura telemetría
    if (snapshot?.telemetryServicesRunning) {
      console.log('[MaxService.disable()] Restoring telemetry...')
      const telemetryRestored = await enableTelemetry()
      console.log('[MaxService.disable()] Telemetry result:', telemetryRestored)
      
      // Si no se logró restaurar, NO hacer retry automático
      // Enviar error al renderer para que el usuario decida
      if (!telemetryRestored) {
        const isRunning = await isTelemetryRunning()
        console.log('[MaxService.disable()] Telemetry service running:', isRunning)
        throw new Error('UAC cancelado al restaurar telemetría. El proceso requería permisos de administrador.')
      }
    }
  } catch (e) {
    console.error('[MaxService.disable()] Telemetry error:', e)
    // Lanzar el error para que main/process lo capture y envíe al renderer
    throw e
  }

  try {
    console.log('[MaxService.disable()] Restoring notifications...')
    // Restaura notificaciones
    await disableFocusAssist(snapshot?.focusAssistLevel ?? 0)
    console.log('[MaxService.disable()] Notifications restored')
  } catch (e) {
    console.error('[MaxService.disable()] Notifications error:', e)
    errors.push(`Focus Assist: ${String(e)}`)
  }

  try {
    console.log('[MaxService.disable()] Restoring game mode...')
    // Restaura Game Mode
    if (snapshot) {
      await restoreGameMode({
        gameModeEnabled: snapshot.gameModeEnabled,
        gameBarEnabled: snapshot.gameBarEnabled
      })
    }
    console.log('[MaxService.disable()] Game mode restored')
  } catch (e) {
    console.error('[MaxService.disable()] Game mode error:', e)
    errors.push(`Game Mode: ${String(e)}`)
  }

  // Si hubo errores, lanzar para que main/process lo capture
  if (errors.length > 0) {
    console.error('[MaxService.disable()] Errors found:', errors)
    throw new Error(`Errores al restaurar modo gaming: ${errors.join(', ')}`)
  }

  console.log('[MaxService.disable()] Returning success')
  return { success: true, errors: [] }
}

/**
 * Lee el estado actual real de Windows para sincronizar la UI al montar el componente.
 * No modifica nada — solo lectura.
 */
export async function getCurrentConfig(): Promise<GamingConfig> {
  const [ultraPower, telemetryRunning, notifSilenced, gameMode] = await Promise.all([
    isPowerPlanActive().catch(() => false),
    isTelemetryRunning().catch(() => true).then((running) => !running),
    isNotificationsSilenced().catch(() => false),
    getGameModeStatus()
      .then((s) => s.gameModeEnabled)
      .catch(() => false)
  ])

  return {
    ultraPower,
    disableWinTelemetry: telemetryRunning,
    silenceNotifications: notifSilenced,
    gameMode
  }
}

export const MaxPerformanceService = {
  enable,
  disable,
  getCurrentConfig
}