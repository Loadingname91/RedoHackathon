import React, { useEffect, useState } from 'react'
import { rpc } from '../lib/supabase.js'
import { deviceId, prefs, setPrefs } from '../lib/identity.js'

const HOST_AT = 3

export default function MySky() {
  const [sky, setSky] = useState(null)
  const [error, setError] = useState(null)
  const [p, setP] = useState(prefs())
  useEffect(() => { rpc('my_sky', { p_device: deviceId() }).then(setSky).catch((e) => setError(e.message)) }, [])

  const toggle = (key) => { setPrefs({ [key]: !p[key] }); setP(prefs()) }
  function wipe() {
    if (!confirm('Delete everything this app saved on this phone? Your stars will no longer be linked to this phone.')) return
    try { localStorage.clear() } catch {}
    location.hash = '#/'
  }

  return (
    <main className="screen" style={{ display: 'grid', gap: 16 }}>
      <a href="#/">Back to map</a>
      <h1>My sky</h1>
      <p className="muted" style={{ margin: 0 }}>Only you can see this page.</p>
      {error && <p role="alert" style={{ color: 'var(--coral)' }}>{error}</p>}
      {!sky && !error && <p className="muted" role="status">Loading…</p>}
      {sky && (
        <>
          <section className="card">
            <p style={{ fontSize: 40, fontFamily: 'var(--display)', color: 'var(--gold)', margin: 0 }}>{sky.stars}</p>
            <p style={{ margin: 0 }}>people you've connected with</p>
            <p className="muted" style={{ margin: '8px 0 0' }}>
              {sky.hosting_unlocked ? 'You can host your own micro-events.' : `${HOST_AT - sky.stars} more to unlock hosting your own micro-events.`}
            </p>
          </section>
          <section>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>My constellations</h2>
            {sky.constellations.length === 0
              ? <p className="muted">None yet. Connect with 2 people at the same event to form one.</p>
              : <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                  {sky.constellations.map((c, i) => (
                    <li key={i} className="card"><strong style={{ color: 'var(--gold)' }}>{c.name}</strong>
                      <span className="muted"> · {c.size} stars · {c.event}</span></li>
                  ))}
                </ul>}
          </section>
        </>
      )}
      <section style={{ display: 'grid', gap: 8 }}>
        <h2 style={{ fontSize: 18 }}>Settings</h2>
        <button aria-pressed={p.calm} onClick={() => toggle('calm')}>Calm mode: {p.calm ? 'On' : 'Off'}</button>
        <button aria-pressed={p.sound} onClick={() => toggle('sound')}>Sounds: {p.sound ? 'On' : 'Off'}</button>
        <button onClick={wipe}>Delete my data on this phone</button>
      </section>
    </main>
  )
}
