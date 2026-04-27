// src/main/services/max/gameMode.ts
//
// Game Mode en Windows 10/11 se controla via registry en HKCU\SOFTWARE\Microsoft\GameBar.
// No requiere permisos elevados (UAC) ya que opera en HKCU (contexto del usuario actual).

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const GAMEBAR_KEY = 'HKCU\\SOFTWARE\\Microsoft\\GameBar'

type GameModeSnapshot = {
  gameModeEnabled: boolean
  gameBarEnabled: boolean
}

/**
 * Reads a DWORD value from Windows registry
 * @param key - Registry key path
 * @param value - Value name to read
 * @returns The DWORD value as number, or null if not found
 */
async function readDword(key: string, value: string): Promise<number | null> {
  try {
    const { stdout } = await execAsync(`reg query "${key}" /v "${value}"`)
    const match = stdout.match(/REG_DWORD\s+(0x[0-9a-fA-F]+|\d+)/)
    if (!match) return null
    return parseInt(match[1], 16)
  } catch {
    return null
  }
}

/** Lee el estado actual de Game Mode y Game Bar */
export async function getGameModeStatus(): Promise<GameModeSnapshot> {
  const [gameModeVal, gameBarVal] = await Promise.all([
    readDword(GAMEBAR_KEY, 'AutoGameModeEnabled'),
    readDword(GAMEBAR_KEY, 'AllowAutoGameMode')
  ])

  return {
    gameModeEnabled: gameModeVal === 1,
    // Game Bar activo si AllowAutoGameMode está en 1 o no existe (default habilitado)
    gameBarEnabled: gameBarVal === null ? true : gameBarVal === 1
  }
}

/** Activa Game Mode y optimiza Game Bar para rendimiento */
export async function enableGameMode(): Promise<void> {
  const cmds = [
    // Activa Game Mode automático
    `reg add "${GAMEBAR_KEY}" /v "AutoGameModeEnabled" /t REG_DWORD /d 1 /f`,
    // Permite el modo automático de Game Mode
    `reg add "${GAMEBAR_KEY}" /v "AllowAutoGameMode" /t REG_DWORD /d 1 /f`,
    // Desactiva Game Bar (consume recursos, no necesaria en modo gaming)
    `reg add "${GAMEBAR_KEY}" /v "UseNexusForGameBarEnabled" /t REG_DWORD /d 0 /f`
  ]

  for (const cmd of cmds) {
    try {
      await execAsync(cmd)
    } catch (e) {
      console.warn('[GameMode] Error aplicando configuración:', e)
    }
  }
}

/** Restaura Game Mode y Game Bar a los valores del snapshot */
export async function restoreGameMode(snapshot: GameModeSnapshot): Promise<void> {
  const gameModeVal = snapshot.gameModeEnabled ? 1 : 0
  const gameBarVal = snapshot.gameBarEnabled ? 1 : 0

  const cmds = [
    `reg add "${GAMEBAR_KEY}" /v "AutoGameModeEnabled" /t REG_DWORD /d ${gameModeVal} /f`,
    `reg add "${GAMEBAR_KEY}" /v "AllowAutoGameMode" /t REG_DWORD /d ${gameBarVal} /f`,
    // Restauramos Game Bar a su estado original
    `reg add "${GAMEBAR_KEY}" /v "UseNexusForGameBarEnabled" /t REG_DWORD /d ${gameBarVal} /f`
  ]

  for (const cmd of cmds) {
    try {
      await execAsync(cmd)
    } catch (e) {
      console.warn('[GameMode] Error restaurando configuración:', e)
    }
  }
}