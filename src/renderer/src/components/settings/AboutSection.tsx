//src/renderer/src/components/settings/AboutSection.tsx
import React from 'react';
import { Button, Typography, Box, Stack, alpha } from '@mui/material';
import { Info, User, Code, Globe, ExternalLink } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SettingsCard } from './SettingsCard';

// Definimos la interfaz que faltaba
interface AboutSectionProps {
  onAboutClick?: () => void; // Marcada como opcional por si acaso, pero disponible
}

const LinkButton = ({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => {
  const { mode, colors } = useThemeMode();
  return (
    <Button
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      fullWidth
      sx={{
        py: 1.2,
        px: 2,
        borderRadius: '8px',
        color: colors.textMuted,
        border: `1px solid ${colors.surfaceBorder}`,
        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        fontWeight: 600,
        fontSize: '0.78rem',
        textTransform: 'none',
        justifyContent: 'space-between',
        transition: 'all 200ms ease',
        '&:hover': {
          bgcolor: alpha(colors.cyan, 0.08),
          borderColor: alpha(colors.cyan, 0.4),
          color: colors.cyan,
          transform: 'translateY(-1px)',
          '& .lucide-external-link': { opacity: 1, transform: 'translateX(2px)' }
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ display: 'flex', opacity: 0.7 }}>{icon}</Box>
        <Typography variant="inherit">{label}</Typography>
      </Stack>
      <ExternalLink 
        size={14} 
        className="lucide-external-link" 
        style={{ opacity: 0.3, transition: 'all 0.2s ease' }} 
      />
    </Button>
  );
};

export const AboutSection = ({ onAboutClick }: AboutSectionProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  return (
    <SettingsCard
      title={t('settings.about.title')}
      icon={<Info size={16} />}
      accentColor={colors.cyan}
    >
      <Stack spacing={3}>
        <Typography sx={{ 
          fontSize: '0.78rem', 
          color: colors.textMuted, 
          lineHeight: 1.6,
          opacity: 0.9
        }}>
          {t('settings.about.subtitle')}
        </Typography>

        {/* DEVELOPER CARD - Ahora con onClick opcional */}
        <Box 
          onClick={onAboutClick}
          sx={{
            p: 2.5,
            borderRadius: '12px',
            bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.surfaceBorder}`,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2.5,
            cursor: onAboutClick ? 'pointer' : 'default',
            transition: 'all 200ms ease',
            '&:hover': onAboutClick ? {
              borderColor: alpha(colors.cyan, 0.3),
              bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
            } : {},
          }}
        >
          <Box sx={{
            position: 'absolute', right: -10, top: -10,
            color: colors.cyan, opacity: 0.03, transform: 'rotate(-15deg)'
          }}>
            <User size={120} strokeWidth={1} />
          </Box>

          <Box sx={{
            width: 52, height: 52, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(colors.cyan, 0.1),
            border: `1px solid ${alpha(colors.cyan, 0.2)}`,
            color: colors.cyan,
            flexShrink: 0,
          }}>
            <User size={24} />
          </Box>

          <Box sx={{ zIndex: 1 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: colors.textMuted, mb: 0.2 }}>
              Roberto Coria
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: 600, opacity: 0.6, textTransform: 'uppercase' }}>
              Dev engineer • Mantech Labs
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, mb: 2, opacity: 0.5 }}>
            Recursos y Contacto
          </Typography>
          
          <Stack spacing={1}>
            <LinkButton icon={<Code size={14} />} label="LinkedIn Professional Profile" href="https://www.linkedin.com/in/roberto-coria-vargas-088231309" />
            <LinkButton icon={<Globe size={14} />} label="Digital Portfolio & Projects" href="https://portfolio-rcv.vercel.app/" />
            <LinkButton icon={<Code size={14} />} label="Source Code & Documentation" href="https://github.com/RobertoCV10" />
          </Stack>
        </Box>
      </Stack>
    </SettingsCard>
  );
};