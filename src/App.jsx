import React, { useEffect, useState, lazy, Suspense } from 'react'
import { prefs, setPrefs } from './lib/identity.js'
import { applySeeing } from './screens/MySky.jsx'
import TabBar from './components/TabBar.jsx'
import { useAuth, homeFor } from './lib/auth.js'

// Hash routes: #/path/param?query. Each screen file is owned by one lane (see docs/plan/BUILD_LANES.md).
const routes = {
  '': lazy(() => import('./screens/MapScreen.jsx')),            // lane B
  'event': lazy(() => import('./screens/EventScreenCard.jsx')),   // lane B  #/event/:id
  'nav': lazy(() => import('./screens/Navigate.jsx')),           // lane B  #/nav/:id
  'checkin': lazy(() => import('./screens/CheckIn.jsx')),        // lane A  #/checkin/:id
  'at': lazy(() => import('./screens/AtEvent.jsx')),             // lane A  #/at/:id  (code, scan, match, prompt, constellation inside)
  'sky': lazy(() => import('./screens/MySky.jsx')),              // lane A  #/sky
  'screen': lazy(() => import('./screens/Projector.jsx')),       // lane A  #/screen/:id
  'host': lazy(() => import('./screens/Host.jsx')),              // lane C  #/host/new, #/host/:id?k=secret
  'feedback': lazy(() => import('./screens/Feedback.jsx')),      // lane A  #/feedback/:id
  'micro': lazy(() => import('./screens/Micro.jsx')),            // lane C  #/micro
  'admin': lazy(() => import('./screens/Admin.jsx')),
  'start': lazy(() => import('./screens/Start.jsx')),             // sign in + role picker
  'welcome': lazy(() => import('./screens/Welcome.jsx')),         // first sign-in onboarding            // admin  #/admin (Campus Connect sync)
}

function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?')
  const [name = '', param] = path.split('/')
  return { name, param, query: new URLSearchParams(query) }
}

export const go = (to) => { location.hash = to }

export default function App() {
  const [route, setRoute] = useState(parseHash)
  useEffect(() => {
    setPrefs({}) // apply calm mode on load
    applySeeing() // text size + high contrast
    const on = () => setRoute(parseHash())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const auth = useAuth()
  const signedIn = !!auth.user, onboarded = !!auth.profile?.onboarded
  // Every screen needs sign-in. A link opened while signed out (event QR, check-in, host link) is remembered
  // and reopened after Google sign-in + onboarding. First sign-in goes through onboarding (welcome).
  useEffect(() => {
    if (auth.loading) return
    if (!signedIn || !onboarded) {
      // remember the link (e.g. a check-in QR) until sign-in + onboarding are done
      if (route.name && !['start', 'welcome'].includes(route.name)) try { sessionStorage.setItem('cu.next', location.hash) } catch {}
      return
    }
    let next = null; try { next = sessionStorage.getItem('cu.next'); sessionStorage.removeItem('cu.next') } catch {}
    if (next) { location.hash = next; return }
    if (route.name === '' && homeFor(auth.role) !== '#/' && !prefs().landed) { setPrefs({ landed: true }); location.hash = homeFor(auth.role) }
  }, [auth.loading, signedIn, onboarded, route.name])
  const name = auth.loading ? 'loading' : !signedIn ? 'start' : !onboarded ? 'welcome' : route.name
  // Tab bar on the main screens only; immersive screens (at the event, navigation, projector, check-in) keep the full screen.
  const tabs = signedIn && onboarded && ['', 'event', 'sky', 'host', 'admin', 'micro', 'start'].includes(name)
  useEffect(() => { document.documentElement.dataset.tabs = tabs ? '1' : '0' }, [tabs])
  if (name === 'loading') return <p className="screen muted" role="status">Loading…</p>
  const Screen = routes[name] ?? routes['']
  return (
    <>
      <Suspense fallback={<p className="screen muted" role="status">Loading…</p>}>
        <Screen param={route.param} query={route.query} prefs={prefs()} />
      </Suspense>
      {tabs && <TabBar role={auth.role} route={{ ...route, name }} />}
    </>
  )
}
