/**
 * Motyw Material-UI dla Filament Dashboard
 * Dopasowany do istniejącego ciemnego designu
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { createTheme, alpha } from '@mui/material/styles';

// Kolory zgodne z oryginalnym dashboardem
const colors = {
  primary: '#00d9ff',
  secondary: '#ff6b6b',
  tertiary: '#4ecdc4',
  quaternary: '#ffe66d',
  quinary: '#95e1d3',
  background: {
    dark: '#1a1a2e',
    light: '#16213e',
  },
  text: {
    primary: '#e4e4e4',
    secondary: '#888888',
  },
  status: {
    completed: '#4caf50',
    cancelled: '#ff9800',
    error: '#f44336',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: alpha(colors.primary, 0.8),
      dark: alpha(colors.primary, 0.6),
    },
    secondary: {
      main: colors.secondary,
    },
    background: {
      default: colors.background.dark,
      paper: alpha('#ffffff', 0.05),
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    success: {
      main: colors.status.completed,
    },
    warning: {
      main: colors.status.cancelled,
    },
    error: {
      main: colors.status.error,
    },
  },
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.primary,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
      color: colors.text.secondary,
    },
  },
  shape: {
    borderRadius: 15,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${colors.background.dark} 0%, ${colors.background.light} 100%)`,
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: alpha('#ffffff', 0.05),
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: alpha('#ffffff', 0.05),
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: colors.primary,
          color: colors.background.dark,
          boxShadow: `0 4px 15px ${alpha(colors.primary, 0.3)}`,
          '&:hover': {
            background: alpha(colors.primary, 0.9),
            boxShadow: `0 6px 20px ${alpha(colors.primary, 0.4)}`,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: colors.primary,
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          '&.Mui-selected': {
            color: colors.primary,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: alpha(colors.primary, 0.1),
            color: colors.primary,
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '1px',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            background: alpha('#ffffff', 0.02),
          },
          '&:hover': {
            background: alpha(colors.primary, 0.05),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: alpha('#ffffff', 0.2),
            },
            '&:hover fieldset': {
              borderColor: alpha(colors.primary, 0.5),
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        colorSuccess: {
          backgroundColor: alpha(colors.status.completed, 0.2),
          color: colors.status.completed,
        },
        colorWarning: {
          backgroundColor: alpha(colors.status.cancelled, 0.2),
          color: colors.status.cancelled,
        },
        colorError: {
          backgroundColor: alpha(colors.status.error, 0.2),
          color: colors.status.error,
        },
      },
    },
  },
});

// Eksportuj kolory do użycia w wykresach
export const chartColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  tertiary: colors.tertiary,
  quaternary: colors.quaternary,
  quinary: colors.quinary,
  all: [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.quaternary,
    colors.quinary,
  ],
};

export default theme;
