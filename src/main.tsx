/**
 * Punkt wejścia aplikacji Filament Dashboard
 * Autor: Damian Misko via Claude Code
 * Data: 2025-12-31
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Usunięcie domyślnych stylów Vite
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
