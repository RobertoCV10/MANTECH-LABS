import { Box, Typography, Switch, Slider, Button, keyframes, Stack, alpha } from '@mui/material'
import { useThemeMode } from '../../../theme/ThemeContext'
import { useLanguage } from '../../../context/LanguageContext'
import { Shield, ShieldCheck, Zap, Lock } from 'lucide-react'

const scan = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: translateY(100%); opacity: 0; }
`

interface SentinelControlProps {
  autoOptimize: boolean
  onAutoOptimizeChange: (val: boolean) => void
  threshold: number
  onThresholdChange: (val: number) => void
  isValidated: boolean
  isSaving: boolean
  onConfirm: () => void
}

export const SentinelControl = ({
  autoOptimize,
  onAutoOptimizeChange,
  threshold,
  onThresholdChange,
  isValidated,
  isSaving,
  onConfirm
}: SentinelControlProps) => {
  const { colors, mode } = useThemeMode()
  const { t } = useLanguage()

  // Mejoramos la lógica de color de acento: si está apagado, usamos textSubtle
  // para que tenga un poco más de presencia que el muted.
  const accentColor = autoOptimize ? colors.green : colors.textSubtle

  return (
    <Box sx={{
      p: 1.5, // Un poco más de aire
      borderRadius: 2,
      // En modo claro usamos un gris muy sutil (sidebarBg) para diferenciar el panel
      bgcolor: mode === 'light' ? colors.sidebarBg : 'rgba(255,255,255,0.02)',
      border: `1px solid ${autoOptimize ? colors.greenBorder : colors.surfaceBorder}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: autoOptimize && mode === 'light' ? `0 4px 20px ${alpha(colors.green, 0.08)}` : 'none'
    }}>
      
      {/* Scan Animation - Refinada para no ser invasiva en light mode */}
      {autoOptimize && (
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(to bottom, transparent, ${alpha(colors.green, mode === 'light' ? 0.04 : 0.08)}, transparent)`,
          animation: `${scan} 4s infinite linear`,
          pointerEvents: 'none'
        }} />
      )}

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Stack spacing={0.5}>
          <Typography sx={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: accentColor, 
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {autoOptimize ? <ShieldCheck size={14} /> : <Shield size={14} />}
            {autoOptimize ? 'MANAGEMENT ACTIVE' : 'MANAGEMENT STANDBY'}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: colors.textSubtle, fontWeight: 600, opacity: 0.8 }}>
            v0.8.0 Management Protocol
          </Typography>
        </Stack>

        <Switch
          size="small"
          checked={autoOptimize}
          onChange={(e) => onAutoOptimizeChange(e.target.checked)}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: colors.green },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { 
              bgcolor: colors.green,
              opacity: 0.5
            },
          }}
        />
      </Stack>

      {/* Configuration Section */}
      <Box sx={{ 
        opacity: autoOptimize ? 1 : 0.4, 
        transition: 'all 0.3s ease', 
        filter: autoOptimize ? 'none' : 'grayscale(1)',
        pointerEvents: autoOptimize ? 'auto' : 'none' 
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase' }}>
            Purge Threshold
          </Typography>
          <Typography sx={{ 
            fontSize: '1rem', 
            fontWeight: 800, 
            color: colors.green, // Mantenemos el color para que sepa qué está configurando
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            {threshold}%
          </Typography>
        </Stack>

        <Slider
          value={threshold}
          onChange={(_, v) => onThresholdChange(v as number)}
          disabled={!autoOptimize}
          min={40}
          max={95}
          sx={{
            color: colors.green,
            height: 4,
            mb: 2.5,
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              bgcolor: mode === 'light' ? colors.green : '#fff',
              border: mode === 'light' ? '2px solid #fff' : 'none',
              boxShadow: `0 2px 6px ${alpha(colors.green, 0.4)}`,
              '&:hover': { boxShadow: `0 0 0 8px ${alpha(colors.green, 0.1)}` }
            },
            '& .MuiSlider-rail': { bgcolor: colors.surfaceBorder, opacity: 1 },
            '& .MuiSlider-track': { border: 'none' }
          }}
        />
      </Box>

      {/* Action Button - El cambio más importante */}
      <Button
        fullWidth
        disabled={isSaving || !autoOptimize}
        onClick={onConfirm}
        variant="contained"
        disableElevation
        startIcon={isValidated ? <ShieldCheck size={16} /> : <Zap size={16} />}
        sx={{
          py: 1.25,
          borderRadius: 1.5,
          fontSize: '0.7rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          // Jerarquía visual clara: si está validado es el "Success" dim, si no, es el color de acento
          bgcolor: isValidated ? colors.greenDim : alpha(colors.cyan, 0.08),
          color: isValidated ? colors.green : colors.cyan,
          border: `1px solid ${isValidated ? colors.greenBorder : colors.cyanBorder}`,
          transition: 'all 0.2s ease',
          '&:hover:not(:disabled)': {
            bgcolor: isValidated ? colors.green : colors.cyan,
            color: '#fff',
            borderColor: 'transparent',
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(isValidated ? colors.green : colors.cyan, 0.3)}`
          },
          '&:disabled': {
            bgcolor: colors.surfaceBorder,
            color: colors.textSubtle,
            opacity: 0.5
          }
        }}
      >
        {isSaving ? t('ram.saving') : isValidated ? 'CONFIGURATION SAVED' : 'COMMIT CHANGES'}
      </Button>
    </Box>
  )
}