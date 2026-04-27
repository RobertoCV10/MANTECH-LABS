//src/renderer/src/components/DiskCard.tsx
import { useState } from 'react';
import { Paper, Box, Typography, Collapse } from '@mui/material';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { HardDrive, Thermometer, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export interface DiskInfo {
  fs:            string;
  type:          string;
  size:          string;
  used:          number;
  available:     string;
  readIO:        string;
  writeIO:       string;
  temp:          number;
  status:        string;
  model?:        string;
  interfaceType?: string;
}

export const DiskCard = ({ disk, defaultExpanded = false }: { disk: DiskInfo; defaultExpanded?: boolean }) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isCritical = disk.used > 90;
  const usageColor = isCritical ? colors.red : disk.used > 70 ? colors.orange : colors.cyan;
  const tempColor  = disk.temp > 45 ? colors.red : disk.temp > 35 ? colors.orange : colors.cyan;
  const displayTemp = disk.temp > 0 ? `${disk.temp}°C` : '--°C';

  const isReading = disk.readIO  !== '0 B/s';
  const isWriting = disk.writeIO !== '0 B/s';
  const hasActivity = isReading || isWriting;

  return (
    <Paper
      sx={{
        borderRadius: 1,
        bgcolor: colors.surface,
        border: `1px solid ${expanded ? `${colors.cyan}30` : colors.surfaceBorder}`,
        overflow: 'hidden',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        '&:hover': { 
          borderColor: colors.cyanBorder,
          transform: 'translateY(-1px)',
          boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex', alignItems: 'stretch',
          cursor: 'pointer', minHeight: 64,
        }}
      >
        <Box sx={{
          width: 3, flexShrink: 0,
          bgcolor: usageColor,
          boxShadow: mode === 'dark' ? `0 0 8px ${usageColor}60` : 'none',
        }} />

        <Box sx={{
          px: 2, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', width: 88, flexShrink: 0,
          borderRight: `1px solid ${colors.surfaceBorder}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
            <HardDrive size={14} color={usageColor} style={{ opacity: 0.8 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace', color: colors.textMuted }}>
              {disk.fs}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted, opacity: 0.55, letterSpacing: 0.3, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {disk.model || t('disk.card.local_disk')}
          </Typography>
        </Box>

        <Box sx={{
          flex: 1, px: 3,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: 2,
          minWidth: 0,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: '1 rem', fontWeight: 800, fontFamily: 'monospace', color: usageColor, lineHeight: 1 }}>
              {disk.used.toFixed(1)}
              <span style={{ fontSize: '0.8rem', marginLeft: 2, opacity: 0.6, fontWeight: 400 }}>%</span>
            </Typography>
            <Typography sx={{ fontSize: '.65rem', color: colors.textMuted, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {disk.available} {t('disk.card.free')} · {disk.size}
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', height: 3, bgcolor: `${usageColor}18`, borderRadius: 10 }}>
            <Box sx={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${Math.min(disk.used, 100)}%`,
              bgcolor: usageColor, borderRadius: 10,
              boxShadow: mode === 'dark' ? `0 0 6px ${usageColor}60` : 'none',
              transition: 'width 600ms ease',
            }} />
          </Box>
        </Box>

        <Box sx={{
          px: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          borderLeft: `1px solid ${colors.surfaceBorder}`,
          minWidth: 56,
        }}>
          <Thermometer size={13} color={tempColor} style={{ opacity: 0.8, marginBottom: 1 }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color: tempColor }}>
            {displayTemp}
          </Typography>
        </Box>

        <Box sx={{
          px: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          borderLeft: `1px solid ${colors.surfaceBorder}`,
          minWidth: 44,
        }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%',
            bgcolor: hasActivity ? colors.cyan : `${colors.textMuted}30`,
            boxShadow: hasActivity && mode === 'dark' ? `0 0 8px ${colors.cyan}` : 'none',
            mb: 0.5,
            animation: hasActivity ? 'pulse 1.5s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.3 },
            }
          }} />
          <Typography sx={{ fontSize: '0.5rem', color: colors.textMuted, opacity: 0.45, letterSpacing: 0.3 }}>
            I/O
          </Typography>
        </Box>

        <Box sx={{
          px: 1, display: 'flex', alignItems: 'center',
          color: colors.textMuted, opacity: 0.45,
        }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Box>
      </Box>

      <Collapse in={expanded} timeout={200} unmountOnExit>
        <Box sx={{
          borderTop: `1px solid ${colors.surfaceBorder}`,
          px: 1, py: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 1,
        }}>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{
                width: 5, height: 5, borderRadius: '50%',
                bgcolor: isReading ? colors.cyan : `${colors.textMuted}30`,
                boxShadow: isReading && mode === 'dark' ? `0 0 5px ${colors.cyan}` : 'none',
              }} />
              <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted, opacity: 0.55, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {t('disk.card.read')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: isReading ? colors.cyan : colors.textMuted, opacity: isReading ? 1 : 0.4 }}>
              {disk.readIO}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{
                width: 5, height: 5, borderRadius: '50%',
                bgcolor: isWriting ? colors.orange : `${colors.textMuted}30`,
                boxShadow: isWriting && mode === 'dark' ? `0 0 5px ${colors.orange}` : 'none',
              }} />
              <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted, opacity: 0.55, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {t('disk.card.write')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: isWriting ? colors.orange : colors.textMuted, opacity: isWriting ? 1 : 0.4 }}>
              {disk.writeIO}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Thermometer size={11} color={colors.textMuted} style={{ opacity: 0.55 }} />
              <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted, opacity: 0.55, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {t('disk.card.temp')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: tempColor }}>
              {displayTemp}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ShieldCheck size={11} color={colors.textMuted} style={{ opacity: 0.55 }} />
              <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted, opacity: 0.55, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {t('disk.card.health')}
              </Typography>
            </Box>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.25, borderRadius: 1,
              bgcolor: mode === 'dark' ? `${colors.green}12` : `${colors.green}06`,
              border: `1px solid ${mode === 'dark' ? `${colors.green}25` : `${colors.green}12`}`,
              width: 'fit-content',
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: colors.green, boxShadow: mode === 'dark' ? `0 0 5px ${colors.green}` : 'none' }} />
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.green }}>
                {disk.status}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontSize: '0.55rem', color: colors.textMuted, opacity: 0.55, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {t('disk.card.type')}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: colors.textMuted, opacity: 0.7 }}>
              {disk.type}
            </Typography>
            {disk.interfaceType && (
              <Typography sx={{ fontSize: '0.6rem', color: colors.textMuted, opacity: 0.5, fontFamily: 'monospace' }}>
                {disk.interfaceType}
              </Typography>
            )}
          </Box>

        </Box>
      </Collapse>
    </Paper>
  );
};