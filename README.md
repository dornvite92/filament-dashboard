# Filament Dashboard

> Zaawansowany dashboard do monitorowania zużycia filamentu dla drukarek 3D z firmware Klipper/Moonraker.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Material-UI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## Funkcjonalności

### Dashboard
- Statystyki zużycia filamentu (metry, gramy)
- Liczba wydruków i wskaźnik sukcesu
- Łączny czas druku
- Wykres dziennego zużycia (ostatnie 14 dni)
- Wykres kołowy zużycia według materiału
- Tabela szczegółowa według typu filamentu

### Historia wydruków
- Pełna lista wszystkich wydruków z bazy Moonraker
- **Filtry zaawansowane:**
  - Zakres dat (od-do z kalendarzem)
  - Wyszukiwanie nazwy pliku (autocomplete)
  - Filtr materiału (PLA, PETG, ABS, TPU...)
  - Filtr statusu (ukończone, anulowane, błąd)
- Sortowanie po wszystkich kolumnach
- Paginacja (10/25/50/100 rekordów)
- **Eksport danych:**
  - CSV (z polskimi znakami)
  - Excel (.xlsx)

### UI/UX
- Ciemny motyw dopasowany do Mainsail
- Responsywny design (mobile-first)
- Animowane karty statystyk
- Wskaźniki ładowania
- Powiadomienia toast

## Wymagania

- Raspberry Pi z Klipper/Moonraker
- Node.js 18+ (do budowania)
- nginx (do serwowania)

## Instalacja

### 1. Klonowanie repozytorium
```bash
cd ~
git clone https://github.com/dornvite92/filament-dashboard.git
cd filament-dashboard
```

### 2. Instalacja zależności i budowanie
```bash
npm install
npm run build
```

### 3. Wdrożenie
```bash
# Utwórz katalog docelowy
mkdir -p ~/filament_dashboard

# Skopiuj zbudowane pliki
cp -r dist/* ~/filament_dashboard/
```

### 4. Konfiguracja nginx
Dodaj do `/etc/nginx/sites-available/mainsail`:
```nginx
# Filament Dashboard
location /filament/ {
    alias /home/damian/filament_dashboard/;
    index index.html;
    add_header Cache-Control "no-cache";
}
```

Zrestartuj nginx:
```bash
sudo systemctl reload nginx
```

### 5. Dostęp
Otwórz w przeglądarce: `http://ADRES_RPI/filament/`

## Development

```bash
# Uruchom serwer deweloperski
npm run dev

# Budowanie produkcyjne
npm run build

# Podgląd builda
npm run preview
```

## Struktura projektu

```
filament_dashboard_react/
├── src/
│   ├── components/
│   │   ├── Dashboard/          # Główny widok statystyk
│   │   ├── History/            # Widok historii z filtrami
│   │   └── common/             # Komponenty współdzielone
│   ├── hooks/
│   │   └── useFilamentData.ts  # Hook do zarządzania danymi
│   ├── services/
│   │   └── api.ts              # Komunikacja z Moonraker API
│   ├── theme/
│   │   └── index.ts            # Motyw Material-UI
│   ├── types/
│   │   └── index.ts            # Typy TypeScript
│   └── App.tsx                 # Komponent główny
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## API Moonraker

Dashboard korzysta z natywnego API Moonraker:

| Endpoint | Opis |
|----------|------|
| `/server/history/list` | Lista wydruków z paginacją |
| `/server/history/totals` | Sumy statystyk |
| `/printer/info` | Status drukarki |

## Technologie

- **Frontend:** React 19, TypeScript 5.8
- **UI:** Material-UI 7 (MUI)
- **Wykresy:** Recharts
- **Date Picker:** MUI X Date Pickers + Day.js
- **Eksport:** SheetJS (xlsx), FileSaver
- **Budowanie:** Vite 7

## Kompatybilność

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Autor

**Damian Misko** via Claude Code

## Licencja

MIT License - szczegóły w pliku [LICENSE](LICENSE)

---

*Projekt stworzony dla drukarki Anycubic Kobra 2 Neo z Klipper firmware.*
