import React, { useState } from 'react'
import { useAuth, signInWithGoogle, signOut, homeFor, deleteAccount } from '../lib/auth.js'

// Signed out: the sign-in screen (every page needs an account). Signed in: the Account page.
const ROLE_TEXT = {
  student: 'Student · find events, check in, meet people.',
  organizer: 'Organizer · your events, live status, the room screen.',
  admin: 'Admin · campus data sync and organizer roles.',
}

export default function Start() {
  const { loading, user, role } = useAuth()
  const [delErr, setDelErr] = useState('')
  if (loading) return <p className="screen muted" role="status">Checking your account…</p>

  if (!user) return (
    <main className="screen" style={{ display: 'grid', gap: 18, alignContent: 'start', paddingTop: 48 }}>
      <header style={{ display: 'grid', gap: 6 }}>
        <h1 style={{ fontSize: 30 }}>Constellation U</h1>
        <p className="muted" style={{ margin: 0 }}>Follow what's happening. Find your people.</p>
      </header>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <button className="primary" onClick={signInWithGoogle}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.1L6.4 14zM12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.8 9.4 6 12 6z"/></svg>
          Continue with Google
        </button>
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>Everyone starts as a student. Other people only ever see the nickname you pick, never your name or email.</p>
      </div>
      <p className="muted" style={{ fontSize: 14, margin: 0 }}>Opened a link to an event? You'll go straight back to it after signing in.</p>
    </main>
  )

  return (
    <main className="screen" style={{ display: 'grid', gap: 16, alignContent: 'start', paddingTop: 28 }}>
      <h1 style={{ fontSize: 26 }}>Account</h1>
      <div className="card" style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{user.email}</div>
        <div className="muted" style={{ fontSize: 14 }}>{ROLE_TEXT[role] ?? ROLE_TEXT.student}</div>
      </div>
      <a className="btn primary" href={homeFor(role)}>Go to my {role === 'admin' ? 'campus data' : role === 'organizer' ? 'events' : 'map'}</a>
      {role === 'student' && <a className="btn" href="#/sky">My sky and comfort settings</a>}
      <p className="muted" style={{ fontSize: 14, margin: 0 }}>Need organizer access for your club? Ask an admin to add your email.</p>
      <button onClick={signOut}>Sign out</button>
      <section className="card" style={{ display: 'grid', gap: 8, borderColor: '#5A2A35' }}>
        <strong>Delete my account</strong>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>Removes your profile, check-ins, the people you've met and anything you shared with them. Safety reports stay. This can't be undone.</p>
        <button style={{ color: 'var(--coral)', borderColor: '#5A2A35' }} onClick={async () => {
          if (!confirm('Delete your account and everything tied to it? This cannot be undone.')) return
          try { await deleteAccount() } catch (e) { setDelErr(`Couldn't delete your account: ${e.message}`) }
        }}>Delete my account</button>
        {delErr && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{delErr}</p>}
      </section>
    </main>
  )
}
