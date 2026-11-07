import React, { useEffect, useState } from 'react'
import { supabase, rpc } from '../lib/supabase.js'
import { deviceId } from '../lib/identity.js'
import { Back } from './CheckIn.jsx'
import '../components/social/social.css'

const FACES = [
  { label: 'Not really', mouth: 'M8.5 16c1-1.3 2.2-1.8 3.5-1.8s2.5.5 3.5 1.8' },
  { label: 'It was OK', mouth: 'M8.5 15.2h7' },
  { label: 'Worth it', mouth: 'M8 14c1 2 2.3 3 4 3s3-1 4-3' },
]

// Design 15 · Worth going? One answer per phone, only from phones that checked in.
export default function Feedback({ param: eventId }) {
  const [event, setEvent] = useState(null)
  const [pick, setPick] = useState(null)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => { supabase.from('events').select('id,title,building_code').eq('id', eventId).maybeSingle().then(({ data }) => setEvent(data)) }, [eventId])

  async function send(e) {
    e.preventDefault(); setError(null)
    try { await rpc('give_feedback', { p_event: eventId, p_device: deviceId(), p_rating: pick + 1, p_comment: comment.trim() || null }); setSent(true) }
    catch (err) { setError(err.message === 'only people who checked in can answer' ? 'Only people who checked in to this event can answer.' : err.message) }
  }

  return (
    <main className="cu">
      <form className="cu-col" onSubmit={send} style={{ gap: 20 }}>
        <div className="cu-top">
          <a className="cu-ib" href="#/" aria-label="Back to map"><Back /></a>
          <p className="cu-kicker grow">{event ? `${event.title} · ${event.building_code}` : 'Feedback'}</p>
        </div>
        {sent ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
            <h1 className="cu-h" role="status">Thanks. That helps the next event.</h1>
            <a className="cu-goldbtn" href="#/">Back to the map</a>
          </div>
        ) : (
          <>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="cu-h" style={{ fontSize: 28, marginBottom: 16 }}>Worth going?</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                {FACES.map((f, i) => {
                  const on = pick === i
                  return (
                    <button type="button" key={f.label} aria-pressed={on} onClick={() => setPick(i)}
                      style={{ height: 112, borderRadius: 18, border: `1.5px solid ${on ? '#F5C76B' : '#36407A'}`, background: on ? '#2A2A3E' : '#121936', color: on ? '#FFE2A3' : '#C9D0EC', display: 'flex', flexDirection: 'column', gap: 8, font: '600 14px Inter, sans-serif' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={on ? '#FFE2A3' : '#C9D0EC'} strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" /><path d="M9 10h.01M15 10h.01" strokeWidth="2.4" /><path d={f.mouth} />
                      </svg>
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <div>
              <label htmlFor="fb">Anything to add? <span style={{ fontWeight: 400, color: '#AEB7DA' }}>(optional)</span></label>
              <textarea id="fb" rows={4} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', resize: 'none' }} />
            </div>
            <p className="cu-note">Anonymous. The organizer only sees results after 3+ responses. Only people who checked in can answer.</p>
            {error && <p role="alert" className="cu-err">{error}</p>}
            <div style={{ flex: 1 }} />
            <div className="cu-row2">
              <button className="cu-primary" disabled={pick === null}>Send feedback</button>
              <a className="cu-secondary" href="#/">Skip</a>
            </div>
          </>
        )}
      </form>
    </main>
  )
}
