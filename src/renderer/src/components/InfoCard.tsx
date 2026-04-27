import { Paper, Typography, Box, SxProps } from '@mui/material';
import { useThemeMode } from '../theme/ThemeContext';

interface InfoCardProps {
  label:     string;
  value:     number;
  unit?:     string;
  subValue?: string;
  color:     string;
  sx?:       SxProps;  // Add this line
}

export const InfoCard = ({ label, value, unit = '%', subValue, color, sx }: InfoCardProps) => {
  const { mode, colors } = useThemeMode();

  const size     = 160;
  const stroke   = 12;
  const r        = (size - stroke * 2) / 2;
  const cx       = size / 2;
  const cy       = size / 2;
  const startDeg = -220;
  const sweepDeg = 260;
  const clamp    = Math.min(Math.max(value, 0), 100);
  const filled   = (clamp / 100) * sweepDeg;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const arc = (start: number, sweep: number) => {
    const end   = start + sweep;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    return `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  const statusLabel = value > 85 ? 'CRIT' : value > 65 ? 'WARN' : 'OK';
  const statusColor = value > 85 ? colors.red : value > 65 ? colors.orange : colors.green;

  return (
    <Paper sx={{
      p: 2, borderRadius: 2, height: '100%',
      bgcolor: colors.surface,
      border: `1px solid ${colors.surfaceBorder}`,
      display: 'flex', flexDirection: 'column',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
      },
      ...sx
    }}>
      <Typography sx={{
        fontSize: '0.62rem', letterSpacing: 2,
        color: colors.textMuted, opacity: 0.55,
        textTransform: 'uppercase', mb: 2
      }}>
        {label}
      </Typography>

      {/* Gauge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Box sx={{ position: 'relative', width: size, height: size * 0.82 }}>
          <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
            {/* Track */}
            <path
              d={arc(startDeg, sweepDeg)}
              fill="none"
              stroke={mode === 'dark' ? `${color}18` : `${color}25`}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            {/* Active */}
            {clamp > 0 && (
              <path
                d={arc(startDeg, filled)}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                style={{ filter: mode === 'dark' ? `drop-shadow(0 0 6px ${color}90)` : 'none' }}
              />
            )}
          </svg>

          {/* Centro */}
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pt: 4,
            px: '5rem'
          }}>
            {/* Número + % en la misma línea */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
              <Typography sx={{
                fontSize: '2.2rem',
                fontWeight: 900,
                lineHeight: 1,
                color: colors.textMuted,
                letterSpacing: 0,
              }}>
                {value}
              </Typography>
              <Typography sx={{
                fontSize: '0.8rem',
                color: color,
                fontWeight: 600,
                letterSpacing: 1,
              }}>
                {unit}
              </Typography>
            </Box>

            {/* Badge */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.25,
              borderRadius: 1, mt: 2,
              bgcolor: mode === 'dark' ? `${statusColor}18` : `${statusColor}12`,
              border: `1px solid ${mode === 'dark' ? `${statusColor}40` : `${statusColor}25`}`,
            }}>
              <Box sx={{
                width: 6, height: 6,
                borderRadius: '50%',
                bgcolor: statusColor,
                boxShadow: mode === 'dark' ? `0 0 6px ${statusColor}` : 'none'
              }} />
              <Typography sx={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: statusColor,
                letterSpacing: 1.5
              }}>
                {statusLabel}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {subValue && (
        <Typography sx={{
          fontSize: '0.65rem', color: colors.textMuted,
          opacity: 0.55, textAlign: 'center', mt: 1
        }}>
          {subValue}
        </Typography>
      )}
    </Paper>
  );
};