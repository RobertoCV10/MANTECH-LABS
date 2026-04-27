// src/main/services/max/notifications.ts
//
// Focus Assist en Windows 10/11 se controla via una clave de registry compleja
// en CloudStore. El enfoque más robusto y compatible entre versiones es usar
// PowerShell con la API de WinRT (solo W11) o el registry directo (W10/W11).
//
// Usamos registry directo porque es compatible con ambas versiones y no requiere
// permisos adicionales al ejecutarse en el contexto del usuario actual.

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/** Lee el nivel actual de Focus Assist (0, 1 o 2) */
export async function getFocusAssistLevel(): Promise<number> {
  try {
    // Intentamos leer via PowerShell el valor binario que controla el nivel
    const ps = `
      $path = 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings'
      $val = Get-ItemProperty -Path $path -Name 'NOC_GLOBAL_SETTING_TOASTS_ENABLED' -ErrorAction SilentlyContinue
      if ($null -eq $val) { Write-Output 0 } else { Write-Output $val.NOC_GLOBAL_SETTING_TOASTS_ENABLED }
    `.trim()

    const { stdout } = await execAsync(
      `powershell -NoProfile -NonInteractive -Command "${ps.replace(/\n/g, ' ')}"`
    )
    const level = parseInt(stdout.trim(), 10)
    return isNaN(level) ? 0 : level
  } catch {
    return 0
  }
}

/** Activa Focus Assist nivel 2 (solo alarmas) — silencia todas las notificaciones */
export async function enableFocusAssist(): Promise<void> {
  // Escribimos el valor que indica "solo alarmas" (2)
  // Este es el registry que Windows respeta para la configuración global
  const cmds = [
    // Desactiva los toasts (notificaciones emergentes)
    `reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" /v "NOC_GLOBAL_SETTING_TOASTS_ENABLED" /t REG_DWORD /d 0 /f`,
    // Activa Do Not Disturb / Focus Assist modo alarmas
    `reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" /v "NOC_GLOBAL_SETTING_ALLOW_CRITICAL_TOASTS_ABOVE_LOCK" /t REG_DWORD /d 1 /f`
  ]

  for (const cmd of cmds) {
    try {
      await execAsync(cmd)
    } catch (e) {
      console.warn('[Notifications] Error aplicando Focus Assist:', e)
    }
  }
}

/** Restaura las notificaciones al estado original */
export async function disableFocusAssist(originalLevel: number = 1): Promise<void> {
  const cmds = [
    `reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" /v "NOC_GLOBAL_SETTING_TOASTS_ENABLED" /t REG_DWORD /d ${originalLevel} /f`,
    `reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" /v "NOC_GLOBAL_SETTING_ALLOW_CRITICAL_TOASTS_ABOVE_LOCK" /t REG_DWORD /d 0 /f`
  ]

  for (const cmd of cmds) {
    try {
      await execAsync(cmd)
    } catch (e) {
      console.warn('[Notifications] Error restaurando notificaciones:', e)
    }
  }
}

/** Devuelve true si las notificaciones están suprimidas actualmente */
export async function isNotificationsSilenced(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" /v "NOC_GLOBAL_SETTING_TOASTS_ENABLED"`
    )
    // Si el valor es 0x0, las notificaciones están desactivadas
    return stdout.includes('0x0')
  } catch {
    return false
  }
}