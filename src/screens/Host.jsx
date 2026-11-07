import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { setHostSecret, getHostSecret, hostLink } from '../lib/identity.js'
import {
  BUILDINGS, OFFERING_TYPES, STATUSES, LIMITED, getEvent, parseAnnouncement, publishEvent, setOfferings,
  autoFinish, toLocalInput, fromLocalInput, claimEvent, listQuestions, answerQuestion, feedbackSummary, hostedIds, isLive,
} from '../lib/events.js'

const ACCESS = [
  { key: 'step_free', label: 'Step-free entrance', options: ['yes', 'no', 'unknown'] },
  { key: 'captions_asl', label: 'Captions or ASL', options: ['yes', 'no', 'unknown'] },
  { key: 'quiet_space', label: 'Quiet space', options: ['yes', 'no', 'unknown'] },
  { key: 'sensory', label: 'Noise level', options: ['quiet', 'moderate', 'loud', 'unknown'] },
]
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-US', { timeZone: 'America/Denver', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Time not set')
const checkinUrl = (id) => `${location.origin}/#/checkin/${id}`
const timeOnly = (iso) => new Date(iso).toLocaleTimeString('en-US', { timeZone: 'America/Denver', hour: 'numeric', minute: '2-digit' })
const isWarn = (s) => /review|unknown|missing|possible match/i.test(`${s.label} ${s.detail ?? ''}`)
const sectionH = { fontSize: 14, letterSpacing: '0.08em', color: 'var(--muted)', margin: '0 0 10px', fontFamily: 'var(--font)' }

// Shared by the published view and the dashboard: one-tap status for limited offerings.
function LiveStatus({ ev, onSave }) {
  const offerings = ev.offerings ?? []
  return (
    <section aria-labelledby="live-h" style={{ marginTop: 24 }}>
      <h2 id="live-h" style={sectionH}>3 · LIVE OFFERING STATUS</h2>
      {offerings.length === 0 && <p className="muted">No offerings listed.</p>}
      {offerings.map((o, i) => (
        <div key={i} className="card" style={{ marginBottom: 10 }}>
          <p style={{ margin: '0 0 8px' }}><strong style={{ textTransform: 'capitalize' }}>{o.text || o.type}</strong>
            <span className="muted"> · {LIMITED.has(o.type) ? (STATUSES.find((x) => x.id === o.status)?.label ?? 'Advertised') : 'No live status needed'}</span></p>
          {LIMITED.has(o.type) && (
            <div role="group" aria-label={`${o.text || o.type} status`} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STATUSES.map((s) => (
                <button key={s.id} type="button" aria-pressed={o.status === s.id} className={o.status === s.id ? 'gold' : undefined}
                  onClick={() => onSave(offerings.map((x, j) => (j === i ? { ...x, status: s.id } : x)))}>{s.label}</button>
              ))}
            </div>
          )}
        </div>
      ))}
      {ev.end_at && <p className="muted" style={{ fontSize: 14 }}>Busy? It switches to Finished on its own at {timeOnly(ev.end_at)}, when the event ends.</p>}
    </section>
  )
}

function QR({ text, label, frame }) {
  const [src, setSrc] = useState('')
  useEffect(() => { QRCode.toDataURL(text, { margin: 1, width: 480 }).then(setSrc).catch(() => setSrc('')) }, [text])
  return (
    <figure style={{ margin: 0, padding: 16, borderRadius: 20, border: `6px solid ${frame}`, background: '#fff', textAlign: 'center', maxWidth: 320 }}>
      {src ? <img src={src} alt={`QR code: ${label}`} style={{ width: '100%', display: 'block' }} /> : <p style={{ color: '#000' }}>Making QR…</p>}
      <figcaption style={{ color: '#0B1020', font: '700 18px var(--display)', marginTop: 8 }}>{label}</figcaption>
    </figure>
  )
}

function CopyButton({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button type="button" onClick={() => navigator.clipboard?.writeText(text).then(() => setDone(true), () => setDone(false))}>
      {done ? 'Copied' : 'Copy link'}
    </button>
  )
}

function Field({ id, label, review, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id}>{label}{review && <span style={{ color: 'var(--warn)', marginLeft: 8 }}>· Check this</span>}</label>
      <div style={review ? { borderRadius: 14, boxShadow: '0 0 0 2px var(--warn)' } : undefined}>{children}</div>
    </div>
  )
}

function Review({ draft, setDraft, review, duplicates, onPublish, busy, error }) {
  const set = (k, v) => setDraft({ ...draft, [k]: v })
  const setOff = (i, patch) => set('offerings', draft.offerings.map((o, j) => (j === i ? { ...o, ...patch } : o)))
  const r = (f) => review.includes(f)
  return (
    <form onSubmit={(e) => { e.preventDefault(); onPublish() }} aria-label="Review event details">
      {duplicates.length > 0 && (
        <div className="card" role="status" style={{ borderColor: 'var(--warn)', marginBottom: 16 }}>
          <strong>Possible duplicate.</strong> This looks like {duplicates.map((d) => `"${d.title}" (${fmt(d.start_at)})`).join(', ')}. Publish only if it's a different event.
        </div>
      )}
      <Field id="title" label="Title" review={r('title')}><input id="title" required maxLength={120} value={draft.title ?? ''} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field id="host" label="Host club" review={r('host')}><input id="host" value={draft.host ?? ''} onChange={(e) => set('host', e.target.value)} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <Field id="start" label="Starts" review={r('start')}><input id="start" type="datetime-local" value={toLocalInput(draft.start)} onChange={(e) => set('start', fromLocalInput(e.target.value))} /></Field>
        <Field id="end" label="Ends" review={r('end')}><input id="end" type="datetime-local" value={toLocalInput(draft.end)} onChange={(e) => set('end', fromLocalInput(e.target.value))} /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <Field id="building" label="Building" review={r('building_code')}>
          <select id="building" value={draft.building_code} onChange={(e) => set('building_code', e.target.value)}>
            <option value="unknown">Pick a building…</option>
            {BUILDINGS.map((b) => <option key={b.code} value={b.code}>{b.code} · {b.names?.[0] ?? b.name}</option>)}
          </select>
        </Field>
        <Field id="room" label="Room" review={r('room')}><input id="room" value={draft.room ?? ''} onChange={(e) => set('room', e.target.value)} /></Field>
      </div>

      <fieldset className="card" style={{ marginBottom: 14 }}>
        <legend style={{ padding: '0 6px' }}>What the event offers</legend>
        {draft.offerings.length === 0 && <p className="muted">Nothing listed. Add food, swag, music and more.</p>}
        {draft.offerings.map((o, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <div><label htmlFor={`ot${i}`}>Type</label>
              <select id={`ot${i}`} value={o.type} onChange={(e) => setOff(i, { type: e.target.value })}>{OFFERING_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label htmlFor={`ox${i}`}>Details</label><input id={`ox${i}`} value={o.text} onChange={(e) => setOff(i, { text: e.target.value })} /></div>
            <div><label htmlFor={`os${i}`}>Status</label>
              <select id={`os${i}`} value={o.status} onChange={(e) => setOff(i, { status: e.target.value })}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
            <button type="button" aria-label={`Remove ${o.text || o.type}`} onClick={() => set('offerings', draft.offerings.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => set('offerings', [...draft.offerings, { type: 'food', text: '', status: 'advertised' }])}>Add offering</button>
      </fieldset>

      <fieldset className="card" style={{ marginBottom: 14 }}>
        <legend style={{ padding: '0 6px' }}>Access <span className="muted">(leave "unknown" if you're not sure)</span></legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {ACCESS.map((a) => (
            <div key={a.key}><label htmlFor={a.key}>{a.label}</label>
              <select id={a.key} value={draft.access?.[a.key] ?? 'unknown'} onChange={(e) => set('access', { ...draft.access, [a.key]: e.target.value })}>
                {a.options.map((v) => <option key={v}>{v}</option>)}</select></div>
          ))}
        </div>
      </fieldset>
      {error && <p role="alert" style={{ color: 'var(--coral)' }}>{error}</p>}
      <button className="primary" type="submit" disabled={busy}>{busy ? 'Publishing…' : 'Publish to the map'}</button>
    </form>
  )
}

function Published({ id, secret, ev, onSave }) {
  const link = hostLink(id, secret)
  return (
    <section aria-labelledby="pub-h">
      <h1 id="pub-h">Your event is a planet on {ev.building_code}</h1>
      <p className="muted">Students can see it now. Show the event QR in the room. <a href={`#/event/${id}`} style={{ color: 'var(--gold)' }}>See map</a></p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, margin: '20px 0' }}>
        <QR text={checkinUrl(id)} label="Join this event" frame="var(--crimson)" />
        <div style={{ flex: '1 1 240px' }}>
          <h2 style={{ fontSize: 20 }}>Host link</h2>
          <p className="muted">Anyone with this link can manage the event. Open it on your second laptop by scanning this code. Keep it private.</p>
          <QR text={link} label="Host link (private)" frame="var(--gold)" />
          <p style={{ wordBreak: 'break-all', fontSize: 13 }} className="muted">{link}</p>
          <CopyButton text={link} />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <a className="btn primary" href={`#/screen/${id}`}>Open projector screen</a>
        <a className="btn" href={`#/host/${id}`}>Manage event</a>
        <a className="btn" href={`#/event/${id}`}>View on map</a>
      </div>
      <LiveStatus ev={ev} onSave={onSave} />
    </section>
  )
}

function NewEvent() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('paste')
  const [steps, setSteps] = useState([])
  const [shown, setShown] = useState(0)
  const [result, setResult] = useState(null)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pub, setPub] = useState(null)

  // Reveal the real processing steps one at a time.
  useEffect(() => {
    if (phase !== 'steps' || shown >= steps.length) { if (phase === 'steps') setPhase('review'); return }
    const t = setTimeout(() => setShown((n) => n + 1), 350)
    return () => clearTimeout(t)
  }, [phase, shown, steps.length])

  async function read() {
    setError(''); setPhase('reading')
    try {
      const r = await parseAnnouncement(text)
      setResult(r); setDraft(r.event); setSteps(r.steps); setShown(0); setPhase('steps')
    } catch (e) { setError(e.message); setPhase('paste') }
  }

  async function publish() {
    if (!draft.title?.trim()) return setError('Add a title.')
    if (draft.building_code === 'unknown') return setError('Pick a building so the event lands on the map.')
    setBusy(true); setError('')
    try {
      const { event_id, host_secret } = await publishEvent({
        title: draft.title.trim(), host: draft.host, start_at: draft.start, end_at: draft.end,
        building_code: draft.building_code, room: draft.room, offerings: draft.offerings, access: draft.access, source_text: draft.source_text,
      })
      setHostSecret(event_id, host_secret)
      setPub({ id: event_id, secret: host_secret, ev: { building_code: draft.building_code, end_at: draft.end, offerings: draft.offerings } })
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function savePub(offerings) {
    setError('')
    try { await setOfferings(pub.id, pub.secret, offerings); setPub({ ...pub, ev: { ...pub.ev, offerings } }) } catch (e) { setError(e.message) }
  }
  if (pub) return <>{error && <p role="alert" style={{ color: 'var(--coral)' }}>{error}</p>}<Published id={pub.id} secret={pub.secret} ev={pub.ev} onSave={savePub} /></>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <section style={{ flex: '1 1 320px', minWidth: 0 }} aria-labelledby="new-h">
        <h1 id="new-h" className="sr-only">Add an event</h1>
        <h2 style={sectionH}>1 · PASTE ONCE</h2>
        <label htmlFor="ann">Paste your Instagram caption, Discord post or flyer text</label>
        <textarea id="ann" rows={8} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Paste your Instagram caption, Discord post or flyer text" disabled={phase === 'reading'} />
        <p className="muted" style={{ fontSize: 13 }}>{text.length}/4000</p>
        {phase === 'paste' && error && <p role="alert" style={{ color: 'var(--coral)' }}>{error}</p>}
        <button className="primary" type="button" onClick={read} disabled={!text.trim() || phase === 'reading'}>
          {phase === 'reading' ? 'Reading…' : 'Read it'}
        </button>
        <p className="muted" style={{ fontSize: 13 }}>Pasted text is treated as data only. Nothing goes live until you publish.</p>
        {phase !== 'paste' && (
          <>
          <h2 style={{ ...sectionH, marginTop: 20 }}>AGENT STEPS</h2>
          <ol aria-live="polite" style={{ listStyle: 'none', padding: 0 }}>
            {phase === 'reading' && <li className="muted">Reading announcement…</li>}
            {steps.slice(0, shown).map((s, i) => {
              const w = isWarn(s)
              return (
                <li key={i} className="card" style={{ marginBottom: 8, padding: 12, borderColor: w ? 'var(--warn)' : undefined }}>
                  <span aria-hidden="true" style={{ color: w ? 'var(--warn)' : 'var(--ok)', fontWeight: 700, marginRight: 8 }}>{w ? '!' : '✓'}</span>
                  <strong>{s.label}</strong>{s.detail && <span className="muted"> · {s.detail}</span>}{w && <span className="sr-only"> (needs a look)</span>}
                </li>
              )
            })}
          </ol>
          </>
        )}
      </section>
      <section style={{ flex: '2 1 480px', minWidth: 0 }} aria-label="Review">
        <h2 style={sectionH}>2 · REVIEW, FIX ONLY WHAT'S AMBER</h2>
        {phase === 'review' && draft
          ? <Review draft={draft} setDraft={setDraft} review={result.event.needs_review ?? []} duplicates={result.duplicates ?? []} onPublish={publish} busy={busy} error={error} />
          : <><button className="primary" type="button" disabled>Publish to the map</button>
              <p className="muted" style={{ fontSize: 14 }}>Publish unlocks after the agent reads your post.</p></>}
      </section>
    </div>
  )
}

function Dashboard({ id, query }) {
  const [secret, setSecret] = useState(() => getHostSecret(id))
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    const k = query?.get('k')
    if (k) { setHostSecret(id, k); setSecret(k); history.replaceState(null, '', `#/host/${id}`) } // keep the secret out of the address bar
  }, [id])

  useEffect(() => { getEvent(id).then(setEv, (e) => setError(e.message)) }, [id])

  async function save(offerings) {
    setError('')
    try { await setOfferings(id, secret, offerings); setEv((e) => ({ ...e, offerings })) } catch (e) { setError(e.message) }
  }

  // Auto-finish limited offerings once the event has ended (checked while this page is open).
  useEffect(() => {
    if (!ev || !secret) return
    const check = () => { const next = autoFinish(ev.offerings ?? [], ev.end_at); if (next) save(next) }
    check(); const t = setInterval(check, 60000)
    return () => clearInterval(t)
  }, [ev?.end_at, ev?.offerings, secret])

  if (error && !ev) return <p role="alert">{error}</p>
  if (!ev) return <p className="muted" role="status">Loading event…</p>
  if (!secret) return (
    <section><h1>{ev.title}</h1><p>Only the organizer can manage this event. Ask the organizer for the host link.</p></section>
  )
  async function claim() {
    setError('')
    try { await claimEvent(id, secret); setEv((e) => ({ ...e, source: 'host' })) } catch (e) { setError(e.message) }
  }
  return (
    <section aria-labelledby="dash-h">
      <h1 id="dash-h">{ev.title}</h1>
      <p className="muted">{fmt(ev.start_at)}{ev.end_at ? ` until ${timeOnly(ev.end_at)}` : ''} · {ev.building_code}{ev.room ? ` ${ev.room}` : ''}</p>
      {ev.source === 'campus_connect' ? (
        <div className="card" style={{ borderColor: 'var(--gold)', marginTop: 16 }}>
          <h2 style={{ fontSize: 20 }}>Claim this event</h2>
          <p className="muted">It was imported from Campus Connect, so students see "no live status". Claim it to post live food and swag status.</p>
          <button className="gold" type="button" onClick={claim}>Claim this event</button>
        </div>
      ) : <LiveStatus ev={ev} onSave={save} />}
      <Questions id={id} secret={secret} />
      <Feedback id={id} secret={secret} />
      {error && <p role="alert" style={{ color: 'var(--coral)' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
        <a className="btn primary" href={`#/screen/${id}`}>Open projector screen</a>
        <button type="button" onClick={() => setShowQr((v) => !v)} aria-expanded={showQr}>{showQr ? 'Hide event QR' : 'Show event QR'}</button>
        <CopyButton text={hostLink(id, secret)} />
      </div>
      {showQr && <div style={{ marginTop: 16 }}><QR text={checkinUrl(id)} label="Join this event" frame="var(--crimson)" /></div>}
    </section>
  )
}

function Questions({ id, secret }) {
  const [qs, setQs] = useState([])
  const [drafts, setDrafts] = useState({})
  const [err, setErr] = useState('')
  const load = () => listQuestions(id, secret).then((r) => setQs(r ?? []), (e) => setErr(e.message))
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t) }, [id, secret])
  const open = qs.filter((q) => !q.answer)
  async function send(q) {
    setErr('')
    try { await answerQuestion(id, secret, q.id, drafts[q.id] ?? ''); setDrafts({ ...drafts, [q.id]: '' }); load() } catch (e) { setErr(e.message) }
  }
  return (
    <section aria-labelledby="q-h" style={{ marginTop: 24 }}>
      <h2 id="q-h" style={sectionH}>ACCESS QUESTIONS · {open.length} open</h2>
      {qs.length === 0 && <p className="muted">No questions yet. Students ask anonymously from the event card when access info is unknown.</p>}
      {qs.map((q) => (
        <div key={q.id} className="card" style={{ marginBottom: 10, borderColor: q.answer ? undefined : 'var(--warn)' }}>
          <p style={{ margin: '0 0 8px' }}>“{q.question}”</p>
          {q.answer ? <p className="muted" style={{ margin: 0 }}>Answered: {q.answer}</p> : (
            <form onSubmit={(e) => { e.preventDefault(); send(q) }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label htmlFor={`a${q.id}`} className="sr-only">Answer</label>
              <input id={`a${q.id}`} required maxLength={300} style={{ flex: '1 1 200px' }} value={drafts[q.id] ?? ''}
                onChange={(e) => setDrafts({ ...drafts, [q.id]: e.target.value })} placeholder="Your answer, shown on the event card" />
              <button type="submit">Answer</button>
            </form>
          )}
        </div>
      ))}
      {err && <p role="alert" style={{ color: 'var(--coral)' }}>{err}</p>}
    </section>
  )
}

function Feedback({ id, secret }) {
  const [f, setF] = useState(null)
  useEffect(() => { feedbackSummary(id, secret).then(setF, () => setF(null)) }, [id, secret])
  if (!f) return null
  const r = f.ratings ?? {}
  return (
    <section aria-labelledby="fb-h" style={{ marginTop: 24 }}>
      <h2 id="fb-h" style={sectionH}>FEEDBACK</h2>
      {f.hidden ? <p className="muted">{f.responses} of 3 responses. Results show once 3 people answer, so nobody can be singled out.</p> : (
        <div className="card">
          <p style={{ margin: '0 0 8px' }}>{f.responses} responses · {f.checked_in} checked in</p>
          <p className="muted" style={{ margin: '0 0 8px' }}>Worth going: yes {r[3] ?? 0} · okay {r[2] ?? 0} · no {r[1] ?? 0}</p>
          {(f.comments ?? []).map((c, i) => <p key={i} style={{ margin: '4px 0' }}>“{c}”</p>)}
        </div>
      )}
    </section>
  )
}

// #/host: my hosted events, or the organizer empty state.
function HostHome({ events }) {
  if (!events.length) return (
    <section className="card" aria-labelledby="empty-h" style={{ maxWidth: 520 }}>
      <p style={sectionH}>JORDAN · ORGANIZER</p>
      <h1 id="empty-h">No events yet</h1>
      <p className="muted">Paste your first post and it's on the map in under a minute.</p>
      <a className="btn primary" href="#/host/new">Paste your first post</a>
    </section>
  )
  return (
    <section aria-labelledby="mine-h">
      <h1 id="mine-h" style={{ marginBottom: 12 }}>Your events</h1>
      {events.map((e) => (
        <a key={e.id} href={`#/host/${e.id}`} className="card" style={{ display: 'block', marginBottom: 10, color: 'var(--text)', textDecoration: 'none' }}>
          <strong>{e.title}</strong><span className="muted"> · {e.building_code} · {isLive(e) ? 'Live now' : fmt(e.start_at)}</span>
        </a>
      ))}
      <a className="btn primary" href="#/host/new">Add an event</a>
    </section>
  )
}

export default function Host({ param, query }) {
  const [mine, setMine] = useState([])
  useEffect(() => { Promise.all(hostedIds().map((id) => getEvent(id).catch(() => null))).then((r) => setMine(r.filter(Boolean))) }, [param])
  const live = mine.filter((e) => isLive(e))
  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0 }}><a href="#/" style={{ color: 'var(--muted)' }}>Back to map</a></p>
          <p style={{ margin: '4px 0 0', font: '700 22px var(--display)' }}>Organizer panel <span className="muted" style={{ font: '400 15px var(--font)' }}>· Hosting: {live.length} live event{live.length === 1 ? '' : 's'}</span></p>
        </div>
        {live[0] && <a className="btn primary" href={`#/screen/${live[0].id}`}>Open event screen</a>}
      </header>
      {param === 'new' ? <NewEvent /> : param ? <Dashboard id={param} query={query} /> : <HostHome events={mine} />}
    </main>
  )
}
