import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { useEventLive, sendGlow, motionOK } from '../lib/social.js'
import Sky, { SPARK } from '../components/social/Sky.jsx'
import '../components/social/social.css'

// Design 10 · projected event screen. Nicknames, lines and constellation names only. Never clues.
export default function Projector({ param: eventId }) {
  const live = useEventLive(eventId)
  const [qr, setQr] = useState(null)
  const sent = useRef(false)
  const joinUrl = `${location.origin}/#/checkin/${eventId}`
  useEffect(() => { QRCode.toDataURL(joinUrl, { margin: 1, width: 600, color: { dark: '#0B1020', light: '#FFFFFF' } }).then(setQr) }, [joinUrl])
  const dust = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 100, s: 1 + (i % 3), d: (i * 0.3) % 3 })), [])

  const links = live.connections.filter((c) => c.a_confirmed && c.b_confirmed).length
  const goal = live.event?.room_goal ?? 20
  const reached = links >= goal
  useEffect(() => { if (reached && !sent.current) { sent.current = true; sendGlow(eventId) } }, [reached, eventId])

  if (live.loading) return <main className="cu"><p className="cu-col cu-sub" role="status">Loading…</p></main>
  if (!live.event) return <main className="cu"><p className="cu-col cu-sub">Event not found.</p></main>

  return (
    <main className="cu" style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh', overflow: 'hidden', background: 'linear-gradient(180deg, #0B1020 0%, #111836 80%, #1E1A3A 100%)' }}>
      {dust.map((s, i) => <span key={i} aria-hidden="true" className="cu-tw" style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: '50%', background: '#CFD6F5', animationDelay: `${s.d}s` }} />)}
      {reached && <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 66% 44%, rgba(245,199,107,.42) 0%, rgba(245,199,107,.12) 45%, rgba(245,199,107,0) 75%)', animation: motionOK() ? 'cu-pop 2s ease-out both' : 'none' }} />}
      <section style={{ position: 'relative', flex: '1 1 380px', maxWidth: 460, boxSizing: 'border-box', padding: '48px 40px', background: 'rgba(15,21,48,.88)', borderRight: '1px solid #2C3660', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center' }}>
        {live.event.host && <p style={{ font: '600 15px Inter, sans-serif', color: '#F5C76B', letterSpacing: 1.2, margin: 0, textTransform: 'uppercase' }}>{live.event.host}</p>}
        <h1 style={{ font: "700 38px 'Space Grotesk', sans-serif", lineHeight: 1.1, margin: 0 }}>{live.event.title}</h1>
        <div style={{ width: 'min(330px, 80%)', aspectRatio: '1', padding: 18, boxSizing: 'border-box', borderRadius: 22, background: '#fff', border: '6px solid #CC0000' }}>
          {qr && <img src={qr} alt="QR code: scan to join this event" style={{ width: '100%', height: '100%' }} />}
        </div>
        <p style={{ font: "700 34px 'Space Grotesk', sans-serif", color: '#FFE2A3', margin: 0 }}>Scan to join the sky</p>
        <p style={{ font: '400 17px Inter, sans-serif', color: '#C9D0EC', lineHeight: 1.45, margin: 0 }}>No GPS. Only people in this room see your star.<br />Joining is optional. Everything here is for everyone.</p>
        <div style={{ flex: 1 }} />
        <p style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 18, background: '#161E3E', border: '1px solid #36407A', font: '600 20px Inter, sans-serif', margin: 0 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F5C76B" strokeWidth="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
          Star Corner: by this screen
        </p>
      </section>
      <section style={{ position: 'relative', flex: '2 1 600px', padding: 48, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, font: "700 28px 'Space Grotesk', sans-serif", margin: 0 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d={SPARK} fill="#F5C76B" /></svg>
            The sky over {live.event.building_code}
          </h2>
          <p style={{ font: '600 18px Inter, sans-serif', color: '#C9D0EC', margin: 0 }}>{live.people.length} people here · nicknames only</p>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 980 }}>
            <Sky people={live.people} connections={live.connections} constellations={live.constellations} w={980} h={560} big />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 12 }} aria-live="polite">
            <p style={{ font: "700 28px 'Space Grotesk', sans-serif", margin: 0 }}>{reached ? 'The room lit up!' : `${links} / ${goal} links`}</p>
            <p style={{ font: '600 20px Inter, sans-serif', color: '#FFE2A3', margin: 0 }}>{reached ? `${links} links tonight` : `${goal - links} more to light up the room`}</p>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(links, goal)} aria-label="Room goal"
            style={{ height: 22, borderRadius: 11, background: '#1C2550', overflow: 'hidden', border: '1px solid #36407A' }}>
            <div style={{ width: `${Math.min(100, (links / goal) * 100)}%`, height: '100%', borderRadius: 11, background: 'linear-gradient(90deg, #E8A93B, #FFE2A3)', transition: 'width 1s' }} />
          </div>
        </div>
      </section>
    </main>
  )
}
