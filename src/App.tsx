/**
 * Główny komponent aplikacji Filament Dashboard
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { useState, useCallback, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Snackbar,
  Alert,
  alpha,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import theme from './theme';
import Dashboard from './components/Dashboard';
import { History as HistoryView } from './components/History';
import { useFilamentData } from './hooks/useFilamentData';
import { fetchUniqueFilenames } from './services/api';

// Panel zakładki
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Hook do danych
  const {
    totals,
    materials,
    materialStats,
    dailyUsage,
    historyRecords,
    loading,
    error,
    refresh,
    applyFilters,
  } = useFilamentData();

  // Załaduj nazwy plików dla autocomplete
  useEffect(() => {
    fetchUniqueFilenames().then(setFilenames).catch(console.error);
  }, []);

  // Obsługa zmiany zakładki
  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  }, []);

  // Odśwież dane
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      setSnackbar({
        open: true,
        message: 'Dane zostały odświeżone',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Błąd odświeżania danych',
        severity: 'error',
      });
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // Zamknij snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Format czasu ostatniej aktualizacji
  const lastUpdate = new Date().toLocaleString('pl-PL');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Nagłówek */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h1" component="h1" gutterBottom>
            Filament Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Anycubic Kobra 2 Neo | Klipper
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ostatnia aktualizacja: {lastUpdate}
          </Typography>
        </Box>

        {/* Zakładki */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: (theme) => alpha(theme.palette.divider, 0.1),
            mb: 0,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
              },
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              iconPosition="start"
              label="Dashboard"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              icon={<HistoryIcon />}
              iconPosition="start"
              label="Historia"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Zawartość zakładek */}
        <TabPanel value={tabIndex} index={0}>
          <Dashboard
            totals={totals!}
            materialStats={materialStats}
            dailyUsage={dailyUsage}
            loading={loading.jobs || loading.totals}
            error={error}
          />
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <HistoryView
            records={historyRecords}
            materials={materials}
            filenames={filenames}
            loading={loading.jobs}
            error={error}
            onFilter={applyFilters}
          />
        </TabPanel>

        {/* Przycisk odświeżania */}
        <Tooltip title="Odśwież dane" placement="left">
          <Fab
            color="primary"
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              position: 'fixed',
              bottom: 30,
              right: 30,
              boxShadow: (theme) => `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <RefreshIcon
              sx={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Fab>
        </Tooltip>

        {/* Snackbar powiadomień */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
