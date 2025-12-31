/**
 * Główny widok Dashboard - statystyki zużycia filamentu
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StraightenIcon from '@mui/icons-material/Straighten';
import ScaleIcon from '@mui/icons-material/Scale';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { StatCard } from '../common';
import { chartColors } from '../../theme';
import type { JobTotals, MaterialStats, DailyUsage } from '../../types';

interface DashboardProps {
  totals: JobTotals;
  materialStats: MaterialStats[];
  dailyUsage: DailyUsage[];
  loading: boolean;
  error: string | null;
}

export function Dashboard({
  totals,
  materialStats,
  dailyUsage,
  loading,
  error,
}: DashboardProps) {
  // Oblicz wskaźnik sukcesu
  const successRate = useMemo(() => {
    const completed = materialStats.reduce((sum, m) => sum + m.completedCount, 0);
    const total = materialStats.reduce((sum, m) => sum + m.jobCount, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [materialStats]);

  // Formatuj dane dla wykresu kołowego
  const pieData = useMemo(() => {
    return materialStats.map((m) => ({
      name: m.name,
      value: Math.round(m.usedMeters * 100) / 100,
    }));
  }, [materialStats]);

  // Formatuj dane dla wykresu słupkowego
  const barData = useMemo(() => {
    return dailyUsage.map((d) => ({
      date: new Date(d.date).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
      }),
      'Zużycie (m)': Math.round(d.usedMeters * 100) / 100,
    }));
  }, [dailyUsage]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Karty statystyk */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            value={`${(totals.total_filament_used / 1000).toFixed(1)} m`}
            label="Metrów zużyto"
            icon={<StraightenIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            value={`${Math.round((totals.total_filament_used / 1000) * 3)} g`}
            label="Gramów (szacunkowo)"
            icon={<ScaleIcon />}
            color="#ff6b6b"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            value={totals.total_jobs}
            label="Wydruków"
            icon={<PrintIcon />}
            color="#4ecdc4"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            value={`${successRate}%`}
            label="Sukces"
            icon={<CheckCircleIcon />}
            color="#ffe66d"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            value={`${Math.round(totals.total_print_time / 3600)} h`}
            label="Godzin druku"
            icon={<AccessTimeIcon />}
            color="#95e1d3"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            value={`${Math.round(totals.total_time / 3600)} h`}
            label="Godzin pracy"
            icon={<AccessTimeIcon />}
            color="#a78bfa"
          />
        </Grid>
      </Grid>

      {/* Wykresy */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Wykres dzienny */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Zużycie dzienne (ostatnie 14 dni)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#888', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis
                      tick={{ fill: '#888', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar
                      dataKey="Zużycie (m)"
                      fill={chartColors.primary}
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Wykres materiałów */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Zużycie według materiału
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}m`}
                      labelLine={{ stroke: '#888' }}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors.all[index % chartColors.all.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                      }}
                      formatter={(value) => [`${value} m`, 'Zużycie']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: '#e4e4e4' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela materiałów */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Zużycie według typu filamentu
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Materiał</TableCell>
                  <TableCell align="right">Zużycie (m)</TableCell>
                  <TableCell align="right">Waga (g)</TableCell>
                  <TableCell align="right">Wydruki</TableCell>
                  <TableCell align="right">Ukończone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materialStats.map((material) => (
                  <TableRow key={material.name}>
                    <TableCell>
                      <strong>{material.name}</strong>
                    </TableCell>
                    <TableCell align="right">
                      {material.usedMeters.toFixed(2)} m
                    </TableCell>
                    <TableCell align="right">
                      {Math.round(material.weightGrams)} g
                    </TableCell>
                    <TableCell align="right">{material.jobCount}</TableCell>
                    <TableCell align="right">{material.completedCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;
