/**
 * Chip statusu wydruku
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

// Mapowanie statusów na konfigurację
const statusConfig: Record<
  string,
  { label: string; color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactElement }
> = {
  completed: {
    label: 'Ukończony',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  cancelled: {
    label: 'Anulowany',
    color: 'warning',
    icon: <CancelIcon />,
  },
  error: {
    label: 'Błąd',
    color: 'error',
    icon: <ErrorIcon />,
  },
  server_exit: {
    label: 'Serwer',
    color: 'error',
    icon: <PowerSettingsNewIcon />,
  },
  klippy_shutdown: {
    label: 'Shutdown',
    color: 'error',
    icon: <PowerSettingsNewIcon />,
  },
  klippy_disconnect: {
    label: 'Rozłączony',
    color: 'error',
    icon: <PowerSettingsNewIcon />,
  },
};

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = statusConfig[status] || {
    label: status,
    color: 'default' as const,
    icon: <ErrorIcon />,
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{ fontWeight: 500 }}
    />
  );
}

export default StatusChip;
