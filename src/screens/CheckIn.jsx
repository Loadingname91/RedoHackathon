import React, { useEffect, useState } from 'react'
import { supabase, rpc, EVENT_COLS } from '../lib/supabase.js'
import { deviceId, getSession, setSession, prefs, setPrefs } from '../lib/identity.js'
import { INTERESTS } from '../lib/foryou.js'
import { SPARK } from '../components/social/Sky.jsx'
import '../components/social/social.css'

const NAMES = ['Comet', 'Nova', 'Orbit', 'Vega', 'Pulsar', 'Lumen', 'Quill', 'Juniper']
const until = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Denver' }) : null

// Design 03 · Check in.
export default function CheckIn({ param: eventId }) {
  const existing = getSession(eventId)
  const [event, setEvent] = useState(null)
  const [nickname, setNickname] = useState(existing?.nickname ?? prefs().nickname ?? NAMES[Math.floor(Math.random() * NAMES.length)])
  const [interests, setInterests] = useState(prefs().interests ?? []) // from your profile when signed in
  const [clue, setClue] = useState('')
  const [prefersText, setPrefersText] = useState(!!prefs().prefersText)
  const [comeToMe, setComeToMe] = useState(!!prefs().comeToMe)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { supabase.from('events').select(EVENT_COLS).eq('id', eventId).maybeSingle().then(({ data }) => setEvent(data)) }, [eventId])

  const toggle = (i) => setInterests((cur) => cur.includes(i) ? cur.filter((x) => x !== i) : cur.length < 3 ? [...cur, i] : cur)
  const shuffle = () => setNickname((n) => NAMES[(NAMES.indexOf(n) + 1) % NAMES.length])

  async function submit(e) {
    e.preventDefault()
    if (!nickname.trim()) return setError('Pick a nickname first.')
    setBusy(true); setError(null)
    try {
      const r = await rpc('check_in', {
        p_event: eventId, p_device: deviceId(), p_nickname: nickname.trim().slice(0, 24), p_interests: interests,
        p_clue: clue.trim() || null, p_prefers_text: prefersText, p_come_to_me: comeToMe,
      })
      setSession(eventId, { ...r, nickname: r.nickname ?? nickname.trim() })
      setPrefs({ interests }) // feeds the map's "For you" ranking; stays on this phone
      location.hash = `#/at/${eventId}`
    } catch (err) { setError(err.message); setBusy(false) }
  }

  const place = [event?.building_code, event?.room && `Room ${event.room}`, event?.end_at && `until ${until(event.end_at)}`].filter(Boolean).join(' · ')
  return (
    <main className="cu">
      <form className="cu-col" onSubmit={submit} style={{ gap: 18 }}>
        <div className="cu-top" style={{ alignItems: 'flex-start' }}>
          <a className="cu-ib" href={`#/event/${eventId}`} aria-label="Back to the event"><Back /></a>
          <div className="grow">
            <p className="cu-kicker">Checking in to</p>
            <h1 className="cu-h" style={{ fontSize: 22 }}>{event?.title ?? 'This event'}</h1>
            {place && <p className="cu-small" style={{ fontSize: 13 }}>{place}</p>}
          </div>
        </div>
        <p className="cu-note"><Lock /> No GPS. Only people at this event see your star. Gone when the event ends.</p>
        <div>
          <label htmlFor="nick">Nickname</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="nick" value={nickname} maxLength={24} onChange={(e) => setNickname(e.target.value)} autoComplete="off" style={{ flex: 1 }} />
            <button type="button" className="cu-ib" style={{ width: 50, height: 50, borderRadius: 14 }} onClick={shuffle} aria-label="Suggest another nickname">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E9ECF8" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
            </button>
          </div>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
            <span className="cu-label" style={{ margin: 0 }}>Pick 2–3 interests</span>
            <span className="cu-small" style={{ fontSize: 13 }} aria-live="polite">{interests.length} / 3</span>
          </legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INTERESTS.map((i) => <button type="button" key={i} className="cu-chip" aria-pressed={interests.includes(i)} onClick={() => toggle(i)}>{i}</button>)}
          </div>
        </fieldset>
        <div>
          <label htmlFor="clue">One clue so your match can find you <span style={{ fontWeight: 400, color: '#AEB7DA' }}>(optional)</span></label>
          <input id="clue" value={clue} maxLength={80} onChange={(e) => setClue(e.target.value)} placeholder="green hoodie, near the pizza" />
          <p className="cu-small" style={{ marginTop: 8 }}>Only your match sees it. Deleted when the event ends.</p>
        </div>
        <div>
          <Toggle on={prefersText} set={setPrefersText} title="I prefer text" sub="Answer prompts by typing. No talking needed." />
          <Toggle on={comeToMe} set={setComeToMe} title="Come to me" sub="You stay put. Your match walks over." />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <div aria-hidden="true" style={{ width: 70, height: 70, borderRadius: '50%', border: '1.5px dashed #F5C76B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="cu-tw" width="36" height="36" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 10px #F5C76B)' }}><path d={SPARK} fill="#FFE2A3" /></svg>
          </div>
          <p className="cu-small" style={{ fontSize: 13 }}>Your star joins the sky over {event?.building_code ?? 'this event'}</p>
        </div>
        {error && <p role="alert" className="cu-err">{error}</p>}
        <div className="cu-row2">
          <button className="cu-primary" disabled={busy}>{busy ? 'Joining…' : `Join as ${nickname.trim() || '…'}`}</button>
          <a className="cu-secondary" href={`#/event/${eventId}`}>Just browsing</a>
        </div>
      </form>
    </main>
  )
}

export const Toggle = ({ on, set, title, sub }) => (
  <div className="cu-switch">
    <div><b>{title}</b>{sub && <span>{sub}</span>}</div>
    <button type="button" aria-pressed={on} aria-label={title} onClick={() => set(!on)} />
  </div>
)
export const Back = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E9ECF8" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
export const Close = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E9ECF8" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
const Lock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7FE0C4" strokeWidth="2" aria-hidden="true" style={{ flex: 'none', marginTop: 1 }}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
