# KhetMitra updated prototype

This package includes the existing React + Vite project with an initial UI implementation of:

- Device Controls page for buzzer toggle/intensity, scarecrow light toggle/brightness, automatic protection switch, and manual alert button.
- Animated four-direction radar-style visualization.
- Settings page with configurable developer display name, profile photo URL, bio, LinkedIn, and Instagram links.
- Explicit demo labels so the UI does not claim to control real hardware.

## Run locally

1. Install Node.js if not already installed.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local` and enter your Supabase project URL and publishable key only if you want to configure Supabase authentication.
5. Run `npm run dev`.
6. Run `npm run build` to validate the production build.

## Important implementation limits

- Device controls currently update demo UI state only. They do not control a physical ESP32, buzzer, or light.
- Radar sweep is an animation, not a physical radar or real sensor feed.
- Developer profile fields currently persist only while the app remains open; Supabase persistence is not implemented here.
- Real ESP32 integration requires firmware, authenticated backend command delivery/acknowledgements, database schema and policies, and compatible driver circuits. A dimmable light and PWM-capable buzzer/driver are required for intensity control.
- Push notifications are not configured in this update.

The original `.env.local`, `.git` history, `node_modules`, and `dist` build output are intentionally excluded from this archive. Keep your local credentials private and do not upload service-role keys to GitHub.
