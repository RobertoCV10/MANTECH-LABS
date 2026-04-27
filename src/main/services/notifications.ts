// src/main/services/notifications.ts
import { BrowserWindow, ipcMain } from 'electron'

export function sendNotification(
  window: BrowserWindow,
  notification: {
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    title?: string
    persistent?: boolean
  }
): void {
  window.webContents.send('notification', notification)
}

export function registerNotificationHandlers(): void {
  ipcMain.handle('send-notification', (event, notification) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      sendNotification(window, notification)
    }
  })
}
