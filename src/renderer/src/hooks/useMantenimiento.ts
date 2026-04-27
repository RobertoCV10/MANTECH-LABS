// src/renderer/src/hooks/useMantenimiento.ts

import { useState, useEffect, useMemo } from 'react';
import i18n from '../i18n';

interface UserProgressEntry {
  lastCompleted: string | null;
  checklist: boolean[];
}

type UserProgressMap = Record<string, UserProgressEntry>;

export const useMantenimiento = (mantenimientosRaw: any[]) => {
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const savedData = await window.api.getMantenimientoProgreso();
        setUserProgress(savedData || {});
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar progreso:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const mantenimientosProcesados = useMemo(() => {
    const results = mantenimientosRaw.map((m) => {
      const saved = userProgress[m.id] || { 
        lastCompleted: null, 
        checklist: new Array(m.checklist.length).fill(false) 
      };

      // Obtener la frecuencia traducida para calcular los días
      const frecuenciaTraducida = i18n.t(m.frecuencia);
      const num = parseInt(frecuenciaTraducida) || 1;
      const isMonth = frecuenciaTraducida.toLowerCase().includes('mes');
      const totalFreqDays = isMonth ? num * 30 : num;

      let diasRestantes: number;

      if (!saved.lastCompleted) {
        diasRestantes = 0; // Urgente: nunca se ha hecho
      } else {
        const lastDate = new Date(saved.lastCompleted);
        const dueDate = new Date(lastDate);
        dueDate.setDate(lastDate.getDate() + totalFreqDays);
        
        const diff = dueDate.getTime() - new Date().getTime();
        diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

    // Dentro del map de mantenimientosProcesados
    const estaVencido = diasRestantes <= 0;

    return {
      ...m,
      diasRestantes,
      // Está completado solo si se hizo y NO ha vencido aún
      completado: saved.lastCompleted !== null && !estaVencido, 
      currentChecklist: saved.checklist
    };
    });

  // ORDENAMIENTO: Ponemos las que tienen menos días restantes (o negativas) al principio
    return results.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [userProgress, mantenimientosRaw]);

  // --- NUEVA LÓGICA PARA EL HERO (ESTADÍSTICAS) ---
  const stats = useMemo(() => {
    return {
      totalVencidos: mantenimientosProcesados.filter(m => m.diasRestantes <= 0).length,
      proximos7Dias: mantenimientosProcesados.filter(m => m.diasRestantes > 0 && m.diasRestantes <= 7).length,
      totalCompletados: Object.values(userProgress).filter(p => p.lastCompleted !== null).length
    };
  }, [mantenimientosProcesados, userProgress]);

  const updateProgress = async (id: string, newChecklist: boolean[], isFinalize: boolean = false) => {
    const isAllChecked = newChecklist.every(Boolean);
    const newProgress = { ...userProgress };
    
    if (isFinalize && isAllChecked) {
      newProgress[id] = {
        lastCompleted: new Date().toISOString(),
        checklist: newChecklist
      };
    } else {
      newProgress[id] = {
        lastCompleted: userProgress[id]?.lastCompleted || null,
        checklist: newChecklist
      };
    }

    setUserProgress(newProgress);

    try {
      const result = await window.api.saveMantenimientoProgreso(newProgress);
      if (!result?.success) {
        console.error('Error al guardar:', result);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const resetProgress = async (id: string) => {
    const newProgress = { ...userProgress };
    const mantenimiento = mantenimientosRaw.find(m => m.id === id);
    
    if (mantenimiento) {
      newProgress[id] = {
        lastCompleted: null,
        checklist: new Array(mantenimiento.checklist.length).fill(false)
      };
    }

    setUserProgress(newProgress);

    try {
      const result = await window.api.saveMantenimientoProgreso(newProgress);
      if (!result?.success) {
        console.error('Error al guardar:', result);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const resetAllProgress = async () => {
    const newProgress: UserProgressMap = {};
    
    mantenimientosRaw.forEach(m => {
      newProgress[m.id] = {
        lastCompleted: null,
        checklist: new Array(m.checklist.length).fill(false)
      };
    });
    
    setUserProgress(newProgress);
    
    try {
      await window.api.saveMantenimientoProgreso(newProgress);
    } catch (err) {
      console.error('Error al reiniciar todo:', err);
    }
  };

  return {
    mantenimientos: mantenimientosProcesados,
    proximoMantenimiento: mantenimientosProcesados.find(m => m.diasRestantes <= 0) || mantenimientosProcesados[0],
    stats,
    updateProgress,
    resetProgress,
    resetAllProgress,
    loading,
    userProgress
  };
};