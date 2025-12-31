/**
 * Karta statystyki - pojedynczy wskaźnik
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { Card, CardContent, Typography, Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  sx?: SxProps<Theme>;
}

export function StatCard({ value, label, icon, color = '#00d9ff', sx }: StatCardProps) {
  return (
    <Card sx={{ textAlign: 'center', ...sx }}>
      <CardContent sx={{ py: 3 }}>
        {icon && (
          <Box
            sx={{
              mb: 1,
              color: color,
              '& svg': { fontSize: 32 },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            color: color,
            mb: 0.5,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.8rem',
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;
