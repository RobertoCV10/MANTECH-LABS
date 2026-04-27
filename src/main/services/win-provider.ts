// src/main/services/win-provider.ts
import { execFile } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(execFile)

export const WindowsProvider = {
  /**
   * Reads actual bytes/s from Windows performance counters.
   * Solves the zero-read issue from systeminformation.
   */
  async getIO(): Promise<Map<string, { read: number; write: number }>> {
    const map = new Map<string, { read: number; write: number }>()
    try {
      const { stdout } = await execAsync('powershell', [
        '-NoProfile', '-NonInteractive', '-Command',
        "Get-CimInstance -ClassName Win32_PerfFormattedData_PerfDisk_PhysicalDisk | Where-Object { $_.Name -ne '_Total' } | Select-Object Name,DiskReadBytesPersec,DiskWriteBytesPersec | ConvertTo-Json -Compress"
      ], { timeout: 10000 })

      const raw = stdout.trim()
      if (!raw) return map

      const items = JSON.parse(raw)
      const arr = Array.isArray(items) ? items : [items]

      arr.forEach((item: any) => {
        const read = Math.max(0, Number(item.DiskReadBytesPersec) || 0)
        const write = Math.max(0, Number(item.DiskWriteBytesPersec) || 0)

        const letters = [...item.Name.matchAll(/([A-Za-z]):/g)].map(m => m[1].toLowerCase())
        letters.forEach(letter => map.set(letter, { read, write }))
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Windows IO Error:', message)
    }
    return map
  },

  /**
   * Reads S.M.A.R.T. temperature per physical disk.
   * Requires Administrator privileges to return data.
   */
  async getTemps(): Promise<Map<string, number>> {
    const map = new Map<string, number>()
    try {
      const { stdout } = await execAsync('powershell', [
        '-NoProfile', '-NonInteractive', '-Command',
        "Get-PhysicalDisk | ForEach-Object { $d = $_; $temp = (Get-StorageReliabilityCounter -PhysicalDisk $d).Temperature; [PSCustomObject]@{ FriendlyName=$d.FriendlyName; Temp=$temp } } | ConvertTo-Json -Compress"
      ], { timeout: 5000 })

      const raw = stdout.trim()
      if (!raw) return map

      const items = JSON.parse(raw)
      const arr = Array.isArray(items) ? items : [items]

      arr.forEach((item: any) => {
        if (item.Temp) {
          map.set(item.FriendlyName.toLowerCase(), item.Temp)
        }
      })
    } catch {
      // Silently fails if no permissions
    }
    return map
  },

  /**
   * Gets Standby (Cache) memory details not reported by systeminformation on Windows.
   */
  async getMemoryDetails(): Promise<{ cache: number }> {
    try {
      const { stdout } = await execAsync('powershell', [
        '-NoProfile', '-NonInteractive', '-Command',
        "Get-CimInstance -ClassName Win32_PerfFormattedData_PerfOS_Memory | Select-Object StandbyCacheCoreBytes,StandbyCacheNormalPriorityBytes,StandbyCacheReserveBytes | ConvertTo-Json -Compress"
      ], { timeout: 6000 })

      const raw = stdout.trim()
      if (!raw) return { cache: 0 }

      const data = JSON.parse(raw)
      const cacheBytes = (
        Number(data.StandbyCacheCoreBytes || 0) +
        Number(data.StandbyCacheNormalPriorityBytes || 0) +
        Number(data.StandbyCacheReserveBytes || 0)
      )

      return {
        cache: parseFloat((cacheBytes / 1024 / 1024 / 1024).toFixed(2))
      }
    } catch {
      return { cache: 0 }
    }
  },

  /**
   * Sums WorkingSet64 of all active processes in GB.
   * This is the value that visibly changes after optimizeWorkingSet().
   */
  async getWorkingSetTotal(): Promise<number> {
    try {
      const { stdout } = await execAsync('powershell', [
        '-NoProfile', '-NonInteractive', '-Command',
        "(Get-Process | Measure-Object WorkingSet64 -Sum).Sum"
      ], { timeout: 8000 })

      const raw = stdout.trim()
      if (!raw) return 0

      const bytes = Number(raw)
      return isNaN(bytes) ? 0 : parseFloat((bytes / 1024 / 1024 / 1024).toFixed(2))
    } catch {
      return 0
    }
  }
}