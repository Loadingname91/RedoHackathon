# Build lanes (parallel work)

Run: `npm run dev` → http://localhost:5173 (phones: use the Network URL; camera needs HTTPS, so test scanning on the Vercel deploy).
Routes are hash-based (`#/event/<id>`), see `src/App.jsx`.

## Shared (read-only for lanes; ask the lead before changing)
- `src/App.jsx` router · `src/theme.css` tokens · `src/lib/supabase.js` (`rpc()`, `PARTICIPANT_COLS`) · `src/lib/identity.js` (device ID, sessions, host secrets, prefs)
- `supabase/schema.sql`: database functions are the only way to write. **Never** `select('*')` on participants.
- Rules: `docs/design/DESIGN_AUDIT.md` (contrast, 44 px tap targets, no emoji icons, text with every color state, calm mode)

## Lane A: live social
Owns `src/screens/CheckIn.jsx`, `AtEvent.jsx`, `MySky.jsx`, `Projector.jsx`, `src/lib/social.js`, `src/components/social/*`.
Check-in → at-event home → my code (rotating QR + 4 digits) → scanner (jsQR + type code) → prompt + confirm (waiting/declined/expired) → constellation (3+) → hide/leave. Projector: event QR, live sky, room goal, room-wide gold glow. My sky: `my_sky(device)`.

## Lane B: map + navigation
Owns `src/screens/MapScreen.jsx`, `EventScreenCard.jsx`, `Navigate.jsx`, `src/lib/geo.js`, `src/data/buildings.json`, `src/data/routes.json`, `api/route.js`, `src/components/map/*`.
Leaflet + CARTO dark tiles, event stars, filters, list view, event card, "I'm free until" slider, in-app navigation via OpenRouteService (walk / wheelchair), saved routes as a backup.

## Lane C: organizer + AI
Owns `src/screens/Host.jsx`, `api/parse.js`, `src/lib/events.js`, `scripts/*`, `src/components/host/*`.
Paste → Claude extracts JSON (buildings only from `buildings.json` or "unknown") → review (amber fields, access) → `publish_event` → published screen (event QR, host link, open projector) → status toggles via `set_offerings`. Seed 6–8 real events.

## Lane D: design canvas
Claude Design canvas with the P0 screens from `DESIGN_AUDIT.md` section C.
