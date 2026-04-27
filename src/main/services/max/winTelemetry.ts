// src/main/services/max/winTelemetry.ts
//
// Gestiona los servicios de telemetría de Windows (DiagTrack, dmwappushservice).
// Usa el mismo patrón runPowerShell elevado de services/temp/main.ts para
// evitar el error 5 (Acceso denegado) en sc config sin abrir ventanas visibles.
//
// IMPORTANTE: Independiente del TelemetryService de métricas (CPU/RAM).

import { execFile } from 'child_process'
import fs from 'fs'

const TELEMETRY_SERVICES = ['DiagTrack', 'dmwappushservice']
const EXCHANGE_FILE = `C:\\Users\\Public\\exchange_telemetry.txt`

// ─── Runner PowerShell elevado (mismo patrón que temp/main.ts) ───────────────

async function runPowerShell(
  script: string,
  elevated = false
): Promise<{ output: string; success: boolean }> {
  console.log('[WinTelemetry.runPowerShell] Starting... elevated:', elevated)
  console.log('[WinTelemetry.runPowerShell] Exchange file exists BEFORE:', fs.existsSync(EXCHANGE_FILE))
  
  return new Promise((resolve) => {
    const cleanScript = script.replace(/\n/g, ' ').trim()

    const finalScript = elevated
      ? `${cleanScript}; $result | Out-File -FilePath '${EXCHANGE_FILE}' -Encoding utf8 -Force`
      : cleanScript

    const buffer = Buffer.from(finalScript, 'utf16le')
    const base64Script = buffer.toString('base64')

    let args: string[]

    if (elevated) {
      args = [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-Command',
        `Start-Process powershell.exe -ArgumentList "-NoProfile -EncodedCommand ${base64Script}" -Verb RunAs -Wait -WindowStyle Hidden`
      ]
    } else {
      args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', base64Script]
    }

    execFile('powershell.exe', args, { timeout: 60000 }, (err, stdout) => {
      console.log('[WinTelemetry.runPowerShell] Process finished, err:', err ? err.message : 'none')
      
      if (err && !elevated) {
        console.log('[WinTelemetry.runPowerShell] Non-elevated error, returning failure')
        resolve({ output: '', success: false })
        return
      }

      if (elevated) {
        // Aumentar timeout a 2 segundos para dar más tiempo al proceso elevado
        setTimeout(() => {
          const exists = fs.existsSync(EXCHANGE_FILE)
          console.log('[WinTelemetry.runPowerShell] Exchange file exists AFTER (2000ms):', exists)
          
          if (exists) {
            try {
              const content = fs
                .readFileSync(EXCHANGE_FILE, 'utf8')
                .replace(/\uFEFF/g, '')
                .trim()
              console.log('[WinTelemetry.runPowerShell] File content:', content)
              fs.unlinkSync(EXCHANGE_FILE)
              resolve({ output: content, success: true })
            } catch (readErr) {
              console.error('[WinTelemetry.runPowerShell] Error reading file:', readErr)
              resolve({ output: '', success: true }) // El archivo existía, considerar éxito
            }
          } else {
            // Archivo no existe - verificar si es porque el proceso falló o realmente UAC cancelado
            console.log('[WinTelemetry.runPowerShell] File does not exist')
            resolve({ output: '', success: false })
          }
        }, 2000) // 2000ms en lugar de 500ms
      } else {
        console.log('[WinTelemetry.runPowerShell] Non-elevated, returning success')
        resolve({ output: stdout?.trim() || '', success: true })
      }
    })
  })
}

// ─── Estado ──────────────────────────────────────────────────────────────────

/** Devuelve true si DiagTrack está corriendo */
export async function isTelemetryRunning(): Promise<boolean> {
  const script = `
    $svc = Get-Service -Name 'DiagTrack' -ErrorAction SilentlyContinue;
    if ($null -eq $svc) { Write-Output 'false' }
    else { Write-Output ($svc.Status -eq 'Running').ToString().ToLower() }
  `
  const { output } = await runPowerShell(script)
  return output === 'true'
}

// ─── Deshabilitar ─────────────────────────────────────────────────────────────

/**
 * Detiene y deshabilita los servicios de telemetría.
 * Requiere UAC — se solicita una sola vez para ambos servicios.
 * Devuelve false si el usuario canceló el UAC.
 */
export async function disableTelemetry(): Promise<boolean> {
  const servicesCmds = TELEMETRY_SERVICES.map(
    (svc) => `
      $s = Get-Service -Name '${svc}' -ErrorAction SilentlyContinue;
      if ($null -ne $s) {
        Stop-Service -Name '${svc}' -Force -ErrorAction SilentlyContinue;
        sc.exe config '${svc}' start= disabled | Out-Null;
      }
    `
  ).join(' ')

  const script = `
    ${servicesCmds}
    $result = 'ok';
  `

  const { success } = await runPowerShell(script, true)

  if (!success) {
    console.warn('[WinTelemetry] UAC cancelado — telemetría no deshabilitada.')
  }

  return success
}

// ─── Restaurar ────────────────────────────────────────────────────────────────

/**
 * Restaura los servicios de telemetría a inicio automático y los arranca.
 * Requiere UAC — misma elevación que disableTelemetry.
 * Devuelve false si el usuario canceló el UAC.
 */
export async function enableTelemetry(): Promise<boolean> {
  const servicesCmds = TELEMETRY_SERVICES.map(
    (svc) => `
      $s = Get-Service -Name '${svc}' -ErrorAction SilentlyContinue;
      if ($null -ne $s) {
        sc.exe config '${svc}' start= auto | Out-Null;
        Start-Service -Name '${svc}' -ErrorAction SilentlyContinue;
      }
    `
  ).join(' ')

  const script = `
    ${servicesCmds}
    $result = 'ok';
  `

  const { success } = await runPowerShell(script, true)

  if (!success) {
    console.warn('[WinTelemetry] UAC cancelado — telemetría no restaurada.')
  }

  return success
}