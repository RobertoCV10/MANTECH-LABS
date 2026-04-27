//src/renderer/src/components/settings/SystemPermissionsSection.tsx
import { Button, Typography, Box, Stack, alpha } from '@mui/material';
import { ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { SettingsCard } from './SettingsCard';

export const SystemPermissionsSection = () => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const { success } = useNotification();

  const handleAdminRestart = async () => {
    try {
      const response = await window.api.invoke('restart-as-admin');
      if (response.success) success(t('settings.success'));
    } catch (err) {
      console.error('Error invoking restart-as-admin:', err);
    }
  };

  return (
    <SettingsCard
      title={t('settings.permissions.title')}
      icon={<ShieldCheck size={16} />} // Un toque más pequeño para sobriedad
      accentColor={colors.cyan}
    >
      <Stack spacing={3} sx={{ height: '100%', justifyContent: 'space-between' }}>
        
        {/* Descripción con tipografía refinada */}
        <Typography sx={{ 
          fontSize: '0.78rem', 
          color: colors.textMuted, 
          opacity: 0.6, 
          lineHeight: 1.6,
          fontWeight: 400 
        }}>
          {t('settings.permissions.description')}
        </Typography>

        {/* Botón estilo "Action Bar" de Windows Powertoys */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleAdminRestart}
          endIcon={<ChevronRight size={14} style={{ opacity: 0.5 }} />}
          sx={{
            py: 1.2,
            px: 2,
            borderRadius: '8px',
            textTransform: 'none',
            justifyContent: 'space-between', // Separa el texto del icono de flecha
            
            // Estética de vidrio/acrílico
            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderColor: colors.surfaceBorder,
            color: colors.textMuted,
            
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 200ms ease',

            '&:hover': {
              bgcolor: mode === 'dark' ? alpha(colors.cyan, 0.08) : alpha(colors.cyan, 0.04),
              borderColor: alpha(colors.cyan, 0.4),
              color: colors.cyan,
              transform: 'translateY(-1px)',
              '& .lucide': { opacity: 1, color: colors.cyan }
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShieldAlert size={16} />
            <Typography variant="inherit">
              {t('settings.permissions.button')}
            </Typography>
          </Stack>
        </Button>

      </Stack>
    </SettingsCard>
  );
};