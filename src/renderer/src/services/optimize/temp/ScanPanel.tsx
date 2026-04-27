// src/renderer/src/services/optimize/temp/ScanPanel.tsx
import { Typography, Box, Stack, Button, keyframes, alpha } from '@mui/material'
import { CheckCircle, RefreshCcw, AlertCircle, Activity } from 'lucide-react'
import { useThemeMode } from '../../../theme/ThemeContext'
import { useLanguage } from '../../../context/LanguageContext'

// --- ANIMACIONES NIVEL SISTEMA OPERATIVO ---

// 1. Giro "Eased" (acelera y desacelera para no ser monótono)
const smoothRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

// 2. Barrido de luz lineal (Focus Shimmer)
const lightSweep = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  50%, 100% { transform: translateX(250%) skewX(-15deg); }
`

// 3. Pulso de borde (Glow sutil)
const activeGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0px 0px transparent; }
  50% { box-shadow: 0 0 20px -5px var(--glow-color); }
`

interface ScanPanelProps {
  scanning: boolean
  cleaning: boolean
  scanStatus: 'idle' | 'loading' | 'success' | 'error'
  totalSizeGB: number | null
  onScan: () => void
}

export const ScanPanel = ({ scanning, cleaning, scanStatus, totalSizeGB, onScan }: ScanPanelProps) => {
  const { colors, mode } = useThemeMode()
  const { t } = useLanguage()

  const getStatusColor = () => {
    if (scanStatus === 'error') return colors.red
    if (scanStatus === 'success') return colors.green
    if (scanning) return colors.cyan
    return colors.textMuted
  }

  const statusColor = getStatusColor()

  return (
    <Box sx={{ 
      p: '20px 36px', 
      borderRadius: '16px',
      // En modo claro usamos blanco puro con una sombra muy sutil
      bgcolor: colors.surface,
      border: `1px solid ${scanning ? alpha(statusColor, 0.4) : colors.surfaceBorder}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      // El brillo es mucho más tenue en modo claro para no ensuciar el blanco
      '--glow-color': alpha(statusColor, mode === 'light' ? 0.15 : 0.25),
      animation: scanning ? `${activeGlow} 3s infinite ease-in-out` : 'none',
      boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
    }}>

      {/* --- EFECTO SHIMMER --- */}
      {scanning && (
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: `linear-gradient(90deg, transparent, ${alpha(statusColor, 0.05)}, transparent)`,
          animation: `${lightSweep} 2.5s infinite linear`,
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}

      <Stack direction="row" spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* Left: Icono con Anillo Segmentado */}
        <Box sx={{ position: 'relative', display: 'flex' }}>
          <Box sx={{
            position: 'absolute',
            inset: -6, // Un poco más de espacio
            borderRadius: '50%',
            border: `2px solid ${alpha(statusColor, 0.1)}`,
            borderTopColor: scanning ? statusColor : 'transparent',
            animation: scanning ? `${smoothRotate} 1s infinite cubic-bezier(0.5, 0, 0.5, 1)` : 'none',
            transition: 'border-color 0.3s ease'
          }} />

          <Box sx={{
            width: 56, height: 56, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: mode === 'light' ? colors.sidebarBg : alpha(statusColor, 0.05),
            border: `1px solid ${alpha(statusColor, 0.15)}`,
          }}>
            {scanning ? (
              <RefreshCcw size={24} color={statusColor} />
            ) : scanStatus === 'success' ? (
              <CheckCircle size={24} color={statusColor} strokeWidth={2.5} />
            ) : (
              <Activity size={24} color={statusColor} />
            )}
          </Box>
        </Box>

        {/* Center: Hero Readout */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ 
            fontSize: '11px', 
            fontWeight: 800, // Más peso para legibilidad
            color: statusColor, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase', 
            mb: 0.5
          }}>
            {scanning ? t('temp.scan_panel.analyzing') : t('temp.scan_panel.scan_title')}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography sx={{ 
              fontSize: '3.5rem', 
              fontWeight: 200, 
              // CORRECCIÓN: El color del número ahora es dinámico
              color: mode === 'light' ? colors.textMuted : '#fff',
              fontFamily: '"Segoe UI Variable Display", sans-serif',
              lineHeight: 1,
              letterSpacing: '-0.05em'
            }}>
              {totalSizeGB !== null ? totalSizeGB.toFixed(2) : '0.00'}
            </Typography>
            <Typography sx={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              color: colors.textSubtle, 
              ml: 1.5,
              opacity: 0.8
            }}>
              GB
            </Typography>
          </Box>
          
          <Typography sx={{ 
            fontSize: '12px', 
            color: colors.textSubtle, 
            mt: 0.5,
            fontWeight: 500
          }}>
             {scanStatus === 'error' ? t('temp.scan_error') : t('temp.scan_panel.recoverable')}
          </Typography>
        </Box>

        {/* Right: Botón Estilo Windows 11 (High Contrast) */}
        <Button
          variant="contained"
          onClick={onScan}
          disabled={scanning || cleaning}
          disableElevation
          sx={{
            px: 4, height: '40px',
            borderRadius: '6px',
            // El botón debe ser el elemento de mayor contraste
            bgcolor: mode === 'light' ? '#000' : '#fff',
            color: mode === 'light' ? '#fff' : '#000',
            fontWeight: 700, 
            fontSize: '13px',
            textTransform: 'none',
            transition: 'all 0.2s ease',
            borderBottom: mode === 'light' ? '3px solid rgba(0,0,0,0.3)' : 'none',
            '&:hover:not(:disabled)': {
              bgcolor: mode === 'light' ? '#222' : '#eee',
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
            },
            '&.Mui-disabled': {
              bgcolor: colors.surfaceBorder,
              color: colors.textSubtle,
            }
          }}
        >
          {scanning ? t('temp.scan_panel.analyzing') : t('temp.scan_panel.scan_button')}
        </Button>
      </Stack>

      {/* Progress Bar (Bottom) */}
      <Box sx={{ 
        position: 'absolute', bottom: 0, left: 0, right: 0, 
        height: '4px', bgcolor: alpha(statusColor, 0.05) 
      }}>
        <Box sx={{ 
          height: '100%', 
          width: scanning ? '100%' : totalSizeGB && totalSizeGB > 0 ? '100%' : '0%',
          bgcolor: statusColor,
          boxShadow: mode === 'dark' ? `0 0 12px ${alpha(statusColor, 0.6)}` : 'none',
          transition: scanning ? 'none' : 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(scanning && {
            animation: `${lightSweep} 1.5s infinite linear`,
            background: `linear-gradient(90deg, ${alpha(statusColor, 0.2)}, ${statusColor}, ${alpha(statusColor, 0.2)})`,
            backgroundSize: '200% 100%'
          })
        }} />
      </Box>
    </Box>
  )
}