// src/renderer/src/components/notifications/NotificationSnackbar.tsx
import { useState, useEffect, useRef } from 'react'
import { Snackbar, Box, IconButton, Stack, Typography, alpha } from '@mui/material'
import { X, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import { useNotification } from '../../context/NotificationContext'
import { useThemeMode } from '../../theme/ThemeContext'

export const NotificationSnackbar: React.FC = () => {
  const { notifications, markAsRead } = useNotification()
  const { mode, colors } = useThemeMode()
  const [currentId, setCurrentId] = useState<string | null>(null)
  const shownIds = useRef<Set<string>>(new Set())

  // Mapeo de estilos y iconos por severidad
  const getSeverityConfig = (type: string) => {
    const configs = {
      success: { color: colors.green, icon: <CheckCircle2 size={18} /> },
      error: { color: colors.red, icon: <ShieldAlert size={18} /> },
      warning: { color: colors.orange, icon: <AlertTriangle size={18} /> },
      info: { color: colors.cyan, icon: <Info size={18} /> }
    }
    return configs[type as keyof typeof configs] || configs.info
  }

  useEffect(() => {
    const unread = notifications.find(n => !shownIds.current.has(n.id))
    if (unread && !currentId) {
      setCurrentId(unread.id)
    }
  }, [notifications, currentId])

  useEffect(() => {
    if (currentId) shownIds.current.add(currentId)
  }, [currentId])

  useEffect(() => {
    if (!currentId) return
    const notification = notifications.find(n => n.id === currentId)
    if (!notification) return

    const duration = notification.type === 'error' ? 8000 : 5000
    const timer = setTimeout(() => {
      markAsRead(currentId)
      setCurrentId(null)
    }, duration)

    return () => clearTimeout(timer)
  }, [currentId, notifications, markAsRead])

  const handleClose = () => {
    if (currentId) {
      markAsRead(currentId)
      setCurrentId(null)
    }
  }

  const notification = notifications.find(n => n.id === currentId)
  if (!notification) return null

  const { color, icon } = getSeverityConfig(notification.type)

  return (
    <Snackbar
      open={!!currentId}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      onClose={handleClose}
      sx={{ 
        bottom: { xs: 20, sm: 30 }, 
        right: { xs: 20, sm: 30 },
        pointerEvents: 'none' // Evita interferir con clics detrás si no es necesario
      }}
    >
      <Box sx={{
        pointerEvents: 'auto',
        minWidth: 320,
        maxWidth: 420,
        bgcolor: mode === 'dark' ? alpha('#0A0A0A', 0.9) : '#FFF',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: '10px',
        boxShadow: mode === 'dark' ? `0 12px 32px rgba(0,0,0,0.5)` : `0 8px 24px rgba(0,0,0,0.12)`,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        // Animación de entrada suave
        animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        }
      }}>
        {/* Indicador de severidad lateral con Glow */}
        <Box sx={{ 
          width: 5, 
          bgcolor: color,
          boxShadow: `0 0 15px ${alpha(color, 0.5)}`,
          flexShrink: 0
        }} />

        <Stack direction="row" spacing={2} sx={{ p: 2, flex: 1 }} alignItems="flex-start">
          <Box sx={{ color: color, mt: 0.2, flexShrink: 0 }}>
            {icon}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              color: mode === 'dark' ? '#FFF' : '#000',
              lineHeight: 1.2,
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {notification.title || 'Status Update'}
            </Typography>
            <Typography sx={{ 
              fontSize: '0.75rem', 
              color: colors.textMuted,
              lineHeight: 1.4,
              opacity: 0.9
            }}>
              {notification.message}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ 
              color: colors.textSubtle, 
              p: 0.5,
              mt: -0.5,
              mr: -0.5,
              '&:hover': { color: colors.red, bgcolor: 'transparent' }
            }}
          >
            <X size={14} />
          </IconButton>
        </Stack>
      </Box>
    </Snackbar>
  )
}