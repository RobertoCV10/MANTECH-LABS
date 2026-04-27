// src/renderer/src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Notification, NotificationContextType, NotificationType } from '../types/notifications'

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const generateId = (): string => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const MAX_NOTIFICATIONS = 50

  const notify = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: Date.now(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS))
  }, [])

  const success = useCallback((message: string, title?: string, persistent: boolean = false) => {
    notify({ type: 'success', message, title, persistent, source: 'renderer' })
  }, [notify])

  const error = useCallback((message: string, title?: string, persistent: boolean = false) => {
    notify({ type: 'error', message, title, persistent, source: 'renderer' })
  }, [notify])

  const warning = useCallback((message: string, title?: string, persistent: boolean = false) => {
    notify({ type: 'warning', message, title, persistent, source: 'renderer' })
  }, [notify])

  const info = useCallback((message: string, title?: string, persistent: boolean = false) => {
    notify({ type: 'info', message, title, persistent, source: 'renderer' })
  }, [notify])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!window.api?.onNotification) return

    const unsubscribe = window.api.onNotification((data: any) => {
      notify({
        type: data.type as NotificationType,
        message: data.message,
        title: data.title,
        persistent: data.persistent ?? true,
        source: 'main'
      })
    })

    return () => unsubscribe?.()
  }, [notify])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    notify,
    success,
    error,
    warning,
    info,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
