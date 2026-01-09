# AI Coding Agent Instructions for gatofit-ai

## Big Picture
- **Stack:** Vite + React + TypeScript + Tailwind + shadcn-ui, Capacitor for mobile, Supabase for backend.
- **App targets:** Web (`vite`), iOS/Android via Capacitor (`ios/`, `android/`). Mobile-specific assets and scripts live under `scripts/` and `public/`.
- **Structure:** React components in `src/components/**`, pages/routes in `src/pages/**`, shared logic in `src/hooks/`, `src/lib/`, `src/utils/`, feature-specific modules under `src/components/*/` and `src/features/`. Supabase serverless functions under `supabase/functions/` and migrations under `supabase/migrations/`.

## Key Workflows
- **Dev server:** `npm run dev` (see `package.json`). Uses Vite with Tailwind (`tailwind.config.ts`) and PostCSS (`postcss.config.js`).
- **Mobile sync:** `npx cap sync` or `npx cap sync android|ios` to copy web assets to native projects and update plugins. Then `npx cap open android|ios` to open IDE.
- **Mobile build helper scripts:**
  - `scripts/build-mobile.sh` to build and sync mobile assets end-to-end.
  - Notification sound helpers: `scripts/gen-notification-sound.py`, `scripts/copy-notification-sound.sh`, `scripts/add-notification-sound-to-xcode.sh`.
  - Xcode integration helper: `scripts/add-file-to-xcode.py`.
- **Supabase:** Config in `supabase/config.toml`. Use migrations in `supabase/migrations/`. Functions in `supabase/functions/`.

## Conventions & Patterns
- **Components:** Co-located UI components under `src/components/` (e.g., `AIChat.tsx`, `WorkoutCarousel.tsx`). Prefer functional components with hooks; keep styles in Tailwind classes in the JSX.
- **Feature folders:** Subfolders like `ai-chat/`, `calendar/`, `exercise/`, `nutrition/` indicate domain grouping; put domain-specific hooks and utilities nearby.
- **Routing & App shell:** Entry points `src/main.tsx` and `src/App.tsx`. Navigation components like `NavBar.tsx`, `TabMenu.tsx`, and `ProtectedRoute.tsx` suggest guarded routes; ensure auth context usage via `src/contexts/**` when adding protected screens.
- **State & Contexts:** Shared state via `src/contexts/**` and custom hooks in `src/hooks/**`. Follow existing naming: `useX`, context providers `XProvider`.
- **Types:** Define shared types in `src/types/**`. Keep API and data contracts centralized here.
- **Integrations:** Third-party services configured under `src/integrations/**` and `src/services/**`. Use environment variables from `.env` and Vite’s `import.meta.env` pattern.
- **Assets:** Static files in `public/` (e.g., `public/splash/`). Generated/processed assets via scripts in `scripts/`.

## Mobile (Capacitor) Notes
- **Config:** `capacitor.config.ts` drives app ID/name, appURL, and native project settings. Sync after any config change.
- **iOS:** Lives in `ios/App/…` with CocoaPods (`Podfile`, `Pods/`). Run `npx cap sync ios` and open with Xcode.
- **Android:** Lives in `android/app/src/…`. Run `npx cap sync android` and open with Android Studio.
- **Notifications:** See `NOTIFICATIONS.md`, `NOTIFICATION_SOUND_*` guides and scripts under `scripts/` for adding custom sounds and background handling.
- **Live Activities / Splash:** Refer to `LIVE_ACTIVITY_SETUP.md` and `public/splash/splash.html` along with `scripts/generate-splash.py`.

## Testing & Debugging
- **Web debug:** Vite dev server with React Fast Refresh. Use browser devtools; check network calls to Supabase.
- **Mobile debug:** Use Android Studio/Xcode debuggers after `npx cap open`. Re-run `npx cap sync` whenever web assets or plugin configs change.

## Environment & Secrets
- **Vite env:** Use `.env` with `VITE_*` variables. Access via `import.meta.env.VITE_*` in client code.
- **Supabase keys:** Store in `.env` and wire through `src/lib` or `src/services` modules; avoid hardcoding.

## Example Additions
- **New protected screen:**
  1. Create `src/pages/MyFeature.tsx` using Tailwind.
  2. Add route and guard via `ProtectedRoute.tsx`.
  3. Place feature logic under `src/components/my-feature/` and hooks under `src/hooks/useMyFeature.ts`.
  4. If mobile-specific, verify Capacitor plugin availability and re-sync.

## Commands Reference
- `npm run dev`: start web dev server.
- `npx cap sync android`: sync web build and plugins to Android.
- `npx cap open android`: open Android project in Android Studio.
- `bash scripts/build-mobile.sh`: build and sync end-to-end for mobile.

Keep changes minimal and aligned with existing file layout and naming. Prefer co-locating feature code with related components and hooks. Document any new mobile integration in the relevant `NOTIFICATION_*` or mobile guides.