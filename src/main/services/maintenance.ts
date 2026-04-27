import { app } from 'electron';
import fs from 'fs';
import { promises as fsAsync } from 'fs';
import { join } from 'path';

export interface UserMaintenanceProgress {
  [id: string]: {
    lastCompleted: string | null;
    checklist: boolean[];
  }
}

const MANTENIMIENTO_PATH = join(app.getPath('userData'), 'mantenimiento_progreso.json');

export const initMaintenanceStorage = () => {
  if (!fs.existsSync(MANTENIMIENTO_PATH)) {
    try {
      fs.writeFileSync(MANTENIMIENTO_PATH, JSON.stringify({}, null, 2));
      console.log('[Mantenimiento] Archivo inicial creado.');
    } catch (e) {
      console.error('[Mantenimiento] Error al crear archivo inicial:', e);
    }
  }
};

export const getMaintenanceProgress = async (): Promise<UserMaintenanceProgress> => {
  if (fs.existsSync(MANTENIMIENTO_PATH)) {
    try {
      const data = await fsAsync.readFile(MANTENIMIENTO_PATH, 'utf-8');
      if (data.trim() === '') return {};
      return JSON.parse(data) as UserMaintenanceProgress;
    } catch (error) {
      console.error('[MAIN] Error al leer progreso de mantenimiento:', error);
      return {};
    }
  }
  return {};
};

export const saveMaintenanceProgress = async (progress: UserMaintenanceProgress) => {
  try {
    await fsAsync.writeFile(MANTENIMIENTO_PATH, JSON.stringify(progress, null, 2));
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MAIN] Error al guardar progreso de mantenimiento:', message);
    return { success: false, error: message };
  }
};

export const resetMaintenanceItem = async (id: string) => {
  try {
    let progress: UserMaintenanceProgress = await getMaintenanceProgress();
    
    if (progress[id]) {
      const mantenimientoRaw = await fsAsync.readFile(
        join(__dirname, '../../renderer/src/data/mantenimientos.json'), 
        'utf-8'
      );
      const mantenimientosData = JSON.parse(mantenimientoRaw);
      const mantenimiento = mantenimientosData.mantenimientos.find((m: any) => m.id === id);
      
      if (mantenimiento) {
        progress[id] = {
          lastCompleted: null,
          checklist: new Array(mantenimiento.checklist.length).fill(false)
        };
        await saveMaintenanceProgress(progress);
        return { success: true };
      }
    }
    return { success: false, error: 'Mantenimiento no encontrado' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MAIN] Error al resetear mantenimiento:', message);
    return { success: false, error: message };
  }
};
