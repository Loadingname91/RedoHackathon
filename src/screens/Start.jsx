import React, { useState } from 'react'
import { useAuth, signOut, homeFor, deleteAccount } from '../lib/auth.js'
import Landing from './Landing.jsx'

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

  if (!user) return <Landing /> // signed out: the public landing page with Google sign-in

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
