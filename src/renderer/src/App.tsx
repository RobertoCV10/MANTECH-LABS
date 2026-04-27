//src/renderer/src/App.tsx
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, IconButton, Badge, Typography,  } from '@mui/material';
import { AlertTriangle, Bell } from 'lucide-react';
import { createTechTheme } from './theme';
import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, useThemeMode } from './theme/ThemeContext';
import { HomeView } from './views/HomeView';
import { CpuView } from './views/CpuView';
import { RamView } from './views/RamView';
import { DiskView } from './views/DiskView';
import { OptimizeView } from './views/OptimizerView';
import { MantenimientosView } from './views/MantenimientosView';
import { SettingsView } from './views/SettingsView';
import { useMantenimiento } from './hooks/useMantenimiento';
import mantenimientosJSON from './data/mantenimientos.json';
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { NotificationProvider, useNotification } from './context/NotificationContext'
import { NotificationSnackbar } from './components/notifications/NotificationSnackbar'
import { NotificationPanel } from './components/notifications/NotificationPanel'
import { Sidebar } from './components/sidebar'

const mantenimientosData = mantenimientosJSON.mantenimientos;

const defaultRamDetails = {
  total:     0,
  active:    0,
  available: 0,
  cache:     0,
  swapUsed:  0,
  swapTotal: 0,
  layout:    [] as any[],
}

function AppContent() {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const { unreadCount } = useNotification();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const theme = useMemo(() => createTechTheme(mode), [mode]);
  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? colors.sidebarBg : colors.sidebarBg;
    document.body.style.color = mode === 'dark' ? '#e0e0e0' : '#1a2027';
  }, [mode, colors.sidebarBg]);
  const [currentTab, setCurrentTab] = useState('home');
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeDialogMode, setCloseDialogMode] = useState<'simple' | 'gaming' | 'error'>('simple');
  const [closeError, setCloseError] = useState<string | null>(null);
  
  const { resetAllProgress } = useMantenimiento(mantenimientosData);
  
  const [stats, setStats] = useState({ 
    cpu:        0, 
    cpuThreads: [] as number[], 
    ram:        0, 
    disks:      [] as any[],
    ramRaw:     '0/0 GB',
    ramDetails: defaultRamDetails,
    cpuInfo: null as any,
    cpuFreq: 0,
  });
  
  useEffect(() => {
    if (window.api?.onUpdateHardware) {
      window.api.onUpdateHardware((data: any) => {
        setStats({
          cpu:        data.cpu,
          cpuThreads: data.cpuThreads,
          ram:        data.ram,
          disks:      data.disks,
          ramRaw:     data.ramRaw,
          ramDetails: data.ramDetails ?? defaultRamDetails,
          cpuInfo: data.cpuInfo,
          cpuFreq: data.cpuFreq,
        });
      });
    }
  }, []);

  // Escuchar consulta de cierre desde main process
  useEffect(() => {
    const unsub = window.api?.onCloseQuery?.((data: any) => {
      if (data.error) {
        // Error al intentar quitar modo gaming - mostrar dialog de error
        setCloseDialogMode('error');
        setCloseError(data.error);
      } else if (data.gamingModeActive) {
        setCloseDialogMode('gaming');
      } else {
        setCloseDialogMode('simple');
      }
      setShowCloseDialog(true);
    });

    return () => {
      unsub?.();
    };
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box sx={{ height: 32, width: '100%', position: 'fixed', top: 0, left: 0, 
        zIndex: 2000, WebkitAppRegion: 'drag' }} />

      <IconButton
        onClick={() => setShowNotificationPanel(!showNotificationPanel)}
        sx={{
          position: 'fixed',
          top: 40,
          right: 8,
          zIndex: 2002,
          color: colors.cyan,
          borderRadius: 1,
          p: 0.75,
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 
            bgcolor: mode === 'light' ? colors.surfaceBorder : 'transparent',
            transform: 'translateY(-1px)',
          }
        }}
      >
        <Badge badgeContent={unreadCount} max={99} color="error">
          <Bell size={20} />
        </Badge>
      </IconButton>

      <Box sx={{ display: 'flex', bgcolor: colors.sidebarBg, minHeight: '100vh' }}>
        
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

        <Box component="main" sx={{ flexGrow: 1, p:4, mt:2, bgcolor: colors.sidebarBg, minHeight: '100vh' }}>
          {showNotificationPanel && (
            <NotificationPanel top_OFFSET={56} />
          )}
          {currentTab === 'home' && <HomeView stats={stats} onNavigate={setCurrentTab} />}
          {currentTab === 'cpu'  && <CpuView value={stats.cpu} threads={stats.cpuThreads} cpuInfo={stats.cpuInfo} cpuFreq={stats.cpuFreq} />}
          {currentTab === 'ram'  && <RamView value={stats.ram} raw={stats.ramRaw} details={stats.ramDetails} />}
          {currentTab === 'disk' && <DiskView disks={stats.disks} />}
          {currentTab === 'opti' && <OptimizeView />}
          {currentTab === 'mant' && <MantenimientosView />}
          {currentTab === 'settings' && <SettingsView onResetAll={resetAllProgress} />}
        </Box>

        {/* Dialog de cierre simple (sin modo gaming) */}
        <Dialog 
          open={showCloseDialog && closeDialogMode === 'simple'} 
          onClose={() => setShowCloseDialog(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { bgcolor: mode === 'dark' ? 'rgba(26,26,26,0.95)' : '#ffffff', border: `1px solid ${colors.surfaceBorder}`, borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, textAlign: 'left', pb: 1 }}>
            {t('close_dialog.simple_title')}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ textAlign: 'left', opacity: 0.7 }}>
              {t('close_dialog.simple_body')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, pb: 2, pt: 2 }}>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'cancel' });
                setShowCloseDialog(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'close' });
                setShowCloseDialog(false);
              }}
              variant="contained"
              sx={{ 
                bgcolor: colors.red,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': { 
                  filter: 'brightness(0.85)',
                  transform: 'translateY(-1px)',
                  boxShadow: mode === 'dark' ? '0 6px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              {t('close_dialog.confirm_close')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de cierre con modo gaming activo */}
        <Dialog 
          open={showCloseDialog && closeDialogMode === 'gaming'} 
          onClose={() => setShowCloseDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { bgcolor: mode === 'dark' ? 'rgba(26,26,26,0.95)' : '#ffffff', border: `1px solid ${colors.surfaceBorder}`, borderRadius: 2 } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: colors.orange, pb: 1 }}>
            <AlertTriangle size={24} />
            {t('close_dialog.gaming_title')}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('close_dialog.gaming_body')}
            </Typography>
            <Box sx={{ bgcolor: mode === 'dark' ? colors.surface : 'rgba(0,0,0,0.02)', p: 2, borderRadius: 1, mb: 2, border: `1px solid ${colors.surfaceBorder}` }}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>• {t('close_dialog.maintain')}:</strong> {t('close_dialog.maintain_desc')}
                </Typography>
                <Typography variant="body2">
                  <strong>• {t('close_dialog.remove')}:</strong> {t('close_dialog.remove_desc')}
                </Typography>
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.55 }}>
              {t('close_dialog.gaming_footer')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, pb: 2, pt: 2 }}>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'cancel' });
                setShowCloseDialog(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'maintain' });
                setShowCloseDialog(false);
              }}
              variant="outlined"
            >
              {t('close_dialog.maintain')}
            </Button>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'remove' });
                setShowCloseDialog(false);
              }}
              variant="contained"
              sx={{ 
                bgcolor: colors.red,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': { 
                  filter: 'brightness(0.85)',
                  transform: 'translateY(-1px)',
                  boxShadow: mode === 'dark' ? '0 6px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              {t('close_dialog.remove')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de error al quitar modo gaming (falló por permisos) */}
        <Dialog 
          open={showCloseDialog && closeDialogMode === 'error'} 
          onClose={() => setShowCloseDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { bgcolor: mode === 'dark' ? 'rgba(26,26,26,0.95)' : '#ffffff', border: `1px solid ${colors.surfaceBorder}`, borderRadius: 2 } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: colors.red, pb: 1 }}>
            <AlertTriangle size={24} />
            {t('close_dialog.error_title')}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {closeError || t('close_dialog.error_body_default')}
            </Typography>
            <Box sx={{ bgcolor: mode === 'dark' ? 'rgba(255,68,68,0.1)' : 'rgba(198,40,40,0.05)', p: 2, borderRadius: 1, border: `1px solid ${mode === 'dark' ? 'rgba(255,68,68,0.3)' : 'rgba(198,40,40,0.15)'}` }}>
              <Typography variant="body2" sx={{ color: colors.orange }}>
                {t('close_dialog.error_accept')}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, pb: 2, pt: 2 }}>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'close' });
                setShowCloseDialog(false);
              }}
            >
              {t('close_dialog.force_close')}
            </Button>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'maintain' });
                setShowCloseDialog(false);
              }}
              variant="outlined"
            >
              {t('close_dialog.maintain')}
            </Button>
            <Button 
              onClick={() => {
                window.api?.sendCloseResponse({ action: 'remove' });
                setShowCloseDialog(false);
              }}
              variant="contained"
              sx={{ 
                bgcolor: colors.red,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': { 
                  filter: 'brightness(0.85)',
                  transform: 'translateY(-1px)',
                  boxShadow: mode === 'dark' ? '0 6px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              {t('close_dialog.retry')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppContent />
          <NotificationSnackbar />
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App;



