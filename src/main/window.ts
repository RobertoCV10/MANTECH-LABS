// src/main/window.ts
import { app, shell, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { TelemetryService } from './services/telemetry';
import { optimizeStandby, optimizeWorkingSet } from './services/ram/main';
import { sentinelConfig, saveSettings } from './services/config';
import { USER_AGENT } from './constants';
import { MaxPerformanceService } from './services/max/index';


export let isQuitting = false;
export let tray: Tray | null = null;
export let mainWindow: BrowserWindow | null = null;

export function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#121212',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#121212',
      symbolColor: '#747474'
    },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('minimize', () => {
    if (mainWindow) mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      isQuitting = true;
      mainWindow?.webContents.send('close-query', { 
        gamingModeActive: sentinelConfig.gamingModeActive ?? false 
      });
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();

    const telemetryInterval = setInterval(async () => {
      try {
        const payload = await TelemetryService.getFullTelemetry();
        if (sentinelConfig.enabled) {
          const currentUsage = payload.ram;
          const now = Date.now();
          if (currentUsage > sentinelConfig.threshold && (now - sentinelConfig.lastRun) > 30000) {
            await optimizeStandby();
            await optimizeWorkingSet();
            sentinelConfig.lastRun = now;
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('sentinel-action-completed', {
                usageAtTrigger: currentUsage,
                timestamp: now
              });
            }
          }
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('telemetria-cpu', payload);
        }
      } catch (error: unknown) {
        console.error('Error in telemetry/sentinel cycle:', error);
      }
    }, 3000);

    mainWindow?.on('closed', () => {
      clearInterval(telemetryInterval);
    });
  });

  mainWindow?.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow?.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow?.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow?.webContents.setUserAgent(USER_AGENT);
}

export async function handleCloseResponse(response: { action: string }, mainWindow: BrowserWindow) {
  const { action } = response;
  
  switch (action) {
    case 'close':
    case 'maintain':
      isQuitting = true;
      app.quit();
      break;
    case 'remove':
      try {
        const result = await MaxPerformanceService.disable();
        if (result && result.success) {
          sentinelConfig.gamingModeActive = false;
          saveSettings(sentinelConfig);
          isQuitting = true;
          app.quit();
        } else {
          throw new Error(result?.errors?.join(', ') || 'Error desconocido al restaurar');
        }
      } catch (e) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('close-query', { 
            gamingModeActive: true, 
            error: 'Error restoring. Admin privileges required.' 
          });
        }
      }
      break;
    case 'cancel':
      isQuitting = false;
      break;
    default:
      isQuitting = false;
  }
}

export function createTray() {
  const trayIcon = nativeImage.createFromPath(icon);
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        mainWindow?.show();
      }
    },
    {
      label: 'Configuración',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('navigate-to-settings');
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Sentinel');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow?.show();
  });
}
