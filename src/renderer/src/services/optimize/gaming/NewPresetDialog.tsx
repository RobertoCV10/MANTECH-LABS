// src/renderer/src/services/optimize/gaming/NewPresetDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Stack, alpha } from '@mui/material'
import { Gamepad2, Plus, Terminal, AlertCircle, ShieldCheck, X } from 'lucide-react'
import { useThemeMode } from '../../../theme/ThemeContext'
import { useLanguage } from '../../../context/LanguageContext'

type GamingConfig = {
  ultraPower: boolean
  disableWinTelemetry: boolean
  silenceNotifications: boolean
  gameMode: boolean
}

interface NewPresetDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  presetName: string
  onNameChange: (name: string) => void
  config: GamingConfig
  presetsCount: number
}

export const NewPresetDialog = ({
  open,
  onClose,
  onConfirm,
  presetName,
  onNameChange,
  config,
  presetsCount
}: NewPresetDialogProps) => {
  const { colors, mode } = useThemeMode()
  const { t } = useLanguage()
  
  const ACCENT = colors.green
  const ERROR = '#ff4444'

  const FEATURE_LABELS: Record<keyof GamingConfig, string> = {
    ultraPower: t('gaming.ultraPower.label'),
    disableWinTelemetry: t('gaming.disableWinTelemetry.label'),
    silenceNotifications: t('gaming.silenceNotifications.label'),
    gameMode: t('gaming.gameMode.label'),
  }

  const isLimitReached = presetsCount >= 3

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { 
          bgcolor: mode === 'dark' ? '#1c1c1c' : '#ffffff', // Fluent surface
          backgroundImage: 'none', 
          borderRadius: '12px', // Windows 11 Standard
          border: `1px solid ${colors.surfaceBorder}`,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        color: mode === 'dark' ? '#fff' : '#000',
        fontSize: '1rem',
        pt: 3,
        pb: 2,
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Gamepad2 size={20} color={ACCENT} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('gaming.new_preset.title')}
          </Typography>
        </Stack>
        <Box 
          onClick={onClose}
          sx={{ 
            cursor: 'pointer', 
            opacity: 0.5, 
            '&:hover': { opacity: 1 },
            transition: 'opacity 0.2s' 
          }}
        >
          <X size={18} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Input Section - Refined for Desktop Apps */}
        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: colors.textMuted, fontWeight: 500 }}>
            {t('gaming.new_preset.name_label')}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            variant="standard"
            value={presetName}
            onChange={(e) => onNameChange(e.target.value)}
            error={isLimitReached}
            placeholder="e.g. Competitive_V2"
            InputProps={{
              disableUnderline: true,
              startAdornment: <Terminal size={14} style={{ marginRight: 10, opacity: 0.5 }} />,
              sx: {
                height: 42,
                fontSize: '0.85rem',
                color: mode === 'dark' ? '#fff' : '#000',
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                px: 1.5,
                borderRadius: '6px',
                border: `1px solid ${colors.surfaceBorder}`,
                transition: 'all 0.15s ease-in-out',
                '&.Mui-focused': { 
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.01)',
                  borderBottom: `2px solid ${ACCENT}`,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
                }
              }
            }}
          />
          {isLimitReached && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, p: 1, borderRadius: '4px', bgcolor: alpha(ERROR, 0.1) }}>
              <AlertCircle size={14} color={ERROR} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: ERROR }}>
                {t('gaming.new_preset.max_presets_error')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Configuration Summary - Clean List Style */}
        <Box sx={{ 
          p: 2, 
          borderRadius: '8px', 
          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${colors.surfaceBorder}`,
        }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: colors.textSubtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('gaming.new_preset.current_config')}
          </Typography>
          
          <Stack spacing={1.5}>
            {(Object.entries(config) as [keyof GamingConfig, boolean][]).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ShieldCheck 
                  size={14} 
                  color={value ? ACCENT : colors.textSubtle} 
                  style={{ opacity: value ? 1 : 0.3 }}
                />
                <Typography variant="body2" sx={{ 
                  flex: 1,
                  fontSize: '0.8rem',
                  color: value ? colors.textMuted : colors.textSubtle,
                  fontWeight: value ? 500 : 400
                }}>
                  {FEATURE_LABELS[key]}
                </Typography>
                <Typography sx={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 700,
                  color: value ? ACCENT : colors.textSubtle,
                  opacity: value ? 1 : 0.5
                }}>
                  {value ? 'ON' : 'OFF'}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="text"
          sx={{ 
            color: colors.textMuted, 
            fontWeight: 500, 
            textTransform: 'none',
            fontSize: '0.85rem',
            px: 2,
            '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
          }}
        >
          {t('gaming.new_preset.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!presetName.trim() || isLimitReached}
          variant="contained"
          disableElevation
          startIcon={<Plus size={16} />}
          sx={{ 
            bgcolor: ACCENT, 
            color: mode === 'dark' ? '#000' : '#fff', 
            fontWeight: 600,
            px: 3,
            py: 0.8,
            textTransform: 'none',
            fontSize: '0.85rem',
            borderRadius: '6px',
            transition: 'all 0.2s',
            '&:hover': { 
              bgcolor: ACCENT, 
              filter: 'brightness(1.1)',
            },
            '&.Mui-disabled': { 
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)',
              color: colors.textSubtle,
            }
          }}
        >
          {t('gaming.new_preset.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}