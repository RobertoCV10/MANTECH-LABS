// src/main/index.ts
import { app, BrowserWindow, ipcMain, session } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { createWindow, handleCloseResponse, isQuitting, createTray } from './window';
import { registerRamHandlers } from './ipc/ram';
import { registerTempHandlers } from './ipc/temp';
import { registerMaxHandlers } from './ipc/max';
import { registerSentinelHandlers } from './ipc/sentinel';
import { getMaintenanceProgress, saveMaintenanceProgress, resetMaintenanceItem } from './services/maintenance';
import { createBackup, hasBackup, createMasterBackup, hasMasterBackup } from './services/max/backup';
import { sentinelConfig } from './services/config';
import { registerNotificationHandlers } from './services/notifications';

app.whenReady().then(async () => {

    // YouTube embed fix
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*.youtube-nocookie.com/*', '*://*.youtube.com/*'] },
    (details, callback) => {
      const headers = { ...details.requestHeaders };
      headers['Referer'] = 'https://www.youtube-nocookie.com/';
      headers['Origin'] = 'https://www.youtube-nocookie.com';
      callback({ requestHeaders: headers });
    }
  );

  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['*://*.youtube-nocookie.com/*', '*://*.youtube.com/*'] },
    (details, callback) => {
      const headers = { ...details.responseHeaders };
      delete headers['x-frame-options'];
      delete headers['X-Frame-Options'];
      delete headers['content-security-policy'];
      delete headers['Content-Security-Policy'];
      callback({ responseHeaders: headers });
    }
  );

  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Register IPC Handlers
  registerRamHandlers();
  registerTempHandlers();
  registerMaxHandlers();
  registerSentinelHandlers();
  registerNotificationHandlers();

  // Maintenance Handlers
  ipcMain.handle('get-mantenimiento-progreso', async () => getMaintenanceProgress());
  ipcMain.handle('save-mantenimiento-progreso', async (_, progress) => saveMaintenanceProgress(progress));
  ipcMain.handle('reset-mantenimiento', async (_, id) => resetMaintenanceItem(id));

  // Startup Logic
  if (!hasBackup()) {
    createBackup().catch(err => console.error('[Startup] Backup failed:', err));
  }
  if (!hasMasterBackup()) {
    createMasterBackup().catch(err => console.error('[Startup] Master backup failed:', err));
  }

  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Handle App Closure Logic
ipcMain.handle('close-response', async (_event, response) => {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) {
    handleCloseResponse(response, mainWindow);
  }
});

app.on('before-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('close-query', { 
        gamingModeActive: sentinelConfig.gamingModeActive ?? false 
      });
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
