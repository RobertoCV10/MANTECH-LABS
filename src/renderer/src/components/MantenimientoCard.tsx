// src/renderer/src/components/MantenimientoCard.tsx
import { Paper, Typography, Box, Stack, alpha } from '@mui/material';
import { Calendar, CheckCircle, AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface MantenimientoCardProps {
  id: string;
  nombre: string;
  descripcion: string;
  frecuencia: string;
  nivel: 'facil' | 'medio' | 'dificil';
  diasRestantes: number;
  completado: boolean;
  onClick: () => void;
}

const getNivelColor = (nivel: string, colors: any) => {
  switch (nivel) {
    case 'facil':   return colors.green;
    case 'medio':   return colors.orange;
    case 'dificil': return colors.red;
    default:        return colors.textMuted;
  }
};

export const MantenimientoCard = ({
  nombre,
  descripcion,
  frecuencia,
  nivel,
  diasRestantes,
  completado,
  onClick
}: MantenimientoCardProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  const getProgressColor = (dias: number) => {
    if (dias <= 0) return colors.red;
    if (dias <= 7) return colors.orange;
    return colors.green;
  };

  const getProgressValue = (dias: number, frecuencia: string) => {
    const meses = parseInt(frecuencia) || 2;
    const totalDias = meses * 30;
    const diasTranscurridos = totalDias - dias;
    return Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));
  };

  const progressColor = getProgressColor(diasRestantes);
  const nivelColor = getNivelColor(nivel, colors);
  const progressPercent = getProgressValue(diasRestantes, frecuencia);

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '12px',
        bgcolor: mode === 'dark' ? '#0A0A0A' : '#FFFFFF',
        border: `1px solid ${completado ? alpha(colors.green, 0.3) : colors.surfaceBorder}`,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        height: 'fit-content',
        alignSelf: 'start',
        
        '&:hover': {
          borderColor: alpha(colors.cyan, 0.4),
          bgcolor: mode === 'dark' ? '#0F0F0F' : alpha(colors.cyan, 0.02),
          transform: 'translateY(-3px)',
          boxShadow: mode === 'dark' ? '0 12px 30px rgba(0,0,0,0.6)' : '0 10px 20px rgba(0,0,0,0.08)',
          '& .chevron-icon': { transform: 'translateX(4px)', color: colors.cyan }
        },
      }}
    >
      {/* Indicador de estado superior (Glow Line) */}
      <Box sx={{
        position: 'absolute', left: 0, top: 0, right: 0,
        height: '3px',
        bgcolor: completado ? colors.green : progressColor,
        boxShadow: mode === 'dark' ? `0 0 15px ${alpha(completado ? colors.green : progressColor, 0.4)}` : 'none',
      }} />

      <Stack spacing={2}>
        {/* HEADER: Nombre y Icono de Estado */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography sx={{ 
              fontSize: '1rem', 
              fontWeight: 900, 
              mb: 0.5,
              color: mode === 'dark' ? '#EEE' : '#111',
              letterSpacing: -0.2,
            }}>
              {t(nombre)}
            </Typography>
            
            <Typography sx={{ 
              fontSize: '0.75rem', 
              color: colors.textMuted,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {t(descripcion)}
            </Typography>
          </Box>

          <Box className="chevron-icon" sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            bgcolor: completado ? alpha(colors.green, 0.1) : alpha(colors.textMuted, 0.05),
            border: `1px solid ${completado ? alpha(colors.green, 0.2) : 'transparent'}`,
            transition: 'all 0.3s ease',
            flexShrink: 0
          }}>
            {completado ? (
              <CheckCircle size={18} color={colors.green} />
            ) : (
              <ChevronRight size={18} color={colors.textMuted} />
            )}
          </Box>
        </Stack>

        {/* TAGS: Nivel y Frecuencia */}
        <Stack direction="row" spacing={1}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.8,
            px: 1.2, py: 0.4, borderRadius: '6px',
            bgcolor: alpha(nivelColor, 0.08),
            border: `1px solid ${alpha(nivelColor, 0.2)}`,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: nivelColor }} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: nivelColor, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {t(`maintenance.nivel.${nivel}`)}
            </Typography>
          </Box>
          
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.8,
            px: 1.2, py: 0.4, borderRadius: '6px',
            bgcolor: alpha(colors.cyan, 0.06),
            border: `1px solid ${alpha(colors.cyan, 0.15)}`,
          }}>
            <Clock size={12} color={colors.cyan} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: colors.cyan, letterSpacing: 0.5 }}>
              {t(frecuencia)}
            </Typography>
          </Box>
        </Stack>

        {/* PROGRESS AREA */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Calendar size={12} color={progressColor} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textMuted }}>
                {diasRestantes <= 0 
                  ? `${Math.abs(diasRestantes)} ${t('maintenance.status.days_overdue')}` 
                  : `${diasRestantes} ${t('maintenance.status.days_remaining')}`}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: progressColor }}>
              {progressPercent.toFixed(0)}%
            </Typography>
          </Stack>
          
          <Box sx={{ 
            height: 4, 
            bgcolor: alpha(progressColor, 0.1), 
            borderRadius: 10,
            overflow: 'hidden'
          }}>
            <Box sx={{
              height: '100%',
              width: `${progressPercent}%`,
              bgcolor: progressColor,
              boxShadow: mode === 'dark' ? `0 0 10px ${alpha(progressColor, 0.5)}` : 'none',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </Box>
        </Box>

        {/* ALERT BANNERS (Opcionales según estado) */}
        {(diasRestantes <= 7 || diasRestantes <= 0) && (
          <Box sx={{ 
            display: 'flex', alignItems: 'center', gap: 1, p: 1.2,
            bgcolor: alpha(diasRestantes <= 0 ? colors.red : colors.orange, 0.08),
            borderRadius: '8px',
            border: `1px solid ${alpha(diasRestantes <= 0 ? colors.red : colors.orange, 0.2)}`,
          }}>
            <AlertTriangle size={14} color={diasRestantes <= 0 ? colors.red : colors.orange} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: diasRestantes <= 0 ? colors.red : colors.orange, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {diasRestantes <= 0 ? t('maintenance.status.overdue') : t('maintenance.status.expiring')}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};