/**
 * Hook do zarządzania danymi filamentu
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchHistory,
  fetchTotals,
  fetchUniqueMaterials,
  fetchFilteredHistory,
} from '../services/api';
import type {
  PrintJob,
  JobTotals,
  HistoryFilters,
  MaterialStats,
  DailyUsage,
  HistoryRecord,
} from '../types';

// Stan ładowania
interface LoadingState {
  jobs: boolean;
  totals: boolean;
  materials: boolean;
}

// Wartość zwracana przez hook
interface FilamentDataResult {
  // Dane surowe
  jobs: PrintJob[];
  totals: JobTotals | null;
  materials: string[];

  // Dane przetworzone
  materialStats: MaterialStats[];
  dailyUsage: DailyUsage[];
  historyRecords: HistoryRecord[];

  // Stan
  loading: LoadingState;
  error: string | null;

  // Akcje
  refresh: () => Promise<void>;
  applyFilters: (filters: HistoryFilters) => Promise<void>;
}

// Domyślne sumy
const defaultTotals: JobTotals = {
  total_jobs: 0,
  total_time: 0,
  total_print_time: 0,
  total_filament_used: 0,
  longest_job: 0,
  longest_print: 0,
};

/**
 * Hook do pobierania i przetwarzania danych o zużyciu filamentu
 */
export function useFilamentData(): FilamentDataResult {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<PrintJob[]>([]);
  const [totals, setTotals] = useState<JobTotals | null>(null);
  const [materials, setMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    jobs: true,
    totals: true,
    materials: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych
  const loadData = useCallback(async () => {
    setError(null);
    setLoading({ jobs: true, totals: true, materials: true });

    try {
      // Pobierz równolegle
      const [historyResult, totalsResult, materialsResult] = await Promise.all([
        fetchHistory(500),
        fetchTotals(),
        fetchUniqueMaterials(),
      ]);

      setJobs(historyResult.jobs);
      setFilteredJobs(historyResult.jobs);
      setTotals(totalsResult);
      setMaterials(materialsResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
      console.error('Błąd ładowania danych:', err);
    } finally {
      setLoading({ jobs: false, totals: false, materials: false });
    }
  }, []);

  // Załaduj przy montowaniu
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aplikuj filtry
  const applyFilters = useCallback(async (filters: HistoryFilters) => {
    setLoading((prev) => ({ ...prev, jobs: true }));
    try {
      const filtered = await fetchFilteredHistory(filters);
      setFilteredJobs(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Błąd filtrowania';
      setError(message);
    } finally {
      setLoading((prev) => ({ ...prev, jobs: false }));
    }
  }, []);

  // Statystyki materiałów (memoizowane)
  const materialStats = useMemo((): MaterialStats[] => {
    const statsMap = new Map<string, MaterialStats>();

    jobs.forEach((job) => {
      const material = job.metadata?.filament_type || 'Unknown';
      const filamentMeters = job.filament_used / 1000;
      const weight = job.metadata?.filament_weight_total || filamentMeters * 3;

      const existing = statsMap.get(material) || {
        name: material,
        usedMeters: 0,
        weightGrams: 0,
        jobCount: 0,
        completedCount: 0,
      };

      existing.usedMeters += filamentMeters;
      existing.weightGrams += weight;
      existing.jobCount += 1;
      if (job.status === 'completed') {
        existing.completedCount += 1;
      }

      statsMap.set(material, existing);
    });

    return Array.from(statsMap.values()).sort(
      (a, b) => b.usedMeters - a.usedMeters
    );
  }, [jobs]);

  // Zużycie dzienne (ostatnie 14 dni)
  const dailyUsage = useMemo((): DailyUsage[] => {
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

    const dailyMap = new Map<string, DailyUsage>();

    // Inicjalizuj wszystkie dni (nawet puste)
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      dailyMap.set(key, { date: key, usedMeters: 0, jobCount: 0 });
    }

    // Wypełnij danymi
    jobs.forEach((job) => {
      const startTime = job.start_time * 1000;
      if (startTime < fourteenDaysAgo) return;

      const date = new Date(startTime);
      const key = date.toISOString().split('T')[0];

      const existing = dailyMap.get(key);
      if (existing) {
        existing.usedMeters += job.filament_used / 1000;
        existing.jobCount += 1;
      }
    });

    return Array.from(dailyMap.values());
  }, [jobs]);

  // Rekordy historii (do tabeli)
  const historyRecords = useMemo((): HistoryRecord[] => {
    return filteredJobs.map((job) => {
      const filamentMeters = job.filament_used / 1000;
      const thumbnail = job.metadata?.thumbnails?.find(
        (t) => t.width >= 100
      )?.relative_path;

      return {
        id: job.job_id,
        date: new Date(job.start_time * 1000),
        filename: job.filename.split('/').pop() || job.filename,
        material: job.metadata?.filament_type || 'Unknown',
        filamentMeters: Math.round(filamentMeters * 100) / 100,
        weightGrams: Math.round(
          (job.metadata?.filament_weight_total || filamentMeters * 3) * 10
        ) / 10,
        printTimeMinutes: Math.round(job.print_duration / 60),
        status: job.status,
        thumbnail,
      };
    });
  }, [filteredJobs]);

  return {
    jobs,
    totals: totals || defaultTotals,
    materials,
    materialStats,
    dailyUsage,
    historyRecords,
    loading,
    error,
    refresh: loadData,
    applyFilters,
  };
}

export default useFilamentData;
