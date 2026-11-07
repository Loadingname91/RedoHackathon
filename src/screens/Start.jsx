import React from 'react'
import { setPrefs } from '../lib/identity.js'

const ROLES = [
  { id: 'student', to: '#/', title: 'Student', sub: "Find what's on, get there, meet people.", note: 'No account. No GPS.' },
  { id: 'organizer', to: '#/host', title: 'Organizer', sub: 'Paste a post, publish it, run the room.', note: 'Manage events with your host link.' },
  { id: 'admin', to: '#/admin', title: 'Admin', sub: 'Keep Campus Connect events in sync.', note: 'Needs the admin key.' },
]

export default function Start() {
  const pick = (r) => { setPrefs({ role: r.id }); location.hash = r.to }
  return (
    <main className="screen" style={{ display: 'grid', gap: 16, alignContent: 'start', paddingTop: 40 }}>
      <header style={{ display: 'grid', gap: 6 }}>
        <h1 style={{ fontSize: 30 }}>Constellation U</h1>
        <p className="muted" style={{ margin: 0 }}>Follow what's happening. Find your people.</p>
      </header>
      <h2 style={{ fontSize: 18, marginTop: 8 }}>Who are you today?</h2>
      {ROLES.map((r) => (
        <button key={r.id} onClick={() => pick(r)} className="card"
          style={{ display: 'grid', justifyItems: 'start', justifyContent: 'stretch', textAlign: 'left', gap: 4, padding: 18, minHeight: 88, width: '100%' }}>
          <span style={{ font: '700 19px var(--display)', color: 'var(--text)' }}>{r.title}</span>
          <span style={{ fontWeight: 500, color: 'var(--text)' }}>{r.sub}</span>
          <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>{r.note}</span>
        </button>
      ))}
      <p className="muted" style={{ fontSize: 14, margin: 0 }}>You can switch any time from the tab bar. Sign-in with your U account is planned; tonight nothing is tied to your name.</p>
    </main>
  )
}
