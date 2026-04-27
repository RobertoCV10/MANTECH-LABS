import { ipcMain } from 'electron';
import { sentinelConfig, updateSentinelConfig, saveSettings } from '../services/config';
import { optimizeWorkingSet } from '../services/ram/main';
import { AdminService } from '../services/admin';
import { ipcSuccess, ipcError } from '../services/max/types';

export function registerSentinelHandlers() {
  ipcMain.on('update-sentinel-config', (_event, config: any) => {
    updateSentinelConfig(config);
  });

  ipcMain.handle('get-sentinel-config', () => sentinelConfig);

  ipcMain.handle('confirm-sentinel-setup', async (_event, newConfig: any) => {
    try {
      await optimizeWorkingSet();
      updateSentinelConfig({ ...newConfig, validated: true });
      return ipcSuccess(undefined);
    } catch (error: unknown) {
      return ipcError('Permissions denied', 'SENTINEL_SETUP_DENIED');
    }
  });

  ipcMain.handle('restart-as-admin', async () => {
    try {
      const result = await AdminService.restartAsAdmin();
      return ipcSuccess(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'ADMIN_RESTART_FAILED');
    }
  });

  ipcMain.handle('get-total-temp-cleaned', () => {
    return { total: sentinelConfig.totalTempCleanedGB || 0 };
  });

  ipcMain.handle('reset-totals', (_event, data: { resetRam: boolean; resetTemp: boolean }) => {
    try {
      if (data.resetRam) sentinelConfig.totalSavedGB = 0;
      if (data.resetTemp) sentinelConfig.totalTempCleanedGB = 0;
      saveSettings(sentinelConfig);
      return { 
        totalSaved: sentinelConfig.totalSavedGB, 
        totalTempCleaned: sentinelConfig.totalTempCleanedGB 
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { error: message, code: 'RESET_TOTALS_FAILED' };
    }
  });
}
