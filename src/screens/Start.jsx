import React from 'react'
import { setPrefs } from '../lib/identity.js'
import { useAuth, signInWithGoogle, signOut } from '../lib/auth.js'

const ROLES = [
  { id: 'student', to: '#/', title: 'Student', sub: "Find what's on, get there, meet people.", note: 'No GPS stored. Nicknames only.' },
  { id: 'organizer', to: '#/host', title: 'Organizer', sub: 'Paste a post, publish it, run the room.', note: 'Your events stay on your account.' },
  { id: 'admin', to: '#/admin', title: 'Admin', sub: 'Keep Campus Connect events in sync.', note: 'Grants organizer roles too.' },
]
const ALLOWED = { student: ['student'], organizer: ['student', 'organizer'], admin: ['student', 'organizer', 'admin'] }

export default function Start() {
  const { loading, user, role } = useAuth()
  const pick = (r) => { setPrefs({ role: r.id }); location.hash = r.to }
  const roles = ROLES.filter((r) => ALLOWED[role]?.includes(r.id))
  return (
    <main className="screen" style={{ display: 'grid', gap: 16, alignContent: 'start', paddingTop: 40 }}>
      <header style={{ display: 'grid', gap: 6 }}>
        <h1 style={{ fontSize: 30 }}>Constellation U</h1>
        <p className="muted" style={{ margin: 0 }}>Follow what's happening. Find your people.</p>
      </header>

      {loading ? <p className="muted" role="status">Checking your account…</p> : user ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{user.email}</div>
            <div className="muted" style={{ fontSize: 14 }}>Signed in · {role}</div>
          </div>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          <button className="primary" onClick={signInWithGoogle}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.1L6.4 14zM12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.8 9.4 6 12 6z"/></svg>
            Continue with Google
          </button>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>Signing in keeps your stars and constellations across phones. Everyone starts as a student; organizers are added by an admin. You can also look around without an account.</p>
        </div>
      )}

      <h2 style={{ fontSize: 18, marginTop: 8 }}>{user ? 'Open as' : 'Or continue as'}</h2>
      {roles.map((r) => (
        <button key={r.id} onClick={() => pick(r)} className="card"
          style={{ display: 'grid', justifyItems: 'start', justifyContent: 'stretch', textAlign: 'left', gap: 4, padding: 18, minHeight: 88, width: '100%' }}>
          <span style={{ font: '700 19px var(--display)', color: 'var(--text)' }}>{r.title}</span>
          <span style={{ fontWeight: 500, color: 'var(--text)' }}>{r.sub}</span>
          <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>{r.note}</span>
        </button>
      ))}
      {!user && (
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>Organizer or admin? Sign in first. Organizer tools also open from a host link.</p>
      )}
    </main>
  )
}
