import { useEffect, useState, useCallback } from 'react'
import { supabase, PARTICIPANT_COLS, EVENT_COLS } from './supabase.js'

// Groups people joined by confirmed connections. Returns arrays of participant ids.
export function components(ids, edges) {
  const parent = new Map(ids.map((id) => [id, id]))
  const find = (x) => (parent.get(x) === x ? x : (parent.set(x, find(parent.get(x))), parent.get(x)))
  for (const [a, b] of edges) if (parent.has(a) && parent.has(b)) parent.set(find(a), find(b))
  const groups = new Map()
  for (const id of ids) { const r = find(id); groups.set(r, [...(groups.get(r) ?? []), id]) }
  return [...groups.values()]
}

export const confirmedEdges = (connections) =>
  connections.filter((c) => c.a_confirmed && c.b_confirmed).map((c) => [c.a, c.b])

// Live data for one event: refetch on any realtime change; 5 s poll only if the channel drops.
// shortcut: refetches everything on each change; fine for one room, switch to payload merging for big events.
export function useEventLive(eventId) {
  const [data, setData] = useState({ event: null, people: [], connections: [], constellations: [], loading: true, error: null })
  const load = useCallback(async () => {
    if (!eventId) return
    const [ev, ppl, con, cst] = await Promise.all([
      supabase.from('events').select(EVENT_COLS).eq('id', eventId).maybeSingle(),
      supabase.from('participants').select(PARTICIPANT_COLS).eq('event_id', eventId),
      supabase.from('connections').select('*').eq('event_id', eventId),
      supabase.from('constellations').select('id,event_id,name,members,created_at').eq('event_id', eventId),
    ])
    const error = ev.error || ppl.error || con.error || cst.error
    setData({ event: ev.data, people: ppl.data ?? [], connections: con.data ?? [], constellations: cst.data ?? [], loading: false, error: error?.message ?? null })
  }, [eventId])

  useEffect(() => {
    load()
    const ch = supabase.channel(`live:${eventId}`)
    for (const table of ['participants', 'connections', 'constellations', 'events'])
      ch.on('postgres_changes', { event: '*', schema: 'public', table }, load)
    let t = null
    // Poll only while the live channel is down.
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') { clearInterval(t); t = null }
      else if (!t) t = setInterval(load, 5000)
    })
    return () => { clearInterval(t); supabase.removeChannel(ch) }
  }, [eventId, load])

  return { ...data, reload: load }
}

// Room-wide glow: projector sends, phones listen.
export function useRoomGlow(eventId) {
  const [glow, setGlow] = useState(false)
  useEffect(() => {
    const ch = supabase.channel(`room:${eventId}`)
    ch.on('broadcast', { event: 'glow' }, () => { setGlow(true); setTimeout(() => setGlow(false), 4000) }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [eventId])
  return glow
}

export function sendGlow(eventId) {
  const ch = supabase.channel(`room:${eventId}`)
  ch.subscribe((status) => { if (status === 'SUBSCRIBED') ch.send({ type: 'broadcast', event: 'glow', payload: {} }).then(() => setTimeout(() => supabase.removeChannel(ch), 1000)) })
}

// Stars placed on a ring; stable by join order.
export function layout(people, w, h) {
  const n = Math.max(people.length, 1)
  return Object.fromEntries(people.map((p, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2
    const r = Math.min(w, h) * (0.28 + (i % 3) * 0.06)
    return [p.id, { x: w / 2 + Math.cos(ang) * r, y: h / 2 + Math.sin(ang) * r }]
  }))
}

export const motionOK = () =>
  !matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.calm !== '1'
