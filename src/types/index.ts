/**
 * Typy danych dla aplikacji Filament Dashboard
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

// Reprezentacja pojedynczego zadania druku z Moonraker API
export interface PrintJob {
  job_id: string;
  user: string;
  filename: string;
  status: 'completed' | 'cancelled' | 'error' | 'server_exit' | 'klippy_shutdown' | 'klippy_disconnect';
  start_time: number;
  end_time: number;
  print_duration: number;
  total_duration: number;
  filament_used: number; // w mm
  metadata: JobMetadata;
  exists: boolean;
}

// Metadane zadania druku
export interface JobMetadata {
  size?: number;
  modified?: number;
  slicer?: string;
  slicer_version?: string;
  layer_count?: number;
  object_height?: number;
  estimated_time?: number;
  nozzle_diameter?: number;
  layer_height?: number;
  first_layer_height?: number;
  first_layer_extr_temp?: number;
  first_layer_bed_temp?: number;
  filament_name?: string;
  filament_type?: string;
  filament_colors?: string[];
  filament_total?: number;
  filament_weight_total?: number;
  thumbnails?: Thumbnail[];
}

// Miniaturka pliku
export interface Thumbnail {
  width: number;
  height: number;
  size: number;
  relative_path: string;
}

// Sumy z Moonraker API
export interface JobTotals {
  total_jobs: number;
  total_time: number;
  total_print_time: number;
  total_filament_used: number;
  longest_job: number;
  longest_print: number;
}

// Odpowiedź API historii
export interface HistoryListResponse {
  result: {
    count: number;
    jobs: PrintJob[];
  };
}

// Odpowiedź API totals
export interface HistoryTotalsResponse {
  result: {
    job_totals: JobTotals;
    auxiliary_totals: unknown[];
  };
}

// Filtry dla widoku historii
export interface HistoryFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  filename: string;
  material: string;
  status: string;
}

// Statystyki materiałów dla dashboardu
export interface MaterialStats {
  name: string;
  usedMeters: number;
  weightGrams: number;
  jobCount: number;
  completedCount: number;
}

// Dane dla wykresu dziennego
export interface DailyUsage {
  date: string;
  usedMeters: number;
  jobCount: number;
}

// Rekord tabeli historii (przetworzony)
export interface HistoryRecord {
  id: string;
  date: Date;
  filename: string;
  material: string;
  filamentMeters: number;
  weightGrams: number;
  printTimeMinutes: number;
  status: string;
  thumbnail?: string;
}

// Typ sortowania
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: keyof HistoryRecord;
  direction: SortDirection;
}
