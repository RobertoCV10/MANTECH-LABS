import { ipcMain } from 'electron';
import { MaxPerformanceService } from '../services/max/index';
import { hasBackup, readBackupMeta, restoreBackup, getPresets, addPreset, updatePreset, deletePreset, createNewOriginalBackup, applyMasterBackup, syncOriginalToMaster, clearPresets, clearMantenimiento } from '../services/max/backup';
import { sentinelConfig, saveSettings } from '../services/config';
import { GamingConfig } from '../services/max/types';
import { ipcSuccess, ipcError } from '../services/max/types';

export function registerMaxHandlers() {
  ipcMain.handle('max-get-status', async () => {
    try {
      const [currentConfig, meta] = await Promise.all([
        MaxPerformanceService.getCurrentConfig(),
        Promise.resolve(readBackupMeta())
      ]);
      return ipcSuccess({
        currentConfig,
        lastGamingConfig: sentinelConfig.lastGamingConfig ?? null,
        gamingModeActive: sentinelConfig.gamingModeActive ?? false,
        hasBackup: hasBackup(),
        backupMeta: meta
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_STATUS_FAILED');
    }
  });

  ipcMain.handle('max-apply', async (_event, config: GamingConfig) => {
    try {
      const result = await MaxPerformanceService.enable(config);
      if (result.success) {
        sentinelConfig.lastGamingConfig = config;
        sentinelConfig.gamingModeActive = true;
        saveSettings(sentinelConfig);
      }
      return ipcSuccess(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_APPLY_FAILED');
    }
  });

  ipcMain.handle('max-restore', async () => {
    try {
      await restoreBackup();
      sentinelConfig.gamingModeActive = false;
      saveSettings(sentinelConfig);
      return ipcSuccess(undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_RESTORE_FAILED');
    }
  });

  ipcMain.handle('max-get-presets', async () => {
    try {
      return ipcSuccess(getPresets());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_GET_PRESETS_FAILED');
    }
  });

  ipcMain.handle('max-add-preset', async (_event, data: { name: string; config: GamingConfig }) => {
    try {
      return ipcSuccess(addPreset(data.name, data.config));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_ADD_PRESET_FAILED');
    }
  });

  ipcMain.handle('max-update-preset', async (_event, data: { id: string; name: string; config: GamingConfig }) => {
    try {
      return ipcSuccess(updatePreset(data.id, data.name, data.config));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_UPDATE_PRESET_FAILED');
    }
  });

  ipcMain.handle('max-delete-preset', async (_event, id: string) => {
    try {
      deletePreset(id);
      return ipcSuccess(undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_DELETE_PRESET_FAILED');
    }
  });

  ipcMain.handle('max-create-original-backup', async () => {
    try {
      return ipcSuccess(await createNewOriginalBackup());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_CREATE_BACKUP_FAILED');
    }
  });

  ipcMain.handle('max-factory-reset', async () => {
    try {
      await applyMasterBackup();
      syncOriginalToMaster();
      clearPresets();
      clearMantenimiento();
      
      sentinelConfig.totalSavedGB = 0;
      sentinelConfig.totalTempCleanedGB = 0;
      sentinelConfig.gamingModeActive = false;
      sentinelConfig.lastGamingConfig = null;
      saveSettings(sentinelConfig);
      
      return ipcSuccess(undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'MAX_FACTORY_RESET_FAILED');
    }
  });
}
