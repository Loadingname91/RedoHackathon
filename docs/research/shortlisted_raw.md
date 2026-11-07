
1. Your idea: an interest radar for meeting people at events

- What exists: Happn and Bumble BFF use location, but for dating and friends, not events. Whova, Brella and Grip match people at conferences, but from sc, not who is in the room right now.Highlight (2012), Zenly and IRL all shut down. They ran into creepiness, battery drain and fake users.
- The gap: being nearby isn't the hard par to know someone is open to talking rightnow, plus a natural place to meet.
- How to make it stand out: make it work oa and time window, so the cold-start problem goes away. Matches stay hidden until both people accept. Then the app picks a spot to meet ("coffee table, 5
  min").
- Risk: it needs many phones in the room to demo, so you'd have to fake it with simulated users.

2. Accessible campus router ⭐ recommended

- What exists: Google Maps has wheelchair routes for transit only. AccessNow and Wheelmap rate buildings, not
  the paths between them. The U's accessib
- The gap: the U is built on a hill. Snow and ice change which paths you can use every day, and elevators break.
  No app handles slope, snow clearing and
- Build: a campus path graph and A* search with a cost based on your profile (wheelchair, crutches, low vision,
  gets tired easily). People can report "i", and the route updates right away.
- Demo: switch the profile from walking to wheelchair and watch the route change. Report an elevator outage and
  it reroutes live.

3. Free-time event matcher

- What exists: Campus Groups and Engage litagram and GroupMe spread the rest.
- The gap: nothing checks events against your class schedule, walking time or accessibility needs ("step-free?",
  "loud?").
- Build: import your class schedule (.ics). A scheduling solver suggests events that fit the gaps between
  classes. Each event carries accessibilit

4. Open table for spontaneous meals

- What exists: Timeleft and 222 set up dinn advance.
- The gap: a low-pressure way to say "I'm eating alone at the Union right now, join me." Loneliness among
  students is a well-documented problem.
- This overlaps a lot with #1. It could be one mode of your radar.

5. Sensory-friendly spaces finder (accessibility)

- What exists: Google's "popular times" shows how crowded a place is, not how loud or bright.
- The gap: autistic and neurodivergent stuory sensitivities need quiet study andsocial spaces. Students would report noise using their phone's mic, building a live quiet map of campus.
- Bonus: during inversion days, it could sdoor spaces, which ties into the air-quality theme.

6. Accessible trails for getting outdoors safely

- What exists: AllTrails has a "wheelchair friendly" tag, but trail data like grade and surface type is thin.
- The gap: Utah outdoors for people with mtrail grade, surface, air quality andweather into a go/no-go call.
- This uses the same routing engine as #2,feature.

**Project ideas for Crimson Hacks 2026 (State of Utah theme)**

- **Ski-day canyon carpool matcher + optimizer**  
  Match people heading to the same resort by time and seats; show how carpooling reduces wait times or emissions. Judges change snow forecast or carpool rate and see results update.

- **Predictive best-time-to-leave for Cottonwood Canyons**  
  Recommend departure windows to avoid the “red snake.” Interactive timeline or map that updates with weather or demand inputs.

- **Inversion-aware activity recommender**  
  Input location, activity (run, hike, campus walk), and sensitivity. Pull real AQI data and suggest timing, higher elevation, or indoor alternatives. Toggle AQI level in the demo and watch recommendations change.

- **Personal air-quality exposure planner**  
  Real-time + forecast AQI with route or timing advice for outdoor plans. Simple map or list that highlights safer options when pollution is high.

- **Campus interest radar with accessibility filters**  
  Opt-in nearby matching by interests, classes, or free time windows. Add mobility/sensory tags and preferred accessible spots. Demo with simulated users on a campus map.

- **Commuter micro-connection tool**  
  Short-window radar or “who’s free nearby right now” for coffee, study, or a walk between classes. Filters for interests and accessibility.

- **Adaptive outdoor buddy matcher**  
  Match people for hikes, campus walks, or ski alternatives based on ability, adaptive needs, current AQI, and elevation. Suggest accessible trails or TRAILS Adaptive options.

- **Accessible campus path + social overlay**  
  Route finder that accounts for snow, construction, or elevator status, plus nearby people open to connecting along the way.

- **Great Salt Lake dust / lake-level visualizer**  
  Interactive map showing exposed lakebed and estimated dust exposure as water levels change. Simple slider demo using public data.

- **Local Utah makers / shops discovery + matching**  
  Find nearby makers, markets, or shops by interest; optional event or collaboration matching. Lightweight directory with filters.

- **Inversion social pivot planner**  
  When AQI is poor, automatically surface or match people for indoor campus activities or local indoor options instead of outdoor plans.

Crimson Hacks 2026 Ideation & Research Playbook: State of Utah, Campus Socializing, and AccessibilityThe official theme revealed on your kickoff slide—State of Utah: "Let's build to make the state of Utah a better, more awesome place!"—paired with explicit sub-themes including Life on campus at the U, Canyon traffic on ski days, and Getting outdoors safely, gives you a strong runway for a high-impact hackathon build. However, based on historical judging patterns at Crimson Hacks and the broader JustBuild ecosystem, a generic CRUD application, static club directory, or simple chat wrapper is unlikely to win. Winning projects at Crimson Hacks 2025—such as Rover-Q (Best Overall, Q-learning 3D rover navigation), Marvis (Best Technical, camera object detection with voice-control interaction), and Weather Aware Predictions (Best AI/ML, MobileNetV2 image classification connected to solar-charging forecasts)—shared one defining trait: an observable, interactive algorithmic engine where judges can alter an input during a 90-second live demo and immediately watch the system recompute, classify, or route in real time.Your initial concept in Ideas.md—an offline proximity radar where users input their interests, scan for nearby people with shared interests at the same venue, and choose whether to broadcast and accept a meetup—addresses a heavily documented problem at the University of Utah ("the U"). Across student forums, the U is widely described as a commuter-heavy campus where students struggle with isolation, inactive club listings on Campus Connect, and the anxiety of "breaking the ice" in public third places. However, academic research on context-aware and ambient social proximity applications shows that passive radar apps frequently fail due to battery drain, processing overhead, user privacy concerns, cold-start user density limits, and the awkwardness of initiating face-to-face contact from a raw proximity alert. To win at Crimson Hacks, you should re-architect your radar from a passive "who is near me" scanner into an intent-and-activity vector matcher anchored to real Utah micro-locations—such as forming an instant study group in the Marriott Library, finding a fourth passenger at a Park & Ride lot to avoid the $35 weekend Big Cottonwood Canyon ski parking fee, or matching neurodivergent students for low-sensory study sessions.Beyond your radar concept, campus reporting from The Daily Utah Chronicle and student discussions on r/uofu and r/SaltLakeCity reveal an urgent, underserved opportunity in campus accessibility and disability technology. The University of Utah spans 1,534 acres across 247 buildings on the East Bench of the Wasatch foothills, climbing 450 feet in elevation (from 4,600 feet to 5,050 feet) with an overall average gradient of 6.3%—exceeding the 5.0% (1:20) federal accessibility threshold where a walkway must legally be treated as a ramp. Yet the official campus map (map.utah.edu) provides generic walking directions that omit slope grades, broken automatic door buttons, frequent elevator outages, and construction detours. Building an elevation-and-obstacle-aware A* routing simulator for wheelchair users, or a sensory-safe campus navigation and study-matching tool for the 56% of diagnosed disabled students who lack official university accommodations, directly fulfills the Life on campus at the U prompt while delivering the visual, algorithmic substance judges reward.1. Decoding the Kickoff Theme & Crimson Hacks Winning FormulaThe kickoff slide establishes State of Utah as the overarching theme and highlights six example problem areas: Life on campus at the U, Canyon traffic on ski days, Getting outdoors safely, Local Utah shops and makers, The Great Salt Lake, and Winter inversion and air quality. While the prompt allows broad interpretation, the competitive reality of a five-hour hackathon build dictates a disciplined focus on scope and live demonstrability. At Crimson Hacks 2025, approximately 120 builders submitted 20 projects competing across seven award categories: Best Overall, Best Technical, Best AI/ML, Most Ambitious, Best Game, Best UX/UI, and Funniest/Wildest.Participant reflections and organizer summaries indicate that judges do not inspect source code during table demos; instead, a finished, interactive project communicates far more effectively than a complex, incomplete architecture. Using the preparation heuristic developed from past JustBuild and Crimson Hacks events, you should evaluate your project idea across five weighted dimensions: Technical Substance (25%), Demo Impact (25%), Theme Fit (20%), Finishability (20%), and Originality (10%).Strategic DimensionSuggested WeightLow-Scoring Hackathon TrapHigh-Scoring Crimson Hacks ExecutionTechnical Substance25%Static database CRUD app, club directory, or generic chat UI wrapper.Visible algorithmic engine: A* pathfinding, vector similarity matching, constraint optimization, or live camera/audio perception.Demo Impact25%Clicking through static mockup screens or explaining hypothetical features.Letting a judge toggle a live constraint (e.g., "Close the Union elevator," "Add snow," or "Change hobby tags") and watching the UI recompute.Theme Fit20%Generic social or utility app with a Utah label added superficially.Grounded in Utah data: U of U building elevations, UTA TRAX delays, or Cottonwood Canyons HOV parking rules.Finishability20%Over-engineered login/authentication and multi-agent plumbing that fails before demos.Pre-seeded realistic Utah personas/nodes, zero-login interactive sandbox, and a complete end-to-end user path built within 5 hours.Originality10%Standard event calendar or basic chat room.Memorable local framing, such as an elevation-penalized wheelchair router or a canyon "slug-line" carpool optimizer.2. Ground-Truth Research: Socializing, Campus Life, and Accessibility in UtahTo build a product that resonates immediately with Utah judges and student peers, your pitch should address the specific structural problems documented across r/uofu, r/SaltLakeCity, and The Daily Utah Chronicle.A. Campus Social Life & The "Commuter School" Isolation TrapDiscussions on r/uofu and opinion columns in The Daily Utah Chronicle consistently identify a central social challenge: the University of Utah operates largely as a commuter school. A large portion of the student body commutes from across the Salt Lake Valley or neighboring cities such as Layton and Provo via car, UTA buses, TRAX light rail, or FrontRunner, often finishing classes at noon and driving 30 to 90 minutes home. Commuter freshmen frequently describe themselves as "close to friendless" because they miss out on organic dorm-cluster interactions and have nowhere obvious to hang out between classes or work-study shifts.When students attempt to build a social circle on campus or across Salt Lake City, they encounter four persistent barriers. First is the "ghost club" problem on Campus Connect: while students routinely direct lonely peers to campusconnect.utah.edu (powered by CampusGroups) or student Discord servers (such as the 479-member Utah Triangle server or 300-member incoming freshman servers), many clubs appear inactive because they lack updated social media or meeting schedules, forcing students to cold-message club leaders just to verify if a group still meets. Second is high-friction icebreaking in campus "third places": although Salt Lake City and the U offer vibrant third places—including 735 acres of city parks, climbing gyms, the Olpin Union, Marriott Library, Kennecott building study areas, LNCO's third-floor Humanities lounge, and Building 72's ground-floor Games lounge—students note that local culture requires someone to actively break the ice before friendships form. Approaching strangers who are wearing headphones or sitting with existing friend groups triggers intense social anxiety.Third, broader Salt Lake City socializing and app fatigue compound the problem for out-of-state, non-LDS, and graduate students. On r/SaltLakeCity, residents describe dating and friendship apps as "gamified moneymakers that lead nowhere" or risky due to fake profiles, while in-person hobby groups (such as running or board game meetups) often have heavily skewed demographics or require committing to formal multi-hour events rather than spontaneous hangouts. Fourth, canyon ski commuting creates a uniquely Utah social-logistical bottleneck. Because resorts like Brighton and Solitude require parking reservations and charge $20 to $35 for solo or low-occupancy vehicles while offering free (or $5) parking for 3+ (Brighton) or 4+ (Solitude) carpools, students and locals desperately need carpool partners. Yet Solitude's official 2022 carpool app failed to gain traction ("seemed kinda crappy... no one used it"), leaving skiers to solicit strangers in Park & Ride "slug lines" while worrying about awkwardness, gear capacity, and driver reliability.B. Disability & Accessibility Realities at the University of UtahFocusing on disability and accessibility at the U gives your hackathon project deep human impact alongside rigorous algorithmic challenges. Investigative reporting from The Daily Utah Chronicle and first-hand student accounts on r/uofu highlight four interconnected accessibility crises on campus.First, steep topography and failing physical infrastructure make daily navigation hazardous for mobility-impaired students. Across its 1,534-acre footprint, the campus climbs 450 feet from lower campus near the Stadium TRAX station (4,600 feet) to upper campus (5,050 feet) at an average gradient of 6.3%. Under U.S. Access Board and ICC building standards, any walking surface with a running slope steeper than 5.0% (1:20) must be treated as a ramp. Manual wheelchair users such as U student Greta Low report that campus hills are too steep to push up, elevators in older buildings are "dodgy" and break down frequently, push-buttons for automatic doors remain out of order for extended periods, undergraduate STEM lab benches are built too high for wheelchairs, and constant campus construction forces long, exhausting detours.Second, an institutional accommodation gap leaves most disabled students unsupported. According to Daily Utah Chronicle reporting on the U's GURU (Graduate and Undergraduate Researchers of UCEER) and DASTEM (Disabled and Ally STEM) initiatives, only 44% of U students diagnosed with a disability have official university accommodations, meaning 56% navigate coursework and campus life without formal support. Students report that navigating the Center for Disability & Access (CDA) documentation process is confusing, adversarial, and "just as stressful as the actual injury and needing surgery itself".Third, neurodivergent students face sensory overload and executive-function gaps. At traditional university club rush events, autistic and ADHD students report severe sensory overstimulation and rejection. While the CDA (located in SSB 350) launched a weekly "Craft and Connect" series in January 2026 to provide slower-paced, texture-based, neurodiversity-friendly socializing, neurodivergent students still lack tools to locate quiet spaces or low-pressure study partners during the rest of the week. As one U student with ADHD explained on r/uofu, standard CDA test accommodations do not solve their core daily struggle: "knowing how to effectively study in a timely manner despite not being motivated"—a challenge worsened by the closure of several campus identity support hubs.Fourth, campus transit and mobile-only ID policies create acute accessibility friction. Campus shuttles frequently pass by minor stops unless specifically flagged, and while Commuter Services claims the night SafeRide shuttle averages a 7-minute wait, students report waiting up to 30 minutes in vans that struggle in winter snow. Furthermore, the university's push toward a "mobile-first" NFC UCard app has sparked student petitions: the app frequently logs users out, requires a Duo two-factor push while boarding a bus, fails on legacy engineering building card readers after hours, and leaves commuters whose phones die on a 90-minute transit trip vulnerable to being escorted off UTA TRAX with a ~$200 fine.3. Competitive Gap Analysis: Why Existing Apps Haven't Solved ThisDuring judging, you should clearly articulate why incumbent tools fail to resolve these campus and regional pain points.Existing App / PlatformCurrent Usage at the U / UtahUnsolved Technical & UX GapAmbient Proximity Social Apps (including the raw Ideas.md concept)Context-aware social discovery tools that scan for nearby users.1. Cold-Start Problem: Useless when initial user density is low.2. Battery & Privacy Drain: Continuous background location scanning raises privacy fears and drains phone batteries.3. "Last 10 Feet" Awkwardness: A radar ping alone does not give introverts a natural way to start a conversation.Campus Connect (CampusGroups) & DiscordOfficial club portal (campusconnect.utah.edu) and fragmented student Discord servers.Static & Asynchronous: Lists clubs that have gone inactive; provides zero real-time visibility into who is in the Union, library, or game lounge right now looking to study or hang out.University Campus Map (map.utah.edu) & Google MapsOfficial walking directions (DIRECTIONS tool) and general transit routing.Slope- & Obstacle-Blind: map.utah.edu acknowledges wheelchair users but provides zero routing data on terrain slopes (6.3% campus average), curb cuts, broken automatic doors, elevator outages, or construction detours.Solitude Carpool App & Resort Parking PortalsLaunched in 2022 to pair Cottonwood Canyons skiers for 3+/4+ HOV parking.Abandoned & Low-Trust: Described by local skiers as poorly executed and unused; lacks real-time Park & Ride "slug-line" matching, gear-space verification, or snow-tire compliance checks.Transit App, Passio GO & MySafeRideTracking UTA TRAX/buses, U campus shuttles, and health/paratransit rides.Siloed & Rigid: Transit App's real-time "Go" mode drains batteries (threatening mobile UCard access); campus shuttles skip unrequested stops; MySafeRide requires booking 2+ days in advance.4. Upgrading Your Ideas.md Concept: From Passive Radar to "U-Pulse"Your concept in Ideas.md proposes an offline proximity radar where users enter their interests, see nearby matches at the same venue, and choose whether to broadcast and accept an in-person meetup. To make this a Best Overall contender at Crimson Hacks 2026, you should evolve it from a generic conference radar into U-Pulse: an Intent-Driven, Privacy-Preserving Micro-Hub Radar tailored to Life on campus at the U, Neurodivergent Accessibility, and Canyon Carpooling.Four Engineering Upgrades That Make the Radar Judge-ReadyFirst, replace continuous GPS tracking with Ephemeral Micro-Hub Check-Ins. Continuous background location tracking drains phone batteries—a major liability when U students need battery power for their mobile UCard on UTA transit—and raises privacy objections. Instead, anchor the radar to discrete University of Utah Micro-Hubs such as the Olpin Union, Marriott Library, Kennecott Building study rooms, LNCO 3rd Floor, Building 72 Games Lounge, SSB 350 (CDA Hub), or the Stadium TRAX station. A user checks into a hub and toggles "Broadcast On" for a time-boxed window (such as 45 minutes between classes). When the timer ends, their presence disappears automatically.Second, pair static hobby tags with Immediate "Micro-Missions" and a Neurodivergent Sensory Slider. Knowing someone nearby likes video games or hiking is rarely enough to overcome the fear of walking up to them. Have users broadcast both their Interest Tags (e.g., CS major, board games, backcountry skiing, pickleball) and a concrete Current Micro-Mission ("Studying for CS midterm," "Need 1 more for Spikeball," "Looking for a 4th skier for Solitude tomorrow," or "Silent ADHD body-doubling study session"). Crucially, add a Sensory & Social Battery Slider (ranging from Level 1: Silent Parallel Study / Zero Small Talk to Level 3: Casual 1-on-1 Coffee/Craft to Level 5: Group Game/Club Activity). This directly serves autistic, ADHD, and introverted students who experience sensory overload at loud campus events.Third, build a visible Multi-Vector Compatibility Engine for the live demo. Rather than doing a simple keyword match, represent each user as a numerical feature vector combining their encoded interest tags, current course/activity intent, sensory battery level, and hub location. Compute a weighted cosine-similarity and distance-decay score between the active user and all broadcasting peers within the hub and adjacent buildings. When a judge adjusts a user's sensory slider or adds an interest tag during the demo, the radar rings immediately re-sort and animate node positions based on the recomputed compatibility percentage.Fourth, solve the "last 10 feet" handshake with a Shared Beacon and Icebreaker Card. When User A pings a high-similarity match on the radar and User B accepts, the app generates a synchronized visual Table Beacon (a high-contrast color badge on both phone screens plus a specific micro-landmark like "Union 1st Floor near Mom's Cafe") alongside an auto-generated Icebreaker Prompt built from their exact overlapping vectors ("You both play board games and are in Engineering—ask about joining Wednesday night's Great Move Game Society in MEB 3377").5. Four Additional High-Impact Hackathon Ideas (Social + Accessibility + Utah)If you want to explore alternative builds—or combine your social radar with deeper accessibility and Utah infrastructure themes—the following four project concepts are designed specifically around unsolved local problems and the Crimson Hacks judging rubric.Idea 2: AccessU — Elevation, Weather & Obstacle-Aware Campus Routing SimulatorAccessU targets Life on campus at the U and Disability/Accessibility (aimed at Best Overall or Best Technical) by solving the glaring gap in map.utah.edu, which provides walking directions without accounting for the U's 450-foot elevation gain, 6.3% average gradient, broken automatic doors, elevator outages, or construction detours. Modeled after the interactive simulation archetype that won Best Overall at Crimson Hacks 2025 (Rover-Q), AccessU is an interactive campus graph router that calculates the lowest-exertion, ADA-compliant path between any two campus buildings using a customized A* search algorithm.To make the engineering shine, construct a pedestrian graph of 25–35 real University of Utah building nodes and pathway segments with actual elevation values (4,600 feet at Stadium TRAX up to 5,050 feet at upper campus). Weight each graph edge using a dynamic traversal cost that penalizes slopes exceeding the 5.0% (1:20) ADA ramp threshold, multiplies outdoor resistance during winter snow events, and applies an infinite or heavy detour cost when a user flags a broken automatic door button or out-of-order elevator. Cleverly, the router can use multi-story hillside buildings with working elevators as "vertical indoor bridges"—routing a wheelchair user into a building's lower entrance, up the elevator, and out an upper-floor exit to bypass a grueling outdoor hill. During the 90-second demo, show the default map.utah.edu shortest route sending a manual wheelchair user straight up a >7% grade; then let the judge click to toggle a winter snowstorm or break the Union elevator, watching the A* pathfinder dynamically animate a safe alternative route while displaying total push-exertion saved.Idea 3: SensoryMap & FocusPod U — The Neurodivergent Campus CompanionSensoryMap & FocusPod U targets Life on campus at the U and Neurodivergent Accessibility (aimed at Best AI/ML or Best UX/UI) by addressing the 56% of diagnosed disabled students who lack official CDA accommodations and the ADHD/autistic students on r/uofu struggling with sensory overstimulation and study motivation. The application combines a real-time Acoustic & Crowd Sensory Heatmap of campus study spots with a structured "Body-Doubling" Study Pod Matcher.Using the browser's Web Audio API (Fast Fourier Transform frequency spectrum analysis) and optional webcam crowd-density estimation—matching the "Real-time perception + decision" winning pattern from Crimson Hacks 2025—the app samples ambient decibel levels and sudden high-frequency chatter spikes to compute a live Sensory Load Index for campus locations such as Kennecott 2nd floor, Marriott Library, the Union, and SSB 350. Neurodivergent students can view the live campus map to find low-stimulation green zones and launch a 25-minute silent Pomodoro "FocusPod" with a nearby ADHD peer for mutual study accountability without forced small talk. During judging, open the live microphone sensor at your table and ask a judge to clap or speak loudly: the FFT spectrogram immediately spikes, reclassifying the table from "Neurodivergent-Safe" to "Sensory Overload" and automatically routing the user to the nearest quiet campus refuge.Idea 4: CanyonPool 4+ — Algorithmic Ski & Commuter Slug-Line OptimizerCanyonPool 4+ directly tackles Canyon traffic on ski days, Getting outdoors safely, and Campus socializing (aimed at Best Overall or Best Technical). While Brighton and Solitude charge solo drivers $20 to $35 and reward 3+ or 4+ carpools with free or $5 parking, Solitude's 2022 carpool app failed because it acted like a passive bulletin board rather than a real-time matcher. Meanwhile, U of U freshmen frequently ask how to reach the canyons or meet outdoor friends without a car.CanyonPool 4+ formulates morning ski and commuter carpooling as a live Capacitated Bipartite Matching and Vehicle Packing Problem anchored to campus dorms and Cottonwood Canyon Park & Ride lots. Drivers input vehicle passenger capacity, ski/board gear rack space (since 4 adults plus skis rarely fit inside a standard sedan without a roof rack), snow-tire/traction compliance, and terrain pace (e.g., "First chair groomers," "4:00 AM backcountry dawn patrol," or "Beginner afternoon laps"). In the live demo, display 30 simulated U of U skiers across campus; let a judge drag a slider to trigger a canyon snowstorm (enforcing snow-tire constraints) or add a solo rider at the Union, and watch the optimization graph instantly re-cluster everyone into verified 4-person HOV pods while calculating total $35 parking fees saved.Idea 5: U-Access Vision — Real-Time Barrier Detector & CDA Accommodation CopilotU-Access Vision targets Life on campus at the U and Accessibility (aimed at Best AI/ML or Most Ambitious) by closing both the physical reporting gap and the administrative 56% unaccommodated gap. First, using a mobile or webcam vision model, students point their camera at a broken automatic door push-button, an out-of-service elevator sign, an unplowed wheelchair ramp, or an inaccessible high STEM lab bench. The vision pipeline classifies the barrier, pins it onto a live campus accessibility map, and generates a structured facilities work request. Second, an integrated CDA Accommodation Copilot—grounded in U of U workflows such as SSB 350 intake, priority registration windows (Nov 5–6 vs. Nov 9 general registration), and professor accommodation notices—guides injured or newly diagnosed students step-by-step through obtaining formal support without burnout.6. Strategic Decision Matrix & 5-Hour Execution BlueprintTo select your build immediately and finish a polished product within the five-hour hackathon timeline, compare the five concepts against the Crimson Hacks heuristic rubric.Recommended Synthesis: How to Combine Your Radar with AccessibilityIf you want to build on your Ideas.md foundation, build Idea 1 (U-Pulse) and embed the core accessibility and Utah features from Ideas 2, 3, and 4 directly into it. Specifically, make U-Pulse a campus micro-hub radar where students filter peers by Neurodivergent Sensory Battery Level (e.g., quiet ADHD body-doubling vs. Craft and Connect hangouts), toggle a Canyon 4+ Ski Carpool Mode to fill empty seats before heading to Big Cottonwood Canyon, and—once two students match on the radar—automatically compute an AccessU Slope-Safe Meeting Route (avoiding >5% grades and broken automatic doors) to guide both students to an accessible meeting table in the Union or Marriott Library. This unified build hits Life on campus at the U, Canyon traffic on ski days, and Disability/Accessibility in a single cohesive product.Step-by-Step 5-Hour Execution ChecklistMinutes 0–30 (Lock Scope & Pre-Seed Realistic Utah Data): Skip authentication, databases, and account settings. Create a static JSON dataset containing 15 real University of Utah hubs (Olpin Union, Marriott Library, MEB, LNCO 3rd Floor, Building 72 Games Lounge, Kennecott 2nd Floor, SSB 350 CDA Office, Stadium TRAX) with approximate elevations (4,600 ft to 5,050 ft), plus 25 pre-seeded student personas reflecting real r/uofu archetypes (Layton/Provo commuters, CS majors, manual wheelchair users, ADHD students seeking silent body-doubling, and skiers needing a 4th passenger for Solitude).Minutes 30–90 (Prove the Riskiest Technical Engine First): Implement and test your core mathematical engine in isolation. If focusing on the U-Pulse Radar, complete the vector cosine-similarity + sensory filter + distance decay function; if focusing on AccessU routing, complete the A* graph search with slope penalties above 5.0% and obstacle toggles.Minutes 90–180 (Connect Engine to a Split-Screen Interactive Sandbox): Build a clean web interface featuring an interactive campus map or concentric radar on the right and a "Live Judge Control Panel" on the left. Wire the sliders and toggles directly to your algorithm so every click triggers an immediate visual recomputation.Minutes 180–240 (Polish Visual Feedback & The Payoff Card): Add high-contrast visual feedback—such as the double-blind mutual handshake beacon and auto-generated icebreaker prompt (for U-Pulse) or a side-by-side metric comparison card contrasting the standard map.utah.edu route (inaccessible steep slope) against your AccessU route (accessible indoor elevator bridge).Minutes 240–300 (Record Fallback Video & Rehearse the 90-Second Demo): Record a backup screen capture in case venue Wi-Fi drops, and rehearse the 90-second judging pitch so every teammate knows their exact role.Demo WindowObjectiveExact Talking Point & Live Action0–15 SecondsDefine the Utah Problem"At the U, 56% of diagnosed disabled students lack formal accommodations, the 6.3% average campus slope exceeds the 5% ADA ramp limit, and commuters on r/uofu struggle with isolation and inactive clubs on Campus Connect."15–50 SecondsLive Product & Judge Input Change"Here is our live campus engine. Judge, click that toggle to break the Union automatic door—or slide your sensory battery down to Level 1 for an ADHD silent study session. Watch our radar and A router instantly recompute your matches and accessible path."*50–75 SecondsExplain the Technical Substance"To avoid the battery drain and privacy issues that killed past proximity apps, we use ephemeral micro-hub check-ins, computing weighted cosine similarity over activity vectors and an elevation-penalized A traversal across campus."*75–90 SecondsShow Result & Next Improvement"Once matched, our double-blind beacon and icebreaker card eliminate the awkwardness of approaching strangers. Next, we'd integrate live UTA TRAX delay feeds and direct CDA facility reporting."


**Project ideas for Crimson Hacks 2026 (State of Utah theme)**

- **Ski-day canyon carpool matcher + optimizer**  
  Match people heading to the same resort by time and seats; show how carpooling reduces wait times or emissions. Judges change snow forecast or carpool rate and see results update.

- **Predictive best-time-to-leave for Cottonwood Canyons**  
  Recommend departure windows to avoid the “red snake.” Interactive timeline or map that updates with weather or demand inputs.

- **Inversion-aware activity recommender**  
  Input location, activity (run, hike, campus walk), and sensitivity. Pull real AQI data and suggest timing, higher elevation, or indoor alternatives. Toggle AQI level in the demo and watch recommendations change.

- **Personal air-quality exposure planner**  
  Real-time + forecast AQI with route or timing advice for outdoor plans. Simple map or list that highlights safer options when pollution is high.

- **Campus interest radar with accessibility filters**  
  Opt-in nearby matching by interests, classes, or free time windows. Add mobility/sensory tags and preferred accessible spots. Demo with simulated users on a campus map.

- **Commuter micro-connection tool**  
  Short-window radar or “who’s free nearby right now” for coffee, study, or a walk between classes. Filters for interests and accessibility.

- **Adaptive outdoor buddy matcher**  
  Match people for hikes, campus walks, or ski alternatives based on ability, adaptive needs, current AQI, and elevation. Suggest accessible trails or TRAILS Adaptive options.

- **Accessible campus path + social overlay**  
  Route finder that accounts for snow, construction, or elevator status, plus nearby people open to connecting along the way.

- **Great Salt Lake dust / lake-level visualizer**  
  Interactive map showing exposed lakebed and estimated dust exposure as water levels change. Simple slider demo using public data.

- **Local Utah makers / shops discovery + matching**  
  Find nearby makers, markets, or shops by interest; optional event or collaboration matching. Lightweight directory with filters.

- **Inversion social pivot planner**  
  When AQI is poor, automatically surface or match people for indoor campus activities or local indoor options instead of outdoor plans.

These prioritize clear, demoable results (change an input → see an update) and direct ties to the theme examples. The canyon traffic and air-quality ideas are generally the strongest for technical substance and finishability in a short build.


The **“Campus social life and accessibility research”** panel above is marked complete; its report starts with **“Campus & Social Apps Landscape.”** Sorry—I should have brought the findings into the chat. The returned report was also broader than the concrete project shortlist I promised.

**Here are the useful findings and eight project directions, supplemented with checks against current Utah resources and existing apps.**

# The main finding

**The strongest opportunity is helping students go from “I’m interested” to “I can actually participate.”**

That suggests tackling a specific obstacle: arriving alone, an inaccessible entrance, an unpredictable sensory environment, a short gap between classes, or uncertainty about getting home.

I would **not** build a generic campus-events app or a generic interest-matching app:

- **The University of Utah already has Campus Connect.** Its mobile app launched on **September 1, 2026**, offering student-organization discovery, events, RSVPs, and engagement badges. [studentaffairs.utah.edu](https://studentaffairs.utah.edu/blog/posts/2026/september/campus-connect-app.php?utm_source=chatgpt.com)
- **Interest-based student matching already exists.** Nearpeer offers peer matching and messaging, and Southern Utah University promotes it to incoming students. Your project needs a more specific advantage than “find people with similar interests.” [Nearpeer](https://nearpeer.com/?utm_source=chatgpt.com)
- **Accessibility discovery already exists too.** AccessNow provides place-level accessibility features, photos, and reviews; the U has campus accessibility information and an ADA Pathways project. A basic “accessible places on a map” app would overlap substantially. [AccessNow](https://accessnow.com/blog/whats-new-in-the-accessnow-app/)

## What is actually supported by local evidence?

In an **April 2024 University of Utah student listening session**, participants raised loneliness in a predominantly commuting student community, requested more weekend and break activities, and described building-accessibility concerns. Graduate students also identified school/work/life balance as a challenge. These are useful local problem signals, although the session does **not** establish campus-wide prevalence. [Utah Strategy](https://strategy.utah.edu/2024/04/11/student-strategy-session-apr-11/)

Accessibility is also more detailed than whether a building has a ramp. The university’s event guidance addresses accessible entrances and event participation, while its accommodations information describes accessible shuttles and priority snow removal. That supports investigating the **whole attendance experience**, rather than a single accessibility label. [Accessibility at Utah](https://accessibility.utah.edu/events-accessibility.php?utm_source=chatgpt.com)

The opportunities below are **hypotheses to validate**, not claims that no competitor anywhere offers a similar feature. Competitor comparisons are based on public documentation, not hands-on testing of every app.

# Eight ideas worth considering

## 1. AccessPlan — “Can I actually attend this event?”

**My strongest overall recommendation.**

**The problem to investigate:** An event looks interesting, but a student cannot confidently determine whether the route, entrance, room, seating, and participation arrangements meet their needs.

**What already exists:** AccessNow documents accessibility at places. The U provides campus accessibility resources and is developing accessible-path information. Those are foundations to build on, not services to pretend are missing. [AccessNow](https://accessnow.com/blog/whats-new-in-the-accessnow-app/)

**Your proposed difference:** Evaluate an *individual event plan* against a student’s chosen requirements. For example:

> “The route is step-free and seating is confirmed. Captioning has not been confirmed. The listed entrance closes before the event ends.”

Give each fact a source, a timestamp, and a status such as **confirmed, reported, or unknown**. Never convert missing information into “accessible.”

**Hackathon prototype:** Five campus venues, three sample events, a small route graph, and a requirements form. Let a judge mark an elevator unavailable; the system should find another feasible route or explain why it cannot.

**Technical substance:** Constraint-based filtering and routing, with explanations for rejected options.

**Main risk:** Reliable accessibility data—not the algorithm. Clearly label simulated outages and unverified venue information.

---

## 2. WalkIn Together — “I want to go, but I don’t want to arrive alone”

**My strongest social-life recommendation.**

**The problem to investigate:** Someone discovers a club meeting but hesitates because they do not know anyone, do not know what happens on arrival, or worry everyone else already knows each other.

**What already exists:** Campus Connect handles event and organization discovery; Nearpeer handles peer connections. [Student Affairs](https://studentaffairs.utah.edu/blog/posts/2026/september/campus-connect-app.php?utm_source=chatgpt.com)

**Your proposed difference:** A first-visit companion layer for an existing event.

A student selects “first time attending,” joins a mutually accepted group of two or three newcomers, and receives a public meeting point plus a named host who will welcome them. Preferences could include “small group,” “text introductions,” or “meet at the step-free entrance”—without requiring a diagnosis.

**Hackathon prototype:** One event, six demo attendees, compatibility matching, mutual acceptance, and a host check-in screen. A club could distribute it through an event-specific QR code.

**Demo:** Three people who would otherwise arrive separately receive a concrete plan: meet outside at 5:50, enter together, and find the host.

**Main risk:** Whether clubs will reliably provide hosts. Test that before building a large matching system.

---

## 3. PocketHang — “I have 35 minutes before class”

**My strongest commuter-focused recommendation.**

**The problem to investigate:** Students may want connection but have only short, irregular windows on campus. This direction fits the commuting and time-balance concerns raised in the U’s listening session. [Utah Strategy](https://strategy.utah.edu/2024/04/11/student-strategy-session-apr-11/)

**What already exists:** Timeleft already organizes matched small-group social activities; its offering is not limited to dinners. A generic “meet strangers for coffee” pitch would therefore be weak. [Timeleft Help Center](https://help.timeleft.com/hc/en-150/articles/28529250732444-What-is-Timeleft-and-How-Does-It-Work?utm_source=chatgpt.com)

**Your proposed difference:** Match around **available time, walking distance, cost, and a hard departure deadline**, rather than just personality.

Example:

> “Three students have a shared 22-minute window. This free seating area works for everyone, and each person can reach their next destination on time.”

**Hackathon prototype:** Manually entered free windows, a handful of campus meeting places, and a small-group scheduling algorithm. No university timetable integration is necessary for the demo.

**Technical substance:** Find feasible intersections of time windows while accounting for travel time and user-selected access requirements.

**Main risk:** Having enough simultaneous users. Start with one class cohort or one organized campus session.

---

## 4. QuietU — “Where can I socialize without sensory overload?”

**A focused accessibility direction.**

**The problem to investigate:** A venue may be physically accessible but still be a poor fit for someone who needs lower noise, predictable lighting, fewer people, or an easy place to take a break.

**What already exists:** KultureCity already offers sensory-inclusive venue discovery and social stories. “Find sensory-friendly places” alone is not a new category. [KultureCity](https://www.kulturecity.org/sensory-inclusive/?utm_source=chatgpt.com)

**Your proposed difference:** Campus-specific, **time-sensitive conditions** combined with small, low-stimulation social activities.

Instead of a permanent “quiet” badge, show:

> “Reported quiet 15 minutes ago; seating available; lighting information unknown.”

**Hackathon prototype:** Five campus spaces, timestamped check-ins, expiring reports, and filters for a proposed small-group meetup.

**Demo:** A space becomes crowded; the system recommends another location that still fits the group’s preferences.

**Main risk:** Stale or subjective reports. Avoid continuous microphone recording and do not claim that one setting works for all neurodivergent people.

---

## 5. AccessCard — Help organizers publish useful access information

**Probably the easiest useful prototype to finish.**

**The problem to investigate:** Organizers may be willing to accommodate people but publish vague descriptions, leaving attendees to ask the same logistical questions individually.

**What already exists:** The U and Salt Lake City publish accessible-event guidance. Partiful already supports private guest questionnaires, so merely collecting accommodation requests is not a strong differentiator. [Accessibility at Utah](https://accessibility.utah.edu/events-accessibility.php?utm_source=chatgpt.com)

**Your proposed difference:** Turn an event description into a structured access checklist, assign unanswered questions to the organizer, and publish a shareable information card only after confirmation.

Possible fields include entrance instructions, seating, captions or interpreting arrangements, quiet space, and a contact for unresolved questions.

**Hackathon prototype:** Paste event text → identify missing information → organizer confirms details → generate an accessible event card.

**Demo:** A vague listing becomes a clear card showing both verified arrangements and unresolved questions.

**Main risk:** AI inventing accommodations. Use it to extract information and ask questions—not certify compliance.

This could also supply the verified event data that **AccessPlan** needs.

---

## 6. CaptionCircle — Help everyone participate in a group conversation

**Worth exploring with Deaf and hard-of-hearing students before committing.**

**The problem to investigate:** Does an informal club discussion remain hard to join even when captions are available—for example, because the topic changes quickly or someone cannot get a turn?

**What already exists:** Microsoft Translator already supports captioned and translated one-to-one and group conversations. Building basic speech-to-text would duplicate substantial existing functionality. [Microsoft](https://www.microsoft.com/en-us/translator/education/live-conversations/?msockid=1d2a5ee43fa169c519d448523e45688e\&utm_source=chatgpt.com)

**Your proposed difference:** Focus on participation: a shared topic display, typed contributions, a discreet “please repeat” signal, and a visible turn-taking queue.

**Hackathon prototype:** A shared browser room with text contributions and turn requests. Add transcription only after the core interaction works.

**Demo:** A participant signals a missed point and contributes without needing to interrupt verbally.

**Main risk:** Solving an assumed problem rather than one users identify. Obtain recording consent, minimize retention, and do not present automated captions as a substitute for requested interpreting or professional captioning.

---

## 7. LeaveTogether — Coordinate the end of a social event

**A narrower alternative to general friend matching.**

**The problem to investigate:** Someone wants to attend an evening activity but is uncertain about leaving alone, making a connection, or finding others departing at a similar time.

**What already exists:** The U already provides shuttle information and accessible shuttle services. The opportunity would be coordinating people, not recreating vehicle tracking. [Accessibility at Utah](https://accessibility.utah.edu/accommodations/students/campus.php)

**Your proposed difference:** An event-specific departure board: “Leaving around 8:15 toward this public stop—open to company.”

Participants mutually accept before seeing a meeting point. Do not publish home addresses, continuous locations, or anyone’s complete schedule.

**Hackathon prototype:** One event, several departure windows, public destinations, and consent-based grouping. Use clearly labeled sample transport times.

**Demo:** A student changes their departure time and joins a compatible group.

**Main risk:** False safety assurance. This must not be marketed as a vetted escort service or a guarantee of safety. Whether departure uncertainty is a significant local barrier still needs validation.

---

## 8. CommonGround — A more distinctive version of your radar idea

Your original idea is an opt-in nearby-interest radar with mutual acceptance before meeting. Ideas

**What already exists:** Nearpeer already offers interest-based student matching. The more promising part of your concept is **temporary availability at a shared event**, rather than matching interests alone. [Nearpeer](https://nearpeer.com/?utm_source=chatgpt.com)

**My suggested refinement:** Replace precise moving dots with an event-specific session:

> “I’m at this event and open to a ten-minute conversation about game development.”

People join through a QR code, choose a conversation format, mutually accept, and meet at a public landmark. Their availability expires automatically.

**Accessibility angle:** Offer text-first introductions, small-group rather than one-to-one meetings, and a mutually suitable meeting place.

**Hackathon prototype:** QR check-in, interest selection, matching, acceptance, and an expiring session. Skip Bluetooth and continuous geolocation.

**Demo:** Two attendees discover a shared topic and agree on an actual meeting without exposing their movements.

**Main risk:** Low participation. A single organized event is a more plausible starting point than an always-on campus-wide network.

# What I would choose

These are my judgments, not measured scores or official judging criteria.

| Choice | Why it stands out | Biggest challenge |
|---|---|---|
| **AccessPlan** | Combines inclusion with a visible technical demo: change a constraint and watch the plan adapt. | Trustworthy, current access data. |
| **WalkIn Together** | Has a clear social outcome and can begin with one club instead of a whole campus network. | Reliable hosts and actual attendance. |
| **PocketHang** | Has a focused commuter use case and a demonstrable scheduling problem. | Enough users with overlapping availability. |

**For an accessibility-focused project, I would choose AccessPlan. For a socializing-focused project, I would choose WalkIn Together.** AccessCard is the lower-complexity alternative when finishing a polished workflow matters most.

I’ve scoped these as small demonstrable prototypes, following the approach in your uploaded hackathon strategy—not as production-ready systems or a confirmed five-hour event requirement. Crimson_Hacks_2026_Research_and…

For any choice, make the prototype usable without a visual map: keyboard navigation, screen-reader labels, text alternatives, and no color-only status indicators. Keep access preferences optional and avoid requiring people to disclose a medical condition.

**The most useful next step is a few exploratory conversations with students, including students with different access needs: “Tell me about the last campus activity you wanted to attend but skipped—what stopped you?”** Their actual examples should decide which of these problems you build around.

**Project ideas for Crimson Hacks 2026 (State of Utah theme)**

- **Ski-day canyon carpool matcher + optimizer**  
  Match people heading to the same resort by time and seats; show how carpooling reduces wait times or emissions. Judges change snow forecast or carpool rate and see results update.

- **Predictive best-time-to-leave for Cottonwood Canyons**  
  Recommend departure windows to avoid the “red snake.” Interactive timeline or map that updates with weather or demand inputs.

- **Inversion-aware activity recommender**  
  Input location, activity (run, hike, campus walk), and sensitivity. Pull real AQI data and suggest timing, higher elevation, or indoor alternatives. Toggle AQI level in the demo and watch recommendations change.

- **Personal air-quality exposure planner**  
  Real-time + forecast AQI with route or timing advice for outdoor plans. Simple map or list that highlights safer options when pollution is high.

- **Campus interest radar with accessibility filters**  
  Opt-in nearby matching by interests, classes, or free time windows. Add mobility/sensory tags and preferred accessible spots. Demo with simulated users on a campus map.

- **Commuter micro-connection tool**  
  Short-window radar or “who’s free nearby right now” for coffee, study, or a walk between classes. Filters for interests and accessibility.

- **Adaptive outdoor buddy matcher**  
  Match people for hikes, campus walks, or ski alternatives based on ability, adaptive needs, current AQI, and elevation. Suggest accessible trails or TRAILS Adaptive options.

- **Accessible campus path + social overlay**  
  Route finder that accounts for snow, construction, or elevator status, plus nearby people open to connecting along the way.

- **Great Salt Lake dust / lake-level visualizer**  
  Interactive map showing exposed lakebed and estimated dust exposure as water levels change. Simple slider demo using public data.

- **Local Utah makers / shops discovery + matching**  
  Find nearby makers, markets, or shops by interest; optional event or collaboration matching. Lightweight directory with filters.

- **Inversion social pivot planner**  
  When AQI is poor, automatically surface or match people for indoor campus activities or local indoor options instead of outdoor plans.

These prioritize clear, demoable results (change an input → see an update) and direct ties to the theme examples. The canyon traffic and air-quality ideas are generally the strongest for technical substance and finishability in a short build.