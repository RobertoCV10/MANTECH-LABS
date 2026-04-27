//src/main/services/ram/main.ts
import { execFile } from 'child_process'
import path from 'path'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'

/**
 * Clears the Standby List using an external tool.
 * Requires administrator privileges to interact with the kernel.
 */
export async function optimizeStandby(): Promise<{ success: boolean; method: string }> {
  return new Promise((resolve, reject) => {
    const toolPath = is.dev
      ? path.join(app.getAppPath(), 'resources', 'EmptyStandbyList.exe')
      : path.join(process.resourcesPath, 'resources', 'EmptyStandbyList.exe')

    // Use Start-Process with -Verb RunAs to trigger UAC (User Account Control)
    // The -WindowStyle Hidden flag prevents a black console window from flashing
    const elevationCommand = `Start-Process -FilePath "${toolPath}" -ArgumentList "standbylist" -Verb RunAs -WindowStyle Hidden`

    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', elevationCommand], (err) => {
      if (err) {
        // If user clicks "No" on Windows dialog, error is returned here
        console.error('User denied permissions or error occurred:', err)
        reject(err)
      } else {
        resolve({ success: true, method: 'StandbyList' })
      }
    })
  })
}

/**
 * Reduces the Working Set of all active processes.
 * Uses the native .NET method exposed in PowerShell.
 */
export async function optimizeWorkingSet(): Promise<{ success: boolean; method: string }> {
  return new Promise((resolve, reject) => {
    const psScript = 'Get-Process | ForEach-Object { try { $_.EmptyWorkingSet() } catch {} }'
    
    // Execute a PowerShell instance that launches another with elevated privileges
    const elevationCommand = `Start-Process powershell -ArgumentList "-NoProfile -Command ${psScript}" -Verb RunAs -WindowStyle Hidden`
    
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', elevationCommand], (err) => { 
      if (err) {
        console.error('Error or permission denied in Working Set:', err)
        reject(err)
      } else {
        resolve({ success: true, method: 'WorkingSet' })
      }
    })
  })
}
