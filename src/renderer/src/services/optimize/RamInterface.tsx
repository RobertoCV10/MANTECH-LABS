//src/renderer/src/services/optimize/RamInterface.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotify } from '../../hooks/useNotify';
import { Box, Typography, Button, Alert } from '@mui/material';
import Grid from '@mui/material/Grid'; 
import { Play, Zap, Activity, History, ShieldCheck } from 'lucide-react';
import { QuickIndicators } from './ram/QuickIndicators';
import { SentinelControl } from './ram/SentinelControl';
import { ActionHistory } from './ram/ActionHistory';

const MEASUREMENT_DELAY = 2500;
const MAX_LOG_ENTRIES = 15;

interface ActionLog {
  id: number;
  type: 'standby' | 'working-set' | 'sentinel';
  label: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  before: RamSnapshot;
  after: RamSnapshot | null;
  savedGB?: number;
}

interface RamSnapshot {
  active: number;
  cache: number;
  workingSet: number;
  available: number;
}

export const RamInterface = () => {
  const { colors } = useThemeMode();
  const { t } = useLanguage();
  
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [threshold, setThreshold] = useState(80);
  const [isValidated, setIsValidated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ramPct, setRamPct] = useState(0);
  const [ramDetails, setRamDetails] = useState<RamSnapshot & { total: number }>({
    total: 0, active: 0, cache: 0, workingSet: 0, available: 0
  });
  const [status, setStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    standby: 'idle', 'working-set': 'idle',
  });
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);

  const notify = useNotify();
  const ramRef = useRef(ramDetails);
  const logCounter = useRef(0);

  useEffect(() => {
    ramRef.current = ramDetails;
  }, [ramDetails]);

  const getRamSnapshot = useCallback((): RamSnapshot => ({
    active: ramRef.current?.active ?? 0,
    cache: ramRef.current?.cache ?? 0,
    workingSet: ramRef.current?.workingSet ?? 0,
    available: ramRef.current?.available ?? 0,
  }), []);

  const syncGlobalSavings = useCallback(async (saved: number) => {
    if (saved > 0.001 && window.api) {
      try {
        await window.api.invoke('add-to-total-saved', saved);
      } catch (err) {
        console.error("Error al actualizar historial global:", err);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (!window.api) return;
      try {
        const config = await window.api.invoke<any>('get-sentinel-config');
        if (active && config) {
          setAutoOptimize(config.enabled ?? false);
          setThreshold(config.threshold ?? 80);
          setIsValidated(config.validated ?? false);
          setTimeout(() => { setIsLoaded(true); }, 150);
        }
      } catch (err) {
        console.error('[RamInterface] Failed to load config:', err);
      }
    };
    init();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.api) return;
    window.api.sendConfig('update-sentinel-config', {
      enabled: autoOptimize,
      threshold: threshold
    });
  }, [autoOptimize, threshold, isLoaded]);

  const handleConfirmSentinel = async () => {
    setIsSaving(true);
    try {
      const result = await window.api.invoke<any>('confirm-sentinel-setup', {
        enabled: autoOptimize,
        threshold: threshold
      });
      if (result?.success) {
        setIsValidated(true);
        notify.success(t('ram.sentinel_saved'));
      } else {
        setIsValidated(false);
        setAutoOptimize(false);
      }
    } catch (err) {
      setIsValidated(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptimize = async (type: 'standby' | 'working-set') => {
    if (status[type] === 'loading' || !window.api) return;
    const opId = ++logCounter.current;
    const before = getRamSnapshot();
    const label = type === 'standby' ? t('ram.standby_label') : t('ram.working_label');
    setStatus(prev => ({ ...prev, [type]: 'loading' }));
    setActionLog(prev => [{
      id: opId, type, label, before, after: null,
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending'
    }, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
    try {
      const response = await window.api.ramOptimize(type);
      if (!response.success) throw new Error(response.error);
      setStatus(prev => ({ ...prev, [type]: 'success' }));
      setTimeout(async () => {
        const after = getRamSnapshot();
        let saved = (type === 'standby') ? before.cache - after.cache : before.workingSet - after.workingSet;
        setActionLog(prev => prev.map(log => log.id === opId ? { 
          ...log, after, status: 'success', savedGB: saved > 0 ? saved : 0 
        } : log));
        await syncGlobalSavings(saved);
      }, MEASUREMENT_DELAY);
    } catch (err: any) {
      setStatus(prev => ({ ...prev, [type]: 'error' }));
      setActionLog(prev => prev.map(log => log.id === opId ? { ...log, status: 'error' } : log));
      notify.error(t('ram.operation_failed') + `: ${err.message}`);
    } finally {
      setTimeout(() => setStatus(prev => ({ ...prev, [type]: 'idle' })), 3000);
    }
  };

  useEffect(() => {
    if (!window.api) return;
    const unsubscribe = window.api.onSentinelAction(() => {
      const opId = ++logCounter.current;
      const before = getRamSnapshot();
      notify.success(t('ram.sentinel_optimized'));
      setActionLog(prev => [{
        id: opId, type: 'sentinel', label: t('ram.sentinel_auto'),
        before, after: null, timestamp: new Date().toLocaleTimeString(), status: 'pending'
      }, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
      setTimeout(async () => {
        const after = getRamSnapshot();
        const saved = (before.cache + before.workingSet) - (after.cache + after.workingSet);
        setActionLog(prev => prev.map(log => log.id === opId ? { ...log, after, status: 'success', savedGB: saved > 0 ? saved : 0 } : log));
        await syncGlobalSavings(saved);
      }, MEASUREMENT_DELAY);
    });
    return () => unsubscribe();
  }, [getRamSnapshot, syncGlobalSavings]);

  useEffect(() => {
    if (!window.api) return;
    const unsubscribe = window.api.onUpdateHardware((data: any) => {
      setRamPct(Math.round(data.ram));
      if (data.ramDetails) setRamDetails(data.ramDetails);
    });
    return () => unsubscribe();
  }, []);

  const ramColor = useMemo(() => {
    if (ramPct >= threshold) return colors.red;
    if (ramPct > 70) return colors.orange;
    return colors.green;
  }, [ramPct, threshold, colors]);

  const fmtGB = (n: number) => `${n.toFixed(1)}\u00A0GB`;

  if (!window.api) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Alert severity="error">{t('ram.ipc_error')}</Alert>
    </Box>
  );

  return (
    <Grid container spacing={2.5} sx={{ height: '100%', animation: 'fadeIn 0.3s ease-in' }}>
      
      {/* LEFT: Telemetry & Controls (70%) */}
      <Grid size={{ xs: 12, md: 7, lg: 7 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '540px', overflow: 'hidden' }}>
          
          {/* Real-Time Telemetry Card */}
          <Box sx={{ 
            p: 2.5, borderRadius: 1.5, 
            bgcolor: 'rgba(255,255,255,0.02)', 
            border: `1px solid ${colors.surfaceBorder}`,
            transition: 'all 0.2s ease-out'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} color={colors.cyan} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.5px', color: colors.textMuted }}>
                  REAL-TIME TELEMETRY
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ 
                color: ramColor, 
                fontWeight: 700, 
                fontSize: '0.8rem', 
                letterSpacing: '0.3px',
                padding: '4px 12px',
                borderRadius: '4px',
                backgroundColor: `${ramColor}15`
              }}>
                {ramPct}% LOAD
              </Typography>
            </Box>

            <QuickIndicators
              activeGB={fmtGB(ramDetails.active)}
              cacheGB={fmtGB(ramDetails.cache)}
              ramColor={ramColor}
            />
          </Box>

          {/* Manual Intervention Section */}
          <Box>
            <Typography variant="caption" sx={{ 
              color: colors.textSubtle, 
              fontWeight: 600, 
              fontSize: '0.75rem',
              letterSpacing: '0.4px',
              mb: 1.25, 
              display: 'block', 
              textTransform: 'uppercase'
            }}>
              MANUAL INTERVENTION
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                fullWidth variant="contained"
                startIcon={status.standby === 'loading' ? <Activity className="spin" size={16} /> : <Zap size={16} />}
                onClick={() => handleOptimize('standby')}
                disabled={status.standby !== 'idle'}
                sx={{ 
                  py: 1.75, 
                  borderRadius: 1.25, 
                  bgcolor: `${colors.green}18`, 
                  color: colors.green, 
                  border: `1px solid ${colors.green}35`,
                  textTransform: 'uppercase', 
                  fontSize: '0.7rem', 
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  transition: 'all 0.2s ease-out',
                  '&:hover:not(:disabled)': {
                    bgcolor: `${colors.green}25`,
                    borderColor: `${colors.green}50`
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                {status.standby === 'loading' ? t('ram.cleaning') : t('ram.standby_label')}
              </Button>
              <Button
                fullWidth variant="outlined"
                startIcon={status['working-set'] === 'loading' ? <Activity className="spin" size={16} /> : <Play size={16} />}
                onClick={() => handleOptimize('working-set')}
                disabled={status['working-set'] !== 'idle'}
                sx={{ 
                  py: 1.75, 
                  borderRadius: 1.25, 
                  borderColor: colors.surfaceBorder, 
                  color: colors.textMuted, 
                  textTransform: 'uppercase', 
                  fontSize: '0.7rem', 
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  transition: 'all 0.2s ease-out',
                  '&:hover:not(:disabled)': {
                    borderColor: colors.cyan,
                    color: colors.cyan,
                    bgcolor: `${colors.cyan}08`
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                {status['working-set'] === 'loading' ? t('ram.trimming') : t('ram.working_label')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* RIGHT: Sentinel & Logs (30%) */}
      <Grid size={{ xs: 12, md: 5 }} sx={{ height: '580px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'hidden' }}>
          
          {/* Sentinel Engine Card */}
          <Box sx={{ 
            p: 2.5, 
            borderRadius: 1.5, 
            bgcolor: 'rgba(255,255,255,0.015)', 
            border: `1px solid ${colors.surfaceBorder}`,
            transition: 'all 0.2s ease-out'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} color={colors.orange} />
              </Box>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                fontSize: '0.8125rem',
                letterSpacing: '0.5px',
                color: colors.orange 
              }}>
                SENTINEL ENGINE
              </Typography>
            </Box>
            <SentinelControl
              autoOptimize={autoOptimize} onAutoOptimizeChange={setAutoOptimize}
              threshold={threshold} onThresholdChange={setThreshold}
              isValidated={isValidated} isSaving={isSaving} onConfirm={handleConfirmSentinel}
            />
          </Box>

          {/* Action Logs */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
              <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={15} color={colors.textSubtle} />
              </Box>
              <Typography variant="caption" sx={{ 
                fontWeight: 600, 
                fontSize: '0.75rem',
                letterSpacing: '0.4px',
                color: colors.textSubtle, 
                textTransform: 'uppercase' 
              }}>
                Action Logs
              </Typography>
            </Box>
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              borderRadius: 1.25, 
              mb: 22,
              border: `1px solid ${colors.surfaceBorder}`, 
              bgcolor: 'rgba(0,0,0,0.15)',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: `${colors.textMuted}20`,
                borderRadius: '3px',
                '&:hover': {
                  bgcolor: `${colors.textMuted}35`
                }
              }
            }}>
              <ActionHistory logs={actionLog} />
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};