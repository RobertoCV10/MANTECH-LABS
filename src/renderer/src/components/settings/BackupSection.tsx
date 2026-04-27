//src/renderer/src/components/settings/BackupSection.tsx
import { Button, Typography, Box, Stack, alpha } from '@mui/material';
import { Cloud, Save, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SettingsCard } from './SettingsCard';

interface BackupSectionProps {
  onBackupClick: () => void;
  isLoading: boolean;
}

export const BackupSection = ({ onBackupClick, isLoading }: BackupSectionProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  return (
    <SettingsCard
      title={t('settings.backup_section.title')}
      icon={<Cloud size={16} />}
      accentColor={colors.green}
    >
      <Stack spacing={2} sx={{ height: '100%', justifyContent: 'space-between' }}>
        
        <Typography sx={{ 
          fontSize: '0.78rem', 
          color: colors.textMuted, 
          opacity: 0.8, 
          lineHeight: 1.6 
        }}>
          {t('settings.backup_section.description')}
        </Typography>

        {/* CONTENEDOR DE INFORMACIÓN INTEGRADO */}
        <Box sx={{ 
          borderRadius: '10px', 
          overflow: 'hidden',
          border: `1px solid ${colors.surfaceBorder}`,
          bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)'
        }}>
          {/* Info Item: Original Backup */}
          <Stack direction="row" spacing={2} sx={{ p: 1.5, borderBottom: `1px solid ${colors.surfaceBorder}` }} alignItems="center">
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(colors.green, 0.1), color: colors.green
            }}>
              <Save size={16} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: colors.textMuted }}>
                {t('settings.backup_section.original_backup')}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textMuted, opacity: 0.6 }}>
                {t('settings.backup_section.backup_detail')}
              </Typography>
            </Box>
          </Stack>

          {/* Info Item: Warning (Orange) */}
          <Stack direction="row" spacing={2} sx={{ p: 1.5 }} alignItems="center">
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(colors.orange, 0.1), color: colors.orange
            }}>
              <AlertTriangle size={16} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: colors.orange }}>
                {t('settings.backup_section.important')}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textMuted, opacity: 0.6 }}>
                {t('settings.backup_section.warning')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ACTION BUTTON (Action Bar Style) */}
        <Button
          fullWidth
          variant="outlined"
          onClick={onBackupClick}
          disabled={isLoading}
          endIcon={!isLoading && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
          sx={{
            py: 1.2,
            px: 2,
            borderRadius: '8px',
            textTransform: 'none',
            justifyContent: 'space-between',
            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderColor: colors.surfaceBorder,
            color: colors.textMuted,
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 200ms ease',

            '&:hover': {
              bgcolor: alpha(colors.green, 0.08),
              borderColor: alpha(colors.green, 0.4),
              color: colors.green,
              transform: 'translateY(-1px)',
              '& .lucide': { opacity: 1, color: colors.green }
            },
            '&.Mui-disabled': {
              borderColor: alpha(colors.surfaceBorder, 0.3),
              color: alpha(colors.textMuted, 0.3),
            }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            <Typography variant="inherit">
              {isLoading ? t('settings.backup_section.create_loading') : t('settings.backup_section.create_button')}
            </Typography>
          </Stack>
        </Button>

      </Stack>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </SettingsCard>
  );
};