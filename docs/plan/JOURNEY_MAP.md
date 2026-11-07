# Constellation U — Customer Journey Map

Source: `CONSTELLATION_U.md`. Goal: find what's missing.

Constellation U only works if two groups use it: **students** who attend and **organizers** who post events. Both journeys are mapped below.

---

## Persona 1: Maya, a second-year transfer student

- Lives off campus, commutes, knows almost nobody. Follows 3 club Instagram accounts and misses most of their posts.
- **Job to be done:** "When I have a free hour on campus, I want to find something worth going to and leave knowing at least one person, so campus feels like mine."
- **Fears:** standing alone at an event, looking desperate, being tracked.

| Stage | Touchpoint | User action | Thoughts | Emotion | Pain point | Opportunity |
|---|---|---|---|---|---|---|
| **Awareness** | Event QR code on a screen or poster, a friend's shared constellation card | Sees "Scan to join the sky" at an event | "What is this, another app?" | 😐 | **Most people first meet the app at an event, not on the map.** Nothing in the plan explains how people find the map before an event. | Shareable constellation card, QR codes on flyers, clubs share their pin link |
| **Consideration** | Landing page or map | Browses the map without logging in | "Is anything on here? Is it creepy?" | 🤔 | **Empty map = instant leave.** Depends on organizers having posted. Privacy isn't explained up front. | Import the Campus Connect feed so the map is never empty. One line on the landing page: "No GPS. Nobody sees you unless you check in." |
| **Acquisition** | Check-in screen | Picks a nickname and interests | "Do I need an account?" | 🙂 | **Contradiction:** nicknames are per-session, but stars must add up across events to unlock micro-events. That needs a lasting account. | Browsing and joining with no account; an optional U email sign-in later, only to keep your stars. Nickname stays private. |
| **Onboarding** | Inside the event | Gets a "find your half" word, looks around | "How do I find 'Sauce' in a room of 40?" | 😬 | **Finding the person in a crowd is unsolved.** Nothing helps you actually locate your match. | "Hold up your phone" mode: both phones flash the same color. The match is shown in the same section of the room only if the host sets up sections. |
| **Aha moment** | Scan → halves join | Connects, answers prompt, line draws | "Oh, that was easy and fun" | 😄 | Only 1–2 people have opted in → no match, no aha. | **An empty-room state:** "You're first. Your star will match with the next person." A host prompt that announces the game to the room. |
| **Engagement** | Constellation forms, room goal | Names the constellation, sees the sky light up | "We made that" | 🤩 | **After the event, connections go nowhere.** There's no way to stay in touch. | **"Keep in touch":** both opt in to share a contact (Discord or Instagram handle). Otherwise the connection is just a line on the map. |
| **Retention** | Comes back to the map next week | Checks what's on | "Why would I open this again?" | 😐 | No reminders. Nothing pulls her back between events. | Opt-in alerts for chosen tags ("music near me today"). "Your constellation is going to X." Earned micro-events. |
| **Advocacy** | Shares a constellation card | Posts it on an Instagram story | "Look what we made" | 😊 | Nothing to share yet. | Downloadable constellation image with nicknames only and the event name. Free advertising. |

**Moments of truth:**
1. The first look at the map (empty = gone).
2. The first minute at the event (no match = awkward = gone).
3. The day after (no follow-up = forgotten).

**Points where Maya is most likely to leave:** an empty map, an empty room, a connection that goes nowhere after the event, and privacy worries.

---

## Persona 2: Jordan, a club officer

- Runs events twice a month and posts on Instagram and Campus Connect. Worries about turnout and about ordering too much or too little food.
- **Job to be done:** "When I run an event, I want more of the right people to show up and actually mix, without extra work."

| Stage | Touchpoint | Action | Emotion | Pain point | Opportunity |
|---|---|---|---|---|---|
| **Awareness** | Word of mouth, a student union contact | Hears about it | 😐 | **There's no plan for reaching organizers.** | Pitch to the clubs here tonight (UtahSec, Technical Coding Club, Women in Computing, Data Science Club). |
| **Posting** | Paste announcement | Pastes Instagram caption → reviews AI fields → publishes | 🙂 | **Who can post?** Anyone could post fake events. There's no organizer check. | Organizer login with a U email. Club posts show a "verified" badge. Student micro-events are labeled as student-run. |
| **Set-up at the event** | Event QR | Shows the QR on a projector or a printout | 😐 | **There's no screen for displaying the QR, and no "host mode".** | One-tap "Event screen" view: big QR code + live sky + room goal. |
| **During** | Status toggle | Marks food "Running low" | 🙂 | Busy organizers forget to update the status. | Auto-mark "Finished" when the event ends. One-tap buttons. |
| **After** | Recap | Sees results | ❓ | **Organizers get nothing back.** Without a reason, they won't keep posting. | Private recap: "34 checked in, 9 constellations formed, 60% new to your club." Counts only, never names. |

**Organizer aha moment:** the event-screen sky lights up while people are in the room. This is also the demo moment.

---

## What's missing (gaps found)

| # | Gap | Severity | Fix | Tonight? |
|---|---|---|---|---|
| 1 | **Empty map** (no events until organizers post) | 🔴 High | Load Campus Connect feed or seed it with real announcements | Seed 6–8 real announcements by hand. Feed import is a stretch. |
| 2 | **Session nicknames vs stars that add up** | 🔴 High | Optional lasting account that's only needed to keep stars | Demo with localStorage ID; pitch U email sign-in |
| 3 | **Organizer "event screen" mode** (QR + live sky) | 🔴 High | One page per event | **Yes.** It's also the projected demo screen. |
| 4 | **Empty-room / no-match state** | 🟠 Med | "You're first" message + matching with whoever joins next | Yes, copy only |
| 5 | **Connections lead nowhere after the event** | 🟠 Med | Both opt in to "Keep in touch" and exchange a handle | Pitch, or 20 min if time |
| 6 | **Fake events / who can post** | 🟠 Med | Verified organizer badge | Pitch |
| 7 | **Finding your match in a crowded room** | 🟠 Med | Both phones flash the same color | 15 min, nice gimmick |
| 8 | **Organizer recap** (why they'd keep posting) | 🟡 Low tonight, high long-term | Counts-only recap | Pitch |
| 9 | **Reminders between events** | 🟡 | Opt-in tag alerts | Pitch |
| 10 | **Sharing / word of mouth** | 🟡 | Constellation image card | Stretch |
| 11 | **Status forgotten** | 🟡 | Auto-"Finished" when the event ends | 5 min, yes |

## Priorities

**Quick wins tonight:**
- Gap 3, the event screen (it's the demo's projected view anyway)
- Gap 1, seeding real events
- Gap 4, the empty-room copy
- Gap 11, auto-"Finished" at the end time
- Gap 7, matching flash colors if there's time

**Pitch as next steps:**
- Gap 2, U email sign-in
- Gap 5, keep in touch
- Gap 6, verified organizers
- Gap 8, organizer recap

These answer the judges' "would someone in Utah use it?" question.

**Biggest long-term payoff:** the organizer recap. Organizers keep posting only if they get something back, and the student experience depends on the map being full.

*For a visual version, paste the tables into Miro or FigJam.*
