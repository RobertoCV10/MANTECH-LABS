import { Paper, Typography, Box, Stack } from '@mui/material';
import { ReactNode } from 'react';
import { useThemeMode } from '../../theme/ThemeContext';

interface SettingsCardProps {
  title: string;
  icon: ReactNode;
  accentColor?: string;
  children: ReactNode;
  action?: ReactNode;
}

export const SettingsCard = ({ title, icon, accentColor, children, action }: SettingsCardProps) => {
  const { mode, colors } = useThemeMode();
  const accent = accentColor || colors.cyan;

  return (
    <Paper elevation={0} sx={{
      p: 2.5, // Un poco más de aire interno
      borderRadius: '12px', // Radio estilo Apple
      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${colors.surfaceBorder}`,
      position: 'relative',
      overflow: 'hidden',
      height: '100%', // Crucial para el stretch del Flexbox
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        borderColor: `${accent}60`,
        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
        boxShadow: mode === 'dark' 
          ? `0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px ${accent}20` 
          : `0 8px 24px rgba(0,0,0,0.05)`,
      },
    }}>
      {/* Accent line superior - Más sutil estilo Windows 11 */}
      <Box sx={{
        position: 'absolute', left: 0, top: 0, right: 0, height: '1.5px',
        background: `linear-gradient(90deg, ${accent}80, transparent 80%)`,
      }} />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            width: 32, height: 32, // Tamaño fijo para consistencia
            borderRadius: '8px',
            bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${colors.surfaceBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Clonamos el icono para asegurar que herede el color y tamaño */}
            {icon}
          </Box>
          
          <Typography sx={{
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: -0.1,
            color: colors.textMuted, // Texto principal más sobrio
            opacity: 0.9
          }}>
            {title}
          </Typography>
        </Stack>
        {action}
      </Box>

      {/* Content Area - Se expande para empujar el footer si fuera necesario */}
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
    </Paper>
  );
};