// src/main/services/max/powerPlan.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/** GUID de Ultimate Performance — presente en Windows 10/11 Pro y Enterprise.
 *  En Home puede no existir; se maneja en enable() con un fallback a High Performance. */
const ULTIMATE_PERF_GUID = 'e9a42b02-d5df-448d-aa00-03f14749eb61'
/** GUID de High Performance - fallback para Windows Home */
const HIGH_PERF_GUID = '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635f'

/**
 * Gets the GUID of the currently active power scheme
 * @returns The active power plan GUID
 * @throws Error if unable to read active power scheme
 */
export async function getActivePlanGuid(): Promise<string> {
  const { stdout } = await execAsync('powercfg /getactivescheme')
  // Output: "Power Scheme GUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  (Nombre del plan)"
  const match = stdout.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  )
  if (!match) throw new Error('No se pudo leer el plan de energía activo')
  return match[1].toLowerCase()
}

/** Verifica si Ultimate Performance está disponible en este sistema */
async function isUltimatePerfAvailable(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('powercfg /list')
    return stdout.toLowerCase().includes(ULTIMATE_PERF_GUID)
  } catch {
    return false
  }
}

/** Activa el plan de máximo rendimiento.
 *  Intenta Ultimate Performance primero; hace fallback a High Performance. */
export async function enablePowerPlan(): Promise<void> {
  const hasUltimate = await isUltimatePerfAvailable()

  if (hasUltimate) {
    await execAsync(`powercfg /setactive ${ULTIMATE_PERF_GUID}`)
  } else {
    // En Windows Home, duplicamos High Performance como sustituto
    try {
      await execAsync(
        `powercfg -duplicatescheme ${HIGH_PERF_GUID} ${ULTIMATE_PERF_GUID}`
      )
      await execAsync(`powercfg /setactive ${ULTIMATE_PERF_GUID}`)
    } catch {
      // Si tampoco funciona, activamos High Performance directamente
      await execAsync(`powercfg /setactive ${HIGH_PERF_GUID}`)
    }
  }
}

/** Restaura un plan de energía por GUID (usado al hacer restore del backup) */
export async function restorePowerPlan(guid: string): Promise<void> {
  await execAsync(`powercfg /setactive ${guid}`)
}

/** Devuelve true si el plan activo es el de máximo rendimiento */
export async function isPowerPlanActive(): Promise<boolean> {
  const active = await getActivePlanGuid()
  return active === ULTIMATE_PERF_GUID || active === HIGH_PERF_GUID
}