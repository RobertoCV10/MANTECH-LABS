import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { InfoCard } from '../components/InfoCard';
import { MemoryStick } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface RamSlot {
  size:         number;
  speed:        number;
  type:         string;
  formFactor:   string;
  manufacturer: string;
  partNum:      string;
}

interface RamDetails {
  total:     number;
  active:    number;
  available: number;
  cache:     number;
  swapUsed:  number;
  swapTotal: number;
  layout:    RamSlot[];
}

interface RamViewProps {
  value:   number;
  raw:     string;
  details: RamDetails;
}

export const RamView = ({ value, raw, details }: RamViewProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  const statusColor =
    value > 85 ? colors.red :
    value > 65 ? colors.orange : colors.cyan;

  // Segmentos para la barra
  const total = details.total || 1;
  const segments = [
    { label: t('ram.in_use'),   value: details.active,    gb: details.active,    color: colors.cyan,   pct: (details.active    / total) * 100 },
    { label: t('ram.cache'),    value: details.cache,     gb: details.cache,     color: colors.orange, pct: (details.cache     / total) * 100 },
    { label: t('ram.swap'),     value: details.swapUsed,  gb: details.swapUsed,  color: colors.red,    pct: (details.swapUsed  / total) * 100 },
    { label: t('ram.available'),value: details.available, gb: details.available, color: `${colors.cyan}28`, pct: (details.available / total) * 100 },
  ].filter(s => s.gb > 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Título sutil */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MemoryStick size={12} color={colors.textMuted} style={{ opacity: 0.45 }} />
        <Typography sx={{
          fontSize: '0.62rem', letterSpacing: 2.5,
          color: colors.textMuted, opacity: 0.45,
          textTransform: 'uppercase'
        }}>
          {t('ram.title')}
        </Typography>
      </Box>

      <Grid container spacing={2}>

        {/* InfoCard gauge */}
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoCard
            label={t('ram.usage')}
            value={value}
            subValue={`${t('ram.physical_usage')}: ${raw}`}
            color={statusColor}
          />
        </Grid>

        {/* Breakdown visual */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{
            p: 2, borderRadius: 2, height: '100%',
            bgcolor: colors.surface,
            border: `1px solid ${colors.surfaceBorder}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
              <Typography sx={{
                fontSize: '0.62rem', letterSpacing: 2.5,
                color: colors.textMuted, opacity: 0.45,
                textTransform: 'uppercase'
              }}>
                {t('ram.memory_breakdown')}
              </Typography>
              <Typography sx={{
                fontSize: '0.72rem', fontWeight: 700,
                fontFamily: 'monospace', color: colors.textMuted, opacity: 0.7
              }}>
                {details.total} GB total
              </Typography>
            </Box>

            {/* Barra segmentada */}
            <Box sx={{
              display: 'flex', height: 10,
              borderRadius: 1, overflow: 'hidden',
              gap: 0.25, mb: 2,
            }}>
              {segments.map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    width: `${s.pct}%`,
                    bgcolor: s.color,
                    borderRadius:
                      i === 0 ? '8px 0 0 8px' :
                      i === segments.length - 1 ? '0 8px 8px 0' : '0',
                    boxShadow: mode === 'dark' && s.color !== `${colors.cyan}28`
                      ? `0 0 8px ${s.color}60` : 'none',
                    transition: 'width 600ms ease',
                    minWidth: s.gb > 0 ? 2 : 0,
                  }}
                />
              ))}
            </Box>

            {/* Leyenda */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {segments.map((s, i) => (
                <Box key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: 0.25,
                      bgcolor: s.color,
                      boxShadow: mode === 'dark' && s.color !== `${colors.cyan}28` ? `0 0 5px ${s.color}80` : 'none'
                    }} />
                    <Typography sx={{ fontSize: '0.58rem', color: colors.textMuted, opacity: 0.55, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {s.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: colors.textMuted, lineHeight: 1 }}>
                    {s.gb.toFixed(1)}
                    <span style={{ fontSize: '0.65rem', marginLeft: 2, opacity: 0.55, fontWeight: 400 }}>GB</span>
                  </Typography>
                  <Typography sx={{ fontSize: '0.58rem', color: colors.textMuted, opacity: 0.45, mt: 0.25 }}>
                    {s.pct.toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Módulos físicos — DIMM style */}
        {details.layout?.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{
              p: 2, borderRadius: 2,
              bgcolor: colors.surface,
              border: `1px solid ${colors.surfaceBorder}`,
            }}>
              <Typography sx={{
                fontSize: '0.62rem', letterSpacing: 2.5,
                color: colors.textMuted, opacity: 0.45,
                textTransform: 'uppercase', mb: 2
              }}>
                {t('ram.physical_slots')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {details.layout.map((slot, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex', alignItems: 'center',
                      minHeight: 56,
                      borderRadius: 1,
                      bgcolor: mode === 'dark' ? `${colors.cyan}06` : `${colors.cyan}04`,
                      border: `1px solid ${colors.surfaceBorder}`,
                      overflow: 'hidden',
                      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        borderColor: colors.cyanBorder,
                        transform: 'translateY(-1px)',
                        boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    {/* Acento lateral */}
                    <Box sx={{
                      width: 3, height: '100%',
                      bgcolor: colors.cyan,
                      boxShadow: mode === 'dark' ? `0 0 8px ${colors.cyan}60` : 'none',
                      flexShrink: 0,
                    }} />

                    {/* Slot label */}
                    <Box sx={{
                      px: 1.5, borderRight: `1px solid ${colors.surfaceBorder}`,
                      height: '100%', display: 'flex',
                      flexDirection: 'column', justifyContent: 'center',
                      minWidth: 64,
                    }}>
                      <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted, opacity: 0.55, letterSpacing: 1 }}>
                        {t('ram.slot_prefix')}
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1, color: colors.textMuted, opacity: 0.7 }}>
                        {String(i + 1).padStart(2, '0')}
                      </Typography>
                    </Box>

                    {/* Tamaño destacado */}
                    <Box sx={{
                      px: 2, borderRight: `1px solid ${colors.surfaceBorder}`,
                      height: '100%', display: 'flex',
                      alignItems: 'center', minWidth: 80,
                    }}>
                      <Typography sx={{
                        fontSize: '1.4rem', fontWeight: 900,
                        fontFamily: 'monospace', color: colors.cyan,
                        lineHeight: 1,
                      }}>
                        {slot.size}
                        <span style={{ fontSize: '0.7rem', marginLeft: 3, opacity: 0.6, fontWeight: 400 }}>GB</span>
                      </Typography>
                    </Box>

                    {/* Info técnica */}
                    <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {[
                          slot.type,
                          slot.speed ? `${slot.speed} MHz` : null,
                          slot.formFactor,
                        ].filter(Boolean).map((tag, j) => (
                          <Box key={j} sx={{
                            px: 1, py: 0.25, borderRadius: 1,
                            bgcolor: mode === 'dark' ? `${colors.cyan}10` : `${colors.cyan}06`,
                            border: `1px solid ${mode === 'dark' ? `${colors.cyan}20` : `${colors.cyan}10`}`,
                          }}>
                            <Typography sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: colors.cyan, opacity: 0.8 }}>
                              {tag}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Typography sx={{ fontSize: '0.65rem', color: colors.textMuted, opacity: 0.55 }}>
                        {slot.manufacturer || '—'} · <span style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>{slot.partNum || '—'}</span>
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

      </Grid>
    </Box>
  );
};