// src/main/utils/notifications.ts
import { BrowserWindow } from 'electron'

/**
 * Envía una notificación desde el main process al renderer
 * 
 * @param window - La ventana del renderer a notificar
 * @param type - Tipo de notificación: 'success' | 'error' | 'warning' | 'info'
 * @param message - Mensaje principal de la notificación
 * @param title - Título opcional
 * @param persistent - Si es true, la notificación se guarda en el historial (default: true)
 */
export function sendNotification(
  window: BrowserWindow,
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  title?: string,
  persistent: boolean = true
): void {
  window.webContents.send('notification', {
    type,
    message,
    title,
    persistent
  })
}

/**
 * Envía una notificación de éxito
 */
export function notifySuccess(
  window: BrowserWindow,
  message: string,
  title?: string
): void {
  sendNotification(window, 'success', message, title)
}

/**
 * Envía una notificación de error
 */
export function notifyError(
  window: BrowserWindow,
  message: string,
  title?: string
): void {
  sendNotification(window, 'error', message, title, true)
}

/**
 * Envía una notificación de advertencia
 */
export function notifyWarning(
  window: BrowserWindow,
  message: string,
  title?: string
): void {
  sendNotification(window, 'warning', message, title, true)
}

/**
 * Envía una notificación informativa
 */
export function notifyInfo(
  window: BrowserWindow,
  message: string,
  title?: string
): void {
  sendNotification(window, 'info', message, title)
}

/**
 * Envía notificaciones a todas las ventanas activas
 */
export function broadcastNotification(
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  title?: string,
  persistent: boolean = true
): void {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(window => {
    sendNotification(window, type, message, title, persistent)
  })
}
