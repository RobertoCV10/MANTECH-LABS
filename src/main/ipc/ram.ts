import { ipcMain, BrowserWindow } from 'electron';
import { optimizeStandby, optimizeWorkingSet } from '../services/ram/main';
import { sentinelConfig, saveSettings } from '../services/config';
import { ipcSuccess, ipcError } from '../services/max/types';
import { notifySuccess, notifyError } from '../utils/notifications';

export function registerRamHandlers() {
  ipcMain.handle('ram-optimize', async (event, type: 'standby' | 'working-set') => {
    try {
      if (type === 'standby') await optimizeStandby();
      else if (type === 'working-set') await optimizeWorkingSet();
      
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        notifySuccess(window, `Memoria ${type === 'standby' ? 'Standby' : 'Working Set'} optimizada`, 'Optimización RAM')
      }
      
      return ipcSuccess(undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in manual optimization:', message);
      
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        notifyError(window, message, 'Error en optimización RAM')
      }
      
      return ipcError(message, 'RAM_OPTIMIZE_FAILED');
    }
  });

  ipcMain.handle('add-to-total-saved', (_event, gbToAdd: unknown) => {
    try {
      const amount = typeof gbToAdd === 'number' ? gbToAdd : parseFloat(String(gbToAdd));
      if (!isNaN(amount) && amount > 0) {
        const currentTotal = sentinelConfig.totalSavedGB || 0;
        const newTotal = currentTotal + amount;
        sentinelConfig.totalSavedGB = Math.round(newTotal * 1000) / 1000;
        saveSettings(sentinelConfig);
        return ipcSuccess({ newTotal: sentinelConfig.totalSavedGB });
      }
      return ipcError('Invalid amount', 'INVALID_AMOUNT');
    } catch (error: any) {
      return ipcError(error.message, 'ADD_SAVED_FAILED');
    }
  });

  ipcMain.handle('get-total-saved', () => {
    return ipcSuccess({ total: sentinelConfig.totalSavedGB || 0 });
  });
}
