/**
 * Widok historii wydruków z filtrami, sortowaniem i eksportem
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  Tooltip,
  alpha,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { HistoryFilters } from './HistoryFilters';
import { StatusChip } from '../common';
import type { HistoryRecord, HistoryFilters as FilterType, SortDirection } from '../../types';

interface HistoryProps {
  records: HistoryRecord[];
  materials: string[];
  filenames: string[];
  loading: boolean;
  error: string | null;
  onFilter: (filters: FilterType) => void;
}

// Kolumny tabeli z możliwością sortowania
interface Column {
  id: keyof HistoryRecord;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  format?: (value: unknown, record: HistoryRecord) => React.ReactNode;
}

const columns: Column[] = [
  {
    id: 'date',
    label: 'Data/Czas',
    minWidth: 130,
    format: (value) =>
      (value as Date).toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
  {
    id: 'filename',
    label: 'Nazwa pliku',
    minWidth: 200,
    format: (value) => (
      <Tooltip title={value as string} placement="top">
        <span
          style={{
            display: 'block',
            maxWidth: 250,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value as string}
        </span>
      </Tooltip>
    ),
  },
  {
    id: 'material',
    label: 'Materiał',
    minWidth: 80,
  },
  {
    id: 'filamentMeters',
    label: 'Filament (m)',
    align: 'right',
    minWidth: 100,
    format: (value) => `${(value as number).toFixed(2)} m`,
  },
  {
    id: 'weightGrams',
    label: 'Waga (g)',
    align: 'right',
    minWidth: 80,
    format: (value) => `${Math.round(value as number)} g`,
  },
  {
    id: 'printTimeMinutes',
    label: 'Czas druku',
    align: 'right',
    minWidth: 100,
    format: (value) => {
      const minutes = value as number;
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      }
      return `${minutes} min`;
    },
  },
  {
    id: 'status',
    label: 'Status',
    align: 'center',
    minWidth: 120,
    format: (value) => <StatusChip status={value as string} />,
  },
];

export function History({
  records,
  materials,
  filenames,
  loading,
  error,
  onFilter,
}: HistoryProps) {
  // Stan sortowania
  const [orderBy, setOrderBy] = useState<keyof HistoryRecord>('date');
  const [order, setOrder] = useState<SortDirection>('desc');

  // Stan paginacji
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Obsługa sortowania
  const handleSort = useCallback(
    (property: keyof HistoryRecord) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [orderBy, order]
  );

  // Posortowane rekordy
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      let comparison = 0;

      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, [records, orderBy, order]);

  // Rekordy dla aktualnej strony
  const paginatedRecords = useMemo(() => {
    return sortedRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedRecords, page, rowsPerPage]);

  // Obsługa paginacji
  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  // Reset strony przy zmianie filtrów
  const handleFilter = useCallback(
    (filters: FilterType) => {
      setPage(0);
      onFilter(filters);
    },
    [onFilter]
  );

  const handleClearFilters = useCallback(() => {
    setPage(0);
    onFilter({
      dateFrom: null,
      dateTo: null,
      filename: '',
      material: 'all',
      status: 'all',
    });
  }, [onFilter]);

  // Eksport do CSV
  const exportToCSV = useCallback(() => {
    const data = sortedRecords.map((r) => ({
      Data: r.date.toLocaleString('pl-PL'),
      'Nazwa pliku': r.filename,
      Materiał: r.material,
      'Filament (m)': r.filamentMeters,
      'Waga (g)': r.weightGrams,
      'Czas (min)': r.printTimeMinutes,
      Status: r.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `historia-wydrukow-${new Date().toISOString().split('T')[0]}.csv`);
  }, [sortedRecords]);

  // Eksport do Excel
  const exportToExcel = useCallback(() => {
    const data = sortedRecords.map((r) => ({
      Data: r.date.toLocaleString('pl-PL'),
      'Nazwa pliku': r.filename,
      Materiał: r.material,
      'Filament (m)': r.filamentMeters,
      'Waga (g)': r.weightGrams,
      'Czas (min)': r.printTimeMinutes,
      Status: r.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historia');

    // Ustaw szerokości kolumn
    ws['!cols'] = [
      { wch: 18 },
      { wch: 40 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
    ];

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `historia-wydrukow-${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [sortedRecords]);

  return (
    <Box>
      {/* Filtry */}
      <HistoryFilters
        materials={materials}
        filenames={filenames}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      {/* Nagłówek z eksportem */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">
          Historia wydruków ({sortedRecords.length} rekordów)
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button startIcon={<DownloadIcon />} onClick={exportToCSV}>
            CSV
          </Button>
          <Button startIcon={<DownloadIcon />} onClick={exportToExcel}>
            Excel
          </Button>
        </ButtonGroup>
      </Box>

      {/* Błąd */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabela */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                          sortDirection={orderBy === column.id ? order : false}
                        >
                          <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={() => handleSort(column.id)}
                          >
                            {column.label}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Brak rekordów spełniających kryteria
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((record) => (
                        <TableRow hover key={record.id}>
                          {columns.map((column) => {
                            const value = record[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format ? column.format(value, record) : String(value)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={sortedRecords.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Wierszy na stronie:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} z ${count !== -1 ? count : `więcej niż ${to}`}`
                }
                sx={{
                  borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default History;
