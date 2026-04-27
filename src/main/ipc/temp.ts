import { ipcMain } from 'electron';
import { scanTempFolders, cleanTempFolders, requestAdminPrivileges, getAdminWarning, type ScanTarget } from '../services/temp/main';
import { sentinelConfig, saveSettings } from '../services/config';
import { ipcSuccess, ipcError } from '../services/max/types';

export function registerTempHandlers() {
  ipcMain.handle('temp-scan', async (_event, targets: ScanTarget) => {
    try {
      const result = await scanTempFolders(targets);
      return ipcSuccess(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'TEMP_SCAN_FAILED');
    }
  });

  ipcMain.handle('temp-clean', async (_event, targets: ScanTarget) => {
    try {
      const result = await cleanTempFolders(targets);
      const gbDeleted = result.totalDeleted / (1024 * 1024 * 1024);
      sentinelConfig.totalTempCleanedGB = Math.round((sentinelConfig.totalTempCleanedGB + gbDeleted) * 100) / 100;
      saveSettings(sentinelConfig);
      return ipcSuccess({ ...result, gbDeleted });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ipcError(message, 'TEMP_CLEAN_FAILED');
    }
  });

  ipcMain.handle('temp-check-admin', async () => requestAdminPrivileges());
  ipcMain.handle('temp-get-warning', (_event, targets: ScanTarget) => getAdminWarning(targets));
}
