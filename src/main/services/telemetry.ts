// src/main/services/telemetry.ts
import si from 'systeminformation'
import { WindowsProvider } from './win-provider'
import { formatBytes } from '../utils/format'

export const TelemetryService = {
  async getFullTelemetry() {
    const isWin = process.platform === 'win32'

    if (!isWin) {
      throw new Error('TelemetryService.getFullTelemetry() is only supported on Windows')
    }

    // 1. Base data collection
    const [load, mem, disks, diskLayout, blockDevices, memLayout, cpuInfo, cpuSpeed] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.diskLayout(),
      si.blockDevices(),
      si.memLayout(),
      si.cpu(),
      si.cpuCurrentSpeed()
    ])

    // 2. Windows-specific data — includes workingSetTotal
    const ioMap = await WindowsProvider.getIO()
    const winTemps = await WindowsProvider.getTemps()
    const winMem = await WindowsProvider.getMemoryDetails()
    const workingSetGB = await WindowsProvider.getWorkingSetTotal()

    // 3. Disk processing and mapping
    const mappedDisks = disks.map((d) => {
      const driveLetter = d.fs?.replace(':', '').toLowerCase() ?? ''
      const ioStats = ioMap.get(driveLetter) ?? { read: 0, write: 0 }

      const mountNorm = d.mount?.replace(/\\/g, '/').toLowerCase()
      const fsNorm = d.fs?.replace(/\\/g, '/').toLowerCase()

      const bDevice = blockDevices.find(bd => {
        const bdName = bd.name?.toLowerCase()
        const bdMount = bd.mount?.replace(/\\/g, '/').toLowerCase()
        return bdMount === mountNorm || bdName === fsNorm || fsNorm?.endsWith(bdName ?? '')
      })

      const physicalDevice = diskLayout.find(ld => {
        if (bDevice?.device) return ld.device?.toLowerCase() === bDevice.device.toLowerCase()
        return diskLayout.length === 1
      }) ?? null

      const modelKey = physicalDevice?.name?.toLowerCase() ?? ''
      const temp = winTemps.get(modelKey)
        ?? [...winTemps.entries()].find(([k]) => modelKey.includes(k) || k.includes(modelKey))?.[1]
        ?? physicalDevice?.temperature
        ?? null

      return {
        fs: d.fs,
        type: d.type,
        size: formatBytes(d.size),
        used: d.use,
        available: formatBytes(d.size - d.used),
        readIO: formatBytes(ioStats.read) + '/s',
        writeIO: formatBytes(ioStats.write) + '/s',
        temp: temp,
        status: physicalDevice?.smartStatus ?? 'Ok',
        model: physicalDevice?.name ?? d.fs,
        interfaceType: physicalDevice?.interfaceType ?? physicalDevice?.type ?? '—'
      }
    })

    // 4. Final payload
    return {
      cpu: Math.round(load.currentLoad),
      cpuThreads: load.cpus.map(c => Math.round(c.load)),
      cpuInfo: {
        brand: cpuInfo.brand,
        manufacturer: cpuInfo.manufacturer,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
        socket: cpuInfo.socket,
        speed: cpuInfo.speed,
        speedMax: cpuInfo.speedMax ?? cpuInfo.speed,
        virtualization: cpuInfo.virtualization,
        cache: {
          l1d: cpuInfo.cache?.l1d ?? 0,
          l1i: cpuInfo.cache?.l1i ?? 0,
          l2: cpuInfo.cache?.l2 ?? 0,
          l3: cpuInfo.cache?.l3 ?? 0
        }
      },
      cpuFreq: cpuSpeed.avg ?? 0,
      ram: Math.round((mem.active / mem.total) * 100),
      ramRaw: `${(mem.active / 1024 / 1024 / 1024).toFixed(1)} / ${(mem.total / 1024 / 1024 / 1024).toFixed(1)} GB`,

      ramDetails: {
        total: parseFloat((mem.total / 1024 / 1024 / 1024).toFixed(1)),
        active: parseFloat((mem.active / 1024 / 1024 / 1024).toFixed(1)),
        available: parseFloat((mem.available / 1024 / 1024 / 1024).toFixed(1)),
        cache: winMem.cache, // Standby List in GB
        workingSet: workingSetGB, // Working Set total for processes in GB
        swapUsed: parseFloat((mem.swapused / 1024 / 1024 / 1024).toFixed(1)),
        swapTotal: parseFloat((mem.swaptotal / 1024 / 1024 / 1024).toFixed(1)),
        layout: memLayout.map(slot => ({
          size: parseFloat((slot.size / 1024 / 1024 / 1024).toFixed(0)),
          speed: slot.clockSpeed,
          type: slot.type,
          formFactor: slot.formFactor,
          manufacturer: slot.manufacturer,
          partNum: slot.partNum?.trim() || '—'
        }))
      },
      disks: mappedDisks
    }
  }
}