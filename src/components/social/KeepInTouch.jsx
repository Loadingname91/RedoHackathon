import React, { useEffect, useState } from 'react'
import { rpc } from '../../lib/supabase.js'
import { deviceId } from '../../lib/identity.js'
import { SPARK } from './Sky.jsx'

// People you've met, kept after events end. A handle is only revealed when both people choose to share.
export default function KeepInTouch() {
  const [list, setList] = useState(null), [err, setErr] = useState(''), [editing, setEditing] = useState(null), [handle, setHandle] = useState('')
  const load = () => rpc('my_connections', { p_device: deviceId() }).then(setList).catch((e) => setErr(e.message))
  useEffect(() => { load() }, [])
  const act = async (fn, args) => { setErr(''); try { await rpc(fn, { p_device: deviceId(), ...args }); setEditing(null); setHandle(''); await load() } catch (e) { setErr(e.message) } }
  const when = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Denver' })

  return (
    <section aria-labelledby="met">
      <h2 id="met" className="cu-h" style={{ fontSize: 18, marginBottom: 6 }}>People you've met</h2>
      <p className="cu-small" style={{ marginBottom: 10 }}>Kept after the event ends. Nicknames only, unless you both choose to keep in touch.</p>
      {err && <p role="alert" className="cu-err">{err}</p>}
      {list === null ? <p className="cu-sub" role="status">Loading…</p> : list.length === 0 ? <p className="cu-sub">No connections yet. Connect with someone at an event.</p> : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {list.map((c) => (
            <li key={c.id} className="cu-card" style={{ display: 'grid', gap: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}><path d={SPARK} fill="#F5C76B" /></svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ font: '600 15px Inter, sans-serif' }}>{c.nickname}</b>
                  <p className="cu-small" style={{ overflowWrap: 'anywhere' }}>Met at {c.event ?? 'an event'} · {when(c.met_at)}</p>
                </div>
              </div>
              {c.their_handle
                ? <p style={{ margin: 0, overflowWrap: 'anywhere' }}>You're keeping in touch. Theirs: <b>{c.their_handle}</b> · yours: {c.my_handle}</p>
                : c.my_handle
                  ? <p className="cu-small" style={{ margin: 0, overflowWrap: 'anywhere' }}>You offered {c.my_handle}. You'll see theirs only if they share too.</p>
                  : null}
              {editing === c.id ? (
                <form onSubmit={(e) => { e.preventDefault(); act('keep_in_touch', { p_bond: c.id, p_handle: handle }) }} style={{ display: 'grid', gap: 8 }}>
                  <label htmlFor={`h-${c.id}`} className="cu-label">What should {c.nickname} see if they share too?</label>
                  <input id={`h-${c.id}`} value={handle} maxLength={80} onChange={(e) => setHandle(e.target.value)} placeholder="@instagram, Discord name or email" autoComplete="off" />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="cu-pill" type="submit" disabled={!handle.trim()}>Share if they do</button>
                    <button className="cu-pill" type="button" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {c.my_handle
                    ? <button className="cu-pill" onClick={() => act('keep_in_touch', { p_bond: c.id, p_handle: null })}>Stop sharing</button>
                    : <button className="cu-pill" onClick={() => { setEditing(c.id); setHandle('') }}>Keep in touch</button>}
                  <button className="cu-pill" onClick={() => act('forget_connection', { p_bond: c.id })} aria-label={`Remove connection with ${c.nickname}`}>Remove</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="cu-small" style={{ marginTop: 8 }}>Removing deletes the connection for both of you. They aren't told, and neither is anyone else.</p>
    </section>
  )
}
