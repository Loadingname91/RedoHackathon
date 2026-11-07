# Constellation U: 90-second demo script

**Setup:** laptop on `#/host/new` with a club Instagram post copied to the clipboard. Phones A and B are already checked in to the same event and connected to each other. Phone C is checked in too.

| Time | Say | [on screen] |
|---|---|---|
| **0:00–0:15** · Problem | "The U has hundreds of clubs, and their events are scattered across Instagram, Discord and Campus Connect. You miss the free pizza. And when you do show up, you often stand there alone." | [Landing page hero] |
| **0:15–0:50** · Product + live change | "Club officers paste their post once. Watch: I'll change the building from 'Union' to 'Marriott Library' and hit Read it. Claude pulls out the time, room, food and access, and the event lands as a planet on the library. Students open the map, tap For you, and get events ranked by their interests, each with a reason. At the event, you scan the QR and get half of a Utah word. I'm SALT. Somewhere in this room is LAKE." | [Laptop: paste post → edit **"Union" → "Marriott Library"** → **Read it** → amber fields → **Publish** → planet appears on the library. Phone C: map → **For you** → event → check in → shows "SALT"] |
| **0:50–1:15** · Hard part + design choice | "The hard part was live sync across phones. When two people swap codes, both must confirm before a line appears. Three links form a constellation, and every phone and the room screen update at once. One design choice: privacy first. Nicknames only, visible only inside the event, and your location never leaves your phone." | [Phone C types Phone B's code → both confirm → **constellation forms on all three phones** and the projector sky] |
| **1:15–1:30** · Result + next | "It's live on Vercel today, with Google sign-in, and we tested it end to end on three phones. Next, we'd add U of U single sign-on and train For you on real ratings. Constellation U: follow what's happening, find your people." | [Projector sky with the named constellation] |

**Live input to change:** the building name in the pasted post ("Union" → "Marriott Library"). Pick one Claude reliably maps; rehearse it once.

**If it breaks:** Wi-Fi slow → tap **Sync** in the event header. Camera won't scan → use the 4-digit code under the QR. Anything else → play the 28-second video on the landing page.
