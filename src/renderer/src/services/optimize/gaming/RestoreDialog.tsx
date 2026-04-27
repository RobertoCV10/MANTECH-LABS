// src/renderer/src/services/optimize/gaming/RestoreDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Stack, alpha, Typography } from '@mui/material'
import { RotateCcw, ShieldAlert, X } from 'lucide-react'
import { useThemeMode } from '../../../theme/ThemeContext'
import { useLanguage } from '../../../context/LanguageContext'

interface RestoreDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export const RestoreDialog = ({ open, onClose, onConfirm }: RestoreDialogProps) => {
  const { colors, mode } = useThemeMode()
  const { t } = useLanguage()
  const ACCENT = colors.green

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: mode === 'dark' ? '#1c1c1c' : '#ffffff',
          backgroundImage: 'none',
          borderRadius: '12px',
          border: `1px solid ${colors.surfaceBorder}`,
          minWidth: 400, // Un poco más ancho para mejor legibilidad del texto
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
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontSize: '1rem', 
        fontWeight: 600, 
        color: mode === 'dark' ? '#fff' : '#000',
        pb: 1,
        pt: 3,
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ShieldAlert size={20} color={ACCENT} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('gaming.restore.title')}
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

      <DialogContent sx={{ mt: 1 }}>
        <Box sx={{
          p: 2.5,
          borderRadius: '8px',
          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${colors.surfaceBorder}`,
          // Sutil acento lateral para indicar importancia
          borderLeft: `4px solid ${ACCENT}`,
        }}>
          <DialogContentText sx={{ 
            color: colors.textMuted,
            fontSize: '0.85rem', 
            lineHeight: 1.5,
            fontWeight: 400
          }}>
            {t('gaming.restore.description')}
          </DialogContentText>
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
          {t('gaming.restore.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disableElevation
          startIcon={<RotateCcw size={16} />}
          sx={{ 
            bgcolor: ACCENT, 
            color: mode === 'dark' ? '#000' : '#fff', 
            fontWeight: 600, 
            textTransform: 'none',
            fontSize: '0.85rem',
            px: 3,
            py: 0.8,
            borderRadius: '6px',
            transition: 'all 0.2s',
            '&:hover': { 
              bgcolor: ACCENT, 
              filter: 'brightness(1.1)',
            }
          }}
        >
          {t('gaming.restore.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}