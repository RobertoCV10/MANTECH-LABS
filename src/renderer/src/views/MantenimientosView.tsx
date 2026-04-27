import { useState } from 'react';
import { Box, Typography, Grid, Button, Paper, Fade, Stack, alpha } from '@mui/material';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Play, Clock, CheckCircle2, AlertCircle, Calendar, Wrench, ChevronRight } from 'lucide-react';
import { MantenimientoCard } from '../components/MantenimientoCard';
import { MantenimientoDetail } from '../components/MantenimientoDetail';
import { useMantenimiento } from '../hooks/useMantenimiento';
import mantenimientosJSON from '../data/mantenimientos.json';

export const MantenimientosView = () => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const { mantenimientos, proximoMantenimiento, stats, updateProgress, resetProgress, loading, userProgress } = useMantenimiento(mantenimientosJSON.mantenimientos);
  
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (m: any) => {
    setSelectedMantenimiento(m);
    setIsModalOpen(true);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Typography sx={{ color: colors.textMuted, opacity: 0.3, letterSpacing: 2, fontWeight: 700 }}>
        {t('maintenance.loading')}...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      maxWidth: 1100, 
      height: '670px', 
      gap: 3,
      px: 1 // Pequeño respiro lateral
    }}>
      
      {/* HEADER & SECCIÓN DE KPIs */}
      <Box sx={{ 
        borderBottom: `1px solid ${colors.surfaceBorder}`, 
        pb: 2.5,
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between',
        flexShrink: 0 
      }}>
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ p: 0.8, bgcolor: alpha(colors.cyan, 0.1), borderRadius: 1, display: 'flex' }}>
               <Wrench size={16} color={colors.cyan} />
            </Box>
            <Typography sx={{ 
              fontSize: '0.65rem', 
              letterSpacing: 3, 
              color: colors.textMuted, 
              fontWeight: 800,
              textTransform: 'uppercase' 
            }}>
              {t('maintenance.title')}
            </Typography>
          </Stack>

        </Stack>

        <Stack direction="row" spacing={1.5}>
          <StatPill icon={<CheckCircle2 size={12} />} value={stats.totalCompletados} label={t('maintenance.kpis.completed')} color={colors.green} />
          <StatPill icon={<AlertCircle size={12} />} value={stats.totalVencidos} label={t('maintenance.kpis.overdue')} color={colors.red} />
          <StatPill icon={<Calendar size={12} />} value={stats.proximos7Dias} label={t('maintenance.kpis.upcoming')} color={colors.cyan} />
        </Stack>
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
        
        <Stack spacing={4}>
          
          {/* HERO: PROTOCOLO PRIORITARIO */}
          {proximoMantenimiento && (
            <Fade in={!loading} timeout={600}>
              <Paper sx={{
                p: 3.5, 
                borderRadius: '16px',
                background: mode === 'dark' 
                  ? `linear-gradient(145deg, ${alpha(colors.cyan, 0.12)} 0%, #080808 100%)`
                  : `linear-gradient(145deg, ${alpha(colors.cyan, 0.05)} 0%, #FFFFFF 100%)`,
                border: `1px solid ${alpha(colors.cyan, 0.3)}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}>
                {/* Decoración HUD */}
                <Box sx={{
                  position: 'absolute', right: -20, top: -20,
                  width: 200, height: 200, borderRadius: '50%',
                  border: `1px dashed ${alpha(colors.cyan, 0.2)}`,
                  animation: 'spin 20s linear infinite',
                  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }
                }} />

                <Stack spacing={2} sx={{ position: 'relative', zIndex: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Clock size={16} color={colors.cyan} />
                    <Typography sx={{ 
                      fontSize: '0.7rem', fontWeight: 900, letterSpacing: 2.5, 
                      color: colors.cyan, textTransform: 'uppercase' 
                    }}>
                      {t('maintenance.hero.priority_action')}
                    </Typography>
                  </Stack>

                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: -1 }}>
                      {t(proximoMantenimiento.nombre)}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '0.9rem', color: colors.textMuted, 
                      lineHeight: 1.6, maxWidth: '650px', mb: 3 
                    }}>
                      {t(proximoMantenimiento.descripcion)}
                    </Typography>
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Button
                      variant="contained"
                      endIcon={<ChevronRight size={16} />}
                      onClick={() => handleOpenDetail(proximoMantenimiento)}
                      sx={{
                        bgcolor: colors.cyan,
                        color: 'colors.sidebarBg',
                        fontWeight: 900,
                        px: 4, py: 1.5,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: colors.cyan, filter: 'brightness(1.1)' }
                      }}
                    >
                      {t('maintenance.hero.start_protocol')}
                    </Button>

                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      px: 2, py: 1, borderRadius: '8px',
                      bgcolor: alpha(proximoMantenimiento.diasRestantes <= 0 ? colors.red : colors.green, 0.1),
                      border: `1px solid ${alpha(proximoMantenimiento.diasRestantes <= 0 ? colors.red : colors.green, 0.2)}`,
                    }}>
                      <Box sx={{ 
                        width: 8, height: 8, borderRadius: '50%', 
                        bgcolor: proximoMantenimiento.diasRestantes <= 0 ? colors.red : colors.green,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.4 }, '100%': { opacity: 1 } }
                      }} />
                      <Typography sx={{
                        fontSize: '0.75rem', fontWeight: 800,
                        color: proximoMantenimiento.diasRestantes <= 0 ? colors.red : colors.green,
                      }}>
                        {proximoMantenimiento.diasRestantes <= 0
                          ? t('maintenance.hero.immediate_attention')
                          : `${proximoMantenimiento.diasRestantes} ${t('maintenance.hero.days_to_expiry')}`}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* GRID DE PROTOCOLOS */}
          <Box>
            <Typography sx={{ 
              fontSize: '0.65rem', fontWeight: 900, color: colors.textMuted, 
              mb: 3, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5 
            }}>
              Todos los protocolos registrados
            </Typography>
            
            <Grid container spacing={2.5}>
              {mantenimientos.map((m) => (
                <Grid key={m.id} size={{ xs: 12, md: 6 }}>
                  <MantenimientoCard
                    {...m}
                    onClick={() => handleOpenDetail(m)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

        </Stack>
      </Box>

      {/* MODAL DE DETALLE (Mantiene lógica funcional) */}
      {selectedMantenimiento && (
        <MantenimientoDetail
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mantenimiento={selectedMantenimiento}
          completedChecklist={selectedMantenimiento.currentChecklist}
          lastCompleted={userProgress[selectedMantenimiento.id]?.lastCompleted || null}
          onComplete={async (id: string, checklist: boolean[]) => {
            await updateProgress(id, checklist, false);
          }}
          onFinalize={async (id: string, checklist: boolean[]) => {
            await updateProgress(id, checklist, true);
          }}
          onReset={(id: string) => {
            resetProgress(id);
          }}
        />
      )}
    </Box>
  );
};

// StatPill rediseñado para ser más legible
const StatPill = ({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) => {
  const { mode, colors } = useThemeMode();
  
  return (
    <Box sx={{
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.5,
      px: 1.8, py: 0.8, 
      borderRadius: '10px',
      bgcolor: alpha(color, mode === 'dark' ? 0.08 : 0.04),
      border: `1px solid ${alpha(color, 0.15)}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        bgcolor: alpha(color, 0.12),
        borderColor: alpha(color, 0.3),
      }
    }}>
      <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ 
          fontSize: '0.6rem', fontWeight: 700, 
          color: colors.textSubtle, textTransform: 'uppercase', 
          letterSpacing: 0.5, mt: 0.2 
        }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};