# KhetMitra changes applied

## Changes
- Cleared the browser-side alert/sample feed and removed local persistence of event history.
- Removed synthetic heartbeat behavior and changed the initial operating mode to DISARMED.
- Removed simulated detection buttons and stopped fake detection generation.
- Changed empty alert/connection messaging to explain that hardware setup is in progress.
- Disabled physical actuator controls until hardware integration is marked live.
- Replaced the oversized developer profile experience with a compact, CSS-only animated “Designed by DinuVoX” footer.
- Removed sample farm identity defaults and misleading simulation copy in key views.
- Added a fixed mobile viewport shell with contained main-content scrolling and safe-area spacing.

## Important limitations
- The ESP32 module is still in progress. This source does not claim physical hardware validation or working device commands.
- Existing Supabase database rows are not deleted by this frontend change. Review and remove only known demo rows in Supabase before going live; do not truncate real production data.
- The production build could not be verified in this environment because dependencies could not be installed (`vite: not found`). Run `npm ci` and `npm run build` on the development laptop before committing.

## Local validation and commit
Run from the project folder in Antigravity terminal:

```bash
npm ci
npm run build
git status
git diff --check
```

After reviewing the diff and confirming the build passes:

```bash
git add src index.html CHANGES-APPLIED.md
git commit -m "Remove demo telemetry and stabilize mobile UI"
```

This creates a local commit only. Push to GitHub separately only when you are ready. Keep `.env.local`, `.git`, and `.vercel` from the original local project; they are intentionally not in the source archive.
