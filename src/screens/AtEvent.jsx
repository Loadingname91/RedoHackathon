import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import confetti from 'canvas-confetti'
import { rpc } from '../lib/supabase.js'
import { getSession, clearSession } from '../lib/identity.js'
import { useEventLive, useRoomGlow, components, confirmedEdges, motionOK } from '../lib/social.js'
import Safety from '../components/social/Safety.jsx'
import Sky, { SPARK, HALF_L, HALF_R } from '../components/social/Sky.jsx'
import { Back, Close } from './CheckIn.jsx'
import '../components/social/social.css'

// Match look: color + pattern + word, never color alone. All colors keep white text above 4.5:1.
const LOOKS = [
  { color: '#4A2FE0', pattern: 'stripes', css: 'repeating-linear-gradient(45deg, rgba(255,255,255,.09) 0 16px, rgba(255,255,255,0) 16px 32px)' },
  { color: '#0B6E55', pattern: 'dots', css: 'radial-gradient(rgba(255,255,255,.14) 4px, transparent 5px) 0 0/22px 22px' },
  { color: '#A3341C', pattern: 'waves', css: 'repeating-radial-gradient(circle at 0 100%, rgba(255,255,255,.1) 0 8px, transparent 8px 20px)' },
  { color: '#1D55B0', pattern: 'checks', css: 'repeating-conic-gradient(rgba(255,255,255,.1) 0 25%, transparent 0 50%) 0 0/28px 28px' },
]
const lookFor = (key) => LOOKS[[...String(key)].reduce((s, ch) => s + ch.charCodeAt(0), 0) % LOOKS.length]
const PROMPTS = ['Find something you both like that isn’t your major.', 'Rate the food together, out of 10.',
  'Teach each other one thing in 60 seconds.', 'Best hike within an hour of campus?', 'What would you build if you had a free weekend?']
const word = (p) => p?.half_word?.split('#')[1] // stored as "<n>#<WORD>#<A|B>"; only the word is ever shown

export default function AtEvent({ param: eventId }) {
  const session = getSession(eventId)
  const live = useEventLive(eventId)
  const glow = useRoomGlow(eventId)
  const [view, setView] = useState('home') // home | code | scan | beacon | prompt | formed
  const [skyMode, setSkyMode] = useState('sky')
  const [announce, setAnnounce] = useState('')
  const [left, setLeft] = useState(null) // null | 'hidden' | 'left'
  const [dismissed, setDismissed] = useState(() => new Set())
  const [sheet, setSheet] = useState(null) // person
  const [safetyFor, setSafetyFor] = useState(null)
  const meId = session?.participant_id
  const me = live.people.find((p) => p.id === meId)

  const groups = useMemo(() => components(live.people.map((p) => p.id), confirmedEdges(live.connections)), [live.people, live.connections])
  const myGroup = groups.find((g) => g.includes(meId)) ?? [meId]
  const named = live.constellations.find((c) => c.members.includes(meId))

  // New confirmed line: announce it; open "constellation formed" once my group reaches 3 and has no name.
  const confirmedCount = live.connections.filter((c) => c.a_confirmed && c.b_confirmed && (c.a === meId || c.b === meId)).length
  const prevCount = useRef(confirmedCount)
  useEffect(() => {
    if (confirmedCount > prevCount.current) {
      setAnnounce(`Connection confirmed. You have ${confirmedCount} connection${confirmedCount > 1 ? 's' : ''} here.`)
      setView(myGroup.length >= 3 && !named ? 'formed' : 'home')
    }
    prevCount.current = confirmedCount
  }, [confirmedCount])
  // Your group can reach 3 through someone else's new line (you're the first in the chain): celebrate too,
  // but only from the home view so it never interrupts a code, scan or prompt in progress.
  const prevGroup = useRef(myGroup.length)
  useEffect(() => {
    if (myGroup.length >= 3 && prevGroup.current < 3 && !named && view === 'home') setView('formed')
    prevGroup.current = myGroup.length
  }, [myGroup.length])

  if (left === 'left') return <LeftScreen eventId={eventId} title={live.event?.title} />
  if (!session) { location.hash = `#/checkin/${eventId}`; return null }
  if (live.loading) return <main className="cu"><p className="cu-col cu-sub" role="status">Loading the sky…</p></main>
  if (!me && !left) return <LeftScreen eventId={eventId} title={live.event?.title} expired />

  const pending = live.connections.find((c) => (c.a === meId || c.b === meId) && !(c.a_confirmed && c.b_confirmed) && !dismissed.has(c.id))
  const dismiss = (id) => { setDismissed(new Set([...dismissed, id])); setView('home') }

  async function leaveEvent(kind) {
    if (kind === 'left' && !confirm('Leave this event? Your star and lines here disappear right away. Your constellations stay.')) return
    try { await rpc('leave_event', { p_id: meId, p_secret: session.secret }) } catch {}
    if (kind === 'left') clearSession(eventId)
    setLeft(kind)
  }

  const ctx = { live, me, session, eventId, setView, myGroup, named, groups }
  let body
  if (left === 'hidden') body = <Home {...ctx} hidden onShow={() => { clearSession(eventId); location.hash = `#/checkin/${eventId}` }} skyMode={skyMode} setSkyMode={setSkyMode} />
  else if (view === 'formed') body = <Formed {...ctx} onLeave={() => leaveEvent('left')} />
  else if (pending && view === 'prompt') body = <Prompt {...ctx} c={pending} onClose={() => dismiss(pending.id)} onBack={() => setView('home')} onSafety={setSafetyFor} />
  else if (pending) body = <Match {...ctx} c={pending} onFound={() => setView('prompt')} onNotNow={() => dismiss(pending.id)} />
  else if (view === 'beacon') body = <Match {...ctx} onFound={() => setView('code')} onNotNow={() => setView('home')} />
  else if (view === 'code') body = <MyCode {...ctx} />
  else if (view === 'scan') body = <Scanner {...ctx} />
  else body = <Home {...ctx} onHide={() => leaveEvent('hidden')} onLeave={() => leaveEvent('left')} skyMode={skyMode} setSkyMode={setSkyMode} onSelect={setSheet} />

  return (
    <main className="cu">
      {glow && <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
        background: 'radial-gradient(circle, rgba(245,199,107,.5), rgba(245,199,107,0) 70%)', animation: motionOK() ? 'cu-glow 4s ease-in-out' : 'none' }} />}
      <p className="sr-only" aria-live="polite">{announce}{glow ? ' The room reached its goal. The sky lit up.' : ''}</p>
      {body}
      {sheet && <PersonSheet {...ctx} person={sheet} onClose={() => setSheet(null)}
        onConnect={() => { setSheet(null); setView('code') }} onSafety={(x) => { setSheet(null); setSafetyFor(x) }} />}
      {safetyFor && <Safety session={session} {...safetyFor} onClose={() => setSafetyFor(null)} />}
    </main>
  )
}

// Design 04 + 16 + 18 · the event's sky with the bottom sheet.
function Home({ live, me, session, eventId, setView, myGroup, named, hidden, onHide, onShow, onLeave, skyMode, setSkyMode, onSelect }) {
  const [pairN, myWord, side] = (me?.half_word ?? '').split('#')
  const partner = pairN && live.people.find((p) => p.id !== me.id && p.half_word?.split('#')[0] === pairN && p.half_word.split('#')[2] !== side)
  const findWord = word(partner) ?? session.find_word
  const links = live.connections.filter((c) => c.a_confirmed && c.b_confirmed).length
  const goal = live.event?.room_goal ?? 20
  const people = hidden ? live.people.filter((p) => p.id !== me?.id) : live.people
  const alone = people.length <= 1 && !hidden
  return (
    <div className="cu-col">
      <div className="cu-top">
        <a className="cu-ib" href="#/" aria-label="Back to map"><Back /></a>
        <div className="grow">
          <div className="cu-title">{live.event?.title}</div>
          <p className="cu-small" style={{ fontWeight: 500 }}>{live.event?.building_code} · {hidden ? "you're hidden" : "you're checked in"}</p>
        </div>
        <a className="cu-pill" href="#/sky">My sky</a>
        {!hidden && <button className="cu-pill" onClick={onLeave}>Leave</button>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <p className="cu-small" style={{ fontWeight: 500 }}>Stars orbit the event. Positions aren't where people stand.</p>
        <div className="cu-seg" role="group" aria-label="View">
          <button aria-pressed={skyMode === 'sky'} onClick={() => setSkyMode('sky')}>Sky</button>
          <button aria-pressed={skyMode === 'list'} onClick={() => setSkyMode('list')}>List</button>
        </div>
      </div>
      {skyMode === 'sky'
        ? <Sky people={people} connections={live.connections} constellations={live.constellations} meId={me?.id} onSelect={onSelect} />
        : <PeopleList people={people} me={me} live={live} myGroup={myGroup} onSelect={onSelect} />}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: '600 12px Inter, sans-serif', color: '#C9D0EC', marginBottom: 6 }}>
          <span>Room goal</span><span>{Math.min(links, goal)} / {goal} links</span>
        </div>
        <div className="cu-bar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(links, goal)} aria-label="Room goal">
          <div style={{ width: `${Math.min(100, (links / goal) * 100)}%` }} />
        </div>
      </div>
      <p className="cu-card" style={{ margin: 0, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center', font: '500 13px Inter, sans-serif', color: '#C9D0EC' }}>
        <Pin /> <span><b className="cu-gold">Star Corner:</b> by the event screen</span>
      </p>
      <div style={{ flex: 1 }} />
      <section className="cu-sheet" aria-label="Your status">
        {hidden ? (
          <>
            <h2 className="cu-h" style={{ fontSize: 22 }}>You're hidden</h2>
            <p className="cu-sub">Nobody sees your star. The event is still yours.</p>
          </>
        ) : alone ? (
          <>
            <p className="cu-kicker">{me?.nickname}</p>
            <h2 className="cu-h">You're first, the sky is waiting</h2>
            <p className="cu-sub">Your star will match with the next person who joins. Nobody else sees you yet.</p>
          </>
        ) : named ? (
          <>
            <p className="cu-kicker">Your constellation</p>
            <h2 className="cu-h cu-gold">{named.name}</h2>
            <p className="cu-sub">{named.members.length} stars. It stays on this sky until the event ends.</p>
          </>
        ) : (
          <>
            <p className="cu-kicker">Find your half</p>
            <h2 className="cu-h" style={{ fontSize: 26 }}>You're <span className="cu-gold">{myWord || session.my_word}</span>.{' '}
              {findWord ? <>Find <span className="cu-gold">{findWord}</span>.</> : 'Your half is on the way.'}</h2>
            <p className="cu-sub">{partner
              ? `${partner.nickname} is here${partner.interests?.some((i) => me?.interests?.includes(i)) ? ` and likes ${partner.interests.find((i) => me.interests.includes(i)).toLowerCase()} too` : ''}. Ask around, or head to Star Corner.`
              : 'Your other half arrives with the next person who joins.'}
              {myGroup.length > 1 && ` ${myGroup.length - 1} of 2 connections to form a constellation.`}</p>
            {findWord && <button className="cu-secondary" style={{ height: 44, minHeight: 44 }} onClick={() => setView('beacon')}>Hold up my screen</button>}
          </>
        )}
        <div className="cu-row2">
          {hidden
            ? <button className="cu-primary" onClick={onShow}>Show me</button>
            : <button className="cu-primary" onClick={() => setView('code')}>Connect</button>}
          {!hidden && <button className="cu-secondary" onClick={onHide}>Hide me</button>}
          {hidden && <a className="cu-secondary" href="#/">Map</a>}
        </div>
      </section>
    </div>
  )
}

function relation(p, me, live, myGroup) {
  const conn = live.connections.find((c) => (c.a === me?.id && c.b === p.id) || (c.b === me?.id && c.a === p.id))
  if (conn?.a_confirmed && conn?.b_confirmed) return { label: 'Connected', conn }
  if (myGroup.includes(p.id)) return { label: 'Shares a group with you', conn }
  const g = live.connections.some((c) => c.a_confirmed && c.b_confirmed && (c.a === p.id || c.b === p.id))
  return { label: g ? 'Another group' : 'Open to meet', conn }
}

// Design 18 · List mode (same people as the sky).
function PeopleList({ people, me, live, myGroup, onSelect }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
      {people.map((p) => {
        const r = p.id === me?.id ? { label: 'You' } : relation(p, me, live, myGroup)
        return (
          <li key={p.id}>
            <button onClick={() => p.id !== me?.id && onSelect?.(p)} disabled={p.id === me?.id}
              className="cu-card" style={{ width: '100%', minHeight: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#E9ECF8', font: '600 15px Inter, sans-serif' }}>
              <span>{p.nickname}</span><span className="cu-small" style={{ fontSize: 13 }}>{r.label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// Design 18 · tap-a-star sheet.
function PersonSheet({ person, me, live, myGroup, onClose, onConnect, onSafety }) {
  const r = relation(person, me, live, myGroup)
  return (
    <div className="cu-modal" role="dialog" aria-modal="true" aria-labelledby="ps-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section>
        <div className="cu-top">
          <h2 id="ps-title" className="cu-h grow" style={{ fontSize: 22 }}>{person.nickname}</h2>
          <button className="cu-ib" onClick={onClose} aria-label="Close" autoFocus><Close /></button>
        </div>
        <p className="cu-sub" style={{ margin: 0 }}>{r.label}</p>
        {person.interests?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {person.interests.map((i) => <span key={i} className="cu-chip" style={{ display: 'inline-flex', alignItems: 'center', height: 32, minHeight: 32 }}>{i}</span>)}</div>}
        {(person.prefers_text || person.come_to_me) && <p className="cu-small" style={{ fontSize: 13 }}>
          {[person.prefers_text && 'Prefers text', person.come_to_me && 'Come to me: they stay put'].filter(Boolean).join(' · ')}</p>}
        {r.label !== 'Connected' && <button className="cu-primary" onClick={onConnect}>Connect</button>}
        <button className="cu-secondary" onClick={() => onSafety({ person, conn: r.conn })}>Remove, block or report</button>
      </section>
    </div>
  )
}

// Design 05 · show your code.
function MyCode({ session, me, live, setView }) {
  const [code, setCode] = useState(null)
  const [qr, setQr] = useState(null)
  const [left, setLeft] = useState(30)
  const [error, setError] = useState(null)
  useEffect(() => {
    let alive = true
    async function fresh() {
      try {
        const c = await rpc('new_connect_code', { p_id: session.participant_id, p_secret: session.secret })
        if (!alive) return
        setCode(c); setLeft(30); setQr(await QRCode.toDataURL(c, { margin: 1, width: 196, color: { dark: '#0B1020', light: '#FFFFFF' } }))
      } catch (err) { setError(err.message) }
    }
    fresh()
    const refresh = setInterval(fresh, 25000)
    const tick = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => { alive = false; clearInterval(refresh); clearInterval(tick) }
  }, [session])
  const [pairN, , side] = (me?.half_word ?? '').split('#')
  const partner = pairN && live.people.find((p) => p.id !== me.id && p.half_word?.split('#')[0] === pairN && p.half_word.split('#')[2] !== side)
  return (
    <div className="cu-col" style={{ alignItems: 'center' }}>
      <div className="cu-top" style={{ width: '100%', justifyContent: 'space-between' }}>
        <button className="cu-pill" style={{ height: 44 }} onClick={() => setView('home')}>Cancel</button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: "700 15px 'Space Grotesk', sans-serif", color: '#FFE2A3' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ filter: 'drop-shadow(0 0 6px #F5C76B)' }}><path d={HALF_L} fill="#FFE2A3" /></svg>
          {word(me) ?? me?.nickname}
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 className="cu-h" style={{ fontSize: 26 }}>Show your code</h1>
        <p className="cu-sub">Let {partner?.nickname ?? 'them'} scan it. It only works in person and refreshes every 30 seconds.</p>
      </div>
      <div role="img" aria-label={`My star code, refreshes in ${left} seconds`}
        style={{ width: 292, maxWidth: '80vw', aspectRatio: '1', borderRadius: '50%', background: `conic-gradient(#F5C76B ${Math.round((left / 30) * 360)}deg, #1C2550 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <div style={{ width: '95%', aspectRatio: '1', borderRadius: '50%', background: '#0F1530', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {qr ? <img src={qr} alt="" width="196" height="196" style={{ width: '67%', height: 'auto', borderRadius: 12, background: '#fff', padding: 10 }} /> : <p className="cu-small">Making your code…</p>}
        </div>
      </div>
      <p style={{ font: '600 14px Inter, sans-serif', color: '#FFE2A3', margin: 0 }} aria-live="polite">New code in {left}s</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <p className="cu-kicker">Camera not working? They type</p>
        <div style={{ display: 'flex', gap: 8 }} aria-label={`Code ${code ?? 'loading'}`} role="text">
          {(code ?? '····').split('').map((d, i) => (
            <span key={i} style={{ width: 46, height: 56, borderRadius: 12, background: '#161E3E', border: '1px solid #36407A', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 26px 'Space Grotesk', sans-serif" }}>{d}</span>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="cu-err">{error}</p>}
      <div style={{ flex: 1 }} />
      <button className="cu-primary" onClick={() => setView('scan')}><CamIcon /> Scan someone</button>
      <p className="cu-small" style={{ textAlign: 'center' }}>Both of you confirm before a line appears. You can remove it any time.</p>
    </div>
  )
}

function Scanner({ session, setView }) {
  const video = useRef(null)
  const [camera, setCamera] = useState('starting') // starting | on | blocked
  const [typed, setTyped] = useState('')
  const [error, setError] = useState(null)
  const busy = useRef(false)

  async function redeem(code) {
    if (busy.current) return
    busy.current = true; setError(null)
    try { await rpc('redeem_code', { p_id: session.participant_id, p_secret: session.secret, p_code: code }) }
    catch (err) {
      setError(err.message === 'code expired or not at this event' ? 'That code expired or is from another event. Ask for a fresh one.'
        : err.message === 'already connected' ? "You're already connected with them." : err.message)
      busy.current = false
    }
  }

  useEffect(() => {
    let stream, raf, stop = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!navigator.mediaDevices) { setCamera('blocked'); return }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((s) => {
      if (stop) return s.getTracks().forEach((t) => t.stop())
      stream = s; video.current.srcObject = s; video.current.play(); setCamera('on')
      const loop = () => {
        const v = video.current
        if (v && v.readyState === v.HAVE_ENOUGH_DATA) {
          canvas.width = v.videoWidth; canvas.height = v.videoHeight
          ctx.drawImage(v, 0, 0)
          const hit = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)
          if (hit && /^\d{4}$/.test(hit.data)) redeem(hit.data)
        }
        raf = requestAnimationFrame(loop)
      }
      loop()
    }).catch(() => setCamera('blocked'))
    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()) }
  }, [])

  return (
    <div className="cu-col">
      <div className="cu-top">
        <button className="cu-ib" onClick={() => setView('code')} aria-label="Back to my code"><Back /></button>
        <h1 className="cu-h grow" style={{ fontSize: 22 }}>Scan their star code</h1>
      </div>
      {camera !== 'blocked'
        ? <video ref={video} muted playsInline aria-label="Camera view for scanning a star code"
            style={{ width: '100%', borderRadius: 20, border: '3px solid #F5C76B', background: '#000', aspectRatio: '1', objectFit: 'cover' }} />
        : <p className="cu-note">Camera is off or blocked. Type their 4-digit code instead.</p>}
      <form onSubmit={(e) => { e.preventDefault(); redeem(typed) }} style={{ display: 'grid', gap: 10 }}>
        <label htmlFor="code">Type code instead</label>
        <input id="code" inputMode="numeric" pattern="\d{4}" maxLength={4} value={typed} autoComplete="off"
          onChange={(e) => setTyped(e.target.value.replace(/\D/g, ''))} placeholder="4 digits"
          style={{ font: "700 26px 'Space Grotesk', sans-serif", letterSpacing: 10, textAlign: 'center', height: 60 }} />
        <button className="cu-primary" disabled={typed.length !== 4}>Connect</button>
      </form>
      {error && <p role="alert" className="cu-err">{error}</p>}
    </div>
  )
}

// Design 06 · match found / hold up your screen. Both phones show the same color + pattern + word.
function Match({ c, me, live, session, eventId, onFound, onNotNow }) {
  const [hint, setHint] = useState('')
  const [pairN, , side] = (me?.half_word ?? '').split('#')
  const other = c ? live.people.find((p) => p.id === (c.a === me.id ? c.b : c.a))
    : live.people.find((p) => p.id !== me.id && p.half_word?.split('#')[0] === pairN && p.half_word.split('#')[2] !== side)
  const theirWord = (c && other?.half_word?.split('#')[0] !== pairN) ? other?.nickname?.toUpperCase() : (word(other) ?? session.find_word ?? other?.nickname?.toUpperCase())
  const look = lookFor(c ? c.id : `pair${pairN}`)
  const [clue, setClue] = useState(null)
  useEffect(() => { if (c && other) rpc('match_clue', { p_id: session.participant_id, p_secret: session.secret, p_other: other.id }).then(setClue).catch(() => {}) }, [c?.id, other?.id])

  const buzz = () => {
    const ok = navigator.vibrate?.([500, 150, 150, 150, 500])
    setHint(ok ? `Your phone buzzes long, short, long. Feel for it near Star Corner.` : "This phone can't buzz. Try saying it out loud.")
  }
  const speak = () => {
    if (!('speechSynthesis' in window)) return setHint("This phone can't speak. Ask the host instead.")
    speechSynthesis.speak(new SpeechSynthesisUtterance(theirWord ?? 'over here'))
    setHint(`Your phone says “${theirWord}” out loud.`)
  }
  const host = async () => {
    try { await rpc('ask_host', { p_event: eventId, p_question: `${me.nickname} and ${other?.nickname ?? 'their match'} are trying to find each other. Meet at Star Corner?` }); setHint('The host got a private note. Head to Star Corner.') }
    catch { setHint("Couldn't reach the host. Try Star Corner.") }
  }
  const come = () => setHint(`Stay where you are and keep your screen up. ${other?.nickname ?? 'Your match'} will look for your color.`)

  return (
    <div style={{ minHeight: '100dvh', background: `${look.css}, ${look.color}`, color: '#fff' }}>
      <div className="cu-col" style={{ alignItems: 'center', gap: 14 }}>
        <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', font: '600 13px Inter, sans-serif' }}>
          <span style={{ letterSpacing: 1 }}>{c ? 'MATCH FOUND' : 'FIND YOUR HALF'}</span><span>You're {word(me) ?? me.nickname}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center' }}>
          <svg width="52" height="52" viewBox="0 0 24 24" aria-hidden="true"><path d={HALF_R} fill="#fff" /><path d={HALF_L} fill="#fff" fillOpacity=".35" /></svg>
          <p className={motionOK() ? 'cu-breathe' : ''} style={{ font: "700 clamp(48px, 18vw, 84px) 'Space Grotesk', sans-serif", letterSpacing: -2, lineHeight: 1, margin: 0, wordBreak: 'break-word' }}>{theirWord ?? '…'}</p>
          <p className="sr-only">Pattern: {look.pattern}</p>
          {clue && <p style={{ padding: '12px 18px', borderRadius: 16, background: 'rgba(255,255,255,.16)', font: '500 16px Inter, sans-serif', margin: 0 }}>Their clue: {clue}</p>}
          {other?.come_to_me && <p style={{ margin: 0, font: '600 15px Inter, sans-serif' }}>{other.nickname} will stay put. Go to them.</p>}
          <p style={{ font: "700 22px 'Space Grotesk', sans-serif", margin: 0 }}>Hold your phone up.</p>
          {hint
            ? <p role="status" style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,.28)', font: '600 14px Inter, sans-serif', maxWidth: 300, margin: 0 }}>{hint}</p>
            : <p style={{ font: '400 15px Inter, sans-serif', maxWidth: 290, margin: 0 }}>{other?.nickname ?? 'Their'}{other ? "'s" : ''} screen has this same color and {look.pattern}. Look for it across the room.</p>}
        </div>
        <div style={{ alignSelf: 'stretch', display: 'grid', gap: 8 }}>
          <p style={{ font: '600 12px Inter, sans-serif', letterSpacing: .6, textAlign: 'center', margin: 0 }}>CAN'T SPOT THEM?</p>
          <div className="cu-grid2" style={{ gap: 8 }}>
            {[['Buzz pattern', buzz], ['Say it out loud', speak], ['Ask the host', host], ['Come to me', come]].map(([t, fn]) => (
              <button key={t} onClick={fn} style={{ height: 44, borderRadius: 14, border: '1.5px solid rgba(255,255,255,.7)', background: 'rgba(0,0,0,.18)', color: '#fff', font: '600 13px Inter, sans-serif' }}>{t}</button>
            ))}
          </div>
        </div>
        <button onClick={onFound} style={{ alignSelf: 'stretch', height: 56, borderRadius: 16, background: '#fff', color: '#2B1A8C', font: '700 16px Inter, sans-serif', border: 0 }}>We found each other</button>
        <button onClick={onNotNow} style={{ alignSelf: 'stretch', height: 50, borderRadius: 16, border: '1.5px solid rgba(255,255,255,.7)', background: 'transparent', color: '#fff', font: '600 15px Inter, sans-serif' }}>Not now</button>
      </div>
    </div>
  )
}

// Design 07 · shared prompt, both confirm.
function Prompt({ c, me, live, session, onClose, onBack, onSafety }) {
  const otherId = c.a === me.id ? c.b : c.a
  const other = live.people.find((p) => p.id === otherId)
  const mineDone = c.a === me.id ? c.a_confirmed : c.b_confirmed
  const theirsDone = c.a === me.id ? c.b_confirmed : c.a_confirmed
  const [answer, setAnswer] = useState(c.answer ?? '')
  const [pi, setPi] = useState(0)
  const [error, setError] = useState(null)
  const list = [c.prompt, ...PROMPTS.filter((p) => p !== c.prompt)].filter(Boolean)
  const args = { p_id: session.participant_id, p_secret: session.secret }
  const confirmIt = async () => { try { await rpc('confirm_connection', { ...args, p_conn: c.id, p_answer: answer }) } catch (err) { setError(err.message) } }
  const decline = async () => { try { await rpc('remove_connection', { ...args, p_conn: c.id }); onClose() } catch (err) { setError(err.message) } }
  const chip = (done, waiting) => ({ padding: '8px 14px', borderRadius: 16, background: done ? '#F5C76B' : '#1C2550', color: done ? '#0B1020' : '#C9D0EC', font: '600 14px Inter, sans-serif' })
  const a = word(me) ?? me.nickname, b = (other && word(other)) ?? other?.nickname ?? 'them'
  return (
    <div className="cu-col" style={{ gap: 18 }}>
      <div className="cu-top" style={{ justifyContent: 'space-between' }}>
        <button className="cu-ib" onClick={onBack} aria-label="Back"><Back /></button>
        <span className="cu-small" style={{ fontWeight: 600 }}>Say hi, then both say yes</span>
        <button className="cu-ib" onClick={onClose} aria-label="Close"><Close /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <div aria-hidden="true" style={{ position: 'relative', width: 84, height: 84 }}>
          <svg width="84" height="84" viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0, transform: mineDone && theirsDone ? 'none' : 'translateX(-10px)', transition: 'transform .6s' }}><path d={HALF_L} fill="#FFE2A3" /></svg>
          <svg width="84" height="84" viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0, transform: mineDone && theirsDone ? 'none' : 'translateX(10px)', transition: 'transform .6s' }}><path d={HALF_R} fill="#F5C76B" /></svg>
        </div>
        <h1 className="cu-h" style={{ fontSize: 22 }}>{a} + {b}</h1>
        <p className="cu-small" style={{ fontSize: 14 }}>{me.nickname} and {other?.nickname ?? 'your match'} are both checked in at {live.event?.building_code}</p>
        {other?.prefers_text && <p className="cu-small" style={{ fontSize: 13 }}>{other.nickname} prefers text. Type your answer together.</p>}
      </div>
      <div className="cu-card" style={{ padding: 18, borderRadius: 18, border: '1px solid #36407A', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="cu-kicker">Your shared prompt</p>
          <button className="cu-pill" style={{ height: 36, minHeight: 36, fontSize: 12 }} onClick={() => setPi(pi + 1)}>Shuffle</button>
        </div>
        <p aria-live="polite" style={{ font: "600 20px 'Space Grotesk', sans-serif", lineHeight: 1.3, margin: 0 }}>{list[pi % list.length]}</p>
      </div>
      <div>
        <label htmlFor="ans">Your answer together</label>
        <textarea id="ans" rows={2} maxLength={200} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type it here or just say it out loud"
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', resize: 'none' }} />
        <p className="cu-small" style={{ marginTop: 6 }}>Optional. Only you two see it.</p>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }} aria-live="polite">
        <span style={chip(mineDone)}>You {mineDone ? '✓' : '·'}</span>
        <span style={chip(theirsDone)}>{other?.nickname ?? 'Them'} {theirsDone ? '✓' : mineDone ? 'waiting…' : '·'}</span>
      </div>
      <p className="cu-small" style={{ textAlign: 'center', marginTop: -8 }}>A line only appears when you both confirm. That's what stops anyone being linked without saying yes.</p>
      {error && <p role="alert" className="cu-err">{error}</p>}
      {mineDone
        ? <p role="status" style={{ height: 56, borderRadius: 16, background: '#161E3E', border: '1px dashed #36407A', color: '#C9D0EC', font: '600 15px Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>Waiting for {other?.nickname ?? 'them'} to confirm…</p>
        : <>
            <button className="cu-primary" onClick={confirmIt}>Confirm connection</button>
            <button className="cu-secondary" style={{ height: 48, minHeight: 48 }} onClick={decline}>Decline, no hard feelings</button>
          </>}
      {other && <button className="cu-pill" style={{ alignSelf: 'center', border: 0, background: 'none', color: '#AEB7DA', textDecoration: 'underline' }} onClick={() => onSafety({ person: other, conn: c })}>Block or report</button>}
    </div>
  )
}

// Design 08 · a constellation formed: name it, share card, back to the map.
function Formed({ live, me, session, myGroup, named, setView, onLeave }) {
  const [name, setName] = useState(named?.name ?? '')
  const [saved, setSaved] = useState(!!named)
  const [shared, setShared] = useState(false)
  const [error, setError] = useState(null)
  const members = live.people.filter((p) => myGroup.includes(p.id))
  const pts = members.map((p, i) => {
    const ang = (i / members.length) * Math.PI * 2 - Math.PI / 2
    return { p, x: 175 + Math.cos(ang) * 110, y: 160 + Math.sin(ang) * 110 }
  })
  useEffect(() => { if (motionOK()) confetti({ particleCount: 80, spread: 70, shapes: ['star'], colors: ['#F5C76B', '#FFE2A3', '#E9ECF8'], disableForReducedMotion: true }) }, [])
  async function save(e) {
    e.preventDefault(); setError(null)
    try {
      await rpc('name_constellation', { p_id: session.participant_id, p_secret: session.secret, p_members: myGroup, p_name: name.trim() })
      setSaved(true)
    } catch (err) { setError(err.message) }
  }
  function share() {
    shareCard({ name: name.trim() || 'Unnamed, for now', nicks: members.map((m) => m.nickname), event: live.event?.title ?? '' })
    setShared(true)
  }
  return (
    <div style={{ background: 'radial-gradient(circle at 50% 34%, #2A2650 0%, #0B1020 62%)', minHeight: '100dvh' }}>
      <form className="cu-col" onSubmit={save}>
        <div className="cu-top" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="cu-ib" onClick={() => setView('home')} aria-label="Back to the event"><Back /></button>
          <div style={{ display: 'flex', gap: 8 }}>
            <a className="cu-pill" href="#/sky">My sky</a>
            <button type="button" className="cu-pill danger" onClick={onLeave}>Leave event</button>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p className="cu-kicker" style={{ color: '#F5C76B', letterSpacing: 1 }}>A constellation formed</p>
          <h1 className="cu-h">{name.trim() || 'Unnamed, for now'}</h1>
        </div>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '350 / 320' }} role="img" aria-label={`Constellation of ${members.map((m) => m.nickname).join(', ')}`}>
          <svg viewBox="0 0 350 320" width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
            <g stroke="#FFE2A3" strokeWidth="2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px #F5C76B)' }}>
              {live.connections.filter((c) => c.a_confirmed && c.b_confirmed && myGroup.includes(c.a) && myGroup.includes(c.b)).map((c, i) => {
                const A = pts.find((q) => q.p.id === c.a), B = pts.find((q) => q.p.id === c.b)
                return A && B && <line key={c.id} className="cu-draw" style={{ animationDelay: `${0.5 + i * 0.5}s` }} x1={A.x} y1={A.y} x2={B.x} y2={B.y} />
              })}
            </g>
          </svg>
          {pts.map(({ p, x, y }, i) => (
            <div key={p.id} className="cu-popin" style={{ position: 'absolute', left: `${(x / 350) * 100}%`, top: `${(y / 320) * 100}%`, transform: 'translate(-50%, -18px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animationDelay: `${i * 0.2}s` }}>
              <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" style={{ filter: 'drop-shadow(0 0 10px #F5C76B)' }}><path d={SPARK} fill={p.id === me.id ? '#FFF3D6' : '#FFE2A3'} /></svg>
              <span style={{ font: '600 13px Inter, sans-serif', color: '#FFE9BE' }}>{p.id === me.id ? `${p.nickname} (you)` : p.nickname}</span>
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="cname">Name your constellation</label>
          <input id="cname" required maxLength={40} value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} placeholder={`Something only you ${members.length} get`}
            style={{ width: '100%', border: '1px solid #F5C76B', color: '#FFE9BE', font: "600 17px 'Space Grotesk', sans-serif" }} disabled={!!named} />
          <p className="cu-small" style={{ marginTop: 6 }}>It stays on the {live.event?.building_code} sky for tonight's event. Nicknames only.</p>
        </div>
        {!named && !saved && <button className="cu-primary" disabled={!name.trim()}>Name it</button>}
        {error && <p role="alert" className="cu-err">{error}</p>}
        <div style={{ flex: 1 }} />
        {shared && <p role="status" className="cu-note">Card saved: constellation, nicknames and event name only.</p>}
        <div className="cu-grid2">
          <button type="button" className="cu-secondary" onClick={share}>Share card</button>
          <a className="cu-goldbtn" href="#/">Back to the map</a>
        </div>
      </form>
    </div>
  )
}

// Share card PNG: constellation name, nicknames and event title only.
function shareCard({ name, nicks, event }) {
  const c = document.createElement('canvas'); c.width = c.height = 1080
  const g = c.getContext('2d')
  const bg = g.createRadialGradient(540, 420, 40, 540, 420, 760); bg.addColorStop(0, '#2A2650'); bg.addColorStop(1, '#0B1020')
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1080)
  const pts = nicks.map((_, i) => { const a = (i / nicks.length) * Math.PI * 2 - Math.PI / 2; return [540 + Math.cos(a) * 230, 450 + Math.sin(a) * 230] })
  g.strokeStyle = '#FFE2A3'; g.lineWidth = 4; g.shadowColor = '#F5C76B'; g.shadowBlur = 16; g.beginPath()
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke()
  const star = new Path2D(SPARK)
  pts.forEach(([x, y], i) => {
    g.save(); g.translate(x - 36, y - 36); g.scale(3, 3); g.fillStyle = '#FFE2A3'; g.fill(star); g.restore()
    g.shadowBlur = 0; g.fillStyle = '#FFE9BE'; g.font = '600 34px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(nicks[i], x, y + 80)
  })
  g.fillStyle = '#F5C76B'; g.font = '600 30px Inter, sans-serif'; g.fillText('A CONSTELLATION FORMED', 540, 110)
  g.fillStyle = '#E9ECF8'; g.font = "700 64px 'Space Grotesk', sans-serif"; g.fillText(name, 540, 860, 980)
  g.fillStyle = '#AEB7DA'; g.font = '500 32px Inter, sans-serif'; g.fillText(`${event} · Constellation U`, 540, 930, 980)
  const a = document.createElement('a'); a.download = 'constellation.png'; a.href = c.toDataURL('image/png'); a.click()
}

// Design 18 · after leaving (or when the check-in expired).
function LeftScreen({ eventId, title, expired }) {
  return (
    <main className="cu">
      <div className="cu-col" style={{ justifyContent: 'center', textAlign: 'center', alignItems: 'center' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true"><path d={SPARK} fill="none" stroke="#AEB7DA" strokeWidth="1.5" strokeDasharray="2 2" /></svg>
        <h1 className="cu-h" role="status">{expired ? "You're not in this sky right now" : `You left ${title ?? 'the event'}`}</h1>
        <p className="cu-sub">{expired ? 'Your check-in ended or you left the event.' : 'Your star is gone from this sky. Your connections and constellations stay.'}</p>
        <a className="cu-goldbtn" href="#/" style={{ maxWidth: 320 }}>Back to the map</a>
        <a className="cu-secondary" href={`#/checkin/${eventId}`} style={{ maxWidth: 320 }}>Check in again</a>
        {!expired && <a href={`#/feedback/${eventId}`} style={{ color: '#F5C76B', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Rate tonight</a>}
      </div>
    </main>
  )
}

const Pin = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C76B" strokeWidth="2" aria-hidden="true" style={{ flex: 'none' }}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
const CamIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
