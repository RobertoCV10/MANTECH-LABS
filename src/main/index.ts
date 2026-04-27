// src/main/index.ts
import { app, BrowserWindow, ipcMain, session } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { autoUpdater } from 'electron-updater';
import { createWindow, handleCloseResponse, isQuitting, createTray } from './window';
import { registerRamHandlers } from './ipc/ram';
import { registerTempHandlers } from './ipc/temp';
import { registerMaxHandlers } from './ipc/max';
import { registerSentinelHandlers } from './ipc/sentinel';
import { getMaintenanceProgress, saveMaintenanceProgress, resetMaintenanceItem } from './services/maintenance';
import { createBackup, hasBackup, createMasterBackup, hasMasterBackup } from './services/max/backup';
import { sentinelConfig } from './services/config';
import { registerNotificationHandlers } from './services/notifications';

// Auto-Updater Configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Configure logging for auto-updater
autoUpdater.logger = {
  info: (message) => console.log('[AutoUpdater]', message),
  warn: (message) => console.warn('[AutoUpdater]', message),
  error: (message) => console.error('[AutoUpdater]', message),
  debug: (message) => console.debug('[AutoUpdater]', message),
};

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

  // Auto-Updater IPC Handlers
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { available: result?.updateInfo?.version !== app.getVersion() };
    } catch (error) {
      return { available: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

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

  // Auto-Updater: Check for updates after startup
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      console.error('[AutoUpdater] Error checking for updates:', err);
    });
  }

  // Auto-Updater Events
  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info.version);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] No update available');
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`[AutoUpdater] Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded:', info.version);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version,
      });
    }
  });

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
