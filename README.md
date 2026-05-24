# mfgt-status-display

Kiosk display board for MFGT (Motorfluggruppe Thun): aerodrome status, weather, events, flights, reservations.

## Per-deployment configuration

Each deployment lives under `configs/<name>/settings.json` and is selected at build time via the `CONFIG` env var.

```bash
npm start                          # dev server, default config (lszt-indoor1)
CONFIG=lszt-outdoor1 npm start     # dev server, outdoor config

npm run build                      # production build, default config
CONFIG=lszt-outdoor1 npm run build # production build, outdoor config
```

The default is `lszt-indoor1` (see `defaultConfiguration` in `angular.json`).

### Adding a new deployment

1. Create `configs/<name>/settings.json`.
2. Add matching `<name>` blocks under `architect.build.configurations` and `architect.serve.configurations` in `angular.json` (copy an existing pair, swap the `input` path).
3. Build with `CONFIG=<name> npm run build`.

No fork required — all deployments live on the same branch.
