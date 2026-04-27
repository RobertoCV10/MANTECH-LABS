import { Typography, Box, Stack, alpha } from '@mui/material';
import { Palette, Sun, Moon, Globe, Check } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SettingsCard } from './SettingsCard';

export const AppearanceSection = () => {
  const { mode, toggleTheme, colors } = useThemeMode();
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ] as const;

  return (
    <SettingsCard
      title={t('settings.appearance.title')}
      icon={<Palette size={16} />}
      accentColor={colors.cyan}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* FILA DE TEMA (Estilo Windows 11 / Settings) */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 0.5 // Alineado con el header de la card
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: mode === 'dark' ? alpha(colors.cyan, 0.1) : alpha(colors.cyan, 0.05),
              border: `1px solid ${alpha(colors.cyan, 0.2)}`,
              color: colors.cyan
            }}>
              {mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {t('settings.appearance.subtitle')}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: colors.textMuted, opacity: 0.6 }}>
                {mode === 'dark' ? t('settings.appearance.dark_mode') : t('settings.appearance.light_mode')}
              </Typography>
            </Box>
          </Stack>

          {/* Switch Estilizado */}
          <Box
            onClick={toggleTheme}
            sx={{
              width: 48, height: 24, borderRadius: 12,
              bgcolor: mode === 'dark' ? colors.cyan : alpha(colors.textMuted, 0.2),
              cursor: 'pointer', position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            <Box sx={{
              width: 18, height: 18, borderRadius: '50%', 
              bgcolor: '#fff',
              position: 'absolute', top: 3,
              left: mode === 'dark' ? 27 : 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }} />
          </Box>
        </Box>

        {/* SEPARADOR SUTIL */}
        <Box sx={{ height: '1px', bgcolor: colors.surfaceBorder, mx: 0.5 }} />

        {/* SECTOR DE IDIOMA (Estilo Segmented Control de Apple) */}
        <Box sx={{ px: 0.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Globe size={14} color={colors.textMuted} />
            <Typography sx={{ 
              fontSize: '0.65rem', 
              color: colors.textMuted, 
              fontWeight: 700,
              letterSpacing: 1.2, 
              textTransform: 'uppercase' 
            }}>
              {t('settings.appearance.language')}
            </Typography>
          </Stack>

          <Box sx={{ 
            display: 'flex', 
            p: 0.5, 
            bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
            borderRadius: '10px',
            border: `1px solid ${colors.surfaceBorder}`,
          }}>
            {languages.map((lang) => {
              const isActive = language === lang.code;
              return (
                <Box
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  sx={{
                    flex: 1,
                    py: 1,
                    borderRadius: '7px',
                    cursor: 'pointer',
                    bgcolor: isActive ? (mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff') : 'transparent',
                    border: `1px solid ${isActive ? colors.surfaceBorder : 'transparent'}`,
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 200ms ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    '&:hover': {
                      bgcolor: isActive ? undefined : alpha(colors.cyan, 0.05),
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '1rem' }}>{lang.flag}</Typography>
                  <Typography sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? colors.textMuted : colors.textMuted,
                  }}>
                    {lang.label}
                  </Typography>
                  {isActive && <Check size={12} color={colors.cyan} />}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </SettingsCard>
  );
};