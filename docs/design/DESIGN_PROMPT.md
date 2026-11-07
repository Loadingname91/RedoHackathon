# Prompt for Claude Design

Attach `docs/plan/CONSTELLATION_U.md` and `docs/design/DESIGN_BRIEF_PERSONAS.md`, then paste the prompt below.

---

Build a clickable, high-fidelity mock app for **Constellation U**. The attached file is the full product spec, and it is the source of truth for features, wording and privacy rules. This is for a hackathon demo tonight, so put speed and visual impact first. Use fake data only, with no backend.

## What it is
A night-sky map of the University of Utah campus showing events and what each one offers (food, swag, music, games, speakers, workshops, prizes). At an event, students can opt in to meet people. When two people confirm a connection in person by scanning each other's QR code, a line is drawn between their two stars. Three connected people form a named constellation. Tagline: **"Follow what's happening. Find your people."**

## Visual direction
- **Night sky:** deep navy or black background (#0B1020-ish), soft glowing stars, thin luminous connection lines, subtle twinkle.
- **Accent:** Utah crimson (#CC0000) used sparingly for main actions and "live" badges. Use warm gold for stars and constellations.
- Clean sans-serif type, large tap targets, mobile first. Calm and magical, never like a casino or a game score screen.
- Respect reduced motion: animations become fades.

## Screens (phone frames ~390px wide, unless noted)
1. **Map (home):** dark campus map with ~8 building outlines (Warnock Engineering/WEB, MEB, Union, Marriott Library, Lassonde, SFEBB, Kahlert Village, Crocker Science). Event stars glow on their building. Filter chips: Now · Later today · Open to meet · 🍕 Food · 🎁 Swag · 🎵 Music · 🎲 Games · 🎤 Speaker. A "List" toggle switches to an accessible list view.
2. **Event card (bottom sheet):** title, host club, time, building and room, offering badges with status ("🍕 Pizza · Available · updated 2 min ago"), "4 people open to meet" (count only), and buttons: **Take me there** (navigation inside the app), **Check in**, **View original announcement**.
2b. **Navigation (full screen, inside the app):** the dark map with a glowing comet-trail route from your blue dot to the event's star. A top banner with the next turn ("↱ Turn right at the Union fountain · 80 m"). A bottom sheet with "6 min walk · 450 m", a 🚶 Walk / ♿ Step-free route toggle, an expandable list of steps, and "Start from: My location ▾ / pick a building". A small note: "Location used only to find your route, never stored." When you arrive: the star bursts and a "You're here, check in?" button appears. Include an off-route state ("Finding a new route…").
3. **Check-in:** nickname field, pick 2–3 interest chips, optional "one clue so your match can find you" field ("green hoodie, near the pizza"), and a privacy line: *"No GPS. Only people at this event see your star. Gone when the event ends."* Buttons: Join, Just browsing.
4. **At the event:** your star among other stars around the building. A card: "Your half is **FRY**. Find **SAUCE**." There is a Star Corner hint, plus "Connect" and "Hide me" buttons.
5. **Connect:** large QR code with a 30-second countdown ring, a 4-digit fallback code under it, and a "Scan someone" button.
6. **Match found:** the full screen fills with one bold color, with the word "SAUCE" in huge type and their clue underneath: "Hold your phone up."
7. **Prompt and confirm:** a shared prompt ("Find something you both like that isn't your major"), a text box for the shared answer, and a two-step confirmation showing "You ✓ · Sauce waiting…".
8. **Constellation formed:** two half-star shapes fly together and light up, then 3 stars and lines form a triangle. A "Name your constellation" field ("The Unfinished Game Studio") and a "Share card" button.
9. **Event screen (desktop 1440px, projected):** a huge QR code ("Scan to join the sky") on the left. On the right, the live sky for this event, with stars, lines and named constellations. At the bottom, a room goal bar ("12 / 20 links: light up the room") and a "Star Corner: by the projector" label. Nicknames only.
10. **Organizer panel (desktop):** a paste box for an announcement. An "agent steps" list that fills in: *Read → Found offerings → Matched building: WEB → Time found → Room missing ⚠ → Ready for review*. A review form with extracted fields, where uncertain ones are flagged in amber. Publish button. An offering status toggle: Advertised / Available / Running low / Finished.
11. **Micro-event (unlocked at 3 connections):** "You've earned hosting." Fields: title, building (from the list), time, and visibility: My constellation / Their connections too / Whole campus.
11a. **Accessibility (spread across the screens above):**
   - **Event card:** an "Access" row with icons: ♿ Step-free entrance · 🛗 Elevator · 🤫 Quiet space · 🧏 Captions/ASL · 🔊 Sensory: Loud. Anything not known shows a grey "Unknown" label and is never hidden. The navigation button says "**Take me to the accessible entrance**".
   - **Map filters:** add ♿ Step-free · 🤫 Quiet · 🧏 Captions/ASL.
   - **Check-in:** two toggles, "💬 I prefer text" and "📍 Come to me (I'll stay put)".
   - **Match found:** color **plus** a big pattern (stripes, dots or waves) **plus** the word, so it never relies on color alone. If the match chose "Come to me", show "Sauce will stay put. Find them: by the elevator."
   - **Prompt screen:** a text-only mode with suggested opening lines.
   - **Settings:** large text, high contrast, reduced motion, sound on/off.
11b. **My schedule:** a "Load my calendar (.ics)" button and an "I'm free until __" slider. On the map, events in your free time glow brighter with a gold "Fits your 45-min gap" badge, and events that clash with your classes fade to about 30% with a small "Clashes with CS 3500" label. A lock note: "Your calendar stays on this phone." Include an animated transition where the sky rearranges its brightness after the calendar loads.
12. **Feedback:** "Worth going?" with 😞 😐 😄 and an optional comment. Note: "Anonymous. The organizer only sees results after 3+ responses."

## Clickable flow to wire up
Map → tap the WEB star → event card → Take me there → Navigation → arrive → Check in → At the event → Connect → Match found → Prompt and confirm → Constellation formed → back to the map, where the constellation now shows on WEB.
Separately: Organizer panel → Publish → a new star appears on the map. The Event screen shows the room goal filling up.

## Rules
- Never show an exact location, star counts in public, leaderboards, or "least connected" lists.
- Food or entry is never locked behind connecting.
- Use only clearly fake demo data: nicknames like Sauce, Fry, Comet, Nova. No real names or photos.
- Every screen needs a clear "Leave / Hide me" option where presence is shown.

## Make it playful: small gestures and fun touches
The app should feel alive and a bit magical. Every tap should get a response. Design and prototype these:

**The sky itself**
- **Living sky:** the background matches the real Salt Lake time, from sunset orange to deep night, and the Wasatch mountains are a silhouette along the bottom edge.
- **Tilt parallax:** stars shift in layers as the phone tilts (dragging works the same way on desktop).
- **Busy events twinkle more:** the more people checked in, the faster an event's star pulses.
- **Shooting stars:** every so often one crosses the sky. Tapping it reveals a random icebreaker prompt (a hidden surprise).
- **Pull to refresh = pull a comet** down from the top.
- **Pinch** to zoom from the whole campus down into one event's constellation.

**Joining**
- **Drop your star:** at check-in, drag your glowing star from the bottom of the screen onto the building. It lands with a small burst and joins the sky.
- **Empty room:** your lone star orbits slowly with the line "You're first, the sky is waiting".

**Connecting**
- **Hold to link:** both people press and hold their thumbs on screen while a ring fills. Releasing early cancels. The press is the consent.
- **Halves join:** the two half-stars fly together with a short vibration and a soft chime.
- **Lines draw themselves** like a pen stroke between the stars.
- **Constellation melody:** each star is a musical note, and each new constellation plays its own short tune.
- **Naming:** as you type the constellation's name, the letters sprinkle out like stardust and settle into place.
- **Shake to shuffle** the conversation prompt.

**The room moment (biggest wow)**
- When the room goal is reached, the event screen goes supernova and **every phone in the room flashes gold together.** The whole room lights up at once.

**Cards**
- Event cards flip like collectible star cards; the back shows the original announcement.
- Offering badges have small animated icons (pizza slice wobbles, music note bounces).

**Guardrails (required)**
- **Reduced motion:** every animation becomes a simple fade, and tilt and shake are turned off.
- **Sound off by default** with one speaker toggle. Vibration is optional.
- **No flashing more than 3 times per second** (seizure safety). The room flash is one slow glow, not a strobe.
- Every gesture has a plain tap-button alternative, for accessibility.
- No public scores, even inside the games.
