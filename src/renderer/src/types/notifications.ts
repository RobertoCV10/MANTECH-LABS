// src/renderer/src/types/notifications.ts

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  timestamp: number
  persistent: boolean
  read: boolean
  source?: 'renderer' | 'main'
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  notify: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  success: (message: string, title?: string, persistent?: boolean) => void
  error: (message: string, title?: string, persistent?: boolean) => void
  warning: (message: string, title?: string, persistent?: boolean) => void
  info: (message: string, title?: string, persistent?: boolean) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}
