# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A kiosk/display-board Angular app for MFGT (Motorfluggruppe Thun), a Swiss aviation club. It shows aerodrome open/closed status, weather, events, flights, and reservations on a screen — designed for TV-mounted displays at any resolution.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (default config: lszt-indoor1)
npm run build      # production build → dist/ (default config: lszt-indoor1)
CONFIG=lszt-outdoor1 npm run build   # build with a different per-deployment config
npm test           # Karma/Jasmine unit tests (Chrome)
npm run test-ci    # headless CI test run
npm run lint       # TSLint
npm run e2e        # Protractor e2e tests
```

## Architecture

**Single functional page.** The app has one real view: `StatusComponent` at `/status`. The root `**` wildcard redirects to `/not-found`; the root-path redirect is commented out in `app-routing.module.ts`.

**Data flow.** `StatusComponent.updateStatus()` first calls `MfgtService.getConfig()` to load `/assets/settings.json`, then calls `showStatus()` which fires individual API calls conditionally based on the loaded settings. All backend calls go to `https://api.mfgt.ch/api/v1/`.

**Per-deployment configuration.** Each deployment's `settings.json` lives under `configs/<name>/settings.json` (e.g. `configs/lszt-indoor1`, `configs/lszt-outdoor1`). The active config is selected at build time via the `CONFIG` env var — `package.json` passes `--configuration production,${CONFIG:-lszt-indoor1}` to `ng build`. The matching `angular.json` configuration overrides the `assets` array so the chosen `configs/<name>/` directory is copied to `dist/assets/`, producing `dist/assets/settings.json`. There is **no committed `src/assets/settings.json`** — only deployment-specific files in `configs/`. To add a new deployment: create `configs/<name>/settings.json` and add matching `<name>` configuration blocks under `architect.build.configurations` and `architect.serve.configurations` in `angular.json`. Key fields:
- `showEvents / showFlights / showReservations` — render the side panels
- `requestAerodromeStatusDataEnabled / requestWeatherDataEnabled / requestEventsDataEnabled / requestFlightDataEnabled / requestReservationsDataEnabled` — gate the actual HTTP calls independently of rendering

**`isPortrait` layout mode.** Set to `true` when none of the three side panels (events/flights/reservations) are enabled. This is not physical orientation — it switches the status message to `white-space: pre-wrap` for multi-line display and adjusts padding.

**Sizing.** Everything uses `vmin` units so the layout scales to any screen size without breakpoints.

**Wind speed conversion.** The API returns wind/gust strength in km/h; the component divides by `1.84` to convert to knots before display.

**Auto-refresh.** The `setInterval` call in `ngOnInit` is commented out. To enable periodic refresh, uncomment and set the desired interval (currently drafted at 10 seconds).

**`MfgtService`** (`src/app/shared/services/mfgtService.ts`) — the single service for all API calls. Inline comments document the expected response shapes for each endpoint.
