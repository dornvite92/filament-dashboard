/**
 * Serwis API do komunikacji z Moonraker
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import type {
  PrintJob,
  JobTotals,
  HistoryListResponse,
  HistoryTotalsResponse,
  HistoryFilters,
} from '../types';

// Bazowy URL API Moonraker (nginx proxy już jest skonfigurowane dla /server/, /printer/)
const API_BASE = '';

/**
 * Pobiera listę zadań druku z historii
 * @param limit - maksymalna liczba rekordów
 * @param start - indeks początkowy (dla paginacji)
 * @param before - timestamp końcowy (opcjonalnie)
 * @param since - timestamp początkowy (opcjonalnie)
 */
export async function fetchHistory(
  limit: number = 500,
  start: number = 0,
  before?: number,
  since?: number
): Promise<{ jobs: PrintJob[]; count: number }> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    start: start.toString(),
  });

  if (before) params.append('before', before.toString());
  if (since) params.append('since', since.toString());

  const response = await fetch(`${API_BASE}/server/history/list?${params}`);
  if (!response.ok) {
    throw new Error(`Błąd API: ${response.status}`);
  }

  const data: HistoryListResponse = await response.json();
  return {
    jobs: data.result.jobs,
    count: data.result.count,
  };
}

/**
 * Pobiera sumy statystyk z Moonraker
 */
export async function fetchTotals(): Promise<JobTotals> {
  const response = await fetch(`${API_BASE}/server/history/totals`);
  if (!response.ok) {
    throw new Error(`Błąd API: ${response.status}`);
  }

  const data: HistoryTotalsResponse = await response.json();
  return data.result.job_totals;
}

/**
 * Pobiera status drukarki
 */
export async function fetchPrinterStatus(): Promise<{
  state: string;
  state_message: string;
}> {
  const response = await fetch(`${API_BASE}/printer/info`);
  if (!response.ok) {
    throw new Error(`Błąd API: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Pobiera pełną historię z filtrowaniem po stronie klienta
 * (Moonraker nie wspiera filtrowania po nazwie pliku czy materiale)
 */
export async function fetchFilteredHistory(
  filters: HistoryFilters,
  limit: number = 1000
): Promise<PrintJob[]> {
  // Pobierz wszystkie zadania (lub ograniczone datami)
  const before = filters.dateTo
    ? Math.floor(filters.dateTo.getTime() / 1000) + 86400 // +1 dzień
    : undefined;
  const since = filters.dateFrom
    ? Math.floor(filters.dateFrom.getTime() / 1000)
    : undefined;

  const { jobs } = await fetchHistory(limit, 0, before, since);

  // Filtruj po stronie klienta
  return jobs.filter((job) => {
    // Filtr nazwy pliku
    if (
      filters.filename &&
      !job.filename.toLowerCase().includes(filters.filename.toLowerCase())
    ) {
      return false;
    }

    // Filtr materiału
    if (filters.material && filters.material !== 'all') {
      const jobMaterial = job.metadata?.filament_type || 'Unknown';
      if (jobMaterial.toLowerCase() !== filters.material.toLowerCase()) {
        return false;
      }
    }

    // Filtr statusu
    if (filters.status && filters.status !== 'all') {
      if (job.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Pobiera unikalne materiały z historii
 */
export async function fetchUniqueMaterials(): Promise<string[]> {
  const { jobs } = await fetchHistory(500);
  const materials = new Set<string>();

  jobs.forEach((job) => {
    const material = job.metadata?.filament_type;
    if (material) {
      materials.add(material);
    }
  });

  return Array.from(materials).sort();
}

/**
 * Pobiera unikalne nazwy plików dla autocomplete
 */
export async function fetchUniqueFilenames(): Promise<string[]> {
  const { jobs } = await fetchHistory(500);
  const filenames = new Set<string>();

  jobs.forEach((job) => {
    if (job.filename) {
      // Usuń ścieżkę, zostaw tylko nazwę pliku
      const name = job.filename.split('/').pop() || job.filename;
      filenames.add(name);
    }
  });

  return Array.from(filenames).sort();
}

/**
 * Generuje URL do miniaturki
 */
export function getThumbnailUrl(relativePath: string): string {
  return `/server/files/gcodes/${relativePath}`;
}
