# Design audit: Constellation U (plan stage)

Audited: `docs/plan/CONSTELLATION_U.md`, `docs/design/DESIGN_PROMPT.md`, `docs/design/DESIGN_BRIEF_PERSONAS.md`, `supabase/schema.sql`.
Nothing is built yet, so this checks **screen coverage** and **design and accessibility risks in the plan**. Code checks (contrast measurements, performance, phone-size layout) run after the build.

Priority key: **P0** blocks the demo or the core promise · **P1** needed for a credible product · **P2** after the hackathon.

---

## A. Screen inventory

✅ = in the design prompt · ⚠️ = mentioned but has no screen · ❌ = missing

### 1. Collecting events (organizer + AI agent)
| Screen | Status | Priority |
|---|---|---|
| Add event: paste text / upload flyer | ✅ | P0 |
| Agent steps, shown live | ✅ | P0 |
| Review and fix fields (amber = unsure; building picker; offerings; **access fields**) | ⚠️ the access fields aren't on the review form | P0 |
| **Possible duplicate** ("WEB, 7 PM, same club: is this the same event?") | ❌ | P1 |
| **Published** confirmation: event QR code, "Open event screen", "Print QR", "Copy host link" | ❌ | P0 |
| My events list with quick status buttons | ⚠️ described, no screen | P1 |
| Edit / cancel event (cancelled star fades, and checked-in people are told) | ❌ | P1 |
| Event recap (counts + AI feedback summary) | ⚠️ | P2 |
| Campus Connect import queue (batch review) | ⚠️ | P2 |

### 2. Organizer setup
| Screen | Status | Priority |
|---|---|---|
| "Host an event" first screen: what you get, takes 1 minute | ❌ | P1 |
| **Host link / managing from a second device** | ❌ (see issue H1) | **P0** |
| Organizer sign-in (U email) + club verification request | ❌ | P2 (pitch) |

### 3. New student setup
| Screen | Status | Priority |
|---|---|---|
| First open: map + one-line promise ("No GPS stored. Nobody sees you unless you check in.") | ⚠️ the promise only appears at check-in | P0 |
| Schedule setup (slider / .ics) | ✅ | P1 |
| **Accessibility preferences** (step-free routes, text-first, calm mode, large text) | ❌ only in settings | P1 |
| **Location permission explainer** before the browser asks | ❌ | P0 (navigation depends on it) |
| **Camera permission explainer + "camera blocked" state** that falls back to the 4-digit code | ❌ | P0 |
| Notifications opt-in | ⚠️ pitch | P2 |

### 4. Finding events
| Screen | Status | Priority |
|---|---|---|
| Map with filters | ✅ | P0 |
| **List view** (same content as the map, for accessibility) | ⚠️ a toggle is mentioned, no screen | P0 |
| **Building sheet with several events** ordered by time | ❌ (the spec requires it) | P1 |
| **Search** (club, event, building) | ❌ | P1 |
| Event card | ✅ | P0 |
| "No events match" empty state for each persona | ⚠️ in the persona brief only | P1 |

### 5. Getting there
| Screen | Status | Priority |
|---|---|---|
| Navigation (route, ETA, walk/step-free toggle, steps) | ✅ | P0 |
| Arrived → "Check in?" | ✅ | P0 |
| **Route failed / offline** → saved route or "Open in Maps" | ❌ | P1 |

### 6. At the event
| Screen | Status | Priority |
|---|---|---|
| Check-in | ✅ | P0 |
| At-event home (half-word, Star Corner, Connect, Hide me) | ✅ | P0 |
| My connect code (rotating QR + 4 digits) | ✅ | P0 |
| **Scanner** (camera view + "Type code instead") | ❌ | P0 |
| Match found (color + pattern + word) | ✅ | P0 |
| Prompt + confirm | ✅ | P0 |
| **Waiting for the other person / they declined / code expired / already connected** | ❌ | P0 (the server already returns these errors) |
| Constellation formed + naming | ✅ | P0 |
| Share card | ⚠️ | P2 |
| Room goal reached (whole room lights up) | ✅ | P1 |
| **Block / report this person** | ❌ (privacy promise) | **P0** |
| Leave event / hide me (confirmation + "your star is gone") | ⚠️ button only | P0 |
| Empty room ("You're first") | ✅ | P1 |
| Event ended (presence removed, feedback prompt) | ⚠️ | P1 |
| Feedback | ✅ | P2 |

### 7. User profile: **"My sky"** (missing entirely)
| Screen | Status | Priority |
|---|---|---|
| **My sky**: my constellations across events, star count (private), unlock progress ("1 more to host") | ❌ | **P0** (micro-events depend on it) |
| Edit default nickname, interests, clue | ❌ | P1 |
| Keep-in-touch handles (shared only when both agree) | ❌ | P2 |
| Connection list with **remove** / **block** | ❌ | P1 |
| **Privacy & data**: what's stored, "Delete everything" | ❌ | P1 |
| Settings: accessibility, sound, motion, calm mode, hide social | ⚠️ | P1 |

### 8. Micro-events
| Screen | Status | Priority |
|---|---|---|
| Unlock moment ("You've earned hosting") | ⚠️ | P1 |
| Create (title, building, time, visibility) | ✅ | P1 |
| **RSVP request → host accepts → room revealed** | ❌ (the spec relies on this for safety) | P1 |

### 9. System states (every screen)
Loading, reconnecting ("Live updates paused"), session expired, event cancelled. ❌ none are designed yet. **P1.**

**Count:** 12 screens designed · ~11 mentioned without a screen · ~17 missing (6 of them P0).

---

## B. Issues found in the plan

### Data model and logic (fix before building)
| # | Issue | Why it matters | Fix | P |
|---|---|---|---|---|
| H1 | **The host secret only lives in one browser.** The demo uses laptop 1 for the event screen and laptop 2 for the organizer panel, so laptop 1 can't control the event. | The demo breaks | "Host link" with the secret in the URL fragment; open it on the second laptop | **P0** |
| H2 | **No identity across events.** `participants` is per event, so stars can't add up and micro-events can't unlock. "My sky" has no data. | A core feature has no data behind it | Add a `device_id` (person) column to `participants`; count confirmed connections per device. Keep the per-event row temporary. | **P0** |
| H3 | Connections are deleted when presence expires or someone leaves, which erases "My sky" history | Profile is empty after each event | When someone leaves, keep the connection but hide its event presence. Or store a separate lasting `bonds` row (device ↔ device) at confirmation. | P1 |
| H4 | Any browser can read nicknames at any live event (a known shortcut) | Breaks "only people here see your star" | Read participants only through a function that checks you're checked in. Map shows counts only. | P1 |
| H5 | Two kinds of QR code (event QR vs. your rotating code) | People scan the wrong one | Different frames + labels: "Join this event" (crimson frame) vs "My star code" (gold, with countdown) | P0 |
| H6 | Event times are stored in UTC; schedule fit runs on the phone | Wrong fit/clash badges | Convert to America/Denver for display and comparisons | P1 |

### Accessibility
| # | Issue | Fix | P |
|---|---|---|---|
| A1 | **Clashing events at 30% opacity** make their text unreadable (fails 4.5:1 contrast) | Dim the *star* only; keep the text at full contrast with a "Clashes with CS 3500" label | P0 |
| A2 | **Utah crimson #CC0000 as text on navy** is about 3:1 contrast and fails | Crimson only as a button background (white text passes); a lighter coral for crimson text on dark | P0 |
| A3 | **Emoji as icons** (🍕 ♿ 🤫) read inconsistently aloud ("slice of pizza") and look different on every phone | Single-style SVG icons with written labels | P1 |
| A4 | **Stars as tap targets** are smaller than 44 px | 44 px invisible hit area; the list view has the same actions | P0 |
| A5 | Schedule fit, offering status and live state rely on color/brightness | Always pair with text ("Fits 45-min gap", "Running low") | P0 |
| A6 | Gestures (hold to link, drag star, shake, tilt, pinch) | Each has a visible button (already a rule); check it on every screen | P0 |
| A7 | Dark theme while **navigating outdoors** in daylight is hard to read | High-contrast navigation mode by default when walking | P1 |
| A8 | Animated stars + room flash + sounds are too much for sensory-sensitive students, who are one of the target groups | **Calm mode**: no twinkle, no flash, no sound. Offered at setup and auto-on with reduced motion. | P1 |
| A9 | The spoken screen-reader updates must not interrupt during navigation | Polite updates; navigation turns take priority | P1 |

### Visual design and hierarchy
| # | Issue | Fix | P |
|---|---|---|---|
| V1 | **Event card overload**: offerings + status + access + social count + fit + 3 buttons | One main action per persona (Check in / Take me there). Access as one summary row ("Step-free · Quiet unknown") that expands. | P0 |
| V2 | Too many fun touches competing (10+). They fight for attention and slow the build. | Keep 3 signature moments: halves joining, lines drawing, room lights up. Everything else is quiet. | P1 |
| V3 | Brand: night sky + gold + crimson risks looking like a generic "space app" | Make it Utah-specific: Wasatch silhouette, real building shapes, U-style typography. Avoid nebula gradients. | P1 |
| V4 | The match screen fills the whole display with one color, which makes the phone hard to use and can look like an alarm | Color frame + pattern + word, with a "Done" button always visible | P1 |

### Privacy and safety
| # | Issue | Fix | P |
|---|---|---|---|
| S1 | **No block/report screen**, though the spec promises it | Block (hidden from each other, can't connect), Report (to the organizer and app admin) | **P0** |
| S2 | Your clue ("green hoodie") identifies you; it must never appear on the projector | The rule exists; add it to the event screen's design note | P0 |
| S3 | Shared constellation cards could show who met whom | Nicknames only, ask before sharing, all members must allow | P2 |
| S4 | Requests to the routing service send the user's start location | Say so on the navigation screen (already planned); never log it | P0 |

---

## C. Recommended screen set for the design (in build order)

**Student, P0:** First-open map · List view · Event card · Location explainer · Navigate · Arrived · Check-in · At-event home · My star code · Scanner (+ type code / camera blocked) · Match found · Prompt + waiting/declined states · Constellation formed · Block/report · Leave/hide · **My sky (profile)**

**Organizer, P0:** Add event (paste) · Agent steps · Review (with access fields) · Published (QR + host link) · Event screen (projector)

**P1, add after:** Building sheet · Search · Duplicate warning · My events · Settings (calm mode, accessibility) · Schedule setup · Micro-event create + RSVP · Room goal reached · Event ended + feedback · System states

**Before building, fix in data:** H1 (host link) and H2 (`device_id`).
