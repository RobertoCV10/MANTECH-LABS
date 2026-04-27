import { Typography, Box, Paper } from '@mui/material';
import { DiskCard } from '../components/DiskCard';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const DiskView = ({ disks = [] }: { disks: any[] }) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  const needsAdmin = !disks.some(
    d => d.temp !== null && d.temp !== undefined && d.temp !== 0 && d.temp !== '--'
  );

  const totalDisks  = disks.length;
  const criticalCount = disks.filter(d => d.used > 90).length;
  const warningCount  = disks.filter(d => d.used > 70 && d.used <= 90).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Box sx={{ borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HardDrive size={12} color={colors.textMuted} />
            <Typography sx={{ fontSize: '0.62rem', letterSpacing: 2.5, color: colors.textMuted, opacity: 0.45, textTransform: 'uppercase' }}>
              {t('disk.title')}
            </Typography>
          </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.6rem', color: colors.textMuted, opacity: 0.45 }}>
            {totalDisks} {totalDisks === 1 ? 'unidad' : 'unidades'}
          </Typography>
          {criticalCount > 0 && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.25, borderRadius: 1,
              bgcolor: mode === 'dark' ? `${colors.red}12` : `${colors.red}08`,
              border: `1px solid ${mode === 'dark' ? `${colors.red}25` : `${colors.red}15`}`,
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              }
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: colors.red, boxShadow: mode === 'dark' ? `0 0 5px ${colors.red}` : 'none' }} />
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: colors.red }}>
                {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          {warningCount > 0 && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.25, borderRadius: 1,
              bgcolor: mode === 'dark' ? `${colors.orange}12` : `${colors.orange}08`,
              border: `1px solid ${mode === 'dark' ? `${colors.orange}25` : `${colors.orange}15`}`,
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              }
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: colors.orange }} />
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: colors.orange }}>
                {warningCount} alerta{warningCount > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>
        </Box>
      </Box>

      {needsAdmin && (
        <Paper sx={{
          px: 2, py: 1, borderRadius: 1,
          bgcolor: mode === 'dark' ? `${colors.orange}10` : `${colors.orange}06`,
          border: `1px solid ${mode === 'dark' ? `${colors.orange}25` : `${colors.orange}12`}`,
          display: 'flex', alignItems: 'center', gap: 1.5,
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          }
        }}>
          <AlertTriangle size={13} color={colors.orange} style={{ opacity: 0.8 }} />
          <Typography sx={{ fontSize: '0.7rem', color: colors.orange, fontWeight: 600 }}>
            {t('common.admin_required')}
          </Typography>
        </Paper>
      )}

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 2,
        overflowY: 'auto',
        alignItems: 'start',
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: `${colors.cyan}20`, borderRadius: 1
        },
      }}>
        {disks.map((disk) => (
          <DiskCard
            key={disk.fs}
            disk={disk}
            defaultExpanded={false}
          />
        ))}
      </Box>

    </Box>
  );
};
