import React, { useEffect, useState } from 'react'
import '../components/map/map.css'
import Icon, { OFFERING_LABEL } from '../components/map/icons.jsx'
import { useEvents, buildingByCode, openCount } from '../components/map/useEvents.js'
import { statusOf, offerLine, placeOf } from './MapScreen.jsx'
import { isNow, whenText } from '../lib/geo.js'
import { supabase, rpc } from '../lib/supabase.js'

// Access rows in the design's order. Unknown values get an "Ask the host" button.
const ACCESS = [
  ['step_free', 'Step-free entrance', 'Is there a step-free way in?'],
  ['elevator', 'Elevator', 'Is there an elevator to the room?'],
  ['quiet_space', 'Quiet space nearby', 'Is there a quiet space nearby?'],
  ['sensory', 'Noise and lights', 'How loud or bright will it be?'],
  ['captions_asl', 'Captions or ASL', 'Will there be captions or ASL?'],
]
const val = (v) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : !v || v === 'unknown' ? 'unknown' : String(v)

export default function EventScreenCard({ param }) {
  const { events, counts, error } = useEvents()
  const [showSource, setShowSource] = useState(false)
  const [asking, setAsking] = useState(null) // question text being edited
  const [asked, setAsked] = useState('')
  const [answers, setAnswers] = useState([])
  const e = events?.find((x) => x.id === param)

  useEffect(() => {
    if (!param) return
    supabase.from('host_questions').select('id,question,answer').eq('event_id', param).then(({ data }) => setAnswers(data ?? []))
  }, [param, asked])

  if (error) return <main className="screen"><p role="alert">Couldn't load this event: {error}</p><a className="btn" href="#/">Back to map</a></main>
  if (!events) return <main className="screen"><p role="status" className="muted">Loading…</p></main>
  if (!e) return <main className="screen"><p>This event is gone. It may have been cancelled.</p><a className="btn" href="#/">Back to map</a></main>

  const b = buildingByCode[e.building_code]
  const open = openCount(counts, e.id)
  const access = e.access ?? {}
  const live = isNow(e)

  const ask = async (ev) => {
    ev.preventDefault()
    try { await rpc('ask_host', { p_event: e.id, p_question: asking }); setAsked(asking); setAsking(null) }
    catch (err) { setAsked(`error:${err.message}`) }
  }

  if (showSource) return (
    <main className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
      <p className="cu-small" style={{ margin: 0, letterSpacing: 1 }}>ORIGINAL ANNOUNCEMENT · {e.source === 'campus_connect' ? 'from Campus Connect' : 'pasted by the host'}</p>
      <p className="card" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{e.source_text}</p>
      <p className="cu-small" style={{ margin: 0 }}>The building and offerings above were pulled from this post{e.source === 'campus_connect' ? '' : ' and checked by the organizer before publishing'}.</p>
      <button onClick={() => setShowSource(false)}>Back to event details</button>
    </main>
  )

  return (
    <main className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start', paddingBottom: 32 }}>
      <div className="cu-row" style={{ justifyContent: 'space-between' }}>
        <a className="btn cu-round" href="#/" aria-label="Back to map"><Icon name="back" /></a>
        <span className="cu-small">{b ? `${b.names[0]} (${b.code})` : 'Location on the announcement'}</span>
        <span style={{ width: 44 }} />
      </div>

      <header style={{ display: 'grid', gap: 6 }}>
        <span className="cu-row"><span className={`cu-tag ${live ? 'live' : 'later'}`}>{live ? 'LIVE' : 'LATER'}</span><span className="cu-small">{whenText(e)}</span></span>
        <h1 style={{ fontSize: 26, lineHeight: 1.15 }}>{e.title}</h1>
        <p className="cu-small" style={{ margin: 0 }}>{e.student_run ? 'Student-run · not a club post' : e.host || 'Host not listed'}</p>
        <p style={{ margin: 0 }}>{placeOf(e)}</p>
      </header>

      {e.source === 'campus_connect' && <p className="cu-note" style={{ margin: 0 }}>From Campus Connect. Food and status aren't tracked live until the host claims it.</p>}

      {(e.offerings ?? []).length > 0 && (
        <section className="card" aria-label="What's on offer" style={{ display: 'grid', gap: 10 }}>
          {e.offerings.map((o, i) => (
            <div key={i} className="cu-row" style={{ justifyContent: 'space-between' }}>
              <span className="cu-row" style={{ fontWeight: 600 }}><Icon name={o.type} />{o.text || OFFERING_LABEL[o.type] || 'Other'}</span>
              <span className="cu-row cu-small"><span className="cu-dot" style={{ background: statusOf(o)[1] }} />{offerLine(o)}</span>
            </div>
          ))}
        </section>
      )}

      {open > 0 && <p className="cu-row cu-small" style={{ margin: 0 }}><Icon name="star" size={16} />{open} people open to meet · joining is optional</p>}

      <section className="card" aria-labelledby="acc-h" style={{ display: 'grid', gap: 8 }}>
        <h2 id="acc-h" className="cu-row" style={{ fontSize: 16 }}><Icon name="access" />Access</h2>
        {ACCESS.map(([k, label, q]) => (
          <div key={k} className="cu-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span className="cu-small">{label}: <strong style={{ color: val(access[k]) === 'unknown' ? 'var(--coral)' : 'var(--text)' }}>{val(access[k])}</strong></span>
            {val(access[k]) === 'unknown' && <button className="cu-chip" onClick={() => setAsking(q)}>Ask the host</button>}
          </div>
        ))}
        {b && <p className="cu-small" style={{ margin: 0 }}>Entrance location {b.entrance.step_free === 'yes' ? 'checked' : 'not verified yet'}.</p>}
        {asking !== null && (
          <form onSubmit={ask} style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="q" style={{ margin: 0 }}>Your question (anonymous; the organizer sees it in their panel)</label>
            <input id="q" value={asking} maxLength={200} onChange={(ev) => setAsking(ev.target.value)} />
            <div className="cu-row"><button className="primary" disabled={!asking.trim()}>Send question</button><button type="button" onClick={() => setAsking(null)}>Cancel</button></div>
          </form>
        )}
        {asked && <p role="status" className="cu-small" style={{ margin: 0 }}>{asked.startsWith('error:') ? `Couldn't send: ${asked.slice(6)}` : 'Sent. The answer shows up here once the host replies.'}</p>}
        {answers.filter((a) => a.answer).map((a) => <p key={a.id} className="cu-small" style={{ margin: 0 }}><strong>{a.question}</strong> {a.answer}</p>)}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <a className="btn primary" href={`#/checkin/${e.id}`}>Check in</a>
        {b ? <a className="btn" href={`#/nav/${e.id}`}>Directions</a> : <span className="cu-small">No mapped building yet</span>}
      </div>
      {e.source_text && <button onClick={() => setShowSource(true)}>View original announcement</button>}
    </main>
  )
}
