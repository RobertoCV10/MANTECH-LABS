//src/renderer/src/services/optimize/TempInterface.tsx
import { useState, useEffect } from 'react';
import { useThemeMode } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotify } from '../../hooks/useNotify';
import { Box, Typography, Button, Snackbar, Alert, keyframes } from '@mui/material';
import { Trash2, CheckCircle, Shield, Zap, Sparkles } from 'lucide-react';
import { ScanPanel } from './temp/ScanPanel';
import { CleanTargets } from './temp/CleanTargets';

// Animation for a "breathing" border effect
const breathe = keyframes`
  0% { box-shadow: 0 0 0px 0px rgba(255, 119, 34, 0); }
  50% { box-shadow: 0 0 15px 2px rgba(255, 119, 34, 0.15); }
  100% { box-shadow: 0 0 0px 0px rgba(255, 119, 34, 0); }
`;

type ScanTarget = {
  userTemp: boolean;
  winTemp: boolean;
  prefetch: boolean;
  updateCache: boolean;
};

type ScanResult = {
  totalSize: number;
  adminDenied?: boolean;
  details: {
    userTemp?: { size: number; path: string };
    winTemp?: { size: number; path: string };
    prefetch?: { size: number; path: string };
    updateCache?: { size: number; path: string };
  };
};

export const TempInterface = () => {
  const { colors, mode } = useThemeMode();
  const { t } = useLanguage();
  const notify = useNotify();

  // Estados de proceso
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Estados de datos
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [lastCleanedGB, setLastCleanedGB] = useState<number>(0);
  const [requiresAdmin, setRequiresAdmin] = useState(false);
  const [adminWarnings, setAdminWarnings] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<ScanTarget>({
    userTemp: true,
    winTemp: true,
    prefetch: false,
    updateCache: false
  });

  // Estados para Toasts
  const [showAdminDeniedToast, setShowAdminDeniedToast] = useState(false);
  const [adminDeniedInfo, setAdminDeniedInfo] = useState<string>('');

  const updateAdminWarnings = async (targets: ScanTarget) => {
    const hasProtected = targets.winTemp || targets.prefetch || targets.updateCache;
    setRequiresAdmin(hasProtected);
    if (hasProtected) {
      try {
        const warnings = await window.api.invoke('temp-get-warning', targets);
        setAdminWarnings(warnings || []);
      } catch (err) {
        console.error("Error fetching warnings", err);
      }
    } else {
      setAdminWarnings([]);
    }
  };

  useEffect(() => {
    updateAdminWarnings(selectedTargets);
  }, []);

  const handleToggle = (target: keyof ScanTarget) => {
    const newTargets = { ...selectedTargets, [target]: !selectedTargets[target] };
    setSelectedTargets(newTargets);
    updateAdminWarnings(newTargets);
  };

  const handleAdminDeniedFeedback = (data: ScanResult) => {
    const deniedFolders: string[] = [];
    if (selectedTargets.winTemp && data.details?.winTemp?.size === 0) 
      deniedFolders.push(t('temp.folders.system_temp'));
    if (selectedTargets.prefetch && data.details?.prefetch?.size === 0) 
      deniedFolders.push(t('temp.folders.prefetch'));
    if (selectedTargets.updateCache && data.details?.updateCache?.size === 0) 
      deniedFolders.push(t('temp.folders.update_cache'));

    if (deniedFolders.length > 0) {
      setAdminDeniedInfo(deniedFolders.join(', '));
      setShowAdminDeniedToast(true);
      notify.warning(t('temp.requires_elevation'), t('temp.permissions_denied'));
    }
  };

  const startScan = async () => {
    setScanning(true);
    setScanStatus('loading');
    setShowAdminDeniedToast(false);
    try {
      const result = await window.api.invoke('temp-scan', selectedTargets);
      if (result.success) {
        setScanResult(result.data);
        setScanStatus('success');
        if (result.data.adminDenied) handleAdminDeniedFeedback(result.data);
      }
    } catch (err) {
      setScanStatus('error');
      notify.error(t('temp.scan_error'));
    } finally {
      setScanning(false);
    }
  };

  const startClean = async () => {
    setCleaning(true);
    setShowAdminDeniedToast(false);
    try {
      const result = await window.api.invoke('temp-clean', selectedTargets);
      if (result.success) {
        const cleaned = result.data.gbDeleted || 0;
        setLastCleanedGB(cleaned);
        setScanStatus('success');
        
        setScanResult(prev => prev
          ? { ...prev, totalSize: Math.max(0, prev.totalSize - (result.data.totalDeleted || 0)) }
          : null
        );

        if (result.data.adminDenied) {
          handleAdminDeniedFeedback(result.data);
        } else {
          notify.success(
            cleaned > 0 
              ? `+${cleaned.toFixed(2)} ${t('temp.saved_registry')}` 
              : t('temp.cleaning_complete')
          );
        }
      }
    } catch (err) {
      setScanStatus('error');
      notify.error(t('temp.clean_error'));
    } finally {
      setCleaning(false);
    }
  };

  const totalSizeGB = scanResult ? scanResult.totalSize / (1024 * 1024 * 1024) : 0;
  const canClean = scanResult && scanResult.totalSize > 0 && !scanning && !cleaning;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3, 
      maxWidth: '850px',
      mx: 'auto',
      width: '100%',
      pb: 4
    }}>
      {/* Header Label - More Industrial */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            bgcolor: `${colors.cyan}15`, 
            p: 0.8, 
            borderRadius: 1, 
            display: 'flex',
            border: `1px solid ${colors.cyan}30`
          }}>
            <Zap size={14} color={colors.cyan} />
          </Box>
          <Typography sx={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: colors.textMuted, 
            letterSpacing: 1.2, 
            textTransform: 'uppercase' 
          }}>
            {t('temp.storage_analysis')}
          </Typography>
        </Box>
        
        {scanResult && (
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSubtle, fontWeight: 600 }}>
            LAST SCAN: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        )}
      </Box>

      {/* Main Analysis Panel */}
      <Box sx={{ 
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
        border: `1px solid ${colors.surfaceBorder}`,
        p: 0.5
      }}>
        <ScanPanel
          scanning={scanning}
          cleaning={cleaning}
          scanStatus={scanStatus}
          totalSizeGB={totalSizeGB}
          onScan={startScan}
        />
      </Box>

      {/* Clean Targets Section */}
      <Box sx={{ px: 1 }}>
        <CleanTargets
          targets={selectedTargets}
          onToggle={handleToggle}
          requiresAdmin={requiresAdmin}
          adminWarnings={adminWarnings}
        />
      </Box>

      {/* ACTION BUTTON: The centerpiece improvement */}
      <Box sx={{ px: 5, }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!canClean && !cleaning}
          onClick={startClean}
          sx={{
            height: 45,
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            
            // Background Logic
            bgcolor: cleaning 
              ? colors.green 
              : canClean 
                ? colors.cyan // Strong accent when action is ready
                : mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            
            color: canClean || cleaning ? '#000' : colors.textSubtle,
            border: `1px solid ${canClean ? 'transparent' : colors.surfaceBorder}`,
            
            // The "Ready to Clean" Breathe Effect
            animation: canClean ? `${breathe} 3s infinite ease-in-out` : 'none',

            '&:hover': {
              bgcolor: canClean ? colors.cyan : 'rgba(255,255,255,0.08)',
              transform: canClean ? 'scale(1.01) translateY(-2px)' : 'none',
              boxShadow: canClean ? `0 8px 24px ${colors.cyan}40` : 'none',
              filter: 'brightness(1.1)'
            },

            '&.Mui-disabled': {
              bgcolor: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.2)',
              border: `1px solid ${colors.surfaceBorder}`
            }
          }}
        >
          {cleaning ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircle size={20} className="animate-spin" />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{t('temp.cleaning').toUpperCase()}</Typography>
            </Box>
          ) : canClean ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Sparkles size={20} />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {t('temp.clean_button').toUpperCase()} — {totalSizeGB.toFixed(2)} GB
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.5 }}>
              <Trash2 size={18} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('temp.no_junk')}</Typography>
            </Box>
          )}
        </Button>
      </Box>

      {/* Snackbar/Alert Section stays the same for logic... */}
    </Box>
  );
};