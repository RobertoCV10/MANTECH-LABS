//src/renderer/src/components/settings/StatsSection.tsx
import { Typography, Box, Stack, Button, alpha } from '@mui/material';
import { BarChart3, Database, Trash2, ChevronRight, RotateCcw } from 'lucide-react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SettingsCard } from './SettingsCard';

interface StatsSectionProps {
  totalSaved: number;
  totalTempCleaned: number;
  resetRam: boolean;
  setResetRam: (val: boolean) => void;
  resetTemp: boolean;
  setResetTemp: (val: boolean) => void;
  onResetTotals: () => void;
}

const MetricDisplay = ({ 
  icon, label, value, unit, color, selected, onToggle 
}: { 
  icon: React.ReactNode; label: string; value: number; unit: string;
  color: string; selected: boolean; onToggle: () => void;
}) => {
  const { mode, colors } = useThemeMode();
  // Ajustamos el maxValue dinámicamente o lo dejamos estático para el diseño
  const maxValue = 100; 
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <Box 
      onClick={onToggle}
      sx={{
        p: 2, borderRadius: '10px',
        bgcolor: selected ? alpha(color, 0.08) : (mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'),
        border: `1px solid ${selected ? alpha(color, 0.4) : colors.surfaceBorder}`,
        cursor: 'pointer',
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: alpha(color, 0.6),
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark' ? `0 6px 20px rgba(0,0,0,0.4)` : '0 4px 12px rgba(0,0,0,0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{ color: selected ? color : colors.textMuted, opacity: 0.8, display: 'flex' }}>{icon}</Box>
        <Typography sx={{ 
          fontSize: '0.62rem', 
          color: colors.textMuted, 
          fontWeight: 700, 
          letterSpacing: 1, 
          textTransform: 'uppercase' 
        }}>
          {label}
        </Typography>
      </Box>

      <Typography sx={{ 
        fontSize: '1.4rem', 
        fontWeight: 800, 
        color: selected ? colors.textMuted : colors.textMuted, // textMuted si no está seleccionado
        letterSpacing: -0.5,
        lineHeight: 1,
        mb: 1
      }}>
        {value.toFixed(1)}
        <span style={{ fontSize: '0.7rem', marginLeft: 4, opacity: 0.5, fontWeight: 400 }}>{unit}</span>
      </Typography>

      {/* Mini Progress bar sutil */}
      <Box sx={{ width: '100%', height: 2, bgcolor: alpha(colors.textMuted, 0.1), borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ 
          width: `${percentage}%`, 
          height: '100%', 
          bgcolor: color, 
          transition: 'width 1s ease-in-out' 
        }} />
      </Box>
    </Box>
  );
};

export const StatsSection = ({
  totalSaved, totalTempCleaned, resetRam, setResetRam, resetTemp, setResetTemp, onResetTotals
}: StatsSectionProps) => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const hasSelection = resetRam || resetTemp;

  return (
    <SettingsCard
      title={t('settings.stats_section.title')}
      icon={<BarChart3 size={16} />}
      accentColor={colors.cyan}
    >
      <Stack spacing={2.5} sx={{ height: '100%', justifyContent: 'space-between' }}>
        <Typography sx={{ 
          fontSize: '0.78rem', 
          color: colors.textMuted, 
          opacity: 0.8, 
          lineHeight: 1.6 
        }}>
          {t('settings.stats_section.description')}
        </Typography>

        {/* Metrics Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <MetricDisplay
            icon={<Database size={14} />}
            label={t('settings.stats_section.ram_saved')}
            value={totalSaved}
            unit="GB"
            color={colors.green}
            selected={resetRam}
            onToggle={() => setResetRam(!resetRam)}
          />
          <MetricDisplay
            icon={<Trash2 size={14} />}
            label={t('settings.stats_section.temp_cleaned')}
            value={totalTempCleaned}
            unit="GB"
            color={colors.cyan}
            selected={resetTemp}
            onToggle={() => setResetTemp(!resetTemp)}
          />
        </Box>

        {/* Action Button: Estilo Action Bar para consistencia */}
        <Button
          fullWidth
          variant="outlined"
          disabled={!hasSelection}
          onClick={onResetTotals}
          endIcon={<ChevronRight size={14} style={{ opacity: 0.5 }} />}
          sx={{
            py: 1.2,
            px: 2,
            borderRadius: '8px',
            textTransform: 'none',
            justifyContent: 'space-between',
            bgcolor: hasSelection 
              ? (mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)')
              : 'transparent',
            borderColor: hasSelection ? colors.surfaceBorder : alpha(colors.surfaceBorder, 0.5),
            color: hasSelection ? colors.textMuted : alpha(colors.textMuted, 0.4),
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 200ms ease',
            '&:hover': {
              bgcolor: alpha(colors.cyan, 0.08),
              borderColor: alpha(colors.cyan, 0.4),
              color: colors.cyan,
              transform: 'translateY(-1px)',
              '& .lucide': { opacity: 1, color: colors.cyan }
            },
            '&.Mui-disabled': {
              borderColor: alpha(colors.surfaceBorder, 0.3),
              color: alpha(colors.textMuted, 0.3),
            }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <RotateCcw size={16} />
            <Typography variant="inherit">
              {t('settings.stats_section.button')}
            </Typography>
          </Stack>
        </Button>
      </Stack>
    </SettingsCard>
  );
};