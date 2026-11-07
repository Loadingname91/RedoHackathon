import React, { useEffect, useRef, useState } from 'react'
import Icon from '../components/map/icons.jsx'
import { signInWithGoogle } from '../lib/auth.js'
import './landing.css'

// Public landing page (signed out), aimed at students. Every picture is a real screenshot of the app (public/landing).
// Motion: floating phones, cross-fading explainer, scrolling gallery, reveal on scroll. All off with reduced motion.
const img = (n) => `/landing/${n}.jpg`
const SCENES = [
  { shot: 'map', who: 'Maya · new transfer student', t: '0:00', title: 'Every event, one map',
    body: 'Campus events show up as planets on their building: pizza, music, games, talks. Pulled from Campus Connect and posted by clubs. Your blue dot shows what’s close.' },
  { shot: 'event', who: 'Sam · busy, between classes', t: '0:15', title: 'Know before you walk over',
    body: 'Is the food still there? Is it step-free? Does it fit your 45-minute gap? Then walk there with directions inside the app.' },
  { shot: 'match', who: 'Maya · at the event', t: '0:30', title: 'Find your half',
    body: 'Check in with a nickname and get half of a Utah word pair. Someone here holds the other half. Both phones show the same color, so you can spot each other.' },
  { shot: 'constellation', who: 'Jordan · club officer', t: '0:45', title: 'Three lines, one constellation',
    body: 'When you both say yes, a line connects your stars. Three of you form a constellation you name together, and it stays in My sky after tonight.' },
]
const GALLERY = [['map', 'Campus map'], ['event', 'Event details'], ['checkin', 'Check in'], ['half', 'Find your half'], ['code', 'Your star code'],
  ['match', 'Match found'], ['prompt', 'Say hi, both confirm'], ['constellation', 'Constellation formed'], ['mysky', 'My sky'], ['legend', 'Map legend']]

const Phone = ({ shot, alt, className = '' }) => (
  <figure className={`lp-phone ${className}`}><img src={img(shot)} alt={alt} loading="lazy" decoding="async" /></figure>
)
const CTA = ({ label = 'Continue with Google' }) => <button className="primary lp-cta" onClick={signInWithGoogle}>{label}</button>

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.lp-reveal') ?? []
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.15 })
    els.forEach((e) => io.observe(e)); return () => io.disconnect()
  }, [])
  return ref
}

function Explainer() {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [i, setI] = useState(0), [playing, setPlaying] = useState(!reduce), [tick, setTick] = useState(0)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTick((t) => { if (t + 1 >= 150) { setI((x) => (x + 1) % SCENES.length); return 0 } return t + 1 }), 100)
    return () => clearInterval(id)
  }, [playing])
  const go = (n) => { setI((n + SCENES.length) % SCENES.length); setTick(0) }
  const s = SCENES[i]
  return (
    <section className="lp-explainer lp-reveal" aria-labelledby="ex-h">
      <h2 id="ex-h">How it works in 60 seconds</h2>
      <div className="lp-stage">
        <div className="lp-phone lp-fade">
          {SCENES.map((x, n) => <img key={x.shot} src={img(x.shot)} alt={n === i ? x.title : ''} aria-hidden={n !== i} className={n === i ? 'on' : ''} />)}
        </div>
        <div className="lp-copy" aria-live="polite">
          <span className="lp-who">{s.t} · {s.who}</span>
          <h3 key={s.title} className="lp-pop">{s.title}</h3>
          <p>{s.body}</p>
          <div className="lp-progress" aria-hidden="true">
            {SCENES.map((_, n) => <span key={n}><i style={{ width: n < i ? '100%' : n === i ? `${(tick / 150) * 100}%` : 0 }} /></span>)}
          </div>
          <div className="lp-controls">
            <button onClick={() => go(i - 1)} aria-label="Previous scene">Back</button>
            <button onClick={() => setPlaying(!playing)} aria-pressed={playing}>{playing ? 'Pause' : 'Play'}</button>
            <button onClick={() => go(i + 1)} aria-label="Next scene">Next</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const ref = useReveal()
  return (
    <main className="lp" ref={ref}>
      <div className="lp-stars" aria-hidden="true" />
      <header className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-brand"><Icon name="star" size={18} /> Constellation U · University of Utah</p>
          <h1>Free food, live music and <span className="lp-glow">your people</span>. One campus map.</h1>
          <p className="lp-lead">See everything happening at the U tonight, walk there, and meet someone new when you arrive. No group chats to join. No followers to count.</p>
          <CTA />
          <p className="lp-fine">Sign in with Google. Other students only ever see the nickname you pick.</p>
        </div>
        <div className="lp-hero-art" aria-hidden="true">
          <Phone shot="half" alt="" className="p1" />
          <Phone shot="map" alt="" className="p2" />
          <Phone shot="constellation" alt="" className="p3" />
        </div>
      </header>

      <Explainer />

      <section className="lp-features" aria-label="What you get">
        {[
          ['map', 'Find', 'Every event on one map. Filter by food, music, games or step-free, and see what fits between your classes.', 'event'],
          ['networking', 'Meet', 'Find your half, connect when you both say yes, and keep in touch only if you both choose to.', 'prompt'],
          ['star', 'Grow your sky', 'Constellations and people you’ve met stay with you. Three connections unlock your own small meetups.', 'mysky'],
        ].map(([icon, h, p, shot]) => (
          <article key={h} className="lp-card lp-reveal">
            <img src={img(shot)} alt={`${h}: app screen`} loading="lazy" />
            <div><span className="lp-planet sm"><Icon name={icon} size={20} /></span><h3>{h}</h3><p>{p}</p></div>
          </article>
        ))}
      </section>

      <section className="lp-ai lp-reveal" aria-labelledby="ai-h">
        <span className="lp-badge">Powered by Claude</span>
        <h2 id="ai-h">The boring parts are done for you</h2>
        <div className="lp-ai-grid">
          {[
            ['workshop', 'Reads any announcement', 'Paste an Instagram caption or flyer text. Claude pulls out the time, building, room, food and access details, and shows each step it took.'],
            ['access', 'Never guesses', 'Claude can only pick a real campus building. Anything it isn’t sure about is marked amber for the organizer to check, and text inside a post can’t give it orders.'],
            ['list', 'Campus Connect, synced', 'Hundreds of club events are imported from the Campus Connect calendar. Claude places the ones a simple building match can’t, and skips anything it can’t place.'],
          ].map(([icon, h, p]) => (
            <article key={h} className="lp-ai-card"><span className="lp-planet sm gold"><Icon name={icon} size={20} /></span><h3>{h}</h3><p>{p}</p></article>
          ))}
        </div>
      </section>

      <section className="lp-all lp-reveal" aria-labelledby="all-h">
        <h2 id="all-h">Everything inside</h2>
        <ul className="lp-all-grid">
          {[
            ['map', 'Live planet map', 'Live, later and imported events at a glance, with your location.'],
            ['star', 'For you', 'Events ranked for your interests by a learned model, with the reason shown.'],
            ['clock', 'What fits my gap', 'Load your class calendar. Events that fit your free time glow.'],
            ['nav', 'Walk there in the app', 'Turn-by-turn walking routes, step-free if you need them.'],
            ['food', 'Live food status', 'Hosts mark pizza available, running low or gone.'],
            ['networking', 'Find your half', 'A Utah word pair matched by shared interests breaks the ice.'],
            ['star', 'Two-way lines', 'A connection only appears when both people confirm.'],
            ['prizes', 'Constellations', 'Three connected people name a constellation together.'],
            ['user', 'Keep in touch', 'Swap a handle only if you both choose to.'],
            ['speaker', 'The room lights up', 'Hit the room goal and every phone and the projector glow.'],
            ['other', 'Host your own meetup', 'Unlocks after 3 connections. Share with everyone or just your people.'],
            ['access', 'Access and comfort', 'Text-only prompts, come-to-me, calm mode, large text.'],
            ['locate', 'Private by design', 'Nicknames only, no GPS stored, block or report quietly.'],
          ].map(([icon, h, p]) => (
            <li key={h}><span className="lp-planet xs"><Icon name={icon} size={18} /></span><div><strong>{h}</strong><span>{p}</span></div></li>
          ))}
        </ul>
      </section>

      <section className="lp-tech lp-reveal" aria-labelledby="t-h">
        <h2 id="t-h">The AI and ML inside, and what they unlock</h2>
        <div className="lp-tech-list">
          {[
            ['For you ranking', 'Machine learning: a model trained by gradient descent', 'Learns which offerings people with your interests rate highly, from 3,000 simulated student ratings (32% lower error than guessing the average), then adds timing and your free gap. Runs on your phone.', 'Your best events first, each with a plain reason why.'],
            ['Language AI', 'Claude (LLM)', 'Turns messy club posts into clean events: time, building, room, food, access. Flags what it isn’t sure about instead of inventing it.', 'Organizers post in a minute. Students see accurate details.'],
            ['Interest matching', 'Fuzzy text similarity (trigrams)', 'Matches interests written different ways: “boardgames” and “Board games”, “Ski” and “Skiing”, even typos like “Cofee”.', 'Your half is someone who actually likes what you like.'],
            ['Constellations', 'Graph of confirmed connections', 'People are points, confirmed connections are lines. When three people are joined, the app spots the new group instantly on every phone.', 'The moment a group forms, everyone sees it together.'],
            ['Schedule fit', 'Calendar parsing on your phone', 'Reads your .ics class calendar right in the browser and compares it with event times. Your calendar is never uploaded.', 'You only see what you actually have time for.'],
            ['Routing', 'Walking + wheelchair routing', 'Real walking paths across campus, with a step-free route that avoids stairs, plus a saved fallback when the network drops.', 'Anyone can get there, without leaving the app.'],
          ].map(([name, tech, how, gives]) => (
            <article key={name} className="lp-tech-row">
              <div className="lp-tech-name"><strong>{name}</strong><span>{tech}</span></div>
              <p>{how}</p>
              <p className="lp-tech-gives"><Icon name="star" size={16} /> {gives}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-gallery lp-reveal" aria-labelledby="g-h">
        <h2 id="g-h">Take a look around</h2>
        <div className="lp-marquee" tabIndex={0} aria-label="App screens, scrollable">
          <div className="lp-track">
            {[...GALLERY, ...GALLERY].map(([s, label], n) => (
              <figure key={n} className="lp-shot" aria-hidden={n >= GALLERY.length}>
                <img src={img(s)} alt={n < GALLERY.length ? label : ''} loading="lazy" /><figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-promises lp-reveal" aria-labelledby="pr-h">
        <h2 id="pr-h">Built for comfort, not clout</h2>
        <ul>
          <li><Icon name="locate" size={20} /> Nobody sees you unless you check in, and you disappear when the event ends. Your location never leaves your phone.</li>
          <li><Icon name="networking" size={20} /> Lines only appear when both people say yes. Block or report anyone, quietly.</li>
          <li><Icon name="star" size={20} /> No follower counts, rankings or photos. Just nicknames and stars.</li>
          <li><Icon name="access" size={20} /> Prefer text? Need step-free routes or a calm screen? Set it once.</li>
        </ul>
      </section>

      <section className="lp-org lp-reveal" aria-labelledby="o-h">
        <div>
          <h2 id="o-h">Run a club?</h2>
          <p>Paste your Instagram post once. Claude reads it, you check what’s marked amber, and it’s a planet on the map with a check-in QR. Put the room screen on the projector and watch the sky fill up. Ask an admin to make you an organizer.</p>
        </div>
        <div className="lp-org-art">
          <Phone shot="organizer" alt="Organizer panel: paste an announcement" />
          <figure className="lp-laptop"><img src={img('projector')} alt="Room screen on the projector: QR code and the live sky" loading="lazy" /></figure>
        </div>
      </section>

      <footer className="lp-foot lp-reveal">
        <h2>Tonight’s sky is waiting.</h2>
        <CTA label="Get started with Google" />
        <p className="lp-fine">Made at Crimson Hacks 2026 · Redo × UtahSec · Map data © OpenStreetMap contributors</p>
      </footer>
    </main>
  )
}
