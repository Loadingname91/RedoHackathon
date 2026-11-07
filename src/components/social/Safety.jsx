import React, { useState } from 'react'
import { rpc } from '../../lib/supabase.js'

// Remove / block / report one person. They are never told.
export default function Safety({ session, person, conn, onClose }) {
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(null)
  const [error, setError] = useState(null)
  const args = { p_id: session.participant_id, p_secret: session.secret }

  async function act(kind) {
    setError(null)
    try {
      if (kind === 'remove') await rpc('remove_connection', { ...args, p_conn: conn.id })
      if (kind === 'block') await rpc('block_person', { ...args, p_other: person.id })
      if (kind === 'report') await rpc('report_person', { ...args, p_other: person.id, p_reason: reason.trim() || null })
      setDone({ remove: 'Connection removed.', block: `${person.nickname} is blocked.`, report: `Report sent and ${person.nickname} is blocked.` }[kind])
    } catch (err) { setError(err.message) }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="safety-title"
      style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,18,.8)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <section className="card" style={{ width: '100%', maxWidth: 520, borderRadius: '20px 20px 0 0', display: 'grid', gap: 12, padding: 20 }}>
        <h2 id="safety-title" style={{ fontSize: 20 }}>{person.nickname}</h2>
        {done ? (
          <>
            <p role="status" style={{ margin: 0 }}>{done} They won't be told.</p>
            <button className="primary" onClick={onClose} autoFocus>Done</button>
          </>
        ) : (
          <>
            <p className="muted" style={{ margin: 0 }}>They won't be told.</p>
            {conn && <button onClick={() => act('remove')}>Remove connection</button>}
            <button onClick={() => act('block')}>Block: hide each other and stop connecting</button>
            <label htmlFor="reason">Report reason (optional)</label>
            <textarea id="reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What happened?" />
            <button className="primary" onClick={() => act('report')}>Report and block</button>
            {error && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{error}</p>}
            <button onClick={onClose} autoFocus>Cancel</button>
          </>
        )}
      </section>
    </div>
  )
}
