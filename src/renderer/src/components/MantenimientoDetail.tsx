/**
 * @file MantenimientoDetail.tsx
 * @description Modal profesional de mantenimiento con checklist sincronizado,
 * sistema de reinicio de ciclo y playlist de tutoriales.
 */
import { useState, useMemo, useEffect } from 'react';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Dialog, DialogContent, IconButton, Typography, Box, 
  Button, Checkbox, Paper, Fade, Stack, Grid
} from '@mui/material';
import { X, AlertTriangle, CheckCircle, PlayCircle, ExternalLink, Calendar, Clock } from 'lucide-react';

// --- Interfaces ---

export interface MaintenanceVideo {
  titulo: string;
  video_id: string;
  start_time?: string;
  end_time?: string;
  youtube_search_query: string;
}

export interface Mantenimiento {
  id: string;
  nombre: string;
  descripcion: string;
  frecuencia: string;
  nivel: 'facil' | 'medio' | 'dificil';
  advertencias: string[];
  checklist: string[];
  videos: MaintenanceVideo[];
}

export interface MantenimientoDetailProps {
  mantenimiento: Mantenimiento | null;
  open: boolean;
  onClose: () => void;
  onComplete: (id: string, completedChecklist: boolean[]) => Promise<void>;
  onFinalize: (id: string, completedChecklist: boolean[]) => Promise<void>;
  onReset: (id: string) => void;
  completedChecklist?: boolean[];
  lastCompleted?: string | null;
}

// --- Helpers ---

const extractVideoId = (input: string): string | null => {
  if (!input || input === 'VIDEO_ID_AQUI') return null;
  const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : (input.length === 11 ? input : null);
};

const parseTimeToSeconds = (timeString?: string): number => {
  if (!timeString) return 0;
  const parts = timeString.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

// --- Componente Principal ---

export const MantenimientoDetail = ({
  mantenimiento,
  open,
  onClose,
  onComplete,
  onFinalize,
  onReset,
  completedChecklist = [],
  lastCompleted
}: MantenimientoDetailProps) => {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();

  const COLORS = {
    facil:      colors.green,
    medio:      colors.orange,
    dificil:    colors.red,
    accent:     colors.cyan,
    background: mode === 'dark' ? '#000000' : '#f3f4f6',
    paper:      colors.surface,
    border:     colors.surfaceBorder,
  };

  useEffect(() => {
    if (mantenimiento && open) {
      const initialState = completedChecklist.length === mantenimiento.checklist.length
        ? completedChecklist 
        : new Array(mantenimiento.checklist.length).fill(false);
      setCheckedItems(initialState);
      setSelectedVideoIndex(0);
    }
  }, [mantenimiento, open, completedChecklist]);

  const formatLastCompletedDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const allCompleted = useMemo(() => 
    checkedItems.length > 0 && checkedItems.every(Boolean), 
    [checkedItems]
  );

  if (!mantenimiento) return null;

  const handleCheckboxChange = async (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
    setIsSaving(true);
    try {
      await onComplete(mantenimiento.id, newChecked);
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  const handleFinalize = async () => {
    if (!allCompleted) return;
    const allTrue = new Array(mantenimiento.checklist.length).fill(true);
    setIsSaving(true);
    try {
      await onFinalize(mantenimiento.id, allTrue);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm(t('maintenance.detail.reset_confirm'))) {
      onReset(mantenimiento.id);
      onClose();
    }
  };

  const currentVideo = mantenimiento.videos[selectedVideoIndex];
  const videoId = extractVideoId(currentVideo?.video_id || '');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: COLORS.background,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '20px',
          backgroundImage: 'none',
          boxShadow: mode === 'dark' ? '0 24px 48px rgba(0,0,0,0.8)' : '0 12px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(12px)',
        }
      }}
    >
      {/* HEADER */}
      <Box sx={{ 
        p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.paper,
      }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              width: 6, height: 24, borderRadius: 2,
              bgcolor: COLORS[mantenimiento.nivel],
              boxShadow: `0 0 12px ${COLORS[mantenimiento.nivel]}50`,
            }} />
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: -0.5 }}>
              {t(mantenimiento.nombre)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS[mantenimiento.nivel], letterSpacing: 1, textTransform: 'uppercase' }}>
              {t(`maintenance.nivel.${mantenimiento.nivel}`)}
            </Typography>
            <Typography sx={{ color: colors.textMuted }}>•</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.accent }}>
              <Calendar size={14} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {t(mantenimiento.frecuencia)}
              </Typography>
            </Box>
            {lastCompleted && (
              <>
                <Typography sx={{ color: colors.textMuted }}>•</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.green }}>
                  <CheckCircle size={14} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {formatLastCompletedDate(lastCompleted)}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isSaving && <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 600 }}>{t('maintenance.detail.saving')}</Typography>}
          <IconButton onClick={onClose} sx={{ bgcolor: `${colors.surfaceBorder}`, borderRadius: '10px', '&:hover': { bgcolor: `${colors.red}20`, color: colors.red } }}>
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <DialogContent sx={{ p: 0, overflowX: 'hidden' }}>
        <Grid container sx={{ minHeight: '600px' }}>
          
          {/* COLUMNA IZQUIERDA (70%) */}
          <Grid size={{ xs: 12, lg: 8 }} sx={{ p: 3, borderRight: { lg: `1px solid ${COLORS.border}` } }}>
            
            {/* Layout de Video + Playlist a la derecha */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Reproductor (8/12) */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ 
                  position: 'relative', 
                  paddingTop: '56.25%', // Relación 16:9 real
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  bgcolor: '#000',
                  border: `1px solid ${colors.surfaceBorder}`,
                  boxShadow: mode === 'dark' ? `0 10px 30px rgba(0,0,0,0.5)` : '0 10px 20px rgba(0,0,0,0.05)',
                }}>
                  {videoId ? (
                    <iframe
                      key={`${mantenimiento.id}-${selectedVideoIndex}`}
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${parseTimeToSeconds(currentVideo.start_time)}&rel=0&origin=https://www.youtube-nocookie.com`}
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                      <PlayCircle size={48} color="rgba(255,255,255,0.1)" />
                      <Button sx={{ color: COLORS.accent, mt: 2 }} onClick={() => window.open(`https://www.youtube.com/results?search_query=${currentVideo.youtube_search_query}`)}>
                        {t('maintenance.detail.open_youtube')} <ExternalLink size={14} style={{ marginLeft: 8 }}/>
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Grid>

              {/* Playlist Vertical (4/12) */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.textMuted, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('maintenance.detail.video_guides')}
                  </Typography>
                  <Stack 
                    spacing={1} 
                    sx={{ 
                      overflowY: 'auto', 
                      maxHeight: { md: '300px', lg: '400px' },
                      pr: 0.5,
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: colors.surfaceBorder, borderRadius: 2 }
                    }}
                  >
                    {mantenimiento.videos.map((video, idx) => (
                      <Paper
                        key={idx}
                        onClick={() => setSelectedVideoIndex(idx)}
                        sx={{
                          p: 1.5, cursor: 'pointer', borderRadius: '12px',
                          bgcolor: selectedVideoIndex === idx ? colors.cyanDim : COLORS.paper,
                          border: `1px solid ${selectedVideoIndex === idx ? colors.cyanBorder : colors.surfaceBorder}`,
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: `${colors.cyan}0D`, borderColor: `${colors.cyan}30` },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ position: 'relative', display: 'flex' }}>
                            <PlayCircle size={18} color={selectedVideoIndex === idx ? COLORS.accent : colors.textMuted} />
                          </Box>
                          <Typography sx={{ 
                            fontSize: '0.75rem', 
                            fontWeight: selectedVideoIndex === idx ? 700 : 500, 
                            color: selectedVideoIndex === idx ? COLORS.accent : colors.textSubtle,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>
                            {t(video.titulo)}
                          </Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {/* Descripción y Advertencias */}
            <Box sx={{ bgcolor: COLORS.paper, borderRadius: '16px', p: 3, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.6, color: colors.textMuted, mb: 3 }}>
                {t(mantenimiento.descripcion)}
              </Typography>
              {mantenimiento.advertencias.length > 0 && (
                <Box sx={{ p: 2, bgcolor: `${colors.orange}0D`, border: `1px solid ${colors.orange}35`, borderRadius: '12px' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <AlertTriangle size={18} color={COLORS.medio} />
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.medio }}>
                      {t('maintenance.detail.security_warnings')}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    {mantenimiento.advertencias.map((adv, i) => (
                      <Typography key={i} sx={{ fontSize: '0.8rem', color: colors.textMuted }}>• {t(adv)}</Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </Grid>

          {/* COLUMNA DERECHA (30%): CHECKLIST */}
          <Grid size={{ xs: 12, lg: 4 }} sx={{ bgcolor: mode === 'dark' ? '#050505' : '#fafafa', position: 'relative' }}>
            <Box sx={{ position: 'sticky', top: 0, p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: colors.textMuted }}>{t('maintenance.detail.steps_to_follow')}</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: COLORS.accent }}>{checkedItems.filter(Boolean).length} / {checkedItems.length}</Typography>
                </Box>
                <Box sx={{ height: '6px', bgcolor: colors.surfaceBorder, borderRadius: 10, overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%', width: `${(checkedItems.filter(Boolean).length / checkedItems.length) * 100}%`,
                    bgcolor: allCompleted ? colors.green : colors.cyan, borderRadius: 10, transition: 'width 0.4s ease',
                  }} />
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ overflowY: 'auto', flexGrow: 1, pr: 1, '&::-webkit-scrollbar': { width: '4px' } }}>
                {mantenimiento.checklist.map((step, index) => (
                  <Paper
                    key={index}
                    onClick={() => handleCheckboxChange(index)}
                    sx={{
                      p: 2, cursor: 'pointer', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      bgcolor: checkedItems[index] ? `${colors.green}0D` : COLORS.paper,
                      border: `1px solid ${checkedItems[index] ? `${colors.green}30` : colors.surfaceBorder}`,
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: checkedItems[index] ? `${colors.green}15` : `${colors.cyan}0D` },
                    }}
                  >
                    <Checkbox checked={checkedItems[index] || false} sx={{ p: 0, color: colors.surfaceBorder, '&.Mui-checked': { color: colors.green } }} />
                    <Typography sx={{ 
                      fontSize: '0.8125rem', lineHeight: 1.4, color: checkedItems[index] ? colors.textMuted : colors.textSubtle, 
                      textDecoration: checkedItems[index] ? 'line-through' : 'none', mt: 0.2
                    }}>
                      {t(step)}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${COLORS.border}` }}>
                {allCompleted ? (
                  <Fade in={allCompleted}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: colors.textMuted, mb: 2 }}>
                        {lastCompleted ? `${t('maintenance.detail.last_completion')}: ${formatLastCompletedDate(lastCompleted)}` : t('maintenance.detail.schedule_next')}
                      </Typography>
                      <Button variant="contained" fullWidth onClick={handleFinalize} disabled={isSaving} sx={{ py: 1.5, borderRadius: '12px', bgcolor: COLORS.facil, color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#32e612' } }}>
                        {isSaving ? t('maintenance.detail.saving') : t('maintenance.detail.finalize_button')}
                      </Button>
                      {lastCompleted && (
                        <Button variant="outlined" fullWidth onClick={handleReset} disabled={isSaving} sx={{ mt: 1.5, borderRadius: '12px', color: colors.red, border: `1px solid ${colors.red}50`, '&:hover': { bgcolor: `${colors.red}15`, border: `1px solid ${colors.red}` } }}>
                          {t('maintenance.detail.reset_protocol')}
                        </Button>
                      )}
                    </Box>
                  </Fade>
                ) : (
                  <Box sx={{ p: 2, bgcolor: `${colors.orange}0A`, border: `1px dashed ${colors.orange}40`, borderRadius: '12px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: COLORS.medio }}>{mantenimiento.checklist.length - checkedItems.filter(Boolean).length} {t('maintenance.detail.steps_remaining')}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textMuted, mt: 0.5 }}>{t('maintenance.detail.complete_all_steps')}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

        </Grid>
      </DialogContent>
    </Dialog>
  );
};