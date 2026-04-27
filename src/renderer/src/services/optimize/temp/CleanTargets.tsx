// src/renderer/src/services/optimize/temp/CleanTargets.tsx
import { Box, Typography, keyframes, alpha } from '@mui/material'
import { AlertTriangle, Shield, User, Monitor, Layers, Database } from 'lucide-react'
import { useThemeMode } from '../../../theme/ThemeContext'
import { useLanguage } from '../../../context/LanguageContext'

const pulseWarning = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`

type ScanTarget = {
  userTemp: boolean
  winTemp: boolean
  prefetch: boolean
  updateCache: boolean
}

interface CleanTargetsProps {
  targets: ScanTarget
  onToggle: (key: keyof ScanTarget) => void
  requiresAdmin: boolean
  adminWarnings: string[]
}

const targetIcons: Record<keyof ScanTarget, React.ElementType> = {
  userTemp: User,
  winTemp: Monitor,
  prefetch: Layers,
  updateCache: Database,
}

export const CleanTargets = ({ targets, onToggle, requiresAdmin, adminWarnings }: CleanTargetsProps) => {
  const { colors, mode } = useThemeMode()
  const { t } = useLanguage()

  const getShortLabel = (key: keyof ScanTarget) => {
    const shortLabels: Record<keyof ScanTarget, string> = {
      userTemp: 'User',
      winTemp: 'System',
      prefetch: 'Prefetch',
      updateCache: 'Cache',
    }
    return shortLabels[key]
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header: Alineación con textMuted sólido */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, px: 0.5 }}>
        <Typography sx={{ 
          fontSize: '11px', 
          fontWeight: 800, 
          color: colors.textSubtle, // Cambiado a subtle para mejor peso visual
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          {t('temp.clean_targets')}
        </Typography>
      </Box>

      {/* Grid de Targets */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1.5 // Un poco más de espacio para respirar
      }}>
        {(Object.keys(targets) as Array<keyof ScanTarget>).map((key) => {
          const isActive = targets[key]
          const isSystem = key !== 'userTemp'
          const Icon = targetIcons[key]
          
          // Lógica de color dinámica basada en el tipo de target
          const activeColor = isSystem ? colors.purple : colors.cyan
          const activeBg = isSystem ? alpha(colors.purple, 0.08) : colors.cyanDim
          const activeBorder = isSystem ? alpha(colors.purple, 0.3) : colors.cyanBorder

          return (
            <Box
              key={key}
              onClick={() => onToggle(key)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80px', // Un poco más alto para mejor balance
                borderRadius: 2,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                
                // Superficie coherente con el resto de la app
                bgcolor: isActive ? activeBg : colors.surface,
                border: `1px solid ${isActive ? activeBorder : colors.surfaceBorder}`,
                
                '&:hover': {
                  bgcolor: isActive ? alpha(activeColor, 0.12) : colors.sidebarHover,
                  borderColor: isActive ? activeColor : colors.textSubtle,
                  transform: 'translateY(-2px)',
                  boxShadow: isActive ? `0 4px 12px ${alpha(activeColor, 0.15)}` : 'none'
                },

                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              {/* Indicador superior estilo Microsoft Fluent */}
              {isActive && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  width: '40%',
                  height: '3px',
                  bgcolor: activeColor,
                  borderRadius: '0 0 4px 4px',
                  boxShadow: mode === 'dark' ? `0 0 10px ${alpha(activeColor, 0.5)}` : 'none'
                }} />
              )}

              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? activeColor : colors.textSubtle} 
                style={{ marginBottom: '8px', transition: 'all 0.2s' }} 
              />
              
              <Typography sx={{
                fontSize: '10px',
                fontWeight: isActive ? 800 : 600,
                // CORRECCIÓN: Evitamos #fff en Light Mode para que el texto sea legible
                color: isActive 
                  ? (mode === 'light' ? activeColor : '#fff') 
                  : colors.textSubtle,
                textAlign: 'center',
                letterSpacing: '0.02em'
              }}>
                {getShortLabel(key)}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {/* Admin Warning Banner: InfoBar Estilo WinUI */}
      {requiresAdmin && adminWarnings.length > 0 && (
        <Box sx={{
          mt: 2.5,
          p: '12px 16px',
          borderRadius: 2,
          // Usamos el naranja del sistema para el banner de advertencia
          bgcolor: mode === 'light' ? alpha(colors.orange, 0.05) : alpha(colors.orange, 0.1),
          border: `1px solid ${alpha(colors.orange, 0.25)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 28, 
            height: 28, 
            borderRadius: 1,
            bgcolor: alpha(colors.orange, 0.12)
          }}>
            <Shield size={16} color={colors.orange} style={{ animation: `${pulseWarning} 2s infinite` }} />
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              color: colors.orange, 
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              {t('temp.permission_request')}
            </Typography>
            <Typography sx={{ 
              fontSize: '10px', 
              color: colors.orange, 
              opacity: 0.9, 
              fontWeight: 500,
              mt: 0.2
            }}>
              {adminWarnings.join(', ')}
            </Typography>
          </Box>

          <AlertTriangle size={16} color={colors.orange} style={{ opacity: 0.7 }} />
        </Box>
      )}
    </Box>
  )
}