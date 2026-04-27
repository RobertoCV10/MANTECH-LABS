//src/renderer/src/components/settings/ConfirmationDialog.tsx
import { Dialog, Box, Typography, Button, Stack, alpha } from '@mui/material';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  children?: React.ReactNode;
  confirmLabel: string;
  isLoading?: boolean;
  severityColor?: string;
  confirmButtonColor?: string;
}

export const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel,
  isLoading,
  severityColor,
  confirmButtonColor,
}: ConfirmationDialogProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  
  const resolvedSeverity = severityColor ?? colors.red;
  const resolvedConfirm = confirmButtonColor ?? colors.red;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: mode === 'dark' ? '#0a0a0a' : '#ffffff', // Fondo sólido para evitar transparencias extrañas en diálogos
          backgroundImage: 'none',
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: mode === 'dark' 
            ? `0 24px 48px rgba(0,0,0,0.8)` 
            : `0 12px 32px rgba(0,0,0,0.15)`,
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
          }
        }
      }}
    >
      {/* Línea superior de acento */}
      <Box sx={{
        height: 3,
        background: `linear-gradient(90deg, ${resolvedSeverity}, ${alpha(resolvedSeverity, 0.3)})`,
      }} />

      <Box sx={{ p: children ? 3 : 2.5 }}> {/* Padding dinámico si no hay contenido extra */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{
            width: 42, height: 42, borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(resolvedSeverity, mode === 'dark' ? 0.1 : 0.05),
            border: `1px solid ${alpha(resolvedSeverity, 0.2)}`,
            color: resolvedSeverity,
            flexShrink: 0,
          }}>
            <AlertTriangle size={22} />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography sx={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: mode === 'dark' ? '#fff' : '#000', // Texto principal fuerte
              letterSpacing: -0.4,
              mb: 0.5,
              lineHeight: 1.2
            }}>
              {title}
            </Typography>
            <Typography sx={{
              fontSize: '0.8rem',
              color: colors.textMuted,
              opacity: mode === 'dark' ? 0.8 : 1,
              lineHeight: 1.4,
            }}>
              {description}
            </Typography>
          </Box>

          <Button
            onClick={onClose}
            disabled={isLoading}
            sx={{
              minWidth: 'auto', p: 0.5, mt: -0.5,
              color: colors.textSubtle,
              '&:hover': { color: resolvedSeverity, bgcolor: 'transparent' }
            }}
          >
            <X size={18} />
          </Button>
        </Stack>

        {/* Solo renderiza este bloque si hay children para evitar espacios en blanco */}
        {children && (
          <Box sx={{
            mt: 2.5,
            p: 2,
            borderRadius: '8px',
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : alpha(resolvedSeverity, 0.03),
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : alpha(resolvedSeverity, 0.1)}`,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {children}
          </Box>
        )}

        {/* Acciones del Footer */}
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: children ? 3 : 2.5 }}>
          <Button
            onClick={onClose}
            disabled={isLoading}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '8px',
              color: colors.textMuted,
              fontWeight: 600,
              fontSize: '0.78rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }
            }}
          >
            {t('settings.close')}
          </Button>
          
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="contained"
            sx={{
              px: 3,
              py: 1,
              borderRadius: '8px',
              bgcolor: resolvedConfirm,
              color: '#fff', // Siempre blanco para legibilidad sobre fondo de color
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
              boxShadow: mode === 'dark' ? `0 4px 14px ${alpha(resolvedConfirm, 0.4)}` : 'none',
              '&:hover': {
                bgcolor: resolvedConfirm,
                filter: 'brightness(1.1)',
                boxShadow: mode === 'dark' ? `0 6px 20px ${alpha(resolvedConfirm, 0.5)}` : 'none',
              },
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            ) : confirmLabel}
          </Button>
        </Stack>
      </Box>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Dialog>
  );
};