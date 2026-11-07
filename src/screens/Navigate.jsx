import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import '../components/map/map.css'
import Icon from '../components/map/icons.jsx'
import { useEvents, buildings, buildingByCode } from '../components/map/useEvents.js'
import { TILES, ATTRIBUTION } from './MapScreen.jsx'
import { meters, distanceToLine, fmtDuration, fmtDistance } from '../lib/geo.js'
import { prefs, setPrefs } from '../lib/identity.js'
import savedRoutes from '../data/routes.json'

const ARRIVE_M = 40, OFF_ROUTE_M = 30, REROUTE_GAP_MS = 30000

async function fetchRoute(from, to, profile, fromCode, toCode) {
  try {
    const r = await fetch('/api/route', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: [from.lng, from.lat], to: [to.lng, to.lat], profile }) })
    const body = await r.json()
    if (r.ok) return body
    const saved = savedRoutes[`${fromCode}>${toCode}|${profile}`]
    if (saved) return { ...saved, saved: true }
    throw new Error(body.error || 'No route found')
  } catch (err) {
    const saved = savedRoutes[`${fromCode}>${toCode}|${profile}`]
    if (saved) return { ...saved, saved: true } // offline / service down: saved demo route
    throw err
  }
}

export default function Navigate({ param }) {
  const { events } = useEvents()
  const e = events?.find((x) => x.id === param)
  const b = e && buildingByCode[e.building_code]
  const dest = b?.entrance

  const [start, setStart] = useState(null) // { lat, lng, code?, gps? }
  const [stepFree, setStepFree] = useState(!!prefs().stepFree)
  const [route, setRoute] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const [you, setYou] = useState(null)
  const [stepIdx, setStepIdx] = useState(1)
  const [arrived, setArrived] = useState(false)
  const [contrast, setContrast] = useState(false)
  const mapEl = useRef(null), map = useRef(null), lines = useRef(null), youMarker = useRef(null)
  const lastReroute = useRef(0)
  const profile = stepFree ? 'wheelchair' : 'foot-walking'

  const load = async (from) => {
    setBusy(true); setErr(null)
    try { setRoute(await fetchRoute(from, dest, profile, from.code, b.code)); setStepIdx(1) }
    catch (x) { setRoute(null); setErr(x.message) }
    finally { setBusy(false) }
  }

  useEffect(() => { if (start && dest) load(start) }, [start, profile, dest])

  useEffect(() => {
    document.documentElement.dataset.navContrast = contrast ? '1' : '0'
    return () => { document.documentElement.dataset.navContrast = '0' }
  }, [contrast])

  // Map
  useEffect(() => {
    if (!start || !mapEl.current || map.current) return
    map.current = L.map(mapEl.current, { zoomControl: false }).setView([dest.lat, dest.lng], 17)
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map.current)
    lines.current = L.layerGroup().addTo(map.current)
    L.marker([dest.lat, dest.lng], { keyboard: false, icon: L.divIcon({ className: '', iconSize: [44, 44], html: '<span class="cu-star live"><span class="core"></span></span>' }) }).addTo(map.current)
    return () => { map.current?.remove(); map.current = null }
  }, [start])

  useEffect(() => {
    if (!map.current || !route) return
    lines.current.clearLayers()
    const ll = route.coords.map(([x, y]) => [y, x])
    L.polyline(ll, { color: '#F5C451', weight: 6, opacity: 0.95, className: 'cu-route' }).addTo(lines.current)
    map.current.fitBounds(L.latLngBounds(ll).pad(0.2))
  }, [route])

  // Live follow (GPS start only)
  useEffect(() => {
    if (!start?.gps || !navigator.geolocation) return
    const id = navigator.geolocation.watchPosition((p) => setYou({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}, { enableHighAccuracy: true, maximumAge: 5000 })
    return () => navigator.geolocation.clearWatch(id)
  }, [start])

  useEffect(() => {
    if (!you || !route) return
    if (map.current) {
      youMarker.current ??= L.marker([you.lat, you.lng], { keyboard: false, icon: L.divIcon({ className: '', iconSize: [18, 18], html: '<span class="cu-you"></span>' }) }).addTo(map.current)
      youMarker.current.setLatLng([you.lat, you.lng])
    }
    if (meters(you, dest) < ARRIVE_M) return setArrived(true)
    const next = route.steps[stepIdx]
    if (next?.at && meters(you, { lng: next.at[0], lat: next.at[1] }) < 20) setStepIdx((i) => Math.min(i + 1, route.steps.length - 1))
    if (distanceToLine(you, route.coords) > OFF_ROUTE_M && Date.now() - lastReroute.current > REROUTE_GAP_MS) {
      lastReroute.current = Date.now()
      load({ ...you, gps: true })
    }
  }, [you])

  const useGps = () => {
    if (!navigator.geolocation) return setErr('Location is not available on this device. Pick a building instead.')
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (p) => { setBusy(false); setStart({ lat: p.coords.latitude, lng: p.coords.longitude, gps: true }) },
      () => { setBusy(false); setErr('Location permission was blocked. Pick a building to start from instead.') },
      { enableHighAccuracy: true, timeout: 10000 })
  }
  const fromBuilding = (code) => { const s = buildingByCode[code]; if (s) setStart({ lat: s.entrance.lat, lng: s.entrance.lng, code }) }
  const toggleStepFree = () => { setPrefs({ stepFree: !stepFree }); setStepFree(!stepFree) }

  if (!events) return <main className="screen"><p role="status" className="muted">Loading…</p></main>
  if (!e || !b) return <main className="screen"><p>We don't have a map location for this event.</p><a className="btn" href={e ? `#/event/${e.id}` : '#/'}>Back</a></main>

  const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=walking`
  const next = route?.steps[stepIdx]

  // Step 1: explain before the browser asks for location.
  if (!start) return (
    <main className="screen" style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
      <a className="btn" href={`#/event/${e.id}`} style={{ justifySelf: 'start' }}><Icon name="back" />Event</a>
      <h1 style={{ fontSize: 24 }}>Get to {b.names[0]}</h1>
      <p style={{ margin: 0 }}>To show the route from where you are, we need your location.</p>
      <p className="card" style={{ margin: 0 }}>Your location is used only to find your route. It stays on your phone except for the route request, and it's never stored.</p>
      <button className="primary" onClick={useGps} disabled={busy}><Icon name="locate" />{busy ? 'Finding you…' : 'Use my location'}</button>
      <label htmlFor="startb">Or start from a building</label>
      <select id="startb" defaultValue="" onChange={(x) => fromBuilding(x.target.value)}>
        <option value="" disabled>Choose a building…</option>
        {buildings.filter((x) => x.code !== b.code).map((x) => <option key={x.code} value={x.code}>{x.names[0]}</option>)}
      </select>
      <label className="cu-row" style={{ color: 'var(--text)' }}><input type="checkbox" checked={stepFree} onChange={toggleStepFree} style={{ width: 24, minHeight: 24 }} />Step-free route (avoids stairs)</label>
      {err && <p role="alert" className="card">{err}</p>}
    </main>
  )

  return (
    <>
      <div ref={mapEl} className="cu-map" role="region" aria-label={`Route map to ${b.names[0]}`} />
      <div className="cu-banner" role="status" aria-live="polite">
        <Icon name="turn" size={24} />
        <span style={{ flex: 1 }}>{arrived ? `You're at ${b.names[0]}` : busy ? 'Finding a route…' : next?.text ?? (err ? 'No route' : 'Head to the gold line')}</span>
        <a className="btn" href={`#/event/${e.id}`} aria-label="End navigation"><Icon name="close" /></a>
      </div>

      <section className="cu-sheet" aria-label="Route details">
        <div className="cu-sheet-inner">
          {arrived && (
            <div className="card" style={{ display: 'grid', gap: 8 }}>
              <strong>You're here. Check in?</strong>
              <a className="btn primary" href={`#/checkin/${e.id}`}>Check in to {e.title}</a>
            </div>
          )}
          {route && !arrived && (
            <div className="cu-row" style={{ justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 20 }}>{fmtDuration(route.duration)} · {fmtDistance(route.distance)}</strong>
              {route.saved && <span className="cu-badge">Saved route</span>}
            </div>
          )}
          {err && (
            <div role="alert" className="card" style={{ display: 'grid', gap: 8 }}>
              <span>{err}.{stepFree ? ' Step-free paths may be missing from the map data here.' : ''}</span>
              <a className="btn" href={mapsLink} target="_blank" rel="noreferrer">Open in Maps instead</a>
            </div>
          )}
          <div className="cu-row" style={{ flexWrap: 'wrap' }}>
            <button aria-pressed={!stepFree} onClick={() => stepFree && toggleStepFree()}>Walk</button>
            <button aria-pressed={stepFree} onClick={() => !stepFree && toggleStepFree()}><Icon name="access" />Step-free</button>
            <button aria-pressed={contrast} onClick={() => setContrast(!contrast)}>High contrast</button>
          </div>
          {!arrived && !start.gps && <a className="btn" href={`#/checkin/${e.id}`}>I've arrived: check in</a>}
          {route && (
            <details>
              <summary style={{ cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}>All steps ({route.steps.length})</summary>
              <ol style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
                {route.steps.map((s, i) => <li key={i} aria-current={i === stepIdx ? 'step' : undefined}>{s.text} <span className="muted">{fmtDistance(s.distance)}</span></li>)}
              </ol>
            </details>
          )}
          {start.gps && <p className="muted" style={{ fontSize: 13, margin: 0 }}>Location used only to find your route, never stored.</p>}
        </div>
      </section>
    </>
  )
}
