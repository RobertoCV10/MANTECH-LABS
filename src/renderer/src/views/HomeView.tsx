//src/renderer/src/views/HomeView.tsx
import { Typography, Box, Paper, Button, LinearProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useEffect } from 'react';
import { Trash2, FolderOpen, Clock, Play, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useMantenimiento } from '../hooks/useMantenimiento';
import mantenimientosJSON from '../data/mantenimientos.json';

interface HomeViewProps {
  stats: any;
  onNavigate: (view: string) => void;
}

export const HomeView = ({ stats, onNavigate }: HomeViewProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const { proximoMantenimiento, loading: maintLoading } = useMantenimiento(mantenimientosJSON.mantenimientos);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [totalTempCleaned, setTotalTempCleaned] = useState<number>(0);

  useEffect(() => {
    const loadTotals = async () => {
      try {
        const [savedResponse, tempResponse] = await Promise.all([
          window.api.getTotalSaved(),
          window.api.getTotalTempCleaned()
        ]);
        if (savedResponse.success) setTotalSaved(savedResponse.data.total || 0);
        if (tempResponse.success) setTotalTempCleaned(tempResponse.data.total || 0);
      } catch (e) {
        console.error('Error loading totals:', e);
      }
    };
    loadTotals();
  }, []);

  const mainDisk = stats.disks?.find((d: any) => d.fs === 'C:') || stats.disks?.[0];
  const mainDiskUsage = mainDisk?.used || 0;

  const getStatusColor = (value: number) =>
    value > 90 ? colors.red : value > 70 ? colors.orange : colors.cyan;

  const systemStatus = [stats.cpu, stats.ram, mainDiskUsage].some(v => v > 90)
    ? { label: 'ALERTA', color: colors.red, icon: <AlertTriangle size={12} /> }
    : { label: 'NOMINAL', color: colors.green, icon: <CheckCircle size={12} /> };

  const metrics = [
    { label: t('home.panels.cpu'),  value: stats.cpu,              unit: '%' },
    { label: t('home.panels.ram'),  value: stats.ram,              unit: '%' },
    { label: t('home.panels.disk'), value: mainDiskUsage.toFixed(0), unit: '%' },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── HEADER ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              {t('home.welcome')},{' '}
              <span style={{ color: colors.purple }}>{t('home.engineer')}</span>
            </Typography>
            {/* Badge de estado inline */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.25, borderRadius: 1.5,
              bgcolor: mode === 'dark' ? `${systemStatus.color}14` : `${systemStatus.color}08`,
              border: `1px solid ${mode === 'dark' ? `${systemStatus.color}30` : `${systemStatus.color}15`}`,
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              }
            }}>
              <Box sx={{ color: systemStatus.color, display: 'flex', alignItems: 'center' }}>
                {systemStatus.icon}
              </Box>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: systemStatus.color, letterSpacing: 1.5 }}>
                {systemStatus.label}
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: colors.textMuted, letterSpacing: 0.3, opacity: 0.55 }}>
            {t('home.subtitle')}
          </Typography>
        </Box>

        {/* Timestamp */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.45 }}>
          <Activity size={13} />
          <Typography variant="caption" sx={{ fontSize: '0.7rem', px: 2,}}>
            STATUS
          </Typography>
        </Box>
      </Box>

      {/* ── ZONA PRINCIPAL: MÉTRICAS + MANTENIMIENTO ── */}
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>

        {/* COLUMNA IZQUIERDA: Métricas + Totales + OS */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>

            {/* MÉTRICAS */}
            <Paper sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: colors.surface,
              border: `1px solid ${colors.surfaceBorder}`,
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                borderColor: colors.cyanBorder,
              }
            }}>
              <Typography variant="overline" sx={{ color: colors.textMuted, letterSpacing: 2, fontSize: '0.65rem', opacity: 0.55 }}>
                System Load
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {metrics.map((m) => {
                  const val = Number(m.value);
                  const statusColor = getStatusColor(val);
                  return (
                    <Box key={m.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                        <Typography sx={{
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          color: colors.textMuted,
                          letterSpacing: 1.5,
                          textTransform: 'uppercase',
                          opacity: 0.55
                        }}>
                          {m.label}
                        </Typography>
                        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: statusColor, lineHeight: 1 }}>
                          {m.value}
                          <span style={{ fontSize: '0.75rem', marginLeft: 2, opacity: 0.6 }}>{m.unit}</span>
                        </Typography>
                      </Box>
                      {/* Barra industrial */}
                      <Box sx={{ position: 'relative', height: 3, bgcolor: `${statusColor}18`, borderRadius: 10 }}>
                        <Box sx={{
                          position: 'absolute', left: 0, top: 0,
                          height: '100%',
                          width: `${Math.min(val, 100)}%`,
                          bgcolor: statusColor,
                          borderRadius: 10,
                          boxShadow: mode === 'dark' ? `0 0 6px ${statusColor}80` : 'none',
                          transition: 'width 600ms ease',
                        }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* FILA INFERIOR: Totales + OS */}
            <Grid container spacing={1.5}> {/* Increased spacing slightly for better scannability */}

              {/* TOTALES - Made smaller (size 5) */}
              <Grid size={{ xs: 12, sm: 6 }}> 
                <Paper sx={{
                  p: 2, borderRadius: 2, height: '100%',
                  bgcolor: colors.surface,
                  border: `1px solid ${colors.surfaceBorder}`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', // Centered content looks better when smaller
                  transition: 'all 200ms ease',
                  '&:hover': {
                    borderColor: colors.cyanBorder,
                    transform: 'translateY(-1px)',
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Trash2 size={13} color={colors.textMuted} />
                    <Typography variant="overline" sx={{ color: colors.textMuted, letterSpacing: 1.5, fontSize: '0.6rem', opacity: 0.55 }}>
                      Liberado
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, color: colors.cyan }}>
                    {(totalSaved + totalTempCleaned).toFixed(1)}
                    <span style={{ fontSize: '0.8rem', marginLeft: 4, opacity: 0.55 }}>GB</span>
                  </Typography>
                  
                  {/* Sub-valores simplified for the smaller space */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: `1px solid ${colors.surfaceBorder}` }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted }}>
                      RAM: {totalSaved.toFixed(1)}G
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted }}>
                      Temp: {totalTempCleaned.toFixed(1)}G
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* OS INFO */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{
                  p: 1, borderRadius: 2, height: '100%',
                  bgcolor: colors.surface,
                  border: `1px solid ${colors.surfaceBorder}`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                    borderColor: colors.cyanBorder,
                  }
                }}>
                  <Typography variant="overline" sx={{ color: colors.textMuted, letterSpacing: 2, fontSize: '0.65rem', opacity: 0.55 }}>
                    Sistema
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: colors.textMuted, opacity: 0.7 }}>
                      {t('home.panels.windows')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textMuted, opacity: 0.55, fontSize: '0.65rem', display: 'block' }}>
                      {t('home.panels.kernel')}: x64
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textMuted, opacity: 0.55, fontSize: '0.65rem' }}>
                      6.1.7601
                    </Typography>
                  </Box>
                  {/* Dot decorativo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.green, boxShadow: mode === 'dark' ? `0 0 6px ${colors.green}` : 'none' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.textMuted, opacity: 0.55 }}>
                      Conectado
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

            </Grid>
          </Box>
        </Grid>

        {/* COLUMNA DERECHA: Próximo Mantenimiento */}
        <Grid size={{ xs: 12, md: 5 }}>
          {!maintLoading && proximoMantenimiento ? (
            <Paper sx={{
              p: 2, borderRadius: 2, height: 'fit-content',
              background: `linear-gradient(160deg, ${colors.cyanDim} 0%, transparent 60%)`,
              border: `1px solid ${colors.cyanBorder}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
              }
            }}>
              {/* Decoración de fondo */}
              <Box sx={{
                position: 'absolute', right: -30, top: -30,
                width: 140, height: 140, borderRadius: '50%',
                border: `1px solid ${colors.cyanBorder}`,
                opacity: mode === 'dark' ? 0.3 : 0.15
              }} />
              <Box sx={{
                position: 'absolute', right: -10, top: -10,
                width: 80, height: 80, borderRadius: '50%',
                border: `1px solid ${colors.cyanBorder}`,
                opacity: mode === 'dark' ? 0.2 : 0.1
              }} />

              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Clock size={14} color={colors.cyan} />
                  <Typography variant="overline" sx={{ color: colors.cyan, letterSpacing: 2, fontSize: '0.65rem', fontWeight: 700 }}>
                    {t('maintenance.hero.priority_action')}
                  </Typography>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 1, lineHeight: 1.1 }}>
                  {t(proximoMantenimiento.nombre)}
                </Typography>

                <Typography variant="body2" sx={{ color: colors.textMuted, lineHeight: 1.7, mb: 2, opacity: 0.7 }}>
                  {t(proximoMantenimiento.descripcion)}
                </Typography>

                {/* Badge días */}
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  px: 1, py: 0.5, borderRadius: 1.5, mb: 2,
                  bgcolor: proximoMantenimiento.diasRestantes <= 0
                    ? (mode === 'dark' ? `${colors.red}18` : `${colors.red}08`)
                    : (mode === 'dark' ? `${colors.green}14` : `${colors.green}06}`),
                  border: `1px solid ${proximoMantenimiento.diasRestantes <= 0
                    ? (mode === 'dark' ? `${colors.red}30` : `${colors.red}15`)
                    : (mode === 'dark' ? `${colors.green}25` : `${colors.green}12`)}`,
                }}>
                  <Typography sx={{
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5,
                    color: proximoMantenimiento.diasRestantes <= 0 ? colors.red : colors.green,
                  }}>
                    {proximoMantenimiento.diasRestantes <= 0
                      ? t('maintenance.hero.immediate_attention')
                      : `${proximoMantenimiento.diasRestantes} ${t('maintenance.hero.days_to_expiry')}`}
                  </Typography>
                </Box>
              </Box>

              {/* CTA */}
              <Button
                variant="contained"
                startIcon={<Play size={14} fill="currentColor" />}
                onClick={() => onNavigate('mant')}
                fullWidth
                sx={{
                  bgcolor: colors.cyan,
                  color: colors.sidebarBg,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: 1,
                  py: 1,
                  borderRadius: 1,
                  position: 'relative', zIndex: 2,
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    filter: mode === 'dark' ? 'brightness(0.88)' : 'brightness(1.1)',
                    bgcolor: colors.cyan,
                    transform: 'translateY(-1px)',
                    boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(247, 246, 246, 0.08)',
                  }
                }}
              >
                {t('maintenance.hero.start_protocol')}
              </Button>
            </Paper>
          ) : (
            // Skeleton / fallback si no hay mantenimiento
            <Paper sx={{
              p: 2, borderRadius: 2, height: '100%',
              bgcolor: colors.surface,
              border: `1px solid ${colors.surfaceBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Typography variant="caption" sx={{ color: colors.textMuted, opacity: 0.45 }}>
                Sin mantenimientos pendientes
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};