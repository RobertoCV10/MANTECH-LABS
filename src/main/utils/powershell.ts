// src/main/utils/powershell.ts
import { execFile } from 'child_process'
import fs from 'fs'
import crypto from 'crypto'
import { app } from 'electron'

/**
 * Result of a PowerShell execution
 */
export interface PowerShellResult {
  output: string
  success: boolean
}

/**
 * Exchange file path for elevated PowerShell commands
 * Uses a random name to prevent conflicts
 */
function getExchangeFile(): string {
  const randomName = crypto.randomBytes(16).toString('hex')
  return `C:\\Users\\Public\\exchange_${randomName}.txt`
}

/**
 * Executes a PowerShell script with optional elevation (UAC)
 * 
 * @param script - PowerShell script to execute
 * @param elevated - Whether to run with administrator privileges (default: false)
 * @param timeout - Execution timeout in ms (default: 60000)
 */
export async function runPowerShell(
  script: string,
  elevated = false,
  timeout = 60000
): Promise<PowerShellResult> {
  return new Promise((resolve) => {
    const cleanScript = script.replace(/\n/g, ' ').trim()
    const exchangeFile = getExchangeFile()
    
    const finalScript = elevated
      ? `${cleanScript}; $result | Out-File -FilePath '${exchangeFile}' -Encoding utf8 -Force`
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

    execFile('powershell.exe', args, { timeout }, (err, stdout) => {
      if (err && !elevated) {
        resolve({ output: '', success: false })
        return
      }

      if (elevated) {
        const waitForFile = (retries = 20): void => {
          if (fs.existsSync(exchangeFile)) {
            try {
              const content = fs.readFileSync(exchangeFile, 'utf8')
                .replace(/\uFEFF/g, '').trim()
              fs.unlinkSync(exchangeFile)
              resolve({ output: content, success: true })
            } catch {
              resolve({ output: '', success: true })
            }
          } else if (retries > 0) {
            setTimeout(() => waitForFile(retries - 1), 300)
          } else {
            resolve({ output: '', success: false })
          }
        }
        waitForFile()
      } else {
        resolve({ output: stdout?.trim() || '', success: true })
      }
    })
  })
}

/**
 * Sanitizes a path to prevent command injection attacks
 * Only allows alphanumeric characters, spaces, and common path separators
 */
export function sanitizePath(dirPath: string): string {
  const sanitized = dirPath.replace(/[^a-zA-Z0-9\s\\/:._-]/g, '')
  
  if (sanitized.includes('..') || sanitized.includes('|') || sanitized.includes('&')) {
    throw new Error('Invalid path detected')
  }
  
  return sanitized
}

/**
 * Generates a secure temporary file path in the system temp directory
 */
export function getSecureExchangeFile(): string {
  const randomName = crypto.randomBytes(16).toString('hex')
  const tempPath = app.getPath('temp')
  return `${tempPath}\\exchange_${randomName}.txt`
}