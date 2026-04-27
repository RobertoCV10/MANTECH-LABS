// src/renderer/src/hooks/useNotify.ts
import { useNotification } from '../context/NotificationContext'

export const useNotify = () => {
  const { success, error, warning, info } = useNotification()

  return {
    success: (message: string, title?: string) => success(message, title, false),
    error: (message: string, title?: string) => error(message, title, false),
    warning: (message: string, title?: string) => warning(message, title, false),
    info: (message: string, title?: string) => info(message, title, false),
    persistent: {
      success: (message: string, title?: string) => success(message, title, true),
      error: (message: string, title?: string) => error(message, title, true),
      warning: (message: string, title?: string) => warning(message, title, true),
      info: (message: string, title?: string) => info(message, title, true)
    }
  }
}