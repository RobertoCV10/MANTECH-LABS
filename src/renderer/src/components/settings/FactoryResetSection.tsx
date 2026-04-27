//src/renderer/src/components/settings/FactoryResetSection.tsx
import { Button, Typography, Box, Stack, alpha } from '@mui/material';
import { RotateCcw, AlertTriangle, Skull, ChevronRight } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SettingsCard } from './SettingsCard';

interface FactoryResetSectionProps {
  onResetClick: () => void;
}

export const FactoryResetSection = ({ onResetClick }: FactoryResetSectionProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  return (
    <SettingsCard
      title={t('settings.factory_section.title')}
      icon={<Skull size={16} />}
      accentColor={colors.red}
    >
      <Stack spacing={2.5} sx={{ height: '100%', justifyContent: 'space-between' }}>
        
        <Typography sx={{ 
          fontSize: '0.78rem', 
          color: colors.textMuted, 
          opacity: 0.8, 
          lineHeight: 1.6 
        }}>
          {t('settings.factory_section.description')}
        </Typography>

        {/* DANGER BOX CON ESTILO INDUSTRIAL REFINADO */}
        <Box sx={{
          p: 2,
          borderRadius: '10px',
          bgcolor: mode === 'dark' ? alpha(colors.red, 0.05) : alpha(colors.red, 0.02),
          border: `1px solid ${alpha(colors.red, 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Franjas de advertencia sutiles (Background) */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: `repeating-linear-gradient(45deg, transparent, transparent 15px, ${alpha(colors.red, 0.03)} 15px, ${alpha(colors.red, 0.03)} 30px)`,
            pointerEvents: 'none',
          }} />
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(colors.red, 0.1), 
              color: colors.red,
              border: `1px solid ${alpha(colors.red, 0.2)}`,
              flexShrink: 0,
            }}>
              <AlertTriangle size={18} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: colors.red, mb: 0.5 }}>
                {t('settings.factory_section.warning')}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: colors.textMuted, opacity: 0.8, lineHeight: 1.4 }}>
                {t('settings.factory_section.warning_detail')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* RESET BUTTON (Action Bar Estilo Danger) */}
        <Button
          fullWidth
          variant="outlined"
          onClick={onResetClick}
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
            transition: 'all 250ms ease',

            '&:hover': {
              bgcolor: alpha(colors.red, 0.08),
              borderColor: alpha(colors.red, 0.5),
              color: colors.red,
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark' ? `0 4px 20px ${alpha(colors.red, 0.15)}` : '0 4px 12px rgba(0,0,0,0.05)',
              '& .lucide': { opacity: 1, color: colors.red }
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <RotateCcw size={16} />
            <Typography variant="inherit">
              {t('settings.factory_section.button')}
            </Typography>
          </Stack>
        </Button>
      </Stack>
    </SettingsCard>
  );
};