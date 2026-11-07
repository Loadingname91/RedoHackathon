import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { deviceId } from '../../lib/identity.js'
import buildings from '../../data/buildings.json'

export const EVENT_COLS = 'id,title,host,start_at,end_at,building_code,room,offerings,access,source_text,source,student_run'
export const buildingByCode = Object.fromEntries(buildings.map((b) => [b.code, b]))
export { buildings }

// Live events + per-event participant counts (counts only; names never loaded here).
export function useEvents() {
  const [events, setEvents] = useState(null)
  const [counts, setCounts] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    const loadEvents = async () => {
      const [{ data, error }, vis] = await Promise.all([
        supabase.from('events').select(EVENT_COLS).order('start_at', { ascending: true, nullsFirst: false }),
        supabase.rpc('visible_event_ids', { p_device: deviceId() }),
      ])
      if (!alive) return
      if (error) return setError(error.message)
      setError(null)
      // Private micro-events stay hidden unless shared with this phone. If the check fails, show only non-student events.
      const ok = vis.error ? null : new Set(vis.data.map((r) => r.visible_event_ids ?? r))
      setEvents(data.filter((e) => ok ? ok.has(e.id) : !e.student_run))
    }
    const loadCounts = async () => {
      const { data } = await supabase.from('participants').select('event_id')
      if (!alive || !data) return
      const c = {}
      for (const p of data) c[p.event_id] = (c[p.event_id] ?? 0) + 1
      setCounts(c)
    }
    loadEvents(); loadCounts()
    const ch = supabase.channel('map-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, loadCounts)
      .subscribe()
    // Realtime may skip participants (hidden columns); poll counts as a backup.
    const t = setInterval(loadCounts, 20000)
    return () => { alive = false; clearInterval(t); supabase.removeChannel(ch) }
  }, [])

  return { events, counts, error }
}

// Only reveal a count once 3+ people are present, so one person can't be singled out.
export const openCount = (counts, id) => (counts[id] ?? 0) >= 3 ? counts[id] : 0
