import React, { useEffect, useState } from 'react'
import Icon from '../components/map/icons.jsx'
import { signInWithGoogle } from '../lib/auth.js'
import './landing.css'

// Public landing page (signed out). Talks to students first; organizers get one line near the end.
// The 60-second explainer is 4 scenes of 15 s, one per persona. Reduced motion = no auto-advance.
const SCENES = [
  { who: 'Maya · new transfer student', t: '0:00', title: 'Find what’s on tonight',
    body: 'Every campus event is a planet on one map. Pizza, music, games, talks. Imported from Campus Connect or posted by clubs.',
    screen: { kicker: 'MAP', line1: 'Crimson Hacks 2026', line2: 'WEB · now · pizza at 8', icon: 'food' } },
  { who: 'Sam · busy, between classes', t: '0:15', title: 'See what fits your gap',
    body: 'Load your calendar and events that fit your free time glow. Walk there with in-app directions, step-free if you need it.',
    screen: { kicker: 'FITS YOUR GAP', line1: 'Open Mic', line2: '45 min free · 6 min walk', icon: 'music' } },
  { who: 'Maya again · at the event', t: '0:30', title: 'Find your half',
    body: 'Check in with a nickname. You get half of a Utah word pair, like SALT. Someone in the room has LAKE. Find them, say hi, both confirm.',
    screen: { kicker: 'FIND YOUR HALF', line1: 'You’re SALT', line2: 'Find LAKE', icon: 'networking' } },
  { who: 'Jordan · club officer', t: '0:45', title: 'Three lines make a constellation',
    body: 'Three connected people form a named constellation that stays in My sky. Keep in touch only if you both choose to. Organizers paste a post once and the room lights up.',
    screen: { kicker: 'A CONSTELLATION FORMED', line1: 'The Unfinished Game Studio', line2: '3 stars · Crimson Hacks', icon: 'star' } },
]

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
    <section className="lp-explainer" aria-labelledby="ex-h">
      <h2 id="ex-h">How it works in 60 seconds</h2>
      <div className="lp-stage">
        <div className="lp-phone" aria-hidden="true">
          <span className="lp-kicker">{s.screen.kicker}</span>
          <span className="lp-planet"><Icon name={s.screen.icon} size={30} /></span>
          <strong>{s.screen.line1}</strong>
          <span className="lp-muted">{s.screen.line2}</span>
        </div>
        <div className="lp-copy" aria-live="polite">
          <span className="lp-who">{s.t} · {s.who}</span>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </div>
      </div>
      <div className="lp-progress" aria-hidden="true">
        {SCENES.map((_, n) => <span key={n}><i style={{ width: n < i ? '100%' : n === i ? `${(tick / 150) * 100}%` : 0 }} /></span>)}
      </div>
      <div className="lp-controls">
        <button onClick={() => go(i - 1)} aria-label="Previous scene">Back</button>
        <button onClick={() => setPlaying(!playing)} aria-pressed={playing}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => go(i + 1)} aria-label="Next scene">Next</button>
      </div>
    </section>
  )
}

const CTA = ({ label = 'Continue with Google' }) => (
  <button className="primary lp-cta" onClick={signInWithGoogle}>{label}</button>
)

export default function Landing() {
  return (
    <main className="lp">
      <header className="lp-hero">
        <p className="lp-brand"><Icon name="star" size={18} /> Constellation U · University of Utah</p>
        <h1>Free food, live music and your people. One campus map.</h1>
        <p className="lp-lead">See everything happening at the U tonight, walk there, and meet someone new when you arrive. No group chats to join, no followers to count.</p>
        <CTA />
        <p className="lp-fine">Sign in with Google. Other students only ever see the nickname you pick.</p>
      </header>

      <Explainer />

      <section className="lp-grid" aria-label="What you get">
        {[
          ['map', 'Find', 'Every event on one map, from Campus Connect and clubs. Filter by food, music, games or step-free.'],
          ['nav', 'Get there', 'Walking directions inside the app, step-free routes, and what fits between your classes.'],
          ['networking', 'Meet', 'Find your half, connect when you both say yes, and grow constellations that last past tonight.'],
        ].map(([icon, h, p]) => (
          <article key={h} className="lp-card"><span className="lp-planet sm"><Icon name={icon} size={22} /></span><h3>{h}</h3><p>{p}</p></article>
        ))}
      </section>

      <section className="lp-promises" aria-labelledby="pr-h">
        <h2 id="pr-h">Built for comfort, not clout</h2>
        <ul>
          <li>Nobody sees you unless you check in, and you disappear when the event ends.</li>
          <li>Lines between people only appear when both say yes. Block or report any time.</li>
          <li>No follower counts, no rankings, no photos. Your location never leaves your phone.</li>
          <li>Prefer text? Need step-free routes or a calm screen? Set it once.</li>
        </ul>
      </section>

      <section className="lp-org">
        <p><strong>Run a club?</strong> Paste your Instagram post once. Claude reads it, you check the details, and it's a planet on the map with a check-in QR and a live room screen. Ask an admin to make you an organizer.</p>
      </section>

      <footer className="lp-foot">
        <CTA label="Get started with Google" />
        <p className="lp-fine">Made at Crimson Hacks 2026 · Redo × UtahSec · Map data © OpenStreetMap contributors</p>
      </footer>
    </main>
  )
}
