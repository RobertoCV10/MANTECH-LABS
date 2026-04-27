import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useThemeMode } from '../../../theme/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { CheckCircle, XCircle, Loader, History } from 'lucide-react';

interface ActionLog {
  id: number;
  label: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  after: object | null;
  savedGB?: number;
}

interface ActionHistoryProps {
  logs: ActionLog[];
}

const formatSaved = (savedGB: number, t: (key: string) => string) => {
  if (savedGB <= 0) return `0 MB`;
  return savedGB >= 1
    ? `-${savedGB.toFixed(2)} GB`
    : `-${(savedGB * 1024).toFixed(0)} MB`;
};

export const ActionHistory = ({ logs }: ActionHistoryProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  if (logs.length === 0) {
    return (
      <Box sx={{ 
        height: '40%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 1
      }}>
        {/* Cambiado a textSubtle para que no desaparezca */}
        <History size={28} color={colors.textSubtle} strokeWidth={1.5} />
        <Typography sx={{ 
          mt: 1.25, 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          color: colors.textSubtle, // Ahora es un gris sólido legible
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
          {t('ram.history.empty') || 'No Recent Actions'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {logs.map((log) => {
        const isPending = log.status === 'pending';
        const isError = log.status === 'error';
        
        // Asignación de colores semánticos basados en el nuevo ThemeContext
        const statusColor = isError ? colors.red : isPending ? colors.orange : colors.green;
        const statusBg = isError ? colors.red + '15' : isPending ? colors.orange + '15' : colors.greenDim;
        const statusBorder = isError ? colors.red + '30' : isPending ? colors.orange + '30' : colors.greenBorder;
        
        return (
          <Box
            key={log.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: '8px 12px', 
              borderRadius: 1.5,
              // Usamos sidebarBg para el fondo del ítem para que resalte sobre el panel blanco
              bgcolor: mode === 'light' ? colors.sidebarBg : 'rgba(255,255,255,0.03)',
              border: `1px solid ${colors.surfaceBorder}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: colors.sidebarHover,
                borderColor: isPending ? colors.orange : colors.cyan,
                transform: 'translateX(2px)',
              },
            }}
          >
            {/* Status Dot con brillo sutil */}
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: statusColor,
              boxShadow: mode === 'light' ? 'none' : `0 0 8px ${statusColor}`,
              flexShrink: 0,
            }} />

            <Stack spacing={0} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: colors.textMuted, // El nuevo gris oscuro sólido
                lineHeight: 1.2,
              }}>
                {log.label}
              </Typography>
              <Typography sx={{ 
                fontSize: '0.6rem', 
                color: colors.textSubtle, // Gris medio sólido
                fontFamily: 'monospace',
                fontWeight: 500
              }}>
                {log.timestamp}
              </Typography>
            </Stack>

            {/* Result Tag - Ahora usando tus colores solidificados */}
            {log.after && (
              <Box sx={{ 
                px: 1, 
                py: 0.35, 
                borderRadius: 1, 
                bgcolor: statusBg,
                border: `1px solid ${statusBorder}`,
                flexShrink: 0
              }}>
                <Typography sx={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  color: statusColor,
                  fontFamily: 'monospace',
                }}>
                  {isError ? 'FAIL' : formatSaved(log.savedGB ?? 0, t)}
                </Typography>
              </Box>
            )}

            {isPending && (
              <Loader size={14} color={colors.orange} className="spin" strokeWidth={3} />
            )}
          </Box>
        );
      })}
    </Box>
  );
};