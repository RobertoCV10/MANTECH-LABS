import { Typography, Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { InfoCard } from '../components/InfoCard';
import { Cpu, Zap } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface CpuInfo {
  brand:          string;
  manufacturer:   string;
  cores:          number;
  physicalCores:  number;
  socket:         string;
  speed:          number;
  speedMax:       number;
  virtualization: boolean;
  cache: { l1d: number; l1i: number; l2: number; l3: number };
}

interface CpuViewProps {
  value:   number;
  threads: number[];
  cpuInfo: CpuInfo;
  cpuFreq: number;
}

const formatCache = (bytes: number) => {
  if (!bytes) return 'N/A';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
  if (bytes >= 1024)        return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};

// Interpola entre naranja oscuro → naranja → rojo según carga
const heatColor = (load: number, colors: any): string => {
  if (load >= 85) return colors.red;
  if (load >= 60) return colors.orange;
  if (load >= 30) return colors.cyan;
  return `${colors.cyan}55`;
};

export const CpuView = ({ value, threads = [], cpuInfo, cpuFreq }: CpuViewProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  const statusColor =
    value > 85 ? colors.red :
    value > 65 ? colors.orange : colors.cyan;

  // Calcular columnas del heatmap según cantidad de hilos
  const cols = threads.length <= 8 ? threads.length : threads.length <= 16 ? 8 : 12;
  const rows = Math.ceil(threads.length / cols);

  const specs = [
    { label: t('cpu.manufacturer'),   value: cpuInfo?.manufacturer ?? '—' },
    { label: t('cpu.socket'),         value: cpuInfo?.socket ?? '—' },
    { label: t('cpu.virtualization'), value: cpuInfo?.virtualization ? t('cpu.enabled') : t('cpu.disabled') },
    { label: t('cpu.cores.physical'), value: String(cpuInfo?.physicalCores ?? '—') },
    { label: t('cpu.cores.logical'),  value: String(cpuInfo?.cores ?? '—') },
    { label: t('cpu.cache.l2'),       value: formatCache(cpuInfo?.cache?.l2) },
    { label: t('cpu.cache.l3'),       value: formatCache(cpuInfo?.cache?.l3) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Título sutil */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Cpu size={12} color={colors.textMuted} style={{ opacity: 0.45 }} />
        <Typography sx={{
          fontSize: '0.62rem', letterSpacing: 2.5,
          color: colors.textMuted, opacity: 0.45,
          textTransform: 'uppercase'
        }}>
          {t('cpu.title')}
        </Typography>
      </Box>

      <Grid container spacing={2}>

        {/* InfoCard */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoCard
            label={t('cpu.totalLoad')}
            value={value}
            subValue={`${t('cpu.frequency')}: ${cpuFreq} GHz`}
            color={statusColor}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Specs */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{
            p: 2, borderRadius: 2, height: '100%',
            bgcolor: colors.surface,
            border: `1px solid ${colors.surfaceBorder}`,
          }}>
            {/* Brand como título */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Zap size={12} color={colors.cyan} style={{ opacity: mode === 'dark' ? 0.7 : 0.85 }} />
              <Typography sx={{
                fontSize: '0.72rem', fontWeight: 700,
                color: colors.textMuted, letterSpacing: 0.5
              }}>
                {cpuInfo?.brand ?? '—'}
              </Typography>
            </Box>

            {/* Chips en grid uniforme */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 1,
            }}>
              {specs.map((s) => (
                <Box key={s.label} sx={{
                  px: 1, py: 1, borderRadius: 1,
                  bgcolor: colors.surface,
                  border: `1px solid ${colors.surfaceBorder}`,
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                    borderColor: colors.cyanBorder,
                  }
                }}>
                  <Typography sx={{
                    fontSize: '0.58rem', color: colors.textMuted,
                    opacity: 0.55, letterSpacing: 0.5, mb: 0.5,
                    textTransform: 'uppercase'
                  }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.82rem', fontWeight: 700,
                    fontFamily: 'monospace', color: colors.cyan,
                  }}>
                    {s.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Heatmap de hilos */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{
            p: 2, borderRadius: 2,
            bgcolor: colors.surface,
            border: `1px solid ${colors.surfaceBorder}`,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{
                fontSize: '0.62rem', letterSpacing: 2.5,
                color: colors.textMuted, opacity: 0.55,
                textTransform: 'uppercase'
              }}>
                {t('cpu.threads.distribution')}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: colors.textMuted, opacity: 0.45 }}>
                {threads.length} {t('cpu.threads.detected')}
              </Typography>
            </Box>

            {/* Grid heatmap */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 0.5,
            }}>
              {threads.map((load, i) => {
                const cellColor = heatColor(load, colors);
                const isHot = load >= 60;
                return (
                  <Box
                    key={i}
                    sx={{
                      height: 56,
                      borderRadius: 0.5,
                      bgcolor: mode === 'dark' ? `${cellColor}22` : `${cellColor}30`,
                      border: `1px solid ${mode === 'dark' ? `${cellColor}40` : `${cellColor}50`}`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 0.25,
                      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                      }
                    }}
                  >
                    <Typography sx={{
                      fontSize: '0.5rem', color: colors.textMuted,
                      opacity: 0.45, letterSpacing: 0.5
                    }}>
                      T{i + 1}
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.78rem', fontWeight: 700,
                      color: cellColor, lineHeight: 1,
                      fontFamily: 'monospace',
                    }}>
                      {load}
                    </Typography>
                    <Typography sx={{ fontSize: '0.5rem', color: cellColor, opacity: 0.6 }}>
                      %
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Leyenda de color */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, opacity: 0.55 }}>
              {[
                { label: 'Idle', color: `${colors.cyan}55` },
                { label: 'Normal', color: colors.cyan },
                { label: 'Load', color: colors.orange },
                { label: 'Critical', color: colors.red },
              ].map((leg) => (
                <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 0.25, bgcolor: leg.color }} />
                  <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted }}>
                    {leg.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};