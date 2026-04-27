//src/renderer/src/components/settings/OtherSections.tsx
import { Paper, Typography, Box, Stack, Button } from '@mui/material';
import { ShieldCheck, Palette, Info, Sun, Moon } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext'
import { useNotification } from '../../context/NotificationContext'

export const SystemPermissionsSection = () => {
  const { colors } = useThemeMode();
  const { t } = useLanguage();
  const { success } = useNotification();

  return (
    <Paper sx={{ 
      p: 3, mb: 3,
      bgcolor: colors.cyanDim,
      border: `1px solid ${colors.cyanBorder}`,
    }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <ShieldCheck size={24} color={colors.cyan} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('settings.permissions.title')}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
        {t('settings.permissions.description')}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<ShieldCheck size={18} />}
        onClick={async () => {
          try {
            const response = await window.api.invoke('restart-as-admin');
            if (response.success) success(t('settings.success'));
          } catch (err) {
            console.error('Error invoking restart-as-admin:', err);
          }
        }}
        sx={{
          color: colors.cyan,
          border: `1px solid ${colors.cyanBorder}`,
          '&:hover': {
            bgcolor: colors.cyanDim,
            border: `1px solid ${colors.cyan}`
          }
        }}
      >
        {t('settings.permissions.button')}
      </Button>
    </Paper>
  );
};

export const AppearanceSection = () => {
  const { mode, toggleTheme, colors } = useThemeMode()
  const { language, changeLanguage, t } = useLanguage()

  return (
    <Paper sx={{
      p: 3, mb: 3,
      bbgcolor: colors.surface,
      border: '1px solid',
      borderColor: colors.surfaceBorder,
    }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Palette size={24} color="#757575" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('settings.appearance.title')}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
        {t('settings.appearance.subtitle')}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={2}>
        <Moon size={18} />
        <Box
          onClick={toggleTheme}
          sx={{
            width: 52, height: 28, borderRadius: 14,
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'primary.main',
            cursor: 'pointer', position: 'relative',
            transition: 'background-color 0.3s ease',
            '&:hover': { opacity: 0.85 }
          }}
        >
          <Box sx={{
            width: 22, height: 22, borderRadius: '50%', bgcolor: 'white',
            position: 'absolute', top: 3,
            left: mode === 'dark' ? 3 : 27,
            transition: 'left 0.3s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
          }} />
        </Box>
        <Sun size={18} />
        <Typography variant="body2" sx={{ opacity: 0.7, ml: 1 }}>
          {mode === 'dark' ? t('settings.appearance.dark_mode') : t('settings.appearance.light_mode')}
        </Typography>
      </Stack>

      {/* Selector de idioma */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ opacity: 0.7, minWidth: 60 }}>
          {t('settings.appearance.language')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Box
            onClick={() => changeLanguage('es')}
            sx={{
              px: 2, py: 0.5, borderRadius: 2, cursor: 'pointer',
              border: '1px solid',
              borderColor: language === 'es' ? colors.cyan : colors.surfaceBorder,
              bgcolor:     language === 'es' ? colors.cyanDim : 'transparent',
              color:       language === 'es' ? colors.cyan : 'text.secondary',
              fontSize: '0.8rem', fontWeight: language === 'es' ? 700 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            ES
          </Box>
          <Box
            onClick={() => changeLanguage('en')}
            sx={{
              px: 2, py: 0.5, borderRadius: 2, cursor: 'pointer',
              border: '1px solid',
              borderColor: language === 'en' ? colors.cyan : colors.surfaceBorder,
              bgcolor:     language === 'en' ? colors.cyanDim : 'transparent',
              color:       language === 'en' ? colors.cyan : 'text.secondary',
              fontSize: '0.8rem', fontWeight: language === 'en' ? 700 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            EN
          </Box>
        </Stack>
      </Stack>

    </Paper>
  );
};

export const AboutSection = ({ onAboutClick }: { onAboutClick: () => void }) => {
  const { colors } = useThemeMode();
  const { t } = useLanguage();

  return (
    <Paper sx={{ p: 3, bgcolor: colors.surface, border: `1px solid ${colors.surfaceBorder}` }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Info size={24} color="#757575" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('settings.about.title')}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ opacity: 0.6 }}>
        {t('settings.about.subtitle')}
      </Typography>
      <Button 
        variant="outlined" 
        onClick={onAboutClick}
        sx={{ 
          mt: 2,
          border: `1px solid ${colors.surfaceBorder}`,
          '&:hover': { bgcolor: colors.surface }
        }}
      >
        {t('settings.about.see_details')}
      </Button>
    </Paper>
  );
};
