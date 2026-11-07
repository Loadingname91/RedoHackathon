import React, { useEffect, useState } from 'react'
import { supabase, rpc, PARTICIPANT_COLS } from '../lib/supabase.js'
import { deviceId, prefs, setPrefs, clearSession } from '../lib/identity.js'
import { SPARK } from '../components/social/Sky.jsx'
import { Back, Toggle } from './CheckIn.jsx'
import '../components/social/social.css'

const HOST_AT = 3
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
// Applies the seeing prefs to the page right away. shortcut: App only re-applies calm on load; size/contrast need App to call this too.
export function applySeeing(p = prefs()) {
  const r = document.documentElement
  r.style.fontSize = ['', '112.5%', '125%'][p.size ?? 0]
  r.dataset.contrast = p.contrast ? '1' : '0'
}
const BADGES = ['Quiet chats', 'Prefers typing first', 'Come to me', 'Small groups', 'Here with a friend', 'ASL user', 'Need a minute to warm up']

// Design 19 (My sky) + 21 (Access and comfort). Only you can see this page.
export default function MySky() {
  const [sky, setSky] = useState(null)
  const [error, setError] = useState(null)
  const [live, setLive] = useState([]) // [{ eventId, title, building, session, conns:[{id, other}] }]
  const [hiddenGroups, setHiddenGroups] = useState(() => read('cu.leftGroups', []))
  const [lastLeft, setLastLeft] = useState(null)
  const [confirmLeave, setConfirmLeave] = useState(null)
  const [p, setP] = useState(prefs())
  const put = (patch) => { setPrefs(patch); const n = prefs(); setP(n); applySeeing(n) }

  useEffect(() => { rpc('my_sky', { p_device: deviceId() }).then(setSky).catch((e) => setError(e.message)) }, [])
  useEffect(() => { loadLive().then(setLive) }, [])

  async function removeConn(ev, c) {
    if (!confirm(`Remove your line with ${c.other.nickname}? It's deleted for both of you. They aren't told.`)) return
    try { await rpc('remove_connection', { p_id: ev.session.participant_id, p_secret: ev.session.secret, p_conn: c.id }); setLive(await loadLive()) }
    catch (e) { setError(e.message) }
  }
  async function leaveEvent(ev) {
    try { await rpc('leave_event', { p_id: ev.session.participant_id, p_secret: ev.session.secret }) } catch {}
    clearSession(ev.eventId); setLive(await loadLive())
  }
  const leaveGroup = (name) => { const n = [...hiddenGroups, name]; setHiddenGroups(n); write('cu.leftGroups', n); setLastLeft(name); setConfirmLeave(null) }
  const undo = () => { const n = hiddenGroups.filter((g) => g !== lastLeft); setHiddenGroups(n); write('cu.leftGroups', n); setLastLeft(null) }
  function wipe() {
    if (!confirm('Delete everything this app saved on this phone? Your stars will no longer be linked to this phone.')) return
    try { localStorage.clear() } catch {}
    location.hash = '#/'
  }

  const groups = (sky?.constellations ?? []).filter((g) => !hiddenGroups.includes(g.name))
  const people = live.flatMap((ev) => ev.conns.map((c) => ({ ...c, ev })))
  const current = live[0]
  const badges = p.badges ?? {}
  const cue = (k, d) => (p.cues ?? {})[k] ?? d
  const setCue = (k, v) => put({ cues: { ...(p.cues ?? {}), [k]: v } })

  return (
    <main className="cu">
      <div className="cu-col" style={{ gap: 18 }}>
        <div className="cu-top">
          <a className="cu-ib" href="#/" aria-label="Back to map"><Back /></a>
          <div className="grow"><h1 className="cu-h">My sky</h1><p className="cu-small">Only you can see this page</p></div>
        </div>
        {error && <p role="alert" className="cu-err">{error}</p>}

        <section className="cu-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="grow" style={{ flex: 1 }}>
            <b style={{ font: '600 15px Inter, sans-serif' }}>{current ? `Checked in at ${current.title}` : 'Not checked in anywhere'}</b>
            <p className="cu-small" style={{ fontSize: 13 }}>{current ? `${current.building} · your star is visible there` : 'Scan an event QR to join its sky'}</p>
          </div>
          {current && <>
            <a className="cu-pill" href={`#/at/${current.eventId}`}>Open</a>
            <button className="cu-pill danger" onClick={() => leaveEvent(current)}>Leave event</button>
          </>}
        </section>

        {!sky && !error && <p className="cu-sub" role="status">Loading…</p>}
        {sky && (
          <section className="cu-card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true" style={{ filter: 'drop-shadow(0 0 8px #F5C76B)', flex: 'none' }}><path d={SPARK} fill="#FFE2A3" /></svg>
            <div>
              <b style={{ font: "700 20px 'Space Grotesk', sans-serif" }}>{sky.hosting_unlocked ? "You've earned hosting" : `${Math.max(0, HOST_AT - sky.stars)} more to host`}</b>
              <p className="cu-small" style={{ fontSize: 13 }}>{sky.stars} confirmed connection{sky.stars === 1 ? '' : 's'}. Only you see your count.
                {sky.hosting_unlocked ? ' Post a small meetup of your own.' : ' Three confirmed connections unlock small events of your own.'}</p>
            </div>
          </section>
        )}

        <section aria-labelledby="met">
          <h2 id="met" className="cu-h" style={{ fontSize: 18, marginBottom: 6 }}>People you've met</h2>
          <p className="cu-small" style={{ marginBottom: 10 }}>From events you're checked into now. Nicknames only.</p>
          {people.length === 0 ? <p className="cu-sub">No lines yet. Connect with someone at an event.</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              {people.map((c) => (
                <li key={c.id} className="cu-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d={SPARK} fill="#F5C76B" /></svg>
                  <div style={{ flex: 1 }}><b style={{ font: '600 15px Inter, sans-serif' }}>{c.other.nickname}</b><p className="cu-small">Met at {c.ev.title}</p></div>
                  <button className="cu-pill" onClick={() => removeConn(c.ev, c)} aria-label={`Remove connection with ${c.other.nickname}`}>Remove</button>
                </li>
              ))}
            </ul>
          )}
          <p className="cu-small" style={{ marginTop: 8 }}>Removing a connection deletes that line for both of you. They aren't told.</p>
        </section>

        <section aria-labelledby="cons">
          <h2 id="cons" className="cu-h" style={{ fontSize: 18, marginBottom: 10 }}>Constellations ({groups.length})</h2>
          {lastLeft && <p role="status" className="cu-note" style={{ justifyContent: 'space-between', alignItems: 'center' }}>You left {lastLeft}. <button className="cu-pill" onClick={undo}>Undo</button></p>}
          {groups.length === 0 ? <p className="cu-sub">None yet. Connect with 2 people at the same event to form one.</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {groups.map((g, i) => (
                <li key={i} className="cu-card" style={{ borderColor: '#6B5A2E', display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <b style={{ font: "700 17px 'Space Grotesk', sans-serif", color: '#FFE2A3' }}>{g.name}</b>
                    <span className="cu-small" style={{ fontSize: 13 }}>{g.size} stars</span>
                  </div>
                  <p className="cu-small" style={{ fontSize: 13 }}>Formed at {g.event}{g.at ? ` · ${new Date(g.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Denver' })}` : ''}</p>
                  {confirmLeave === g.name ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <p className="cu-sub" style={{ fontSize: 13 }}>You'll leave the group and its sky. Your one-to-one lines stay unless you remove them. Nobody is notified.</p>
                      <div className="cu-grid2"><button className="cu-secondary" onClick={() => setConfirmLeave(null)}>Keep</button><button className="cu-primary" onClick={() => leaveGroup(g.name)}>Leave</button></div>
                    </div>
                  ) : <button className="cu-pill danger" style={{ justifySelf: 'start' }} onClick={() => setConfirmLeave(g.name)}>Leave constellation</button>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="access" aria-labelledby="acc">
          <h2 id="acc" className="cu-h" style={{ fontSize: 20 }}>Access and comfort</h2>
          <p className="cu-small" style={{ marginBottom: 8 }}>Saved on this phone only</p>
          <p className="cu-kicker" style={{ marginTop: 12 }}>Seeing</p>
          <div className="cu-seg" role="group" aria-label="Text size" style={{ margin: '8px 0' }}>
            {['Default', 'Large', 'Largest'].map((l, i) => <button key={l} aria-pressed={(p.size ?? 0) === i} onClick={() => put({ size: i })}>{l}</button>)}
          </div>
          <Toggle on={!!p.contrast} set={(v) => put({ contrast: v })} title="High contrast" sub="Black background, white text, thicker outlines" />
          <Toggle on={!!p.listFirst} set={(v) => put({ listFirst: v })} title="Lists before maps" sub="Open events and event skies as lists. Best with a screen reader" />
          <p className="cu-kicker" style={{ marginTop: 16 }}>Motion and sound</p>
          <Toggle on={!!p.calm} set={(v) => put({ calm: v })} title="Calm mode" sub="No confetti, no gold room flash, no twinkle" />
          <Toggle on={!!p.sound} set={(v) => put({ sound: v })} title="Sound cues" sub="A soft chime when you match or link. Off by default" />
          <Toggle on={p.vibe ?? true} set={(v) => put({ vibe: v })} title="Vibration" sub="A short buzz pattern for matches, on phones that support it" />
          <p className="cu-kicker" style={{ marginTop: 16 }}>Finding your match</p>
          <p className="cu-small">Pick any that work for you. Your match gets the same cues.</p>
          <Toggle on={cue('buzz', true)} set={(v) => setCue('buzz', v)} title="Matching buzz pattern" sub="Both phones buzz the same rhythm" />
          <Toggle on={cue('spoken', false)} set={(v) => setCue('spoken', v)} title="Spoken word" sub="Your phone says your match word out loud" />
          <Toggle on={cue('host', false)} set={(v) => setCue('host', v)} title="Ask the host to introduce us" sub="The host gets a private nudge" />
          <Toggle on={!!p.comeToMe} set={(v) => put({ comeToMe: v })} title="Come to me" sub="Your match walks over. Your clue tells them where you are" />
          <Toggle on={!!p.prefersText} set={(v) => put({ prefersText: v })} title="Prefer text" sub="Answer prompts by typing. No talking needed" />
          <p className="cu-kicker" style={{ marginTop: 16 }}>Comfort badges</p>
          <p className="cu-small" style={{ marginBottom: 8 }}>Shown on your star only to people at the same event. Preferences, never diagnoses. All optional.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BADGES.map((b) => <button key={b} className="cu-chip" aria-pressed={!!badges[b]} onClick={() => put({ badges: { ...badges, [b]: !badges[b] } })}
              style={badges[b] ? { borderColor: '#7FE0C4', background: '#10263A', color: '#D7F5EC' } : undefined}>{b}</button>)}
          </div>
          <p className="cu-kicker" style={{ marginTop: 16 }}>Events</p>
          <Toggle on={!!p.accessFirst} set={(v) => put({ accessFirst: v })} title="Access details first" sub="Event cards lead with entrance, elevator, noise and captions" />
          <Toggle on={!!p.stepFree} set={(v) => put({ stepFree: v })} title="Only step-free events" sub="Hide events marked stairs only. Unknown ones stay, labeled unknown" />
          <p className="cu-small" style={{ marginTop: 10 }}>When access info is unknown, the event card offers "Ask the host", an anonymous question the organizer sees in their panel.</p>
        </section>

        <button className="cu-secondary" onClick={wipe}>Delete my data on this phone</button>
      </div>
    </main>
  )
}

// Live check-ins on this phone, with my confirmed lines and the other person's nickname.
async function loadLive() {
  const sessions = read('cu.sessions', {})
  const out = []
  for (const [eventId, session] of Object.entries(sessions)) {
    const [ev, ppl, con] = await Promise.all([
      supabase.from('events').select('id,title,building_code').eq('id', eventId).maybeSingle(),
      supabase.from('participants').select(PARTICIPANT_COLS).eq('event_id', eventId),
      supabase.from('connections').select('id,a,b,a_confirmed,b_confirmed').eq('event_id', eventId),
    ])
    const me = ppl.data?.find((x) => x.id === session.participant_id)
    if (!ev.data || !me) continue // check-in ended
    const conns = (con.data ?? []).filter((c) => c.a_confirmed && c.b_confirmed && (c.a === me.id || c.b === me.id))
      .map((c) => ({ id: c.id, other: ppl.data.find((x) => x.id === (c.a === me.id ? c.b : c.a)) ?? { nickname: 'Someone' } }))
    out.push({ eventId, title: ev.data.title, building: ev.data.building_code, session, conns })
  }
  return out
}
