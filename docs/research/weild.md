Chatgpt 
**Yes—and the event itself should be what holds everything together.**

An announcement becomes a place on the map. Food gives someone a reason to visit. A live constellation gives them a way to meet people there. Afterward, the organizer can make any suitable surplus available through a separate, controlled process.

That is one coherent experience rather than a food app, social network, event directory, and delivery service competing for attention.

# Constellation U
### Find something happening. Find someone to experience it with.

**The pitch:**

> Constellation U turns campus announcements into a live map of events, food, and opportunities to connect. Students can discover an event, see who has opted into introductions there, and turn a conversation into a shared constellation.

Your strategy document recommends **“one difficult problem + one visible technical insight + one excellent demo.”** For this project, I would make the live social interaction the hero, use the announcement-processing agent to power discovery, and keep food redistribution as an extension—not another full product to build. Crimson_Hacks_2026_Research_and…

## 1. The hero feature: “Turn this event into a constellation”

The hero should be **a building pin transforming into a live social constellation through actions on people’s phones.**

Here is the complete experience.

### Discover an event

A student opens a campus map and selects **“Food available”** and **“Happening now.”**

They tap an event attached to a campus building. The card explains what is happening, who can attend, whether food is merely advertised or recently confirmed, and how to join.

### Join the event’s social space

The student arrives, scans the event QR code, and chooses:

> **“I’m here and open to introductions.”**

They enter a session nickname and choose a couple of interests or a conversation prompt. Their star appears in that event’s constellation.

**Opening a listing, saving an event, or being nearby should not automatically reveal attendance.**

### Make a connection

Another participating student sends an invitation:

> “Want to try this prompt? Find something you both enjoy that has nothing to do with your major.”

They talk—or exchange text—and submit a shared discovery:

> “We both want to make a game but haven’t finished one yet.”

Both approve it. A connection appears between their stars.

### Grow the constellation

For the minimum viable product, **three people connected through mutually approved introductions form a named constellation**. You do not need every pair to connect or complete an elaborate challenge.

The group can name it “The Unfinished Game Studio.” The event’s shared display lights up.

**That is the memorable moment: the map changes because people interacted—not because an AI generated another recommendation.**

Keep the naming and display optional. Nobody should have to perform socially to access food or attend an event.

---

## 2. How your Google Maps-style interface should work

I would use **one map with an event-detail panel**, rather than separate food, club, and people apps.

### Building pins represent events—not permanent club locations

An organization might hold different events in different buildings. Put each event at its venue, and show the organization as its host.

When several events share a building, tapping the building opens the relevant events, ordered by time.

Use a few clear filters: **Now, Later today, Food, Open introductions.** Accessibility information should be available in the event card and filters, with unknown information clearly marked.

Here is an illustrative card—not a real event:

> **Board Games + Pizza · Demo event**  
> Student Union · Example room  
> 6:00–7:00 p.m.  
>   
> **Food:** Host reports available · Updated 2 minutes ago  
> **Attendance:** Open to students · No registration required  
> **Access:** Entrance information supplied by host; quiet-space information unknown  
>   
> **Social space:** 3 participants have opted into introductions  
>   
> **[View event] [Join social space] [View original announcement]**

**Separate three kinds of information:**

| Information | What it means |
|---|---|
| **Event announcement** | The source says an event is scheduled and describes its offering. |
| **Food status** | An organizer has—or has not—recently confirmed availability. |
| **Social presence** | App participants explicitly opted into being visible at this event. |

Those are different facts. An announcement mentioning pizza does not establish that pizza is still available. Three visible app participants does not mean only three people are attending.

### Put people at the event, not at precise coordinates

You can show stars arranged around the building pin, but label that layout as an **event constellation**, not a positioning system.

The stars should mean “participating in this event’s social space,” not “standing at this exact spot.”

For the prototype, participants can see consenting people in the event session they have joined. Showing existing constellation members at other events can come later, with separate sharing permission.

**You get the social-map effect without building continuous location tracking.** Connection lines also represent introductions, not walking routes.

---

## 3. Give each component a clear role

The distinction matters because much of the discovery and food functionality already exists.

The U’s **Campus Connect** supports organization discovery, events, and RSVPs; **The Loop** promotes campus events and free-food notifications. **Freebites** already advertises campus free-food discovery, leftover-food posting, and notifications. Your pitch should acknowledge this rather than claim that nobody brings campus events or food opportunities together. [Student Affairs](https://studentaffairs.utah.edu/blog/posts/2026/september/campus-connect-app.php)

Your proposed differentiator is the **event-to-introduction experience**, with a visible, cooperative outcome.

| Component | Its job | Hackathon priority |
|---|---|---|
| **Live constellation** | Turn an event visit into mutually accepted introductions. | **Hero. Must work across devices.** |
| **Campus event map** | Answer “What is happening, and where?” | **Core. Limit the geographic area.** |
| **Announcement-processing agent** | Convert an announcement into a source-linked event record. | **Core, but support one input method first.** |
| **Food discovery and status** | Give students practical information about advertised and available food. | **Core, with simple host updates.** |
| **Organizer surplus post** | Offer a controlled next step when suitable food remains. | **Stretch feature.** |
| **Off-campus collection and delivery** | Coordinate donors, transport, and receiving organizations. | **Future partnership workflow.** |

The app should remain useful when nobody is open to introductions: students can still find the event and food information. **Do not populate the map with pretend participants to make it look active.**

## 4. What the agent should actually do

I would describe it as an **event-ingestion agent**, not “an agent that scrapes all Instagram.”

Meta’s official Instagram API documentation describes professional-account access, permissions, and access tokens; its Facebook Login API cannot access consumer accounts. That is not a dependable basis for promising unrestricted access to every club’s announcements. [Postman](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)

### Start with an input you control

For the hackathon, let an organizer **paste an announcement into your app**. A permitted calendar feed or an organizer-supplied flyer can be added after that works.

This still demonstrates the difficult transformation. You are proving that the system can understand and place an announcement—not that it can bypass platform restrictions.

A suitable proposed workflow is:

**Announcement → extract fields → resolve building → check for duplicates → review uncertain fields → publish.**

The extracted record should include the title, organizer, date and time, building, room, eligibility, registration requirements, food wording, source, and update time.

### Make the agent’s uncertainty visible

Suppose the text says:

> “Game night at the Union this Friday. Refreshments provided!”

The agent should not silently invent the room, start time, or quantity of food. “Refreshments provided” also should not become “free dinner available now.”

It should return something like:

> **Building:** Candidate match found  
> **Date:** Needs confirmation against the announcement’s publication date  
> **Time and room:** Missing  
> **Food:** Refreshments mentioned; current availability unknown

For the prototype, use a small, manually checked building directory. Resolving five campus buildings correctly is more useful than occasionally placing events at the wrong “Union.”

### Show a short processing trace

Your organizer interface could display:

> Event details extracted → Building matched → Possible duplicate checked → Two fields need review → Ready to publish

Those steps must reflect actual processing, not decorative animation.

Treat source material as data, not instructions to the agent. Keep publishing and organizer updates permission-controlled. A pasted announcement must not be able to tell the model to ignore validation or modify other events.

**Use AI for interpreting announcements. Use ordinary application logic for permissions, timestamps, food status, and mutual consent.**

---

## 5. Preserve the food-rescue idea—but separate its responsibilities

There are two different food workflows in your proposal.

### A. Discover food at an event

The organizer advertises food as part of an event. Your app displays the event’s attendance conditions and lets the host update:

**Advertised → Confirmed available → Running low → Finished**

Do not estimate remaining servings from app check-ins. Some attendees will not use the app, and attendance is not a measurement of food consumption.

### B. Offer surplus after an event

The host explicitly creates a surplus listing associated with that event. It could contain a pickup window, approximate quantity, packaging and handling information, and a responsible contact.

For a hackathon, demonstrate this with a **clearly labeled test listing**. Do not automatically activate a surplus listing when an event ends; the app cannot know whether suitable food remains.

**The larger donation-and-delivery concept should be partner-led.** WasteLess Solutions already describes a Utah food-rescue operation connecting donors, volunteer transport, and receiving organizations. It is a potential organization to approach—not an integration or partnership you already have. [Waste Less Solutions](https://www.wastelesssolutions.org/our-initiatives/what-is-food-rescue)

Also, do not assume all catered leftovers can be sent to a university pantry: the U’s published pantry description specifically emphasizes non-perishable food. Receiving arrangements need to be confirmed. [Basic Needs](https://basicneeds.utah.edu/food-resources.php)

The university publishes food-handling requirements for campus events, and Salt Lake County recommends supporting established charitable-food organizations while setting requirements for independent outreach. For actual operation, confirm the relevant arrangements with campus food-safety staff and the receiving partner. **The app should coordinate information; it should not certify food safety.** [Environmental Health and Safety](https://www.ehs.utah.edu/guidelines/food-handling-at-campus-events/)

You can preserve the whole vision without pretending delivery logistics are solved:

> “First, help people find existing food opportunities. Next, give organizers a reliable way to request an approved surplus handoff.”

---

## 6. The interactive judging demo

Your strategy document’s 90-second structure is: **define the problem, demonstrate a live change, explain the technical element, and finish with the result and next improvement**. The sequence below follows that structure. Crimson_Hacks_2026_Research_and…

### Prepare the demo around one event

Use one fictional event, one mapped building, two teammates already connected in the event’s test social session, and a third device for the judge.

Have the judge’s device connected before starting the timed presentation. The teammate participants are real test sessions—not invented campus users.

| Time | What happens | What it proves |
|---|---|---|
| **0–15 seconds** | “Finding an event is only the first step. We help students discover it and have a reason to connect when they arrive.” | A focused problem and purpose. |
| **15–30 seconds** | Paste the prepared announcement. The agent extracts its details; the organizer confirms the preview. A pin appears at the building. | Unstructured information becomes a usable event. |
| **30–50 seconds** | The judge opens the event, explicitly joins introductions, and answers one light prompt with a teammate. Both approve the connection. Their star joins the existing pair, forming a three-person constellation. | A real user action changes the shared experience. |
| **50–75 seconds** | Show the source-linked event fields and mutual-approval rule. The host marks food “Finished”; the food badge updates while the event and constellation remain active. | Explainable ingestion, live synchronization, and distinct event/food/social states. |
| **75–90 seconds** | Return to the constellation. Explain that controlled surplus handoffs are the next extension. | The result, followed by a credible next step. |

**The judge should cause the visible change.** Do not make the climax an animation you trigger on their behalf.

The moment when food becomes unavailable but the group remains connected also communicates the concept nicely: the event was a way to meet, not just a food pin.

Keep a fallback recording, as your strategy document recommends. Label any recorded or simulated behavior honestly. Crimson_Hacks_2026_Research_and…

## 7. What makes this technically substantive

You do not need to claim that drawing stars is a breakthrough. The engineering challenge is **keeping imperfect event information and consent-based social state consistent across several devices**.

I would concentrate on three pieces.

### Source-grounded event resolution

The system transforms messy text into an event record, matches the venue against a known building directory, and preserves evidence for the extracted details. It holds incomplete or conflicting records for review.

A good optional demonstration is submitting two announcements for the same event and identifying a possible duplicate rather than producing two misleading pins.

### A real mutual-consent connection state

A connection should move through an explicit sequence:

**Invitation → Recipient accepts → Shared discovery submitted → Both approve → Visible connection**

Opening another person’s profile does not create a connection. One person cannot publish a discovery attributed to someone else.

Validate that on the server, not only through disabled buttons.

### A small, live graph

Participants are nodes. Approved connections are edges. When a connected group reaches three participants, the app offers a constellation name and optional shared display.

For the first build, a simple connected-group check is enough. Elaborate matching, personality analysis, and optimization would add risk without improving the core demonstration.

This fits the document’s proposed weighting: **technical substance and demo impact receive 25% each; theme fit and finishability receive 20% each; originality receives 10%.** Those are preparation heuristics in the document—not official judging criteria. Crimson_Hacks_2026_Research_and…

My application of that framework would be: prioritize reliable multi-device interaction over a large catalog of features.

---

## 8. The scope I would actually commit to

For a short hackathon, build **a mobile-friendly website**, a projected shared view, and an organizer panel.

Keep the implementation to one campus area, a small building directory, a few clearly labeled demo events, one announcement-input method, three conversation prompts, and one constellation-completion rule.

### Essential safeguards belong in the first version

**Presence is opt-in and temporary.** Let people leave or hide immediately. Expire visible presence after a defined short period or the event’s end, whichever comes first. Do not collect movement history.

**The map is not the only interface.** Provide an equivalent event list, keyboard-accessible controls, text participation, and reduced-motion behavior. Do not infer access suitability from a building name or image.

**Food access does not depend on social participation.** No requirement to connect, complete a challenge, reveal a profile, or appear on a public screen.

**Connection requests are controllable.** Include a way to decline, block further invitations, and remove a shared connection. Only show consenting aliases on the projected display.

These are part of the product, not extras to add after the game works.

### Build order using the PDF’s five-hour planning scenario

The document offers a five-hour timeline; that is a planning scenario, not confirmation of the event’s actual available time. Crimson_Hacks_2026_Research_and…

**First 30 minutes:** Agree on the single demo event, the event-record format, consent rules, and ownership of the map, live session, and ingestion work.

**30–90 minutes:** Prove the riskiest interaction: one phone joins, another accepts a connection, and the shared view updates correctly.

**90–180 minutes:** Connect that working social session to the event map, announcement review, and basic food status.

**180–240 minutes:** Improve the event card, constellation reveal, accessibility, expiration behavior, and error messages.

**240–300 minutes:** Rehearse the exact judging sequence, test disconnects and duplicate taps, and record the fallback.

**Cut first:** Instagram integration, delivery routing, permanent friend networks, recommendations across the whole state, and complex rewards.

**Protect until the end:** One event, accurate source information, three devices, explicit consent, and a constellation that genuinely responds.

## The pitch I would use

> **“Constellation U turns campus announcements into shared experiences. Our agent organizes event details on a campus map, including advertised food and host-updated availability. At an event, students can opt into a short introduction activity. When both people confirm a connection, their stars connect—and a room of strangers starts becoming a constellation. We’re beginning with one campus and one interaction, with organizer-controlled surplus food handoffs as the next step.”**

**My recommendation: keep the map, food discovery, and Constellations together. Keep off-campus food transport out of the first build.** That gives you a useful discovery tool, a distinctive social mechanic, and one clear demo.

The next step is to sketch just three screens—**campus map, event card, and live constellation**—and walk through the judging sequence before adding anything else.



Gemini's idea 

You can merge both concepts into **U-Constellations (or StarBite)**: a live, dark-mode social sky map of the University of Utah where free-food events act as gravitational hubs (**Nebulas**) on campus buildings, and the students who show up are **Stars** who unlock perks and rescue leftover catering by forming constellations in real time.

This directly targets tonight's **State of Utah** theme ("Life on campus at the U") while positioning your team for **Best Overall Hack** ($500), **Best Use of AI** ($250), and **Best Design** ($250). It also executes the strategy guide's core formula—*one difficult problem + one visible technical insight + one interactive demo*—by combining an action-taking AI agent (Direction B) with a live spatial graph (Direction A).

**The Hero Feature: Autonomous "Flyer-to-Nebula" Agent + Building Constellation Graph**
Instead of a standard pin map or a standalone icebreaker game, your hero feature links an AI event-scraping pipeline directly to a spatial social graph on the U of U campus map:

* **Visible AI Ingestion Pipeline**: Drop a club flyer image or Instagram caption into the app, and watch an AI agent extract the club, food type, and building code to pin a glowing Nebula on the map.


* **Building-Level Star Graph**: Clicking a glowing building icon zooms into that building's live sky, showing anonymous stars of attendees currently inside who can pair up over shared prompts.
* **Constellation Food Rescue**: When an event ends with leftover catering, a newly connected 3-person constellation can claim a shared mission to walk surplus trays to students or local Salt Lake shelters.

**The 90-Second Interactive Judging Demo**
Judges walk the room starting at 11:35 PM and look for a live demo where changing an input produces an immediate, observable result:

1. **0–15s (The Hook)**: Show the dark-mode U of U map centered on Warnock Engineering Building (WEB 1230) with disconnected stars floating inside the room.


2. **15–50s (Live AI Input)**: Have a judge type a live announcement (e.g., *"UtahSec has leftover pizza in WEB 1230!"*) and watch the agent parse the text and drop a pulsing food node onto WEB.


3. **50–75s (Constellation Approval)**: Tap the WEB 1230 club icon, approve a shared connection between two phones and the laptop, and let the judge name the resulting 3-star triangle constellation live.


4. **75–90s (Leftover Routing)**: Toggle the event to "Surplus Ready," showing how that 3-person constellation claims a rescue route to distribute leftover catering across campus or to a shelter.



**Sub-Features Aligned with the Strategy Doc**

* **Context-Aware Prompts**: The agent tailors icebreakers to the scraped club and food (e.g., at a Technical Coding Club pizza night: *"Find someone who wants to learn a tool you use"*).


* **Group Rescue Verification**: Requiring a completed 3-star constellation to claim leftover catering turns solo food-rescue volunteering into an instant group mission.
* **Privacy-First Ephemeral Identities**: Use session-only star handles, a one-tap toggle to hide connection labels on the shared map, and zero popularity or "least connected" metrics.
* **Sponsor Bonus (Synthe Integration)**: Run `npx synthe@latest init` on your flyer-parser prompt so you can show judges how your agent automatically tested and improved its extraction accuracy.



**Time-Boxed Build Plan (Now until 11:30 PM Keyboards Down)**

* **6:45 – 7:45 PM (Agent & Coordinates)**: Build the LLM JSON parser (extracting club, building, food, and surplus status) and hardcode coordinates for 6 U of U buildings like WEB and MEB.


* **7:45 – 9:15 PM (Dark-Sky Campus Map)**: Render a dark Mapbox or Leaflet map where clicking a building icon overlays an interactive SVG/Canvas constellation graph over that building.


* **9:15 – 10:30 PM (Live Multi-Device Sync)**: Connect Supabase Realtime or WebSockets so connection approvals and judge-named constellations animate across screens instantaneously.


* **10:30 – 11:30 PM (Seed Data & Rehearsal)**: Seed the map with tonight's actual clubs (UtahSec, Technical Coding Club, Women in Computing, Data Science Club) before keyboards go down at 11:30 PM.



What tech stack are you and your team most comfortable using right now so we can scaffold the JSON schema and map state?

grok's suggestion 

**Combined Concept: Constellation Campus**

A live, shared campus map that turns free-food events and nearby people into visible constellations of connection. The map is both a practical discovery tool and a social game. Events with free food (or leftover catering) appear as special nodes on actual buildings. Live users appear as stars. Conversation prompts and mutual approvals draw lines between people, forming named constellations that grow in real time on the map.

### Hero Feature
**Live Constellation Map**  
A Google Maps-style view of campus (or a stylized building map) where:
- An AI agent scrapes Instagram, campus announcements, and club posts, detects free food / snacks / drinks, and pins the event on the correct building with time, description, and club name.
- Live opted-in users appear as stars on the map (approximate location or “at this building”).
- When two people talk and both approve a connection (“We both want to try the free tacos at the Union” or “One of us is going to the event; the other has never been”), their stars link. The line can show the shared discovery. Multiple links form a named constellation centered on the event or building.
- Clicking an event icon shows details + who is already there or planning to go, plus a one-tap “I’m in / connect with people here.”

This is the single screen judges interact with. Everything else supports it.

### Why It Works Together
Free-food events are natural, low-pressure reasons for strangers to be in the same place at the same time. The Constellation mechanic turns that physical co-location into visible, positive social proof without a popularity leaderboard. The scraping agent keeps the map useful even when people are not actively playing. The social layer makes the practical layer more fun and more likely to be used.

### Interactive Demo (90-second structure)
1. **0–15s – Problem**: “Students miss free food because events are scattered across Instagram, and many feel lonely even when surrounded by people.”
2. **15–50s – Live product**:  
   - Show the map.  
   - Trigger or simulate the agent adding a new free-food event on a building.  
   - Judges (or simulated users) appear as stars.  
   - They approve a connection prompt.  
   - Stars link and a small constellation forms and gets named on the map.  
   - Click the event to see details + people already connected there.
3. **50–75s – Technical insight**: The agent classifies posts for free food and maps them to buildings; the graph updates live with mutual approval only; session-only identities.
4. **75–90s – Result + next**: “Judges just created a constellation around a real campus event. Next we add leftover catering intake and accessibility filters.”

### Sub-Features (supporting, not required for the demo)
- Prompt library (shared interest, new experience, skill to teach, “going to this event”).
- Session-only identities + ability to hide your star or contributions.
- Event detail card with building location, time, and “who’s here from my constellation.”
- Simple leftover-food intake form (organizers or caterers can flag surplus; it appears as a special pin).
- Accessibility tags on events or meetup spots (quiet, step-free, etc.).
- Light constellation animations and naming.

### Technical Substance (visible in the demo)
- Scraping + classification agent (free-food detection from text/posts).
- Live graph on a map (nodes = people + events; edges = approved connections).
- Mutual approval before any line appears.
- Building-level mapping so events sit on real campus locations.

### Alignment with Strategy Doc
- **One difficult problem**: Discovering scattered free-food events + turning co-located strangers into low-pressure connections.
- **One visible technical insight**: Agent-populated map + live mutual-approval graph.
- **One excellent demo**: Judges change the map by approving a connection and immediately see a constellation form around an event.
- High demo impact and finishability; technical substance is clear without needing a huge backend.
- Primary target: Best Overall or Best Technical; secondary fit for Best UX/UI or Funniest/Wildest depending on polish and tone.

### Hackathon Scope (realistic)
- Core: Map view, 3–5 sample or live-scraped events pinned to buildings, star placement for users, prompt + mutual approve flow, line drawing + simple constellation naming/animation.
- Agent: Can start with a few pre-scraped or manually added posts classified by a small model or rules, then show one live or semi-live addition.
- Polish: Session identities, hide option, click-to-see event + people.

This keeps the poetic, shared-sky feeling of Constellations while giving it a concrete, useful Utah/campus job (free food discovery and leftover redirection). The map makes the social game spatial and practical, and the social game makes the food map more alive and more likely to create real meetings.




Yes. The two ideas fit together naturally: **free food is why people show up, and Constellations is why they talk once they're there.** That gives you one map and one story. Working name: **Big Dipper**. Tagline: "Follow the food. Find your people."

### Hero feature: the night map
The U campus is drawn as a night sky. Every event with free food glows as a star on its building. An agent puts it there by reading Campus Connect, plus any flyer or Instagram screenshot you give it. Tap a star to see what's happening. Check in and you become a star at that event. When two people both confirm a connection, a constellation line draws between them.

How this maps to your strategy doc:
- **Hard problem:** campus food announcements are scattered and messy (details below).
- **Visible technical insight:** every pin shows the agent's steps. The agent can only place events on buildings from your own campus list, so it never makes up a location.
- **Demo:** the judges create the input, then end up on the map themselves.

### Interactive demo (about 90 seconds at your table)
1. Open on this week's real free-food stars. Drag a time slider and stars light up and fade across campus.
2. Ask a judge to write any food event and a building on a sticky note, then take a photo of it. The agent's steps appear in a side panel (read → food? → building → time → pinned), and a new star pops onto that building.
3. The judges scan your QR code, pick a nickname and three interest tags, and appear around the Crimson Hacks star at WEB. Each gets a Utah prompt like "find someone here who's skied Alta" or "find someone with a strong fry sauce opinion." Two confirm and a line draws. When a third joins, they name the constellation and it stays on the map.

Fallbacks: a text box if the camera or model is slow, a teammate's phone already joined, and a screen recording.

### Sub-features
**Build tonight (the demo path)**
- Campus Connect feed → keyword filter → LLM confirms free food and picks the building and time → pin
- Photo/paste intake (flyer photo, Instagram screenshot, Discord message) through the same pipeline
- Agent steps and source shown on every pin; pins from photos are marked unverified until a second source matches
- Check-in, prompts, two-sided connections, constellation naming

**If there's time**
- Time slider
- Leftover flash pin: an organizer taps "leftovers" and the star pulses with a 30-minute countdown (a small version of your second food idea)
- Merge duplicates across sources ("seen in 2 places")
- Feed U Pantry as a permanent star: it's in the Union basement and open 8 to 6 on weekdays

**Pitch only (don't build):** a caterer leftovers marketplace, routing food to shelters, reach stats for clubs. The pantry stocks non-perishable food, so hot leftovers make more sense as flash pins for students.

**Privacy rules (judges will ask):** you only see individual people at an event you're checked into; everywhere else shows a count. Use check-in instead of GPS, expire it when the event ends, add a hide-me toggle, and show no leaderboard or "least connected."

### What the real data looks like
Campus Connect publishes a school-wide calendar feed of every public event from every group at `https://campusconnect.utah.edu/ical/utah/ical_utah.ics`. I pulled it without signing in. It redirects to a CampusGroups server, so make sure your fetch follows redirects. Each event has a title, start and end times in UTC, location, description, organizer and category, and the descriptions mention pizza, ice cream, treats and free food. I only read the first part of the file (about 1.4 MB total), so expect more quirks. The messiness is your technical-depth story:
- Many events hide the location behind "Sign in to download the location." If the description names a place, use it (one hidden-location event's description puts it at Lassonde). Otherwise show "location on Campus Connect" with the link. Never guess.
- The Union's street address gets added to locations that aren't in the Union, such as a room in SFEBB or Gardner Commons. Looking up that address would pile everything onto the Union. Instead, give the LLM a list of about 25 buildings (code, other names, lat/lng) and make it pick one or answer "unknown."
- Filter out the daily desk check-ins, test events and online events, and also Utah Asia Campus clubs, which use the same platform.
- Convert times from UTC to America/Denver.

Instagram: don't make the demo depend on scraping it live. Login walls and rate limits can break it right at the judges' table. Screenshots through the photo intake give you the same content.

**Stack:** React + Leaflet on a dark map style, Supabase or Firebase for live check-ins, node-ical to read the feed, and any vision LLM that returns JSON. Deploy to Vercel by 7:30 so phones can join. List these in your README, since the rules ask you to credit open source.

### Timeline (about 4h45m left)
| Time | Goal |
|---|---|
| 6:45–7:15 | Lock scope; split into three lanes (data pipeline / map / live features); deploy a blank page; build the building list by clicking each building on your map |
| 7:15–8:30 | Riskiest part first: feed and photos → stars on the map |
| 8:30–9:45 | Check-ins, prompts, connections, lines |
| 9:45–10:45 | Time slider, agent-steps panel, glow, flash pins |
| 10:45–11:15 | Test phones on U Guest and on a hotspot, record the backup video, rehearse twice |
| 11:15–11:30 | Stop coding, final commit, fill in the team slip |

### 90-second pitch
- **Problem (15s):** There's free food on campus almost every day, but it's spread across more than 600 student orgs and their Instagram accounts. A Feed U Pantry volunteer told KUTV that about 1 in 4 U students are food insecure. And when you do show up, you often eat alone.
- **Demo (35s):** sticky note → star → the judges' constellation.
- **Tech (25s):** messy real data, a building list the model has to choose from, connections both people must confirm.
- **Result (15s):** "We found N free-food events this week from real Campus Connect data." Next step: caterers' leftovers going to students.

If you make the finals, put the QR code on the projector and let the whole room join; just load-test with a quick script first. Aim for Best Overall, with Best Use of AI as the natural backup, and a polished night sky could also win Best Design.

Want me to set up the starter code now (map, feed and photo pipeline, live check-ins) so your team can split it up?

Sources:
- [Campus Connect calendar feeds](https://campusconnect.utah.edu/ics_helper)
- [Campus Connect school-wide feed](https://campusconnect.utah.edu/ical/utah/ical_utah.ics)
- [Feed U Pantry – A. Ray Olpin Union](https://union.utah.edu/?p=433)
- [Feed U Pantry giving page](https://giving-beta.utah.edu/funds/feed-u-pantry)
- [KUTV: Feed U Pantry and food insecurity](https://kutv.com/features/pay-it-forward/feed-u-pantry-at-university-of-utah-helps-combat-food-insecurity-among-students)
- [@TheU: Campus Connect](https://attheu.utah.edu/?p=116805)



apart form this maybe we can incentivise people that have more stars connected where they can publish their own micor events like a book reading event or if you want to meet a new person you can limit the publish circle and advertise there etc basically instead of having number of firends who are follwing you etc that usually socail media aopp sshvae we are using this stars and constellation gimick. think of all scenario for privacy aswell