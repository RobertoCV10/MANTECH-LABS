import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

interface UseSettingsLogicProps {
  onResetAll?: () => Promise<void>;
}

export const useSettingsLogic = ({ onResetAll }: UseSettingsLogicProps) => {
  const { success, error } = useNotification();
  const { t } = useLanguage();
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showBackupConfirmDialog, setShowBackupConfirmDialog] = useState(false);
  const [showFactoryResetDialog, setShowFactoryResetDialog] = useState(false);
  const [factoryResetLoading, setFactoryResetLoading] = useState(false);

  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [totalTempCleaned, setTotalTempCleaned] = useState<number>(0);
  const [resetRam, setResetRam] = useState(false);
  const [resetTemp, setResetTemp] = useState(false);
  const [showResetTotalsDialog, setShowResetTotalsDialog] = useState(false);

  useEffect(() => {
    const loadTotals = async () => {
      try {
        const [savedResponse, tempResponse] = await Promise.all([
          window.api.getTotalSaved(),
          window.api.getTotalTempCleaned()
        ]);
        if (savedResponse.success) setTotalSaved(savedResponse.data.total || 0);
        if (tempResponse.success) setTotalTempCleaned(tempResponse.data.total || 0);
      } catch (e) {
        console.error('Error loading totals:', e);
      }
    };
    loadTotals();
  }, []);

  const handleResetAll = async () => {
    setIsResetting(true);
    try {
      await onResetAll?.();
      success(t('settings.success'));
    } catch (err) {
      console.error('Error al reiniciar:', err);
      error('Error al reiniciar mantenimiento');
    } finally {
      setIsResetting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCreateBackup = () => {
    setShowBackupConfirmDialog(true);
  };

  const handleConfirmCreateBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await window.api.maxCreateOriginalBackup();
      if (response.success) {
        success(t('settings.backup_create.success') || t('settings.success'));
      }
    } catch (err) {
      console.error('Error al crear backup:', err);
      error(t('settings.backup_create.error') || 'Error al crear backup');
    } finally {
      setBackupLoading(false);
      setShowBackupConfirmDialog(false);
    }
  };

  const handleResetTotals = async () => {
    setIsResetting(true);
    try {
      const response = await window.api.resetTotals({ resetRam, resetTemp });
      if (response.success) {
        setTotalSaved(response.data.totalSaved);
        setTotalTempCleaned(response.data.totalTempCleaned);
        setResetRam(false);
        setResetTemp(false);
        setShowResetTotalsDialog(false);
        success(t('settings.stats_reset.success'));
      }
    } catch (err) {
      console.error('Error al reiniciar totales:', err);
      error(t('settings.stats_reset.error'));
    } finally {
      setIsResetting(false);
    }
  };

  const handleFactoryReset = async () => {
    setFactoryResetLoading(true);
    try {
      const response = await window.api.maxFactoryReset();
      if (response.success) {
        setShowFactoryResetDialog(false);
        success(t('settings.factory_reset.success'));
        setTotalSaved(0);
        setTotalTempCleaned(0);
      }
    } catch (err) {
      console.error('Error en factory reset:', err);
      error(t('settings.factory_reset.error'));
    } finally {
      setFactoryResetLoading(false);
    }
  };

  return {
    state: {
      showAboutDialog,
      showConfirmDialog,
      isResetting,
      backupLoading,
      showBackupConfirmDialog,
      showFactoryResetDialog,
      factoryResetLoading,
      totalSaved,
      totalTempCleaned,
      resetRam,
      resetTemp,
      showResetTotalsDialog,
    },
    setters: {
      setShowAboutDialog,
      setShowConfirmDialog,
      setIsResetting,
      setBackupLoading,
      setShowBackupConfirmDialog,
      setShowFactoryResetDialog,
      setFactoryResetLoading,
      setTotalSaved,
      setTotalTempCleaned,
      setResetRam,
      setResetTemp,
      setShowResetTotalsDialog,
    },
    handlers: {
      handleResetAll,
      handleCreateBackup,
      handleConfirmCreateBackup,
      handleResetTotals,
      handleFactoryReset,
    }
  };
};
