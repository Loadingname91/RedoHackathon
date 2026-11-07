import React, { useState } from 'react'
import { rpc } from '../../lib/supabase.js'
import './social.css'

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
    <div className="cu cu-modal" role="dialog" aria-modal="true" aria-labelledby="safety-title" style={{ minHeight: 0 }}>
      <section>
        <h2 id="safety-title" className="cu-h" style={{ fontSize: 22 }}>{person.nickname}</h2>
        {done ? (
          <>
            <p role="status" className="cu-sub">{done} They won't be told.</p>
            <button className="cu-goldbtn" onClick={onClose} autoFocus>Done</button>
          </>
        ) : (
          <>
            <p className="cu-sub">They won't be told.</p>
            {conn && <button className="cu-secondary" onClick={() => act('remove')}>Remove connection</button>}
            <button className="cu-secondary" onClick={() => act('block')}>Block: hide each other and stop connecting</button>
            <label htmlFor="reason">Report reason (optional)</label>
            <textarea id="reason" style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px' }} rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What happened?" />
            <button className="cu-primary" onClick={() => act('report')}>Report and block</button>
            {error && <p role="alert" className="cu-err">{error}</p>}
            <button className="cu-secondary" onClick={onClose} autoFocus>Cancel</button>
          </>
        )}
      </section>
    </div>
  )
}
