/**
 * Komponenty filtrów dla widoku historii
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
  Collapse,
  IconButton,
  Typography,
  alpha,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';
import type { HistoryFilters as FilterType } from '../../types';

interface HistoryFiltersProps {
  materials: string[];
  filenames: string[];
  onFilter: (filters: FilterType) => void;
  onClear: () => void;
}

// Dostępne statusy
const statusOptions = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'completed', label: 'Ukończone' },
  { value: 'cancelled', label: 'Anulowane' },
  { value: 'error', label: 'Błąd' },
  { value: 'server_exit', label: 'Restart serwera' },
];

export function HistoryFilters({
  materials,
  filenames,
  onFilter,
  onClear,
}: HistoryFiltersProps) {
  const [expanded, setExpanded] = useState(true);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [filename, setFilename] = useState('');
  const [material, setMaterial] = useState('all');
  const [status, setStatus] = useState('all');

  // Debounce dla wyszukiwania nazwy pliku
  const [debouncedFilename, setDebouncedFilename] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilename(filename);
    }, 300);
    return () => clearTimeout(timer);
  }, [filename]);

  // Aplikuj filtry
  const handleFilter = useCallback(() => {
    onFilter({
      dateFrom: dateFrom?.toDate() || null,
      dateTo: dateTo?.toDate() || null,
      filename: debouncedFilename,
      material,
      status,
    });
  }, [dateFrom, dateTo, debouncedFilename, material, status, onFilter]);

  // Wyczyść filtry
  const handleClear = useCallback(() => {
    setDateFrom(null);
    setDateTo(null);
    setFilename('');
    setMaterial('all');
    setStatus('all');
    onClear();
  }, [onClear]);

  // Auto-filtruj przy zmianie
  useEffect(() => {
    handleFilter();
  }, [dateFrom, dateTo, debouncedFilename, material, status]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          background: (theme) => alpha(theme.palette.primary.main, 0.05),
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Nagłówek filtrów */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: expanded ? 2 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Filtry</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={
                !dateFrom && !dateTo && !filename && material === 'all' && status === 'all'
              }
            >
              Wyczyść
            </Button>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <FilterListIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Pola filtrów */}
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            {/* Data od */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Data od"
                value={dateFrom}
                onChange={setDateFrom}
                maxDate={dateTo || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Data do */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Data do"
                value={dateTo}
                onChange={setDateTo}
                minDate={dateFrom || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Nazwa pliku z autocomplete */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Autocomplete
                freeSolo
                options={filenames}
                value={filename}
                onInputChange={(_, newValue) => setFilename(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nazwa pliku"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Materiał */}
            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Materiał</InputLabel>
                <Select
                  value={material}
                  label="Materiał"
                  onChange={(e) => setMaterial(e.target.value)}
                >
                  <MenuItem value="all">Wszystkie</MenuItem>
                  {materials.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
}

export default HistoryFilters;
