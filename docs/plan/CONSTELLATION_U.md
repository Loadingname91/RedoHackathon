# Constellation U

**Follow what's happening. Find your people.**

Crimson Hacks 2026 · Theme: State of Utah ("Life on campus at the U")

---

## 1. The idea in one line

A night-sky map of campus that shows what's happening and what each event offers (food, swag, music, games, speakers, workshops, prizes). When you're at an event, you can opt in to meet people there. Each connection you both confirm in person draws a line between your two stars, and three connected people form a named constellation.

The event's offering gets people to show up. The constellation gets them talking once they're there.

**Problem:** Campus events are spread across 600+ student orgs, Instagram, Discord and Campus Connect, so students miss them. When students do go, many stand alone.

---

## 2. Full feature set (the pitch version)

| # | Feature | What it does |
|---|---|---|
| 1 | **Campus map** | Events are pins on their building (not on the club's usual building). Filters: Now, Later today, Open to meet, and one per offering. A plain list view is available as an accessible alternative. |
| 2 | **AI announcement agent** | Paste a flyer, a post or a Campus Connect entry. The AI pulls out the title, host, time, building, room and what the event offers. The building must come from a fixed campus list, or the answer is "unknown". Missing or uncertain fields are flagged for review. The agent's steps are shown on screen. |
| 3 | **Offering tags** | 🍕 food · 🎁 swag · 🎵 music · 🎲 games · 🎤 speaker · 🛠 workshop · 🏆 prizes · 🤝 networking · other (original wording kept) |
| 4 | **Live offering status** | The host sets limited offerings (food, swag) to Advertised → Available → Running low → Finished. A flyer saying "pizza" doesn't mean pizza is still there. |
| 5 | **Event check-in** | Scan the event's QR code, pick a nickname and 2–3 interests, and your star appears around that building. |
| 6 | **In-person connection** | Your phone shows a QR code that changes every 30 seconds. The other person scans it, you both get the same prompt, both confirm, and a line draws. |
| 7 | **Constellations** | Three people connected through confirmed links form a constellation, and the group names it. It stays on the map for that event. |
| 8 | **Earned micro-events** | Stars replace follower counts. Once you have 3+ confirmed connections, you can post your own small event (a book reading, a coffee meetup, a study session) and choose who sees it: my constellation, connections of my constellation, or the whole campus. |
| 8b | **Event feedback** | After the event, people who checked in see one tap ("Worth going? 😞 😐 😄") and an optional comment. Only checked-in people can rate, which stops spam. Feedback is anonymous, and the organizer sees it only once 3+ people have answered. The AI turns the comments into a summary for the organizer. This becomes the organizer's reason to keep posting. |
| 8c | **My schedule fit** | Load your own calendar and the map adjusts: events in your free time **glow brighter** with a badge like "Fits your 45-min gap", and events that clash with your classes **dim**. You load a `.ics` file exported from Google, Outlook or Apple Calendar, or use a quick "I'm free until __" slider instead. **The calendar is read only inside your browser and never sent to the server.** Linking a live calendar account is something to pitch, not build tonight. |
| 9 | **Surplus handoff** *(pitch only)* | The organizer posts leftover food with a pickup window. Later, this could connect with food-rescue partners. |

---

## 3. Why QR codes instead of Bluetooth

- **Bluetooth doesn't work in a website on iPhones.** Safari has no Web Bluetooth, and even Chrome can't detect nearby phones. It would need a native app, which is days of work.
- **Bluetooth is a privacy problem.** Phones broadcasting in the background allow passive tracking.
- **A rotating QR code proves you're together.** It can only be scanned in person. A screenshot sent elsewhere stops working within 30 seconds. Showing your code is a clear way of agreeing to connect.

**How a connection is made, with every step checked on the server:**

```
Tap "Connect" → show rotating QR → other person scans
→ server checks: code still fresh, both people checked into the same event, neither has blocked the other
→ both get the same prompt → both confirm → line appears everywhere
```

**The visual moment:** each phone shows half a star shape. When the scan succeeds, the halves fly together and light up, and the projected map zooms in and draws the new line.

*Optional second step:* both people press "Link" at the same moment (within about 2 seconds).

### Finding each other in a crowded room
Use three layers. Each is cheap, and none of them track anyone.
1. **Star Corner:** the event screen marks a physical spot, such as "Star Corner: by the projector". People who want to meet go there, so they're easy to spot.
2. **Your own clue (optional):** at check-in, you can type one line about yourself, such as "green hoodie, near the pizza". Only your match sees it, and it disappears when the event ends. You write it yourself; the app never takes or shows a photo.
3. **Matching colors:** when you've been matched, both phones fill the screen with the same color and your half-word ("SAUCE"). Hold your phone up and look for your color.

Without a match: anyone holding up a star screen is open to connecting, so just scan them.

---

## 3b. Games that get people to meet more

These games nudge people toward meeting but never force them. Every game is opt-in, has a skip button, never penalizes anyone, and never shows a public score. The games are cooperative: the room wins together, and nobody gets ranked.

| Game | How it works | Why it works | Build cost |
|---|---|---|---|
| **Find your half** ⭐ | At check-in, the server pairs people with shared interests and gives each person half of a pair, such as "Fry" / "Sauce", "Delicate" / "Arch", or "Pizza" / "Pineapple". Find the person holding your other half and scan their code. | Gives shy people an easy opening line ("are you Sauce?"). | ~30 min. **Build tonight.** |
| **Light up the room** ⭐ | The projected map shows a shared goal for the event: "12 / 20 links". When the room reaches the goal, the whole sky lights up. | The room works together toward a visible moment, which makes a great finale. | ~20 min. **Build tonight.** |
| **Bridge stars** | When you connect two separate constellations, they merge into one bigger constellation, and your star gets a "bridge" glow. | Rewards meeting people outside your own group. | ~30 min. Stretch. |
| **Shooting star** | At random moments, everyone at the event gets a 10-minute prompt, such as "Find someone who has never been to Alta". Completing it leaves a shooting-star trail on your line. | Creates waves of activity across the room. | ~30 min. Stretch. |
| **Event-aware prompts** | The AI writes connection prompts from the event's tags, such as "Teach each other one thing" at a workshop or "Rate the pizza together" at a pizza night. | Another visible use of the AI. | ~20 min, reusing the AI call. |
| **Utah shape constellations** | Specific link patterns form named shapes: 3 = triangle, 5 = Block U, 7 = Delicate Arch. Each shape has its own artwork. | Collectible goals that fit the Utah theme. | Pitch only. |
| **Meet again** | Connecting with the same person at a second event makes the line brighter, so repeated meetups count more than one-off meetings. | Builds friendships, not just contacts. | Pitch only. |
| **Constellation perks** | Hosts or local Utah shops attach a small perk for constellations, such as stickers, a coffee discount or front-row seats. Food and entry are never gated. | Gives local businesses a reason to join (a link to the Best Commerce Hack prize). | Pitch only. |
| **Weekly sky** | A private recap: "You met 3 new people this week." It's only visible to you, with no streak pressure. | Gentle encouragement to come back. | Pitch only. |

**Guardrails:** no public counts, no "least connected" list, no penalty for skipping, and a limit on how often prompts appear. Someone who just wants the event can turn the game off entirely.

---

## 3c. Playful design layer

All of these are listed in full in `docs/design/DESIGN_PROMPT.md`. What to build tonight, ranked by wow per minute:

| # | Touch | How | Cost |
|---|---|---|---|
| 1 | **Whole room lights up:** when the goal is reached, every phone flashes gold together and the event screen goes supernova | One live broadcast message + a CSS glow | ~25 min. **Biggest wow.** |
| 2 | **Halves join + vibration + chime** when connecting | Animation library + phone vibration (Android only) + a short sound | ~30 min |
| 3 | **Lines draw like a pen stroke** + star-shaped confetti when a constellation forms | SVG line animation + `canvas-confetti` | ~20 min |
| 4 | **Living sky:** sunset-to-night by real SLC time + Wasatch silhouette | A CSS color gradient picked by the hour + one SVG shape | ~15 min |
| 5 | **Drop your star** onto the building at check-in | Drag gesture | ~30 min, stretch |
| 6 | Hold to link, shooting-star prompts, tilt parallax, constellation melody, shake to shuffle | Various | Stretch / mock only |

Notes: iPhone needs a permission tap before tilt or shake can work, and iPhone doesn't support vibration from the browser. Treat both as extras.
Guardrails: reduced-motion support, sound off by default, no flashing faster than 3 times per second, and a plain button for every gesture.

---

## 3d. Accessibility features

These make an event easier to attend and easier to meet people at. Accessibility info the app doesn't know is shown as **"Unknown"**, never guessed.

| # | Feature | Who it helps | How | Tonight? |
|---|---|---|---|---|
| 1 | **Access info on every event:** step-free entrance, elevator, accessible restroom, seating, quiet space, captions or ASL, and sensory level (loud, bright, crowded) | Wheelchair users, people with low energy, Deaf and hard-of-hearing students, autistic students | The AI pulls access details from the announcement and marks anything not mentioned as "unknown". The organizer can fix fields with quick toggles. Filters: ♿ Step-free · 🤫 Quiet · 🧏 Captions/ASL. | **Yes** (~30 min, adds fields to the AI output) |
| 2 | **Directions to the accessible entrance**, not the middle of the building | Wheelchair and mobility-aid users | Store a step-free entrance location for each building in `buildings.json`. The Directions button goes there. If the entrance isn't confirmed, say "not verified". | **Yes** (~15 min of data) |
| 3 | **Text-first connecting:** an "I prefer text" badge your match sees, the prompt answered in the app with no talking needed, and suggested opening lines | Autistic, anxious or non-speaking students, Deaf students | One setting on the check-in screen | **Yes** (~20 min) |
| 4 | **"Come to me":** you stay where you are and your match comes to you, with your own clue ("by the elevator, blue wheelchair") | Wheelchair users, people who can't move through crowds | One setting on the check-in screen. The match screen tells the other person to find you. | **Yes** (~10 min) |
| 5 | **Colorblind-safe matching:** the match screen uses color + a big word + a pattern (stripes, dots, waves), never color alone | Colorblind users | CSS patterns | **Yes** (~10 min) |
| 6 | **Screen reader support:** spoken updates ("Sauce confirmed. Your constellation has 3 stars."), list view in addition to the map, 4-digit code instead of QR scanning, large-text and high-contrast themes | Blind and low-vision users | Labels that screen readers can read aloud; contrast checked on the dark theme | Partly (spoken updates + list view) |
| 7 | **Live sensory level:** the host taps Quiet / Busy / Loud. A "quiet hour" can be added to events. | Autistic students, people with sensory sensitivity | Same toggle as the offering status | Stretch |
| 8 | **Access problem reports:** "Elevator out at WEB", shown on the building and expiring after 24 h | Mobility-aid users | Short report form + live update | Pitch |
| 9 | **Wheelchair route + its travel time** included in schedule fit | Mobility-aid users | OpenRouteService `wheelchair` route (avoids stairs), using the same navigation screen | Yes for the route toggle; travel time in schedule fit is a stretch |

**Pitch line:** "Most event apps tell you what's happening. We also tell you whether you can get in, how loud it is, and let you meet people without having to shout across a crowded room."

---

## 4. Privacy and safety rules

| Scenario | Rule |
|---|---|
| Seeing who is at an event | You only see individual stars at events you've checked into. Elsewhere you see a count, and only once 3+ people are there, so one person can't be identified. |
| Location | No GPS and no Bluetooth. Presence comes from QR check-in only, ends when the event ends or when you leave, and no history is kept. |
| Unwanted connection | Both people must confirm, enforced on the server. Users can decline, block, and remove a connection at any time. |
| Connecting just to see someone's micro-events | Removing or blocking someone cuts their access immediately. The exact room is shown only after the host accepts an RSVP. Micro-events must be in a public campus building. |
| Farming stars for status | You can only connect with someone checked into the same event at the same time. Others never see your star count. No leaderboard and no "least connected" list. |
| Projected shared screen | Shows nicknames only, and only for people who opted in. |
| Access to food or perks | Never tied to joining the social part. Attending an event never requires connecting with anyone. |
| Pasted text tries to instruct the AI | The text is treated as data only. Publishing always needs an organizer to confirm. |
| Screenshots | They can't be prevented, which is why only nicknames are ever shown. |
| Accessibility | A list view in addition to the map, keyboard controls, typed answers to prompts, a reduced-motion option, and "unknown" accessibility info shown as unknown. |

---

## 5. What we build tonight (team of 3)

| # | Feature | Owner | Priority |
|---|---|---|---|
| 1 | **Live sync:** check in → star appears on every screen → QR connect → line → 3 stars = name the constellation | A | **Must. Riskiest part, build first.** |
| 2 | Dark Leaflet map, ~8 hand-placed U buildings, event pins and cards, filters | B | Must |
| 2b | **In-app navigation:** route line + ETA + steps (~40 min), then live follow + next-turn banner + rerouting (~30 min), with saved routes as a backup | B | Must (route line); live follow as Stretch 1 |
| 3 | Paste announcement → AI returns JSON → building from the fixed list → review screen → publish → pin appears, with agent steps shown | C | Must |
| 4 | Host offering-status toggle that updates live | B | Must (small) |
| 4b | "Find your half" pairing + "Light up the room" goal on the projected map | A + B | Stretch 1 (cheap, big demo moment) |
| 5 | Earned micro-events with visibility choice (constellation only / everyone) | A | Stretch 1b |
| 5b | **Schedule fit:** "I'm free until __" slider first; then `.ics` upload read in the browser with `ical.js`; events brighten or dim based on clashes | B | Stretch 1c (~30 min slider + 30 min file upload) |
| 6 | Two-halves joining animation and big-screen zoom | B | Stretch 2 |
| 7 | Import the Campus Connect calendar feed | C | Stretch 3 |
| 8 | Flyer photo intake (vision AI) | C | Stretch 4 |

**Cut:** Instagram scraping, delivery and shelter routing, recommendations, permanent friend lists, leaderboards, Bluetooth.

**Map:** Leaflet + CARTO "Dark Matter" tiles (free, no API key, built on OpenStreetMap; the credit line must stay visible). Building coordinates are hand-picked by clicking each building and saved to `buildings.json` (code, names, lat/lng). Night-sky look: dark tiles + glowing star markers + SVG lines.
**In-app navigation (you never leave the app):**
- **Routing service:** OpenRouteService, which is free with a key and has `foot-walking` and **`wheelchair`** routes. It's called from a Vercel serverless function so the key stays hidden. It returns the route line, distance, time and turn-by-turn steps.
- **Route on the map:** a glowing "comet trail" line from you to the event's (accessible) entrance, an ETA chip ("6 min walk"), and a list of steps.
- **Live follow:** the browser's location API moves your dot along the route, a banner shows the next turn, and the route is recalculated if you're more than ~30 m off it. Arriving can open the event check-in.
- **Start point:** your location, or "Start from building…" (needed indoors, where GPS is poor, and useful for the demo).
- **Privacy:** your location is used only to fetch the route. It's sent to the routing service through our function and is **never stored**. The screen says so.
- **Backup:** routes between the ~8 demo buildings are saved ahead of time in `routes.json`, so the demo works even if the routing service or Wi-Fi fails. An "Open in Maps" link shows only when routing fails.
**Stack:** React + Leaflet (dark map tiles), Supabase Realtime or Firebase, one AI call returning JSON, Vercel. Deploy early so phones can join. Credit the open source used in the README.

**AI output shape:**

```json
{
  "title": "", "host": "", "start": "", "end": "",
  "building_code": "WEB | MEB | UNION | ... | unknown",
  "room": null,
  "offerings": [{"type": "food", "text": "pizza"}],
  "access": {"step_free": "unknown", "captions_asl": "unknown", "quiet_space": "unknown", "sensory": "unknown"},
  "needs_review": ["room", "end"],
  "source_text": "..."
}
```

---

## 6. Timeline (keyboards down at 11:30 PM)

| Time | Goal |
|---|---|
| 7:00–7:15 | Lock scope, assign roles, agree on the data shapes, deploy a blank page |
| 7:15–8:30 | **Prove the risk:** two phones and a laptop show the same star and connection live. Agent returns clean JSON. Map shows pins. |
| 8:30–9:45 | Connect it all: paste → pin → check in → connect → constellation. Offering-status toggle. |
| 9:45–10:45 | Polish: animations, event card, privacy controls (hide, leave, block), list view. Stretch 1 if things are on track. |
| 10:45–11:15 | **Freeze.** Test on U Guest Wi-Fi and a hotspot, test double taps and disconnects, record a backup video, rehearse twice. |
| 11:15–11:30 | Final commit, fill in the team slip, have the demo running at the table. |

**Fallback rule:** if live sync isn't working by 8:15 PM, drop all stretch features.

---

## 7. Demo setup

**Platform:** a mobile website that opens in the phone's browser. **Not Capacitor or an Android app.**
- Judges scan a QR code and join from their own phone in seconds. That's the core of the demo. An Android app can't be installed on an iPhone, and nobody will install an APK at a table.
- Phone browsers can use the camera over HTTPS, which Vercel provides, so QR scanning works without a native app.
- Capacitor would only add Bluetooth and push notifications, and both have been dropped. Packaging an app would cost hours.

**Table layout:**
| Device | Role |
|---|---|
| Laptop 1 (facing the judges) | **Event screen:** big QR code, live sky, room goal |
| Laptop 2 | **Organizer panel:** paste announcement, see agent steps, toggle offering status |
| Teammate phones ×2 | Already checked in and connected (real sessions, not fake users) |
| Judge's own phone | Scans the QR code, joins, completes the constellation |
| Spare team phone | Handed to a judge whose phone camera or browser fails |

**Test early:** iPhone Safari camera access, Android Chrome, U Guest Wi-Fi and a phone hotspot.

## 7b. Demo script

**Table demo (~90 s):**
- **0–15 s, problem:** "Events at the U are spread across 600+ orgs and five apps. When you do show up, you often stand alone."
- **15–50 s, live:** A judge pastes or types an announcement. The agent's steps appear and a pin lands on the building. The judge scans the event QR code, then scans a teammate's connection code. The halves join, and a third star completes the constellation. The judge names it.
- **50–75 s, tech:** "The AI can only place events on known buildings, and it flags what it isn't sure about. Connections require being in the same room, both people confirm, and the server checks every step. No GPS, no Bluetooth."
- **75–90 s, result:** The host marks food "Finished". The badge updates, but the constellation stays, because the event was a way to meet people. "Next: earned micro-events and a feed of every campus event."

**Finalist stage (3 min):** same flow, plus showing a micro-event unlocking and the privacy rules.

---

## 8. Prizes we can target

| Prize | Fit | Why |
|---|---|---|
| **Best Overall Hack ($500)** | Strong | Fits the "Life on campus at the U" theme example. The judge's own action changes the map. |
| **Best Use of AI ($250)** | Strong | Messy announcements become a placed, tagged event, and the agent's steps are visible. Running the sponsor's Synthe tool on the extraction prompt is a bonus. |
| **Best Design ($250)** | Good | Night-sky map, joining-halves animation, live lines. |
| **Wildest Idea ($250)** | Possible | Stars and constellations replacing follower counts. |
| Best Technical Build ($250) | Medium | Live multi-device state, rotating-code proximity check, consent enforced on the server. |
| Most Ambitious ($250) | Medium | Only if we pitch the full vision. |
| Best Commerce Hack ($250) | Weak | Not worth chasing. |

**Official judging criteria:**
- **It works:** three devices running live.
- **It's useful:** a U student would use it tonight.
- **It's well built:** consent checked on the server, AI limited to known buildings.
- **It's clear:** "Follow what's happening. Find your people."

Be at the table with the team slip by 11:35 PM, or we can't place.

---

## 8b. Decisions (recommended, waiting for the team's yes)

| # | Decision | Recommendation |
|---|---|---|
| Q1 | Idea locked | Yes. Constellation U, no more idea changes |
| Q2 | Identity | No accounts. Random ID saved in the phone's browser; stars add up per phone. Pitch U email sign-in. |
| Q3 | Live sync | Supabase (database + live updates), or Firebase if a teammate knows it well |
| Q4 | Map | Leaflet + CARTO Dark Matter tiles. **Full in-app navigation** via OpenRouteService (walking + wheelchair), live follow, with saved demo routes as a backup. |
| Q5 | Proving you're together | Rotating QR code + 4-digit code to type when the camera fails |
| Q6 | AI | Claude API (`ANTHROPIC_API_KEY`), called from a Vercel serverless function so the key never reaches the browser |
| Q7 | Event screen | Must-have. It's the projected laptop view: QR code, live sky, room goal, Star Corner |
| Q8 | Seed data | 6–8 real U announcements pasted in by hand. The Campus Connect feed is a stretch. |
| Q9 | Matching | Automatic "find your half" pairs by shared interests; anyone can still scan anyone |
| Q10 | Feedback | Stretch item tonight (one tap + AI summary, about 25 min) |
| Q11 | Platform | Mobile website only. No Capacitor or native app. |

## 8c. Gaps from the journey map (see `JOURNEY_MAP.md`)

| Gap | Fix | Tonight? |
|---|---|---|
| Empty map | Seed real events | Yes |
| Nickname vs stars that add up | Phone-only ID (Q2) | Yes |
| Nowhere to show the QR code | Event screen (Q7) | Yes |
| Empty room / no match | "You're first, you'll match with the next person" | Yes (copy) |
| Status forgotten | Auto-"Finished" when the event ends | Yes (5 min) |
| Finding your match | Star Corner + your own clue + matching colors | Yes if time |
| Connections lead nowhere after the event | Both opt in to "Keep in touch" and exchange a handle | Pitch |
| Fake events | Verified organizer badge | Pitch |
| Organizer gets nothing back | Feedback + counts-only recap | Stretch / pitch |
| No reminders between events | Opt-in tag alerts | Pitch |

---

## 9. Reference
- Campus Connect calendar feed (check it before relying on it): `https://campusconnect.utah.edu/ical/utah/ical_utah.ics`. It may redirect, many locations are hidden behind sign-in, and times are in UTC (convert to America/Denver).
- Existing apps to acknowledge: Campus Connect, The Loop, Freebites. What's new here is the event-to-introduction experience, not event discovery itself.
