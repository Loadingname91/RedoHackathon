# Constellation U: Design Brief by Persona

**For Claude Design.** Attach this file together with `docs/plan/CONSTELLATION_U.md` (product spec) and `docs/design/DESIGN_PROMPT.md` (screens and visual style). This brief explains **who** uses each screen, **how their first-time setup differs**, and **how their views change.**

> ⚠️ **Data gap:** these personas are working assumptions drawn from the team's research notes and the journey map, not from interviews. Before relying on them, check them with 3–5 quick conversations with U students and one club officer.

---

## Core design principle
There is **one app with three ways in.** Nobody picks a role on a sign-up screen. Instead, the way you arrive decides the first screen you see:

| You arrive by… | You land on… | You're probably… |
|---|---|---|
| Opening the link or home screen | **The map** (browse, no account needed) | Sam (browser) or Maya before an event |
| Scanning an **event QR code** in a room | **Check-in for that event** | Maya (at an event) |
| Tapping "Host an event" or using an organizer link | **Organizer panel** | Jordan |

People can move between ways of using the app. Maya starts as a browser, becomes a connector, and later hosts micro-events.

---

## Persona 1: Maya, "Wants her people"
- **Who:** 19–21, second-year transfer student who commutes and knows almost nobody. Uses Instagram, misses club posts.
- **Job to be done:** "When I have a free hour on campus, I want to find something worth going to and leave knowing at least one person."
- **Pain points:**
  1. Standing alone at events. *(High: this is why she stops going.)*
  2. Events are spread across Instagram, Discord and Campus Connect.
  3. Doesn't know which events fit around her classes.
- **What she wants:**
  1. An easy, natural reason to talk to someone.
  2. Seeing in seconds what's on in her free gap.
  3. Ending up as part of a group she can go back to.
- **Surprising insight:** shy people don't want *fewer* prompts, they want **assigned** ones. "Find SAUCE" feels safer than "go talk to someone", because the game takes the blame for the awkwardness.
- **How well the product fits:** strong. Risks: an empty room means no match, and a connection that goes nowhere after the event.

### Maya's first-time setup (at the event, under 30 seconds)
1. Scans the event QR code → lands on **that event's** check-in, not on the home screen.
2. Sees a privacy line in plain words before anything else: *"No GPS. Only people here see your star. Gone when the event ends."*
3. Picks a nickname (suggested: "Comet") and 2–3 interest chips, plus an optional clue.
4. **Drop your star:** drags her star onto the building, and it joins the sky. *(This is the first moment of delight.)*
5. Immediately gets her half: "You're **FRY**. Find **SAUCE**."
6. Learns how it works by doing it. There are no tutorial screens, just one hint at a time.

### Maya's view
- The map shows **individual stars only at her current event**. Everywhere else shows counts.
- The bottom of the screen has her **half-word card** and a **Connect** button.
- After her first connection, her own constellation appears as a small gold shape at the top ("The Unfinished Game Studio · 3").
- At 3 connections: a celebration, then "You've earned hosting" (a micro-event).
- Day 2 onward: the map opens with "**Your constellation** is going to Board Game Night" (opt-in).

### Maya's journey (emotional high points)
😐 Scan → 🙂 Drop star → 😬 Looking for Sauce → 😄 Halves join → 🤩 Constellation named → 😊 Shares card → 🙂 Comes back for a friend's micro-event

---

## Persona 2: Sam, "Just tell me what's on"
- **Who:** 20–24, busy upper-year or grad student who works part-time. Tight schedule. Mostly here for practical perks (food, swag, a good talk), not for making friends.
- **Job to be done:** "Between classes, show me what's worth walking to in the time I actually have."
- **Pain points:**
  1. Walking across campus only to find the food is gone. *(High.)*
  2. Event info buried in long posts.
  3. Apps that push social features on him.
- **What he wants:**
  1. Trustworthy status ("Pizza · Available · 2 min ago").
  2. Events that fit his schedule, shown at a glance.
  3. One-tap navigation inside the app, with no switching to another app.
- **Surprising insight:** Sam **will never check in socially**, but he's the one who keeps the map useful and spreads it ("there's free pizza in WEB right now"). His needs are why **the social side must stay optional**.
- **How well the product fits:** good for discovery. Risks: if anything feels like it's pushing him to socialize, he leaves. If the status is stale, he loses trust.

### Sam's first-time setup (none)
1. Opens the link → **the map, straight away**. No account, no nickname, no pop-ups.
2. One optional card: "**Load your calendar** to see what fits", with a `.ics` upload or an "I'm free until __" slider. Labeled with a lock: *"Stays on this phone."*
3. The sky **rearranges itself**: events that fit glow, and events that clash fade. *(This is his moment of delight.)*

### Sam's view
- **Schedule-fit mode on:** bright = fits ("Fits your 45-min gap · 4 min walk"), dim = clashes ("Clashes with CS 3500").
- Filters he uses most: Now, Food, Swag.
- The event card puts **offering status first** and **Take me there** second. Social features appear as one small "4 people open to meet" line, never a pop-up.
- A "Hide social" setting removes all social parts of the screen.

### Sam's journey
😐 Opens the map → 🙂 Loads his schedule → 😄 "Pizza in WEB fits my gap" → 🚶 Navigates there in the app → 🙂 Food still there (status was right) → 🔁 Opens it before lunch tomorrow

---

## Persona 3: Jordan, "Make my event worth it"
- **Who:** 20–23, a student club officer who runs events twice a month and posts everywhere by hand.
- **Job to be done:** "When I run an event, I want the right people to show up and actually mix, without extra work."
- **Pain points:**
  1. Reposting the same announcement on 4 platforms. *(High.)*
  2. Low turnout, or people who come but don't talk.
  3. No feedback on whether the event worked.
- **What they want:**
  1. Paste once and the event is published.
  2. A room that feels lively.
  3. Proof for their club ("34 came, 9 groups formed, 60% were new").
- **Surprising insight:** organizers care more about **the room feeling alive** than about headcount. The event screen lighting up is what makes them come back, more than any statistics.
- **How well the product fits:** strong if posting takes under a minute. Risks: forgetting to update status, and not trusting what the AI extracted.

### Jordan's first-time setup (posting in under a minute)
1. "Host an event" → **paste box** with the hint "Paste your Instagram caption, Discord post or flyer text".
2. **Agent steps animate in:** Read → Found offerings → Matched building: WEB → Room missing ⚠.
3. A review form where uncertain fields are **amber**, so Jordan only fixes what's flagged.
4. Publish → **a preview of their star appearing on the map** (moment of delight).
5. "Open event screen" → the projector view with a big QR code.

### Jordan's views
- **Organizer panel** (laptop): my events, quick status buttons (Available / Running low / Finished), and auto-"Finished" at the end time.
- **Event screen** (projector): QR code, live sky, room goal, Star Corner. **Nicknames only. Jordan sees no more about attendees than anyone else does.**
- **Recap** (after the event): counts plus an AI summary of anonymous feedback, shown only once 3+ people have answered.

### Jordan's journey
😩 Copy-pasting posts everywhere → 🙂 Paste once → 😮 The AI got it right → 😐 Sets up the projector → 🤩 Room goal reached, sky lights up → 😊 Recap shows 60% new faces → 🔁 Posts the next event here first

---

## How each screen differs by persona

| Screen | Maya (connector) | Sam (browser) | Jordan (organizer) |
|---|---|---|---|
| **Map** | Her event is lit up with individual stars; her constellation is pinned | Schedule-fit brightness; social features hidden or minimal | Their own events highlighted, with a status shortcut |
| **Event card** | "Check in" first, half-word preview | Status + Take me there first | Edit / Status / Open event screen |
| **Top bar** | Her constellation badge | "Free until 2:15" chip | "Hosting: 1 live event" |
| **Notifications (opt-in)** | "Your constellation is going to X" | "Pizza available in your gap" | "Running low? Update the status" |
| **Empty states** | "You're first, the sky is waiting" | "Nothing fits right now. Next free gap: 3 PM" | "No events yet. Paste your first post" |

## Design rules for every persona
- The **map always works without an account or check-in.**
- **Social is opt-in**, and food or entry is never locked behind it.
- Any view that shows people has **Leave / Hide me** one tap away.
- **The calendar never leaves the phone.** Say so on screen, every time it's mentioned.
- One hint at a time, learned by doing. No tutorial carousels.
- Every gesture has a plain button alternative, and reduced motion is respected.

## What to ask Claude Design to produce
1. The **three entry flows** (map / QR check-in / host) as clickable paths.
2. The **map in three versions** (Maya, Sam, Jordan) side by side, using the table above.
3. The **schedule-fit transition** (the sky rearranging its brightness after the calendar loads).
4. The **empty states** for each persona.
