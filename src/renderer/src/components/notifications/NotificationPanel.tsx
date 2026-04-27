// src/renderer/src/components/notifications/NotificationPanel.tsx
import React from 'react';
import { Box, Typography, Paper, Stack, IconButton, Badge, alpha } from '@mui/material';
import { Bell, Check, Trash2, X, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useThemeMode } from '../../theme/ThemeContext';

interface NotificationPanelProps {
  top_OFFSET?: number;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ top_OFFSET = 60 }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotification();
  const { mode, colors } = useThemeMode();

  const getSeverityStyles = (type: string) => {
    const styles = {
      success: { color: colors.green, icon: <CheckCircle2 size={16} /> },
      error: { color: colors.red, icon: <ShieldAlert size={16} /> },
      warning: { color: colors.orange, icon: <AlertTriangle size={16} /> },
      info: { color: colors.cyan, icon: <Info size={16} /> }
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: top_OFFSET,
        right: 35,
        width: 360, // Ligeramente más estrecho para mayor elegancia
        maxHeight: 500,
        bgcolor: mode === 'dark' ? '#070707' : '#ffffff', // Negro profundo en lugar de gris
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: '12px',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}
    >
      {/* HEADER: Más limpio y con mejor tipografía */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${colors.surfaceBorder}`,
        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Badge 
              badgeContent={unreadCount} 
              sx={{ '& .MuiBadge-badge': { bgcolor: colors.cyan, color: '#000', fontWeight: 900, fontSize: '0.6rem' } }}
            >
              <Bell size={18} color={colors.textMuted} />
            </Badge>
            <Typography sx={{ 
              fontWeight: 800, 
              fontSize: '0.75rem', 
              color: colors.textMuted, 
              letterSpacing: 1.2, 
              textTransform: 'uppercase' 
            }}>
              Terminal Logs
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={markAllAsRead} sx={{ color: colors.cyan, opacity: 0.8, '&:hover': { opacity: 1 } }}>
              <Check size={16} />
            </IconButton>
            <IconButton size="small" onClick={clearAll} sx={{ color: colors.textSubtle, '&:hover': { color: colors.red } }}>
              <Trash2 size={16} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* BODY: Con scrollbar invisible y mejor espaciado */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: colors.surfaceBorder, borderRadius: '10px' }
      }}>
        {notifications.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 6, opacity: 0.3 }}>
            <Bell size={40} strokeWidth={1} />
            <Typography sx={{ fontSize: '0.7rem', mt: 1, fontWeight: 600 }}>Sin registros nuevos</Typography>
          </Stack>
        ) : (
          notifications.map((notif) => {
            const style = getSeverityStyles(notif.type);
            return (
              <Box
                key={notif.id}
                onClick={() => !notif.read && markAsRead(notif.id)}
                sx={{
                  p: 2.5,
                  display: 'flex',
                  gap: 2,
                  borderBottom: `1px solid ${colors.surfaceBorder}`,
                  bgcolor: notif.read ? 'transparent' : alpha(style.color, 0.03),
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }
                }}
              >
                {/* Indicador de estado: Línea vertical minimalista */}
                <Box sx={{ 
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 3, 
                  bgcolor: notif.read ? 'transparent' : style.color,
                  boxShadow: notif.read ? 'none' : `0 0 10px ${style.color}`
                }} />

                <Box sx={{ color: style.color, mt: 0.3 }}>
                  {style.icon}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ 
                    fontSize: '0.85rem', 
                    fontWeight: notif.read ? 600 : 800, 
                    color: notif.read ? colors.textSubtle : (mode === 'dark' ? '#fff' : '#000'),
                    mb: 0.5
                  }}>
                    {notif.title || 'Sistema'}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.78rem', 
                    color: colors.textMuted, 
                    lineHeight: 1.4,
                    opacity: 0.9
                  }}>
                    {notif.message}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                  sx={{ color: colors.textSubtle, opacity: 0.3, '&:hover': { opacity: 1, color: colors.red }, alignSelf: 'flex-start', mt: -0.5 }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            );
          })
        )}
      </Box>

      {/* FOOTER: Texto pequeño y centrado */}
      {notifications.length > 0 && (
        <Box sx={{ py: 1.5, textAlign: 'center', opacity: 0.4 }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Fin del registro
          </Typography>
        </Box>
      )}
    </Paper>
  );
};