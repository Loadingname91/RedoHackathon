import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import confetti from 'canvas-confetti'
import { rpc } from '../lib/supabase.js'
import { getSession, clearSession } from '../lib/identity.js'
import { useEventLive, useRoomGlow, components, confirmedEdges, motionOK } from '../lib/social.js'
import Safety from '../components/social/Safety.jsx'
import Sky, { StarIcon } from '../components/social/Sky.jsx'

// Match look: color + pattern + word, never color alone.
const LOOKS = [
  { color: '#F5C451', pattern: 'stripes', css: 'repeating-linear-gradient(45deg, rgba(0,0,0,.25) 0 10px, transparent 10px 20px)' },
  { color: '#6FB7FF', pattern: 'dots', css: 'radial-gradient(rgba(0,0,0,.3) 3px, transparent 4px) 0 0/16px 16px' },
  { color: '#5FD39A', pattern: 'waves', css: 'repeating-radial-gradient(circle at 0 100%, rgba(0,0,0,.25) 0 6px, transparent 6px 14px)' },
  { color: '#FF9F6B', pattern: 'checks', css: 'repeating-conic-gradient(rgba(0,0,0,.22) 0 25%, transparent 0 50%) 0 0/20px 20px' },
]
const lookFor = (id) => LOOKS[[...id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % LOOKS.length]

export default function AtEvent({ param: eventId }) {
  const session = getSession(eventId)
  const live = useEventLive(eventId)
  const glow = useRoomGlow(eventId)
  const [view, setView] = useState('home') // home | code | scan
  const [announce, setAnnounce] = useState('')
  const [left, setLeft] = useState(false)
  const [safetyFor, setSafetyFor] = useState(null) // { person, conn }
  const meId = session?.participant_id
  const me = live.people.find((p) => p.id === meId)

  // Announce new confirmed connections to screen readers.
  const confirmedCount = live.connections.filter((c) => c.a_confirmed && c.b_confirmed && (c.a === meId || c.b === meId)).length
  const prevCount = useRef(confirmedCount)
  useEffect(() => {
    if (confirmedCount > prevCount.current) setAnnounce(`Connection confirmed. You have ${confirmedCount} connection${confirmedCount > 1 ? 's' : ''} here.`)
    prevCount.current = confirmedCount
  }, [confirmedCount])

  if (left) return (
    <main className="screen">
      <h1 role="status">Your star is gone from this event.</h1>
      <p className="muted">Your lines here were removed too. Your constellations stay in My sky.</p>
      <a className="btn primary" href={`#/event/${eventId}`}>Back to the event</a>
    </main>
  )
  if (!session) { location.hash = `#/checkin/${eventId}`; return null }
  if (live.loading) return <p className="screen muted" role="status">Loading the sky…</p>
  if (!me) return (
    <main className="screen">
      <h1>You're not in this sky right now</h1>
      <p className="muted">Your check-in ended or you left the event.</p>
      <a className="btn primary" href={`#/checkin/${eventId}`}>Check in again</a>
    </main>
  )

  const pending = live.connections.find((c) => (c.a === meId || c.b === meId) && !(c.a_confirmed && c.b_confirmed))

  async function leave() {
    if (!confirm('Leave this event? Your star and lines here disappear right away.')) return
    try { await rpc('leave_event', { p_id: meId, p_secret: session.secret }) } catch {}
    clearSession(eventId)
    setLeft(true)
  }

  return (
    <main className="screen" style={{ position: 'relative' }}>
      {glow && <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
        background: 'radial-gradient(circle, rgba(245,196,81,.55), rgba(245,196,81,0) 70%)', animation: 'cu-glow 4s ease-in-out' }} />}
      <style>{'@keyframes cu-glow{0%,100%{opacity:0}50%{opacity:1}}'}</style>
      <p className="sr-only" aria-live="polite">{announce}{glow ? ' The room reached its goal. The sky lit up.' : ''}</p>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>{live.event?.title}</p>
          <h1 style={{ fontSize: 22 }}>{me.nickname}</h1>
        </div>
        <button onClick={leave} aria-label="Hide me and leave this event">Hide me</button>
      </header>

      {safetyFor && <Safety session={session} {...safetyFor} onClose={() => setSafetyFor(null)} />}
      {pending ? <Prompt c={pending} meId={meId} session={session} people={live.people} onSafety={setSafetyFor} />
        : view === 'code' ? <MyCode session={session} onBack={() => setView('home')} />
        : view === 'scan' ? <Scanner session={session} onBack={() => setView('home')} />
        : <Home live={live} me={me} session={session} setView={setView} onSafety={setSafetyFor} />}
    </main>
  )
}

function Home({ live, me, session, setView, onSafety }) {
  const comps = components(live.people.map((p) => p.id), confirmedEdges(live.connections))
  const mine = comps.find((g) => g.includes(me.id)) ?? [me.id]
  const named = live.constellations.find((c) => c.members.includes(me.id))
  // half_word is "<n>#<WORD>#<A|B>": show only the word. Partner = same n, other side (updates live if they join later).
  const [pairN, myWord, side] = (me.half_word ?? '').split('#')
  const partnerRaw = pairN && live.people.find((p) => p.id !== me.id && p.half_word?.split('#')[0] === pairN && p.half_word.split('#')[2] !== side)?.half_word
  const findWord = partnerRaw?.split('#')[1] ?? session.find_word
  return (
    <>
      <div className="card" style={{ margin: '16px 0', padding: 8 }}>
        <Sky people={live.people} connections={live.connections} constellations={live.constellations} meId={me.id} />
      </div>
      {(myWord || session.my_word) && (
        <p className="card" style={{ fontSize: 18 }}>
          You're <strong style={{ color: 'var(--gold)' }}>{myWord || session.my_word}</strong>.{' '}
          {findWord ? <>Find <strong style={{ color: 'var(--gold)' }}>{findWord}</strong>.</> : 'Your other half arrives with the next person who joins.'}
        </p>
      )}
      {live.people.length < 2 && <p className="muted">You're first. Your star will connect with the next person who joins.</p>}
      <p className="muted" style={{ margin: '0 0 16px' }}>Look for people holding up a star screen at the Star Corner, by the event screen.</p>
      {named ? <p className="card" style={{ color: 'var(--gold)' }}><strong>{named.name}</strong> · your constellation of {named.members.length}</p>
        : mine.length >= 3 ? <NameIt members={mine} session={session} />
        : <p className="muted">{mine.length - 1} of 2 connections to form a constellation.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <button className="gold" onClick={() => setView('code')}><StarIcon /> Show my code</button>
        <button onClick={() => setView('scan')}>Scan someone</button>
      </div>
      {live.people.length > 1 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ minHeight: 44, cursor: 'pointer' }}>People here ({live.people.length - 1})</summary>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {live.people.filter((p) => p.id !== me.id).map((p) => {
              const conn = live.connections.find((c) => (c.a === me.id && c.b === p.id) || (c.b === me.id && c.a === p.id))
              return (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span>{p.nickname}{conn?.a_confirmed && conn?.b_confirmed ? ' · connected' : ''}</span>
                  <button onClick={() => onSafety({ person: p, conn })} aria-label={`Safety options for ${p.nickname}`}>Options</button>
                </li>
              )
            })}
          </ul>
        </details>
      )}
      <p style={{ marginTop: 16 }}><a href="#/sky">My sky</a></p>
    </>
  )
}

function NameIt({ members, session }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  async function save(e) {
    e.preventDefault()
    try {
      await rpc('name_constellation', { p_id: session.participant_id, p_secret: session.secret, p_members: members, p_name: name.trim() })
      if (motionOK()) confetti({ particleCount: 90, spread: 70, shapes: ['star'], colors: ['#F5C451', '#EEF0F7'] })
    } catch (err) { setError(err.message) }
  }
  return (
    <form className="card" onSubmit={save} style={{ display: 'grid', gap: 10 }}>
      <label htmlFor="cname" style={{ color: 'var(--gold)', fontSize: 16 }}>{members.length} stars are connected. Name your constellation</label>
      <input id="cname" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="The Unfinished Game Studio" />
      {error && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{error}</p>}
      <button className="primary">Name it</button>
    </form>
  )
}

function MyCode({ session, onBack }) {
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
        setCode(c); setLeft(30); setQr(await QRCode.toDataURL(c, { margin: 1, width: 240 }))
      } catch (err) { setError(err.message) }
    }
    fresh()
    const refresh = setInterval(fresh, 25000)
    const tick = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => { alive = false; clearInterval(refresh); clearInterval(tick) }
  }, [session])
  return (
    <section style={{ textAlign: 'center', marginTop: 16 }}>
      <div style={{ border: '4px solid var(--gold)', borderRadius: 20, padding: 20, display: 'inline-block' }}>
        <p style={{ margin: '0 0 12px', color: 'var(--gold)', fontWeight: 600 }}>My star code</p>
        {qr ? <img src={qr} alt={`QR code for star code ${code}`} width="240" height="240" style={{ borderRadius: 8, background: '#fff' }} /> : <p className="muted">Making your code…</p>}
        <p style={{ fontFamily: 'var(--display)', fontSize: 48, letterSpacing: 8, margin: '12px 0 0' }}>{code ?? '····'}</p>
        <p className="muted" aria-live="polite">New code in {left}s</p>
      </div>
      {error && <p role="alert" style={{ color: 'var(--coral)' }}>{error}</p>}
      <p className="muted">Let the other person scan this, or read them the 4 digits.</p>
      <button onClick={onBack}>Back</button>
    </section>
  )
}

function Scanner({ session, onBack }) {
  const video = useRef(null)
  const [camera, setCamera] = useState('starting') // starting | on | blocked
  const [typed, setTyped] = useState('')
  const [error, setError] = useState(null)
  const busy = useRef(false)

  async function redeem(code) {
    if (busy.current) return
    busy.current = true; setError(null)
    try { await rpc('redeem_code', { p_id: session.participant_id, p_secret: session.secret, p_code: code }) }
    catch (err) { setError(err.message === 'code expired or not at this event' ? 'That code expired or is from another event. Ask for a fresh one.' : err.message); busy.current = false }
  }

  useEffect(() => {
    let stream, raf, stop = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } }).then((s) => {
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
    if (!navigator.mediaDevices) setCamera('blocked')
    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()) }
  }, [])

  return (
    <section style={{ marginTop: 16, display: 'grid', gap: 12 }}>
      {camera !== 'blocked' ? (
        <video ref={video} muted playsInline aria-label="Camera view for scanning a star code"
          style={{ width: '100%', borderRadius: 16, border: '4px solid var(--gold)', background: '#000', aspectRatio: '1' }} />
      ) : (
        <p className="card">Camera is off or blocked. You can type the 4-digit code instead.</p>
      )}
      <form onSubmit={(e) => { e.preventDefault(); redeem(typed) }} style={{ display: 'grid', gap: 8 }}>
        <label htmlFor="code">Type code instead</label>
        <input id="code" inputMode="numeric" pattern="\d{4}" maxLength={4} value={typed} onChange={(e) => setTyped(e.target.value.replace(/\D/g, ''))} placeholder="4 digits" />
        <button className="primary" disabled={typed.length !== 4}>Connect</button>
      </form>
      {error && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{error}</p>}
      <button onClick={onBack}>Back</button>
    </section>
  )
}

function Prompt({ c, meId, session, people, onSafety }) {
  const otherId = c.a === meId ? c.b : c.a
  const other = people.find((p) => p.id === otherId)
  const mineDone = c.a === meId ? c.a_confirmed : c.b_confirmed
  const [answer, setAnswer] = useState(c.answer ?? '')
  const [clue, setClue] = useState(null)
  const [error, setError] = useState(null)
  const look = useMemo(() => lookFor(c.id), [c.id])
  const args = { p_id: session.participant_id, p_secret: session.secret }

  useEffect(() => { rpc('match_clue', { ...args, p_other: otherId }).then(setClue).catch(() => {}) }, [otherId])

  async function confirmIt() {
    try { await rpc('confirm_connection', { ...args, p_conn: c.id, p_answer: answer }) } catch (err) { setError(err.message) }
  }
  async function decline() {
    try { await rpc('remove_connection', { ...args, p_conn: c.id }) } catch (err) { setError(err.message) }
  }

  return (
    <section style={{ marginTop: 16, display: 'grid', gap: 14 }}>
      <div style={{ border: `6px solid ${look.color}`, borderRadius: 20, padding: 16, background: `${look.css}, ${look.color}33` }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Matched with · {look.pattern} pattern</p>
        <p style={{ fontFamily: 'var(--display)', fontSize: 40, margin: '4px 0', color: look.color, textShadow: '0 1px 2px #000' }}>{other?.nickname?.toUpperCase() ?? 'YOUR MATCH'}</p>
        {clue && <p style={{ margin: 0 }}>Find them: {clue}</p>}
        {other?.come_to_me && <p style={{ margin: '4px 0 0' }}>{other.nickname} will stay put. Go to them.</p>}
        {other?.prefers_text && <p style={{ margin: '4px 0 0' }}>{other.nickname} prefers text. Answer here together.</p>}
      </div>
      <p style={{ margin: 0 }}>{c.prompt}</p>
      <label htmlFor="ans">Your shared answer</label>
      <textarea id="ans" rows={3} maxLength={200} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="We both want to make a game" />
      {mineDone
        ? <p className="card" role="status">Waiting for {other?.nickname ?? 'them'} to confirm…</p>
        : <button className="primary" onClick={confirmIt}>Confirm connection</button>}
      {error && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{error}</p>}
      <button onClick={decline}>{mineDone ? 'Cancel' : 'Not now'}</button>
      {other && <button onClick={() => onSafety({ person: other, conn: c })}>Block or report {other.nickname}</button>}
    </section>
  )
}
