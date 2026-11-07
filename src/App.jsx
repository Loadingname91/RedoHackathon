import React, { useEffect, useState, lazy, Suspense } from 'react'
import { prefs, setPrefs } from './lib/identity.js'
import { applySeeing } from './screens/MySky.jsx'
import TabBar from './components/TabBar.jsx'

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
  'start': lazy(() => import('./screens/Start.jsx')),             // role picker            // admin  #/admin (Campus Connect sync)
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
  const role = prefs().role
  // First visit to the home page goes to the role picker; links shared to events, check-in or host pages open directly.
  const name = route.name === '' && !role ? 'start' : route.name
  const Screen = routes[name] ?? routes['']
  // Tab bar on the main screens only; immersive screens (at the event, navigation, projector, check-in) keep the full screen.
  const tabs = ['', 'event', 'sky', 'host', 'admin', 'micro'].includes(name)
  useEffect(() => { document.documentElement.dataset.tabs = tabs ? '1' : '0' }, [tabs])
  return (
    <>
      <Suspense fallback={<p className="screen muted" role="status">Loading…</p>}>
        <Screen param={route.param} query={route.query} prefs={prefs()} />
      </Suspense>
      {tabs && <TabBar role={role ?? 'student'} route={{ ...route, name }} />}
    </>
  )
}
