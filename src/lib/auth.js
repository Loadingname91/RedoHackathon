import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { setUid, setHostSecret, allHostSecrets, setPrefs } from './identity.js'

// Session + role. Roles come from the profiles table; everyone starts as a student.
// Layout testing only: on the local dev server, localStorage cu.test-role fakes a signed-in, onboarded account so a
// headless browser can reach every screen. import.meta.env.DEV is false in the Vercel build, so this code is removed there.
const testRole = () => { if (!import.meta.env.DEV) return null; try { return localStorage.getItem('cu.test-role') } catch { return null } }

export function useAuth() {
  const fake = testRole()
  const fakeState = () => ({ loading: false, user: { email: 'qa@test.local' }, role: fake, profile: { onboarded: localStorage.getItem('cu.test-onboarded') !== '0' } })
  const [state, setState] = useState(fake ? fakeState() : { loading: true, user: null, role: 'student', profile: null })
  useEffect(() => {
    if (fake) { const r = () => setState(fakeState()); addEventListener('cu-auth', r); return () => removeEventListener('cu-auth', r) }
    const load = async (session) => {
      const user = session?.user ?? null
      setUid(user?.id ?? null)
      if (!user) return setState({ loading: false, user: null, role: 'student', profile: null })
      const { data: role } = await supabase.rpc('my_role')
      if (role === 'organizer' || role === 'admin') {
        // Attach host links opened on this phone to the account, then pull every event this account hosts.
        for (const [id, secret] of Object.entries(allHostSecrets())) supabase.rpc('link_host_event', { p_event: id, p_secret: secret })
        const { data } = await supabase.rpc('my_hosted_events')
        for (const r of data ?? []) setHostSecret(r.event_id, r.host_secret)
      }
      const { data: profile } = await supabase.rpc('my_profile')
      // The account's saved star and comfort settings fill this phone's preferences.
      if (profile?.onboarded) setPrefs({ nickname: profile.nickname ?? undefined, interests: profile.interests, ...(profile.comfort ?? {}) })
      setState({ loading: false, user, role: role ?? 'student', profile })
    }
    // getSession waits for the client to finish exchanging the Google ?code=, then we tidy the URL.
    supabase.auth.getSession().then(({ data }) => {
      if (location.search.includes('code=')) history.replaceState(null, '', location.pathname + location.hash)
      load(data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { setTimeout(() => load(session), 0) })
    // Any screen can ask every useAuth() to reload (e.g. after onboarding saves the profile).
    const refresh = () => supabase.auth.getSession().then(({ data }) => load(data.session))
    addEventListener('cu-auth', refresh)
    return () => { sub.subscription.unsubscribe(); removeEventListener('cu-auth', refresh) }
  }, [])
  return state
}

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/` } })

export const signOut = async () => { await supabase.auth.signOut(); setUid(null); setPrefs({ role: null, landed: false }); location.hash = '' }

// Where each role lands after signing in.
export const homeFor = (role) => (role === 'admin' ? '#/admin' : role === 'organizer' ? '#/host' : '#/')

export const refreshAuth = () => dispatchEvent(new Event('cu-auth'))
export const isTestAuth = () => !!testRole()
