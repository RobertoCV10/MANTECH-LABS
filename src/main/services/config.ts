import { app } from 'electron';
import fs from 'fs';
import { join } from 'path';
import type { GamingConfig } from './max/types';

export interface SentinelConfig {
  enabled: boolean;
  threshold: number;
  lastRun: number;
  validated: boolean;
  totalSavedGB: number;
  totalTempCleanedGB: number;
  lastGamingConfig?: GamingConfig | null;
  gamingModeActive?: boolean;
}

const CONFIG_PATH = join(app.getPath('userData'), 'config.json');

const getDefaultConfig = (): SentinelConfig => ({
  enabled: false,
  threshold: 80,
  lastRun: 0,
  validated: false,
  totalSavedGB: 0,
  totalTempCleanedGB: 0
});

export const loadConfig = (): SentinelConfig => {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const saved = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      return { 
        ...getDefaultConfig(),
        ...saved,
        validated: false
      };
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }
  return getDefaultConfig();
};

export const saveSettings = (config: SentinelConfig): void => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving config:', message);
  }
};

export let sentinelConfig: SentinelConfig = loadConfig();

export const updateSentinelConfig = (config: Partial<SentinelConfig>) => {
  sentinelConfig = { ...sentinelConfig, ...config };
  saveSettings(sentinelConfig);
};
