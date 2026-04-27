//src/renderer/src/components/settings/MaintenanceSection.tsx
import { Button, Typography, Box, Stack, alpha } from '@mui/material';
import { Wrench, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SettingsCard } from './SettingsCard';

interface MaintenanceSectionProps {
  onConfirmReset: () => void;
}

export const MaintenanceSection = ({ onConfirmReset }: MaintenanceSectionProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  return (
    <SettingsCard
      title={t('settings.maintenance_section.title')}
      icon={<Wrench size={16} />}
      accentColor={colors.orange}
    >
      <Stack spacing={2.5} sx={{ height: '100%', justifyContent: 'space-between' }}>
        
        <Typography sx={{ 
          fontSize: '0.78rem', 
          color: colors.textMuted, 
          opacity: 0.8, 
          lineHeight: 1.6 
        }}>
          {t('settings.maintenance_section.description')}
        </Typography>

        {/* WARNING BOX INTEGRADO */}
        <Box sx={{
          p: 2,
          borderRadius: '10px',
          bgcolor: mode === 'dark' ? alpha(colors.orange, 0.05) : alpha(colors.orange, 0.03),
          border: `1px solid ${alpha(colors.orange, 0.2)}`,
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              width: 36, height: 36, borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(colors.orange, 0.1), color: colors.orange
            }}>
              <AlertTriangle size={18} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.orange, mb: 0.5 }}>
                {t('settings.maintenance_section.warning')}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: colors.textMuted, opacity: 0.8, lineHeight: 1.4 }}>
                {t('settings.maintenance_section.warning_detail')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ACTION BUTTON (Estilo Sobrio) */}
        <Button
          fullWidth
          variant="outlined"
          onClick={onConfirmReset}
          endIcon={<ChevronRight size={14} style={{ opacity: 0.5 }} />}
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
              bgcolor: alpha(colors.orange, 0.08),
              borderColor: alpha(colors.orange, 0.4),
              color: colors.orange,
              transform: 'translateY(-1px)',
              '& .lucide': { opacity: 1, color: colors.orange }
            }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Clock size={16} />
            <Typography variant="inherit">
              {t('settings.maintenance_section.button')}
            </Typography>
          </Stack>
        </Button>

      </Stack>
    </SettingsCard>
  );
};