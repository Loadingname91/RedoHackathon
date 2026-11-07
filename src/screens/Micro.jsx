import React, { useEffect, useState } from 'react'
import { rpc } from '../lib/supabase.js'
import { deviceId, setHostSecret } from '../lib/identity.js'
import { BUILDINGS, publishMicro, fromLocalInput } from '../lib/events.js'

const VIS = [
  { id: 'constellation', label: 'My constellation', sub: 'People in a constellation with you' },
  { id: 'connections', label: 'Their connections too', sub: 'People you have met' },
  { id: 'campus', label: 'Whole campus', sub: 'Anyone with the app' },
]
// Public campus buildings only (no residence halls), so meetups stay in shared space.
const PUBLIC = BUILDINGS.filter((b) => b.code !== 'KV')

export default function Micro() {
  const [sky, setSky] = useState(null)
  const [err, setErr] = useState('')
  const [title, setTitle] = useState('')
  const [building, setBuilding] = useState(PUBLIC[0]?.code ?? '')
  const [start, setStart] = useState('')
  const [vis, setVis] = useState('constellation')
  const [busy, setBusy] = useState(false)
  const [posted, setPosted] = useState(null)

  useEffect(() => { rpc('my_sky', { p_device: deviceId() }).then(setSky, (e) => setErr(e.message)) }, [])

  async function post(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const s = fromLocalInput(start)
      const r = await publishMicro(deviceId(), { title: title.trim(), building_code: building, start_at: s,
        end_at: s ? new Date(Date.parse(s) + 2 * 36e5).toISOString() : null }, vis)
      setHostSecret(r.event_id, r.host_secret)
      setPosted({ id: r.event_id, b: PUBLIC.find((b) => b.code === building), who: VIS.find((v) => v.id === vis).label.toLowerCase() })
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  if (!sky && !err) return <main className="screen"><p className="muted" role="status">Loading…</p></main>
  const left = Math.max(0, 3 - (sky?.stars ?? 0))
  return (
    <main className="screen">
      <p><a href="#/sky" style={{ color: 'var(--muted)' }}>Back to My sky</a></p>
      <p className="muted" style={{ fontSize: 14 }}>Student-run · not a club post</p>
      {sky && !sky.hosting_unlocked ? (
        <section className="card" aria-labelledby="lock-h">
          <h1 id="lock-h">{left} more connection{left === 1 ? '' : 's'} to host</h1>
          <p className="muted">Three confirmed connections unlock small events of your own. Only you see your count.</p>
          <a className="btn" href="#/">Find an event</a>
        </section>
      ) : posted ? (
        <section className="card" role="status">
          <h1>Posted</h1>
          <p>A star appears on {posted.b?.names?.[0] ?? posted.b?.code} for: {posted.who}.</p>
          <a className="btn primary" href={`#/event/${posted.id}`}>See it on the map</a>
        </section>
      ) : (
        <form onSubmit={post} aria-labelledby="mi-h">
          <h1 id="mi-h">You've earned hosting</h1>
          <p className="muted">Three confirmed connections unlock small events of your own. Only you see your count.</p>
          <label htmlFor="mt">Title</label>
          <input id="mt" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book reading by the fireplace" />
          <label htmlFor="mb" style={{ marginTop: 12 }}>Building</label>
          <select id="mb" value={building} onChange={(e) => setBuilding(e.target.value)}>
            {PUBLIC.map((b) => <option key={b.code} value={b.code}>{b.names?.[0] ?? b.code}</option>)}
          </select>
          <label htmlFor="ms" style={{ marginTop: 12 }}>Time</label>
          <input id="ms" type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} />
          <p className="muted" style={{ fontSize: 13 }}>Public campus buildings only. The exact room is shown after you accept an RSVP.</p>
          <fieldset style={{ border: 0, padding: 0, margin: '12px 0' }}>
            <legend style={{ color: 'var(--muted)', marginBottom: 8 }}>Who can see it</legend>
            {VIS.map((v) => (
              <label key={v.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, color: 'var(--text)', borderColor: vis === v.id ? 'var(--gold)' : undefined, minHeight: 44 }}>
                <input type="radio" name="vis" value={v.id} checked={vis === v.id} onChange={() => setVis(v.id)} style={{ width: 20, minHeight: 20 }} />
                <span><strong>{v.label}</strong><br /><span className="muted" style={{ fontSize: 14 }}>{v.sub}</span></span>
              </label>
            ))}
          </fieldset>
          {err && <p role="alert" style={{ color: 'var(--coral)' }}>{err}</p>}
          <button className="primary" type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post my micro-event'}</button>
        </form>
      )}
      {err && !sky && <p role="alert" style={{ color: 'var(--coral)' }}>{err}</p>}
    </main>
  )
}
