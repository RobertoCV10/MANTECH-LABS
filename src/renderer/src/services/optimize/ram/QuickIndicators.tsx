// src/renderer/src/services/optimize/temp/QuickIndicators.tsx
import { Box, Typography, keyframes, Stack, alpha } from '@mui/material'
import { useThemeMode } from '../../../theme/ThemeContext'
import { useLanguage } from '../../../context/LanguageContext'
import { Cpu, Database, Activity } from 'lucide-react'

const statusPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

interface QuickIndicatorsProps {
  activeGB: string
  cacheGB: string
  ramColor: string
}

export const QuickIndicators = ({ activeGB, cacheGB, ramColor }: QuickIndicatorsProps) => {
  const { colors, mode } = useThemeMode()

  const indicatorSection = (label: string, value: string, icon: any, color: string, isLast = false) => {
    // Definimos un fondo sutil para el icono basado en el color que recibe
    const iconBg = mode === 'light' ? alpha(color, 0.08) : alpha(color, 0.15);

    return (
      <>
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{
              display: 'flex',
              p: 0.6, // Un poco más de padding para que el icono respire
              borderRadius: '6px',
              bgcolor: iconBg,
              color: color
            }}>
              {icon}
            </Box>
            <Typography sx={{ 
              fontSize: '10px', 
              fontWeight: 800, // Más peso para legibilidad en pequeño
              color: colors.textSubtle, // Gris medio sólido
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap'
            }}>
              {label}
            </Typography>
          </Stack>

          <Box sx={{ mt: 0.5 }}>
            <Typography sx={{ 
              fontSize: '1.35rem', 
              fontWeight: 700, 
              // CORRECCIÓN CRÍTICA: Quitamos el #fff fijo
              color: mode === 'light' ? colors.textMuted : '#fff',
              fontFamily: '"JetBrains Mono", monospace',
              lineHeight: 1,
              textShadow: mode === 'dark' ? `0 2px 12px ${alpha(color, 0.3)}` : 'none'
            }}>
              {value}
            </Typography>
          </Box>
        </Stack>
        {!isLast && (
          <Box sx={{ 
            width: '1px', // Cambiado de 50px a 1px para que sea una línea elegante
            height: '32px', 
            bgcolor: colors.surfaceBorder, 
            mx: 2.5,
            opacity: 1 // Sólido es mejor en light mode
          }} />
        )}
      </>
    )
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      p: '20px 24px', 
      borderRadius: '16px', // Bordes un poco más suaves
      bgcolor: colors.surface, // Usamos la variable de superficie
      border: `1px solid ${colors.surfaceBorder}`,
      boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
      position: 'relative'
    }}>
      
      {indicatorSection('Active RAM', activeGB, <Activity size={14} strokeWidth={2.5} />, ramColor)}

      {indicatorSection('Standby Cache', cacheGB, <Database size={14} strokeWidth={2.5} />, colors.purple, false)}

      {/* Separador manual para la última sección */}
      <Box sx={{ width: '1px', height: '32px', bgcolor: colors.surfaceBorder, mx: 2.5 }} />

      {/* Indicador 3: System Status */}
      <Stack spacing={0.5} sx={{ flex: 1.2, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{
            display: 'flex',
            p: 0.6,
            borderRadius: '6px',
            bgcolor: alpha(ramColor, 0.08),
            color: ramColor
          }}>
            <Cpu size={14} strokeWidth={2.5} />
          </Box>
          <Typography sx={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            color: colors.textSubtle, 
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Status
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
          <Typography sx={{ 
            fontSize: '12px', 
            fontWeight: 800, 
            color: ramColor,
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box component="span" sx={{ 
              width: 8, height: 8, borderRadius: '50%', bgcolor: ramColor,
              boxShadow: `0 0 8px ${alpha(ramColor, 0.4)}`,
              animation: `${statusPulse} 2s infinite ease-in-out`
            }} />
            READY
          </Typography>

          <Box sx={{ 
            flexGrow: 1, 
            height: 6, 
            bgcolor: mode === 'light' ? colors.sidebarBg : alpha(ramColor, 0.1), 
            borderRadius: '10px',
            overflow: 'hidden',
            display: { xs: 'none', sm: 'block' }
          }}>
            <Box sx={{ 
              height: '100%', 
              width: '65%', 
              bgcolor: ramColor,
              borderRadius: '10px',
            }} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}