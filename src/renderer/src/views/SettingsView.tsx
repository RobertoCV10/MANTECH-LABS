import { Typography, Box, Snackbar, Alert, Dialog, Stack, Button, Grid } from '@mui/material';
import { Settings, User } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettingsLogic } from './../hooks/useSettingsLogic';
import { ConfirmationDialog } from './../components/settings';
import { 
  SystemPermissionsSection, 
  AppearanceSection, 
  AboutSection,
  MaintenanceSection,
  BackupSection,
  StatsSection,
  FactoryResetSection 
} from './../components/settings';

interface SettingsViewProps {
  onResetAll?: () => Promise<void>;
}

export const SettingsView = ({ onResetAll }: SettingsViewProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const { state, setters, handlers } = useSettingsLogic({ onResetAll });

  // Estilo para las filas que contienen dos tarjetas
  const rowStyle = {
    display: 'flex',
    gap: 2,
    width: '100%',
    alignItems: 'stretch' // <--- ESTO ES CLAVE
  };

  // Estilo para que cada tarjeta ocupe exactamente la mitad (el cuadriculado que buscas)
  const itemStyle = {
    flex: 1,
    minWidth: 0 // Evita que el contenido desborde el flex
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '670px', overflow: 'hidden', p: 2 }}>

      {/* HEADER SUTIL */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Settings size={13} color={colors.cyan} style={{ opacity: 0.5 }} />
        <Typography sx={{
          fontSize: '0.62rem', letterSpacing: 2.5,
          color: colors.textMuted, opacity: 0.5,
          textTransform: 'uppercase', fontWeight: 700
        }}>
          {t('settings.title')}
        </Typography>
      </Box>

      {/* CONTENIDO SCROLLABLE */}
        <Box sx={{ 
          flex: 1,           // Toma todo el espacio sobrante después del header
          minHeight: 0,      // ¡IMPORTANTE! En Flexbox, esto permite que el hijo sea más pequeño que su contenido y active el scroll
          overflowY: 'auto', // Activa el scroll vertical
          pr: 1, 
          pb: 6,
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,

          // --- ESTILO DE SCROLLBAR (Estilo Windows 11 / Fluent) ---
          '&::-webkit-scrollbar': {
            width: '6px', // Scroll muy fino
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent', // Track invisible para mayor limpieza
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            border: '2px solid transparent', // Crea un efecto de padding
            backgroundClip: 'content-box',
            transition: 'background 0.2s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: colors.cyan, // Se ilumina con tu color de acento al pasar el mouse
            backgroundClip: 'content-box',
          },
        }}>
  
        {/* FILA 1: System + Appearance */}
        <Box sx={rowStyle}>
          <Box sx={itemStyle}><SystemPermissionsSection /></Box>
          <Box sx={itemStyle}><AppearanceSection /></Box>
        </Box>

        {/* FILA 2: Stats + Backup */}
        <Box sx={rowStyle}>
          <Box sx={itemStyle}>
            <StatsSection 
              totalSaved={state.totalSaved}
              totalTempCleaned={state.totalTempCleaned}
              resetRam={state.resetRam}
              setResetRam={setters.setResetRam}
              resetTemp={state.resetTemp}
              setResetTemp={setters.setResetTemp}
              onResetTotals={() => setters.setShowResetTotalsDialog(true)}
            />
          </Box>
          <Box sx={itemStyle}>
            <BackupSection 
              onBackupClick={handlers.handleCreateBackup} 
              isLoading={state.backupLoading} 
            />
          </Box>
        </Box>

        {/* FILA 3: Danger Zone */}
        <Box sx={rowStyle}>
          <Box sx={itemStyle}>
            <MaintenanceSection onConfirmReset={() => setters.setShowConfirmDialog(true)} />
          </Box>
          <Box sx={itemStyle}>
            <FactoryResetSection onResetClick={() => setters.setShowFactoryResetDialog(true)} />
          </Box>
        </Box>

        {/* ABOUT (Ancho completo) */}
        <Box sx={{ width: '100%' }}>
          <AboutSection onAboutClick={() => setters.setShowAboutDialog(true)} />
        </Box>

      </Box>

      {/* About Dialog - PREMIUM */}
      <Dialog open={state.showAboutDialog} onClose={() => setters.setShowAboutDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.surface,
            border: `1px solid ${colors.surfaceBorder}`,
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }
          }
        }}
      >
        {/* Accent line */}
        <Box sx={{
          height: 3,
          background: mode === 'dark' ? `linear-gradient(90deg, ${colors.cyan}, ${colors.cyan}80)` : colors.cyan,
          boxShadow: mode === 'dark' ? `0 0 20px ${colors.cyan}40` : 'none',
        }} />

        <Box sx={{ p: 2 }}>
          {/* Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: colors.cyanDim,
              border: `1px solid ${colors.cyanBorder}`,
            }}>
              <User size={32} color={colors.cyan} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: -0.3 }}>
                Roberto Coria Vargas
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: colors.textMuted, opacity: 0.7 }}>
                Full Stack Developer • Vortex Labs
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, opacity: 0.7, mb: 2, lineHeight: 1.6 }}>
            {t('settings.about.author')}
          </Typography>
          
          <Stack spacing={1}>
            <Button variant="outlined" component="a" href="https://www.linkedin.com/in/roberto-coria-vargas-088231309" target="_blank" rel="noopener noreferrer"
              sx={{ 
                border: `1px solid ${colors.surfaceBorder}`, 
                justifyContent: 'flex-start', 
                textTransform: 'none',
                color: colors.textMuted,
                py: 1,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: colors.cyanDim, 
                  borderColor: colors.cyanBorder,
                  color: colors.cyan,
                  transform: 'translateY(-1px)',
                  boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                }
              }}>
              LinkedIn Profile
            </Button>
            <Button variant="outlined" component="a" href="https://portfolio-rcv.vercel.app/" target="_blank" rel="noopener noreferrer"
              sx={{ 
                border: `1px solid ${colors.surfaceBorder}`, 
                justifyContent: 'flex-start', 
                textTransform: 'none',
                color: colors.textMuted,
                py: 1,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: colors.cyanDim, 
                  borderColor: colors.cyanBorder,
                  color: colors.cyan,
                  transform: 'translateY(-1px)',
                  boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                }
              }}>
              Portfolio
            </Button>
            <Button variant="outlined" component="a" href="https://github.com/RobertoCV10" target="_blank" rel="noopener noreferrer"
              sx={{ 
                border: `1px solid ${colors.surfaceBorder}`, 
                justifyContent: 'flex-start', 
                textTransform: 'none',
                color: colors.textMuted,
                py: 1,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: colors.cyanDim, 
                  borderColor: colors.cyanBorder,
                  color: colors.cyan,
                  transform: 'translateY(-1px)',
                  boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                }
              }}>
              GitHub
            </Button>
          </Stack>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              onClick={() => setters.setShowAboutDialog(false)} 
              sx={{ 
                color: colors.textMuted, 
                opacity: 0.7, 
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  opacity: 1,
                  bgcolor: 'transparent',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              {t('settings.close')}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Maintenance Reset Confirm */}
      <ConfirmationDialog
        open={state.showConfirmDialog}
        onClose={() => !state.isResetting && setters.setShowConfirmDialog(false)}
        onConfirm={handlers.handleResetAll}
        title={t('settings.maintenance_reset.title')}
        description={t('settings.maintenance_reset.description')}
        confirmLabel={state.isResetting ? t('settings.maintenance_reset.reseting') : t('settings.maintenance_reset.confirm')}
        isLoading={state.isResetting}
        severityColor={colors.orange}
        confirmButtonColor={colors.orange}
      >
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>{t('settings.maintenance_reset.items.completion_dates')}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>{t('settings.maintenance_reset.items.checklist_progress')}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>{t('settings.maintenance_reset.items.history')}</Typography>
        </Stack>
      </ConfirmationDialog>

      {/* Stats Reset Confirm */}
      <ConfirmationDialog
        open={state.showResetTotalsDialog}
        onClose={() => setters.setShowResetTotalsDialog(false)}
        onConfirm={handlers.handleResetTotals}
        title={t('settings.stats_reset.title')}
        description={t('settings.stats_reset.description')}
        confirmLabel={state.isResetting ? t('settings.stats_reset.reseting') : t('settings.stats_reset.confirm')}
        isLoading={state.isResetting}
        severityColor={colors.cyan}
        confirmButtonColor={colors.cyan}
      >
        <Stack spacing={1}>
          {state.resetRam && <Typography variant="caption" sx={{ color: colors.green, display: 'block' }}>{t('settings.stats_reset.ram_saved')}: {state.totalSaved.toFixed(2)} GB - 0 GB</Typography>}
          {state.resetTemp && <Typography variant="caption" sx={{ color: colors.cyan, display: 'block' }}>{t('settings.stats_reset.temp_cleaned')}: {state.totalTempCleaned.toFixed(2)} GB - 0 GB</Typography>}
        </Stack>
      </ConfirmationDialog>

      {/* Backup Confirm */}
      <ConfirmationDialog
        open={state.showBackupConfirmDialog}
        onClose={() => setters.setShowBackupConfirmDialog(false)}
        onConfirm={handlers.handleConfirmCreateBackup}
        title={t('settings.backup_create.title')}
        description={t('settings.backup_create.description')}
        confirmLabel={state.backupLoading ? t('settings.backup_create.creating') : t('settings.backup_create.confirm')}
        isLoading={state.backupLoading}
        severityColor={colors.green}
        confirmButtonColor={colors.green} 
      >
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {t('settings.backup_create.detail')}
        </Typography>
      </ConfirmationDialog>

      {/* Factory Reset Confirm */}
      <ConfirmationDialog
        open={state.showFactoryResetDialog}
        onClose={() => setters.setShowFactoryResetDialog(false)}
        onConfirm={handlers.handleFactoryReset}
        title={t('settings.factory_reset.title')}
        description={t('settings.factory_reset.description')}
        confirmLabel={state.factoryResetLoading ? t('settings.factory_reset.reseting') : t('settings.factory_reset.confirm')}
        isLoading={state.factoryResetLoading}
        severityColor="#ff5722"
        confirmButtonColor="#ff5722"
      >
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ color: colors.green,  display: 'block' }}>{t('settings.factory_reset.items.restore_config')}</Typography>
          <Typography variant="body2" sx={{ color: colors.green,  display: 'block' }}>{t('settings.factory_reset.items.sync_backup')}</Typography>
          <Typography variant="body2" sx={{ color: colors.cyan,   display: 'block' }}>{t('settings.factory_reset.items.remove_presets')}</Typography>
          <Typography variant="body2" sx={{ color: colors.red,    display: 'block' }}>{t('settings.factory_reset.items.reset_progress')}</Typography>
          <Typography variant="body2" sx={{ color: colors.orange, display: 'block' }}>{t('settings.factory_reset.items.reset_stats')} ({state.totalSaved.toFixed(2)} GB RAM, {state.totalTempCleaned.toFixed(2)} GB Temp)</Typography>
        </Stack>
      </ConfirmationDialog>

    </Box>
  );
};
