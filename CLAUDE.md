# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A kiosk/display-board Angular app for MFGT (Motorfluggruppe Thun), a Swiss aviation club. It shows aerodrome open/closed status, weather, events, flights, and reservations on a screen — designed for TV-mounted displays at any resolution.

## Commands

```bash
npm start          # dev server at http://localhost:4200
npm run build      # production build → dist/
npm test           # Karma/Jasmine unit tests (Chrome)
npm run test-ci    # headless CI test run
npm run lint       # TSLint
npm run e2e        # Protractor e2e tests
```

## Architecture

**Single functional page.** The app has one real view: `StatusComponent` at `/status`. The root `**` wildcard redirects to `/not-found`; the root-path redirect is commented out in `app-routing.module.ts`.

**Data flow.** `StatusComponent.updateStatus()` first calls `MfgtService.getConfig()` to load `src/assets/settings.json`, then calls `showStatus()` which fires individual API calls conditionally based on the loaded settings. All backend calls go to `https://api.mfgt.ch/api/v1/`.

**Runtime configuration via `src/assets/settings.json`.** This JSON file controls which panels are rendered and which API calls are made. Changing it takes effect on next page load without a rebuild. The component guards against missing keys with explicit `in` checks. Key fields:
- `showEvents / showFlights / showReservations` — render the side panels
- `requestAerodromeStatusDataEnabled / requestWeatherDataEnabled / requestEventsDataEnabled / requestFlightDataEnabled / requestReservationsDataEnabled` — gate the actual HTTP calls independently of rendering

**`isPortrait` layout mode.** Set to `true` when none of the three side panels (events/flights/reservations) are enabled. This is not physical orientation — it switches the status message to `white-space: pre-wrap` for multi-line display and adjusts padding.

**Sizing.** Everything uses `vmin` units so the layout scales to any screen size without breakpoints.

**Wind speed conversion.** The API returns wind/gust strength in km/h; the component divides by `1.84` to convert to knots before display.

**Auto-refresh.** The `setInterval` call in `ngOnInit` is commented out. To enable periodic refresh, uncomment and set the desired interval (currently drafted at 10 seconds).

**`MfgtService`** (`src/app/shared/services/mfgtService.ts`) — the single service for all API calls. Inline comments document the expected response shapes for each endpoint.
