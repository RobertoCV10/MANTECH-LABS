# AGENTS.md

## Architecture
Electron app for Windows system optimization.
- **Main Process**: `src/main/` (IPC, PowerShell system calls, window mgmt)
- **Preload**: `src/preload/` (Secure bridge)
- **Renderer**: `src/renderer/` (React application)
- **IPC Handlers**: `src/main/ipc/` (`ram.ts`, `temp.ts`, `max.ts`, `sentinel.ts`)
- **System Ops**: Executed via PowerShell in `src/main/utils/powershell.ts`

## Development
- **Main Entry**: `src/main/index.ts`
- **Renderer Entry**: `src/renderer/src/main.tsx`
- **Note**: `package.json` is located outside the current working directory; build/run scripts are not in the root.

## Localization & Data
- **Framework**: `react-i18next`
- **Locales**: `src/renderer/src/i18n/locales/` (es.json, en.json)
- **Maintenance Tasks**: `src/renderer/src/data/mantenimientos.json` uses translation keys.
- **Constraint**: New tasks must be added to both `es.json` and `en.json` under `maintenance.tasks`.

## Testing
- No automated test framework. Verify functionality manually by running the app.
