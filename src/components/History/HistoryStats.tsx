/**
 * Statystyki zużycia filamentu dla przefiltrowanych rekordów
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';
import ScaleIcon from '@mui/icons-material/Scale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrintIcon from '@mui/icons-material/Print';
import CategoryIcon from '@mui/icons-material/Category';
import type { HistoryRecord } from '../../types';

interface HistoryStatsProps {
  records: HistoryRecord[];
  loading?: boolean;
}

interface MaterialBreakdown {
  name: string;
  meters: number;
  grams: number;
  count: number;
  percentage: number;
}

interface Stats {
  totalMeters: number;
  totalGrams: number;
  totalMinutes: number;
  totalPrints: number;
  completedPrints: number;
  materialBreakdown: MaterialBreakdown[];
}

// Funkcja pomocnicza - formatowanie czasu
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) {
    return `${hours}h ${mins}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

// Kolory dla materiałów
const materialColors: Record<string, string> = {
  PLA: '#4caf50',
  PETG: '#2196f3',
  ABS: '#ff9800',
  ASA: '#ff5722',
  TPU: '#9c27b0',
  UNKNOWN: '#757575',
};

export function HistoryStats({ records, loading = false }: HistoryStatsProps) {
  const theme = useTheme();

  // Oblicz statystyki
  const stats = useMemo<Stats>(() => {
    if (records.length === 0) {
      return {
        totalMeters: 0,
        totalGrams: 0,
        totalMinutes: 0,
        totalPrints: 0,
        completedPrints: 0,
        materialBreakdown: [],
      };
    }

    // Sumy globalne
    const totalMeters = records.reduce((sum, r) => sum + r.filamentMeters, 0);
    const totalGrams = records.reduce((sum, r) => sum + r.weightGrams, 0);
    const totalMinutes = records.reduce((sum, r) => sum + r.printTimeMinutes, 0);
    const completedPrints = records.filter((r) => r.status === 'completed').length;

    // Podział według materiałów
    const materialMap = new Map<string, { meters: number; grams: number; count: number }>();

    records.forEach((record) => {
      const material = record.material || 'UNKNOWN';
      const existing = materialMap.get(material) || { meters: 0, grams: 0, count: 0 };
      materialMap.set(material, {
        meters: existing.meters + record.filamentMeters,
        grams: existing.grams + record.weightGrams,
        count: existing.count + 1,
      });
    });

    const materialBreakdown: MaterialBreakdown[] = Array.from(materialMap.entries())
      .map(([name, data]) => ({
        name,
        meters: data.meters,
        grams: data.grams,
        count: data.count,
        percentage: totalMeters > 0 ? (data.meters / totalMeters) * 100 : 0,
      }))
      .sort((a, b) => b.meters - a.meters);

    return {
      totalMeters,
      totalGrams,
      totalMinutes,
      totalPrints: records.length,
      completedPrints,
      materialBreakdown,
    };
  }, [records]);

  // Nie pokazuj gdy brak danych lub ładowanie
  if (loading || records.length === 0) {
    return null;
  }

  return (
    <Card
      sx={{
        mt: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      }}
    >
      <CardContent>
        {/* Nagłówek */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CategoryIcon color="primary" />
          Statystyki dla wybranych filtrów
          <Chip
            label={`${stats.totalPrints} wydruków`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Typography>

        {/* Główne statystyki */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Filament (metry) */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.1),
              }}
            >
              <StraightenIcon sx={{ fontSize: 28, color: 'info.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                {stats.totalMeters.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                metrów filamentu
              </Typography>
            </Box>
          </Grid>

          {/* Waga (gramy) */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.1),
              }}
            >
              <ScaleIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                {Math.round(stats.totalGrams)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                gramów ({(stats.totalGrams / 1000).toFixed(2)} kg)
              </Typography>
            </Box>
          </Grid>

          {/* Czas druku */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.1),
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {formatDuration(stats.totalMinutes)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                czas druku
              </Typography>
            </Box>
          </Grid>

          {/* Ukończone */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
              }}
            >
              <PrintIcon sx={{ fontSize: 28, color: 'secondary.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {stats.completedPrints}/{stats.totalPrints}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ukończonych (
                {stats.totalPrints > 0
                  ? Math.round((stats.completedPrints / stats.totalPrints) * 100)
                  : 0}
                %)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Podział według materiałów */}
        {stats.materialBreakdown.length > 1 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
              Podział według materiałów:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {stats.materialBreakdown.map((mat) => (
                <Chip
                  key={mat.name}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <strong>{mat.name}</strong>
                      <span>•</span>
                      <span>{mat.meters.toFixed(1)}m</span>
                      <span>•</span>
                      <span>{Math.round(mat.grams)}g</span>
                      <span>•</span>
                      <span>{mat.count}x</span>
                    </Box>
                  }
                  sx={{
                    bgcolor: alpha(materialColors[mat.name] || materialColors.UNKNOWN, 0.15),
                    borderColor: materialColors[mat.name] || materialColors.UNKNOWN,
                    '& .MuiChip-label': {
                      fontSize: '0.75rem',
                    },
                  }}
                  variant="outlined"
                />
              ))}
            </Box>

            {/* Pasek procentowy */}
            <Box
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
                display: 'flex',
                bgcolor: alpha(theme.palette.divider, 0.3),
              }}
            >
              {stats.materialBreakdown.map((mat) => (
                <Box
                  key={mat.name}
                  sx={{
                    width: `${mat.percentage}%`,
                    bgcolor: materialColors[mat.name] || materialColors.UNKNOWN,
                    transition: 'width 0.3s ease',
                  }}
                  title={`${mat.name}: ${mat.percentage.toFixed(1)}%`}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default HistoryStats;
