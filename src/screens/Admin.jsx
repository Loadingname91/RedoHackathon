import React, { useEffect, useState } from 'react'
import { rpc } from '../lib/supabase.js'

// Admin · campus data: keeps Campus Connect events on the map and shows how each sync went.
const KEY = 'cu.admin'
const readKey = () => { try { return localStorage.getItem(KEY) ?? '' } catch { return '' } }
const saveKey = (k) => { try { k ? localStorage.setItem(KEY, k) : localStorage.removeItem(KEY) } catch {} }

const STATUS = { ok: ['Healthy', 'var(--ok)'], failed: ['Failed', 'var(--coral)'], running: ['Running', 'var(--warn)'] }
const fmt = (t) => t ? new Date(t).toLocaleString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'
const secs = (r) => r.finished_at ? `${Math.round((new Date(r.finished_at) - new Date(r.started_at)) / 1000)}s` : '—'

function Pill({ status }) {
  const [label, color] = STATUS[status] ?? [status, 'var(--muted)']
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px', borderRadius: 999, border: `1px solid ${color}`, color, fontSize: 13, fontWeight: 600 }}>
    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, background: color }} />{label}</span>
}

export default function Admin() {
  const [key, setKey] = useState(readKey)
  const [draft, setDraft] = useState('')
  const [runs, setRuns] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')

  async function load(k = key) {
    try { setRuns(await rpc('sync_runs_list', { p_admin: k })); setErr('') }
    catch (e) { setErr(e.message === 'not an admin' ? 'That admin key was not accepted.' : e.message); if (e.message === 'not an admin') { saveKey(''); setKey('') } }
  }
  useEffect(() => { if (key) load() }, [key])

  async function syncNow() {
    setBusy(true); setErr('')
    const t0 = Date.now()
    const tick = setInterval(() => setProgress(`Reading the Campus Connect feed and saving events… ${Math.round((Date.now() - t0) / 1000)}s`), 500)
    try {
      const r = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin: key }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setProgress(`Done in ${Math.round((Date.now() - t0) / 1000)}s: ${d.new} new, ${d.updated} updated, ${d.unchanged} unchanged, ${d.skipped} skipped.`)
    } catch (e) { setErr(`Sync failed: ${e.message}`); setProgress('') }
    clearInterval(tick); setBusy(false); load()
  }

  if (!key) return (
    <main className="screen">
      <p className="muted" style={{ margin: '8px 0 4px' }}>ADMIN · CAMPUS DATA</p>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Campus Connect sync</h1>
      <form className="card" style={{ display: 'grid', gap: 12 }} onSubmit={(e) => { e.preventDefault(); saveKey(draft.trim()); setKey(draft.trim()) }}>
        <div><label htmlFor="adm">Admin key</label>
          <input id="adm" value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" spellCheck="false" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></div>
        <button className="primary" type="submit" disabled={!draft.trim()}>Open admin</button>
        {err && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{err}</p>}
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>Saved on this device only. Ask the project lead for the key.</p>
      </form>
    </main>
  )

  const last = runs?.[0]
  const lastOk = runs?.find((r) => r.status === 'ok')
  const groups = Object.entries((last?.skipped ?? []).reduce((g, s) => ((g[s.reason] ??= []).push(s), g), {}))

  return (
    <main className="screen" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div><p className="muted" style={{ margin: '8px 0 4px' }}>ADMIN · CAMPUS DATA</p><h1 style={{ fontSize: 24 }}>Campus Connect sync</h1></div>
        <div style={{ display: 'flex', gap: 8 }}><a className="btn" href="#/">Map</a><button onClick={() => { saveKey(''); setKey('') }}>Sign out</button></div>
      </div>

      <section className="card" aria-label="Sync status" style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {last ? <Pill status={last.status} /> : <span className="muted">No syncs yet</span>}
          <span>Last sync {fmt(last?.started_at)}</span>
          <span className="muted">· Last successful {fmt(lastOk?.finished_at)}</span>
        </div>
        <p style={{ margin: 0 }}>Feed health: {last?.feed_status ? `HTTP ${last.feed_status}` : 'unknown'} · {last?.fetched ?? 0} in-person events in the next 7 days</p>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Campus Connect publishes a calendar feed, not live updates, so events refresh on a schedule: automatically once a day at 6:00 AM, or any time with Sync now.
          Events whose location is hidden behind Campus Connect sign-in can't be placed and are listed below.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="primary" onClick={syncNow} disabled={busy || last?.status === 'running'}>{busy ? 'Syncing…' : 'Sync now'}</button>
          <span role="status" aria-live="polite">{progress}</span>
        </div>
        {err && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{err}</p>}
        {last?.error && <p style={{ color: 'var(--coral)', margin: 0 }}>Last error: {last.error}</p>}
      </section>

      <Roles adminKey={key} />

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Run history</h2>
        <div style={{ overflowX: 'auto' }} className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <caption className="sr-only">Last 20 sync runs</caption>
            <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
              {['Started', 'Status', 'In feed', 'New', 'Updated', 'Skipped', 'Took', 'Error'].map((h) => <th key={h} scope="col" style={{ padding: '6px 8px', fontWeight: 600 }}>{h}</th>)}
            </tr></thead>
            <tbody>{(runs ?? []).map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{fmt(r.started_at)}</td>
                <td style={{ padding: '8px' }}><Pill status={r.status} /></td>
                <td style={{ padding: '8px' }}>{r.fetched}</td><td style={{ padding: '8px' }}>{r.new_count}</td>
                <td style={{ padding: '8px' }}>{r.updated_count}</td><td style={{ padding: '8px' }}>{r.skipped_count}</td>
                <td style={{ padding: '8px' }}>{secs(r)}</td><td style={{ padding: '8px', color: 'var(--coral)' }}>{r.error ?? ''}</td>
              </tr>))}
              {runs?.length === 0 && <tr><td colSpan="8" style={{ padding: 8 }} className="muted">No runs yet. Press Sync now.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 20, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Not placed in the last sync ({last?.skipped_count ?? 0})</h2>
        {groups.map(([reason, items]) => (
          <details key={reason} className="card" style={{ marginBottom: 8 }} open={reason === 'Building not on our map'}>
            <summary style={{ cursor: 'pointer', minHeight: 'var(--tap)', display: 'flex', alignItems: 'center' }}>{reason} · {items.length}</summary>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6 }}>
              {items.map((s) => <li key={s.uid}>{s.title}{s.location ? <span className="muted"> · {s.location}</span> : null}
                {reason === 'Building not on our map' && <> · <a href="#/host/new" style={{ color: 'var(--gold)' }}>Add it by hand</a></>}</li>)}
            </ul>
          </details>
        ))}
      </section>
    </main>
  )
}

// Grant organizer/admin to an account that has signed in with Google at least once.
function Roles({ adminKey }) {
  const [email, setEmail] = useState(''), [role, setRole] = useState('organizer'), [msg, setMsg] = useState('')
  const save = async (e) => {
    e.preventDefault()
    try { await rpc('set_role', { p_admin: adminKey, p_email: email, p_role: role }); setMsg(`${email} is now ${role === 'student' ? 'a student' : 'an ' + role}. They'll see it next time they open the app.`); setEmail('') }
    catch (er) { setMsg(er.message) }
  }
  return (
    <section style={{ marginTop: 20 }} className="card">
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Roles</h2>
      <form onSubmit={save} style={{ display: 'grid', gap: 10 }}>
        <div><label htmlFor="role-email">Google account email</label>
          <input id="role-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="club.officer@gmail.com" /></div>
        <div><label htmlFor="role-pick">Role</label>
          <select id="role-pick" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="organizer">Organizer</option><option value="admin">Admin</option><option value="student">Student</option>
          </select></div>
        <button className="primary" type="submit">Save role</button>
        {msg && <p role="status" style={{ margin: 0 }}>{msg}</p>}
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>They need to sign in once first. Everyone starts as a student.</p>
      </form>
    </section>
  )
}
