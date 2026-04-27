// src/main/utils/format.ts

/**
 * Converts bytes to human-readable format (KB, MB, GB, etc.)
 * @param bytes Number of bytes to format
 * @param decimals Number of decimal places (default: 1)
 */
export const formatBytes = (bytes: number, decimals: number = 1): string => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  // Determine unit index (0 = B, 1 = KB, etc.)
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Return calculated value with corresponding unit
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Formats CPU frequency from MHz to GHz if needed
 * @param mhz Frequency in MHz
 */
export const formatFrequency = (mhz: number): string => {
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(2)} GHz`
  }
  return `${mhz} MHz`
}