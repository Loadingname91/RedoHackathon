import React, { useState } from 'react'

// Free-form interest. Matching with other people is fuzzy on the server (pg_trgm), so "boardgames" meets "Board games".
export const tidyInterest = (t) => t.replace(/\s+/g, ' ').trim().slice(0, 24).replace(/^./, (c) => c.toUpperCase())
export const addInterest = (cur, t) => {
  const v = tidyInterest(t)
  if (!v || cur.length >= 3 || cur.some((x) => x.toLowerCase() === v.toLowerCase())) return cur
  return [...cur, v]
}

export default function AddInterest({ onAdd, full }) {
  const [text, setText] = useState('')
  const add = (e) => { e.preventDefault(); if (text.trim()) { onAdd(text); setText('') } }
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <label htmlFor="add-interest" className="sr-only">Add your own interest</label>
      <input id="add-interest" value={text} maxLength={24} disabled={full} placeholder={full ? 'Remove one to add another' : 'Add your own, e.g. Bouldering'}
        onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add(e)} autoComplete="off" />
      <button type="button" onClick={add} disabled={full || !text.trim()}>Add</button>
    </div>
  )
}
