import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { useEventLive, sendGlow } from '../lib/social.js'
import Sky from '../components/social/Sky.jsx'

// Laptop/projector view. Shows nicknames, lines and constellation names only. Never clues.
export default function Projector({ param: eventId }) {
  const live = useEventLive(eventId)
  const [qr, setQr] = useState(null)
  const sent = useRef(false)
  const joinUrl = `${location.origin}/#/checkin/${eventId}`
  useEffect(() => { QRCode.toDataURL(joinUrl, { margin: 1, width: 420 }).then(setQr) }, [joinUrl])

  const links = live.connections.filter((c) => c.a_confirmed && c.b_confirmed).length
  const goal = live.event?.room_goal ?? 20
  const reached = links >= goal
  useEffect(() => { if (reached && !sent.current) { sent.current = true; sendGlow(eventId) } }, [reached, eventId])

  if (live.loading) return <p className="screen muted" role="status">Loading…</p>
  if (!live.event) return <p className="screen">Event not found.</p>

  return (
    <main style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: 48, padding: 48, minHeight: '100vh',
      background: reached ? 'radial-gradient(circle at 65% 45%, rgba(245,196,81,.25), var(--bg) 70%)' : 'var(--bg)', transition: 'background 2s' }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 style={{ fontSize: 44 }}>{live.event.title}</h1>
        <div style={{ border: '8px solid var(--crimson)', borderRadius: 24, padding: 24, background: 'var(--surface)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 700 }}>Join this event</p>
          {qr && <img src={qr} alt="QR code to join this event" width="320" height="320" style={{ background: '#fff', borderRadius: 12 }} />}
          <p className="muted" style={{ fontSize: 18 }}>Scan with your phone camera</p>
        </div>
        <p style={{ fontSize: 22, margin: 0 }}>Star Corner: by this screen</p>
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Sky people={live.people} connections={live.connections} constellations={live.constellations} w={900} h={620} big />
        </div>
        <div>
          <p style={{ fontSize: 24, margin: '0 0 8px' }} aria-live="polite">
            {reached ? `Goal reached: ${links} links. The room lit up!` : `${links} / ${goal} links · light up the room`}
          </p>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(links, goal)} aria-label="Room goal"
            style={{ height: 20, background: 'var(--surface-2)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (links / goal) * 100)}%`, height: '100%', background: 'var(--gold)', transition: 'width 1s' }} />
          </div>
          <p className="muted" style={{ fontSize: 18 }}>{live.people.length} people open to meet · nicknames only</p>
        </div>
      </section>
    </main>
  )
}
