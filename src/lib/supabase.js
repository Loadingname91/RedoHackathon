import { createClient } from '@supabase/supabase-js'

// pkce: Google sign-in returns ?code= in the query string, so it doesn't collide with the hash router.
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { flowType: 'pkce' } })

// Every write goes through a database function. Throws the server's message (e.g. "code expired or not at this event").
export async function rpc(fn, args) {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw new Error(error.message)
  return data
}

// participants: never select('*'). device_id and clue are hidden from browsers and the request fails.
export const PARTICIPANT_COLS = 'id,event_id,nickname,interests,prefers_text,come_to_me,half_word,created_at,expires_at'

// events: host_device is hidden from browsers, so never select('*').
export const EVENT_COLS = 'id,title,host,start_at,end_at,building_code,room,offerings,access,source_text,room_goal,created_at,source,student_run,visibility,source_url'
