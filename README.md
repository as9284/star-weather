# Star Weather

A small **React + TypeScript** weather dashboard bootstrapped with **Vite**.
Drop a location or use your current position to see a 7‑day forecast, toggle
light/dark theme, and even install it as a Progressive Web App.

---

## Features

- Geolocation support with one‑tap "current location" button
- Saved last searched location in `localStorage` to persist between visits
- Lookup by city / state / country using Nominatim reverse‑geocoding
- 7‑day forecast grid with daily icons, highs/lows, and precipitation chance
- Click any day to open a full‑screen neumorphic modal with extended data
- Snow/Storm/Rain icons in probability badge
- Light / dark / system theme toggle persisted in `localStorage`
- Neumorphic UI styling with depth, soft shadows, and accent glow
- Responsive layout using Tailwind CSS v4 utility classes
- PWA ready – includes `manifest.webmanifest` + service worker via `vite-plugin-pwa`

## Getting started

```bash
# install dependencies
npm install

# start dev server
npm run dev
# visit http://localhost:5173 in your browser
```

Build for production:

```bash
npm run build
npm run preview   # verify the generated files locally
```

The production build output lives in `dist/`; a working service worker
(`dist/sw.js`) and manifest are generated automatically.

## Folder structure

```
src/
  App.tsx             # top‑level state, theme & location handling
  main.tsx            # React entry point
  api/weather.ts      # Open‑Meteo + Nominatim helpers
  components/
    LocationSearch.tsx  # autocomplete search box
    WeatherDisplay.tsx  # current conditions & forecast cards + modal
  hooks/
    useWeather.ts       # React Query data fetching
  types/
    weather.ts          # API typings
index.css             # neumorphic + theme CSS variables
vite.config.ts        # config including PWA plugin
public/icon.svg       # app/favicon & PWA icon
```

## Notes

- Tailwind classes use the new v4 syntax for CSS variables (e.g.
  `text-(--text-main)`); avoid `text-[var(--text-main)]`.
- `react-hooks/set-state-in-effect` lint rule is satisfied by updating
  state directly inside callbacks rather than extracted helper functions.
- Card heights are driven by flex layout; removing `aspect-3/4` prevents
  precipitation badges from overflowing on narrow screens.

## License

MIT — feel free to copy, fork, or adapt as you like.
