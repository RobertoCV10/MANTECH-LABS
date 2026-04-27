// src/renderer/src/services/optimize/gaming/EditPresetDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Stack, alpha, Switch } from '@mui/material'
import { Edit2, Save, Terminal, X } from 'lucide-react'
import { useThemeMode } from '../../../theme/ThemeContext'
import { useLanguage } from '../../../context/LanguageContext'

// Ensure GamingConfig is accessible
type GamingConfig = {
  ultraPower: boolean
  disableWinTelemetry: boolean
  silenceNotifications: boolean
  gameMode: boolean
}

interface EditPresetDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  presetName: string
  onNameChange: (name: string) => void
  config: GamingConfig
  onConfigChange: (key: keyof GamingConfig, value: boolean) => void
}

export const EditPresetDialog = ({
  open,
  onClose,
  onConfirm,
  presetName,
  onNameChange,
  config,
  onConfigChange
}: EditPresetDialogProps) => {
  const { colors, mode } = useThemeMode()
  const { t } = useLanguage()
  const ACCENT = colors.green

  const FEATURE_LABELS: Record<keyof GamingConfig, string> = {
    ultraPower: t('gaming.ultraPower.label'),
    disableWinTelemetry: t('gaming.disableWinTelemetry.label'),
    silenceNotifications: t('gaming.silenceNotifications.label'),
    gameMode: t('gaming.gameMode.label'),
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { 
          bgcolor: mode === 'dark' ? '#1c1c1c' : '#ffffff',
          backgroundImage: 'none', 
          borderRadius: '12px',
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
          <Edit2 size={20} color={ACCENT} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('gaming.edit_preset.title')}
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
        {/* Profile Naming Section */}
        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: colors.textMuted, fontWeight: 500 }}>
            {t('gaming.edit_preset.name_label')}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            variant="standard"
            value={presetName}
            onChange={(e) => onNameChange(e.target.value)}
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
        </Box>

        {/* Configuration Toggles - Fluent List Style */}
        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: colors.textSubtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('gaming.edit_preset.config_label')}
          </Typography>

          <Stack spacing={1}>
            {(Object.keys(FEATURE_LABELS) as (keyof GamingConfig)[]).map((key) => {
              const isChecked = config[key]
              
              return (
                <Box 
                  key={key} 
                  onClick={() => onConfigChange(key, !isChecked)}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.2,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    bgcolor: isChecked ? alpha(ACCENT, 0.04) : 'transparent',
                    border: `1px solid ${isChecked ? alpha(ACCENT, 0.2) : colors.surfaceBorder}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isChecked ? alpha(ACCENT, 0.08) : mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isChecked ? ACCENT : alpha(colors.textMuted, 0.3),
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    fontWeight: isChecked ? 600 : 400, 
                    fontSize: '0.8rem',
                    color: isChecked ? (mode === 'dark' ? '#fff' : '#000') : colors.textMuted,
                  }}>
                    {FEATURE_LABELS[key]}
                  </Typography>
                  
                  {/* Standard Fluent-ish Toggle Switch */}
                  <Box sx={{
                    width: 36, height: 18, borderRadius: '10px',
                    bgcolor: isChecked ? ACCENT : alpha(colors.textMuted, 0.2),
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box sx={{
                      width: 12, height: 12, borderRadius: '50%',
                      bgcolor: isChecked ? (mode === 'dark' ? '#000' : '#fff') : colors.textSubtle,
                      position: 'absolute',
                      left: isChecked ? '20px' : '4px',
                      transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }} />
                  </Box>
                </Box>
              )
            })}
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
          {t('gaming.edit_preset.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!presetName.trim()}
          variant="contained"
          disableElevation
          startIcon={<Save size={16} />}
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
          {t('gaming.edit_preset.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}