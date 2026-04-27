//src/main/services/temp/main.ts
import path from 'path'
import { runPowerShell, sanitizePath } from '../../utils/powershell'

export interface ScanTarget {
  userTemp: boolean
  winTemp: boolean
  prefetch: boolean
  updateCache: boolean
}

export interface ScanResult {
  totalSize: number
  details: {
    [key: string]: { size: number; path: string }
  }
  adminDenied?: boolean
}



/**
 * Checks if running with administrator privileges
 */
export async function requestAdminPrivileges(): Promise<boolean> {
  const result = await runPowerShell(`([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)`)
  return result.output.toLowerCase() === 'true'
}

/**
 * Processes a directory for scanning or cleaning using unified logic
 */
async function processDirectory(dirPath: string, mode: 'scan' | 'clean', filter = '*') {
  const sanitizedPath = sanitizePath(dirPath)
  const escapedPath = sanitizedPath.replace(/'/g, "''")

  // Elevar tanto en scan como en clean para carpetas Windows
  const needsAdmin = sanitizedPath.toLowerCase().includes('windows')

  const psScript = `
    $total = 0;
    if (Test-Path '${escapedPath}') {
      $items = Get-ChildItem -Path '${escapedPath}' -Filter '${filter}' -Recurse -File -ErrorAction SilentlyContinue;
      foreach ($item in $items) {
        if ('${mode}' -eq 'clean') {
          try {
            $itemSize = $item.Length;
            Remove-Item $item.FullName -Force -ErrorAction Stop;
            $total += $itemSize;
          } catch { }
        } else {
          $total += $item.Length;
        }
      }
    };
    $result = $total;
    Write-Output $total;
  `.trim()

  const result = await runPowerShell(psScript, needsAdmin)
  return { size: parseInt(result.output, 10) || 0, elevated: result.success }
}

export async function scanTempFolders(targets: ScanTarget): Promise<ScanResult> {
  const result: ScanResult = { totalSize: 0, details: {}, adminDenied: false }
  
  const pathsMap = {
    userTemp: path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Temp'),
    winTemp: path.join(process.env.WINDIR || '', 'Temp'),
    prefetch: path.join(process.env.WINDIR || '', 'Prefetch'),
    updateCache: path.join(process.env.WINDIR || '', 'SoftwareDistribution', 'Download')
  }

  for (const [key, dirPath] of Object.entries(pathsMap)) {
    if (targets[key as keyof ScanTarget]) {
      const { size, elevated } = await processDirectory(dirPath, 'scan')
      result.details[key] = { size, path: dirPath }
      result.totalSize += size
      if (!elevated && (key === 'winTemp' || key === 'prefetch' || key === 'updateCache')) {
        result.adminDenied = true
      }
    }
  }

  return result
}

export async function cleanTempFolders(targets: ScanTarget): Promise<{ totalDeleted: number; details: Record<string, number>; adminDenied: boolean }> {
  const details: Record<string, number> = {}
  let totalDeleted = 0
  let adminDenied = false

  const config = [
    { key: 'userTemp', path: path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Temp') },
    { key: 'winTemp', path: path.join(process.env.WINDIR || '', 'Temp') },
    { key: 'prefetch', path: path.join(process.env.WINDIR || '', 'Prefetch') },
    { key: 'updateCache', path: path.join(process.env.WINDIR || '', 'SoftwareDistribution', 'Download'), stopUpdate: true }
  ]

  for (const item of config) {
    if (targets[item.key as keyof ScanTarget]) {
      let size = 0
      let success = false

      // Special case: Windows Update (requires stopping service and deleting in single elevated process)
      if (item.stopUpdate) {
        const updateScript = `
          $total = 0;
          Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue;
          if (Test-Path '${item.path}') {
            $items = Get-ChildItem -Path '${item.path}' -Recurse -File -ErrorAction SilentlyContinue;
            foreach ($i in $items) { $total += $i.Length; Remove-Item $i.FullName -Force -ErrorAction SilentlyContinue };
          }
          Start-Service -Name wuauserv -ErrorAction SilentlyContinue;
          Write-Output $total;
        `.replace(/\n/g, ' ')

        const res = await runPowerShell(updateScript, true)
        size = parseInt(res.output, 10) || 0
        success = res.success
      } 
      else {
        // Standard execution for other folders
        const res = await processDirectory(item.path, 'clean', '*')
        size = res.size
        success = res.elevated
      }

      details[item.key] = size
      totalDeleted += size

      // Check if access was denied for critical folders
      if (!success && (item.key === 'winTemp' || item.key === 'prefetch' || item.key === 'updateCache')) {
        adminDenied = true
      }
    }
  }

  return { totalDeleted, details, adminDenied }
}

export function getAdminWarning(targets: ScanTarget): string[] {
  const warnings: string[] = []
  if (targets.winTemp) warnings.push('Windows temporary files')
  if (targets.prefetch) warnings.push('Prefetch files (speed up startup)')
  if (targets.updateCache) warnings.push('Windows Update cache')
  return warnings
}