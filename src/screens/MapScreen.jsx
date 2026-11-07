import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import jsQR from 'jsqr'
import '../components/map/map.css'
import Icon, { OFFERING_LABEL, ICON_PATHS } from '../components/map/icons.jsx'
import { useEvents, buildingByCode, openCount } from '../components/map/useEvents.js'
import { busyFromIcs, gapFrom } from '../components/map/schedule.js'
import { CAMPUS, fmtTime, isNow, isLaterToday, fit, whenText } from '../lib/geo.js'
import { prefs, setPrefs, deviceId } from '../lib/identity.js'
import { supabase } from '../lib/supabase.js'

// OpenStreetMap tiles (no key). Darkened with a CSS filter in map.css. shortcut: OSM's public server is for light use; switch to a hosted tile provider for real traffic.
export const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Design 01 chips: one filter at a time.
const CHIPS = ['All', 'Now', 'Later today', 'Open to meet', 'Food', 'Swag', 'Music', 'Games', 'Speaker', 'Step-free', 'Quiet']
const STATUS = { advertised: ['Advertised', '#C9D0EC'], available: ['Available', '#7FE0C4'], running_low: ['Running low', '#FFB45C'], finished: ['Finished', '#8E9AC0'] }
export const statusOf = (o) => STATUS[o.status] ?? ['Advertised', '#C9D0EC']
const ago = (iso) => { if (!iso) return ''; const m = Math.round((Date.now() - new Date(iso)) / 60000); return m < 1 ? ' · just now' : m < 60 ? ` · ${m} min ago` : '' }
export const offerLine = (o) => `${statusOf(o)[0]}${ago(o.updated_at)}`
export const placeOf = (e) => `${buildingByCode[e.building_code]?.names[0] ?? 'Location on the announcement'}${e.room ? ` · ${e.room}` : ''}`

const has = (e, type) => (e.offerings ?? []).some((o) => o.type === type && o.status !== 'finished')
function matches(e, f, counts) {
  if (f === 'All') return true
  if (f === 'Now') return isNow(e)
  if (f === 'Later today') return isLaterToday(e)
  if (f === 'Open to meet') return openCount(counts, e.id) > 0
  if (f === 'Step-free') return e.access?.step_free === 'yes'
  if (f === 'Quiet') return e.access?.quiet_space === 'yes'
  return has(e, f.toLowerCase())
}

const mainOffering = (e) => (e.offerings ?? []).find((o) => o.status !== 'finished')?.type ?? 'star'

function planetHtml({ e, n, mine, sel, dim, pill, pillFits, label }) {
  const live = isNow(e), imported = e.source === 'campus_connect'
  const ring = live ? '#FF5A5A' : '#8E9AC0', dash = live ? 'none' : imported ? '1 3' : '3 2.5'
  const path = ICON_PATHS[mainOffering(e)] ?? ICON_PATHS.star
  return `<span class="cu-planet${live ? '' : ' later'}${dim ? ' dim' : ''}${sel ? ' sel' : ''}">
    ${live ? '<span class="pulse"></span>' : ''}
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <ellipse cx="22" cy="22" rx="19" ry="5.5" fill="none" stroke="${ring}" stroke-opacity=".55" stroke-width="1.3" transform="rotate(-22 22 22)"/>
      <circle cx="22" cy="22" r="12.5" fill="${sel ? '#2A2A4E' : '#141C40'}" stroke="${ring}" stroke-width="2" stroke-dasharray="${dash}"/>
      <g transform="translate(15 15) scale(.5833)"><path d="${path}" fill="none" stroke="#FFE2A3" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></g>
    </svg>
    ${n ? `<span class="count">${n}</span>` : ''}${mine ? `<span class="mine">★ ${mine}</span>` : ''}
    ${pill ? `<span class="pill${pillFits ? ' fits' : ''}">${pill}</span>` : ''}
    <span class="sr-only">${label}</span></span>`
}

// Legend: the real planet drawings from the map, plus what each offering icon means.
function Legend() {
  const h = 3600e3, now = Date.now(), iso = (t) => new Date(t).toISOString()
  const live = { start_at: iso(now - h), end_at: iso(now + h), offerings: [{ type: 'food' }], source: 'host' }
  const later = { ...live, start_at: iso(now + 2 * h), end_at: iso(now + 3 * h) }
  const rows = [
    [planetHtml({ e: live, label: '' }), 'Live now', 'Solid red ring with a slow pulse.'],
    [planetHtml({ e: later, label: '' }), 'Later today', 'Dashed grey ring, no pulse.'],
    [planetHtml({ e: { ...later, source: 'campus_connect' }, label: '' }), 'From Campus Connect', 'Dotted ring. No live food or status until a host claims it.'],
    [planetHtml({ e: live, n: 9, label: '' }), 'People here', 'Number of people checked in. Only shown once 3 or more are there.'],
    [planetHtml({ e: live, mine: 3, label: '' }), 'Your constellation', 'Gold star: a constellation you are part of formed here.'],
  ]
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
        {rows.map(([html, title, sub]) => (
          <li key={title} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'center' }}>
            <span aria-hidden="true" style={{ position: 'relative', width: 56, height: 48, display: 'grid', placeItems: 'center' }} dangerouslySetInnerHTML={{ __html: html }} />
            <span><strong style={{ display: 'block', fontSize: 15 }}>{title}</strong><span className="cu-small">{sub}</span></span>
          </li>
        ))}
      </ul>
      <div>
        <strong style={{ fontSize: 15 }}>Icon inside a planet = the main thing on offer</strong>
        <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {Object.entries(OFFERING_LABEL).filter(([k]) => ICON_PATHS[k]).map(([k, label]) => (
            <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 16, background: '#141C40', border: '1.5px solid #8E9AC0', display: 'grid', placeItems: 'center', color: '#FFE2A3', flex: 'none' }}><Icon name={k} size={18} /></span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

async function scanQrImage(file) {
  const img = await createImageBitmap(file)
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0)
  return jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height)?.data ?? null
}

// Your constellations per event (from events you checked into on this phone). Count = members.
function useMyConstellations() {
  const [mine, setMine] = useState({})
  useEffect(() => {
    let sessions = {}
    try { sessions = JSON.parse(localStorage.getItem('cu.sessions')) ?? {} } catch {}
    const ids = Object.keys(sessions)
    if (!ids.length) return
    supabase.from('constellations').select('id,event_id,name,members').in('event_id', ids).then(({ data }) => {
      const m = {}
      for (const c of data ?? []) if (c.members.includes(sessions[c.event_id]?.participant_id)) m[c.event_id] = { name: c.name, size: c.members.length }
      setMine(m)
    })
  }, [])
  return mine
}

export default function MapScreen({ query }) {
  const { events, counts, error } = useEvents()
  const [filter, setFilter] = useState('All')
  const [view, setView] = useState('map')
  const [sel, setSel] = useState(null)        // event id
  const [sheet, setSheet] = useState(null)    // building code with several events
  const [fitMode, setFitMode] = useState(query?.get('fit') === '1')
  const [freeUntil, setFreeUntil] = useState(prefs().freeUntil)
  const [busy, setBusy] = useState(null)
  const [stepFree, setStepFree] = useState(prefs().stepFree)
  const [showAll, setShowAll] = useState(false)
  const [legend, setLegend] = useState(false)
  const [msg, setMsg] = useState('')
  const [sky, setSky] = useState(null)
  const mine = useMyConstellations()
  const mapEl = useRef(null), map = useRef(null), layer = useRef(null)

  useEffect(() => { supabase.rpc('my_sky', { p_device: deviceId() }).then(({ data }) => setSky(data)) }, [])

  const shown = useMemo(() => (events ?? []).filter((e) => matches(e, filter, counts) && (!fitMode || !stepFree || e.access?.step_free === 'yes')), [events, filter, counts, fitMode, stepFree])
  const byBuilding = useMemo(() => {
    const g = {}
    for (const e of shown) if (buildingByCode[e.building_code]) (g[e.building_code] ??= []).push(e)
    return g
  }, [shown])
  const onNow = (events ?? []).filter((e) => isNow(e)).length
  const later = (events ?? []).filter((e) => isLaterToday(e)).length
  const fitting = fitMode && freeUntil ? shown.filter((e) => fit(e, freeUntil) === 'fits') : []
  const selEv = events?.find((e) => e.id === sel)

  useEffect(() => {
    if (view !== 'map' || !mapEl.current) return
    map.current = L.map(mapEl.current, { zoomControl: false }).setView([CAMPUS.lat, CAMPUS.lng], 16)
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map.current)
    L.control.zoom({ position: 'topright' }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => { map.current.remove(); map.current = null; layer.current = null; youMk.current = null }
  }, [view])

  // "Show my location": off until tapped. The position stays in this browser; nothing is sent or saved.
  const [you, setYou] = useState(null)
  const watch = useRef(null), youMk = useRef(null), centered = useRef(false)
  const stopLocate = () => {
    if (watch.current != null) navigator.geolocation.clearWatch(watch.current)
    watch.current = null; centered.current = false; setYou(null)
  }
  // Like Google Maps: location stays on; the button re-centers on you (or retries if it was blocked).
  const toggleLocate = () => {
    if (watch.current != null) { if (you && map.current) map.current.setView([you.lat, you.lng], 17); return }
    if (!navigator.geolocation) return setMsg('Location is not available on this device.')
    setMsg('Finding you… Your location stays on this phone.')
    watch.current = navigator.geolocation.watchPosition(
      (pos) => setYou({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { stopLocate(); setMsg('Location is blocked. The map works without it.') },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 })
  }
  useEffect(() => {
    // Lock onto the user's location when the map opens, unless they turned it off before.
    if (navigator.geolocation) toggleLocate()
    return () => { if (watch.current != null) navigator.geolocation.clearWatch(watch.current) }
  }, [])

  // Start zoomed out to show every event; once location arrives, show you and the events together.
  // fitState: none → events/you → both. Once both events and your location are known, stop moving the map.
  const fitState = useRef('none')
  const PAD = { paddingTopLeft: [24, 150], paddingBottomRight: [24, 300], maxZoom: 17, animate: false } // an animated move would be dropped if the next fit lands mid-animation
  useEffect(() => { fitState.current = 'none' }, [view]) // map is rebuilt when switching back from List
  useEffect(() => {
    if (!map.current || fitState.current === 'both') return
    const pts = Object.keys(byBuilding).map((c) => [buildingByCode[c].lat, buildingByCode[c].lng])
    const me = you && map.current.distance([you.lat, you.lng], [CAMPUS.lat, CAMPUS.lng]) < 5000 ? [you.lat, you.lng] : null
    if (pts.length && me) { fitState.current = 'both'; map.current.fitBounds(L.latLngBounds([...pts, me]), PAD) }
    else if (pts.length && fitState.current === 'none') { fitState.current = 'events'; map.current.fitBounds(L.latLngBounds(pts), PAD) }
    else if (me && fitState.current === 'none') { fitState.current = 'you'; map.current.setView(me, 17, { animate: false }) }
  }, [byBuilding, you, view])
  useEffect(() => {
    if (!map.current) return
    if (!you) { youMk.current?.remove(); youMk.current = null; return }
    const ll = [you.lat, you.lng]
    if (!youMk.current) youMk.current = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="cu-you"></div>', iconSize: [18, 18] }), keyboard: false, interactive: false, title: 'You are here' }).addTo(map.current)
    else youMk.current.setLatLng(ll)
    if (!centered.current) {
      centered.current = true
      const onCampus = map.current.distance(ll, [CAMPUS.lat, CAMPUS.lng]) < 5000
      setMsg(onCampus ? 'Showing your location. Only on this phone.' : "You're off campus, so the map stays on campus. Your location stays on this phone.")
    }
  }, [you, view])

  useEffect(() => {
    if (!layer.current) return
    layer.current.clearLayers()
    for (const [code, list] of Object.entries(byBuilding)) {
      const b = buildingByCode[code]
      const e = list.find((x) => isNow(x)) ?? list[0]
      const f = fitMode && !showAll ? fit(e, freeUntil) : null
      const n = list.reduce((s, x) => s + openCount(counts, x.id), 0)
      const m = list.map((x) => mine[x.id]).find(Boolean)
      const label = `${e.title}, ${b.names[0]}, ${whenText(e)}${list.length > 1 ? `, and ${list.length - 1} more` : ''}${n ? `, ${n} people here` : ''}${e.source === 'campus_connect' ? ', imported from Campus Connect' : ''}${f === 'clashes' ? ', clashes with your schedule' : f === 'fits' ? ', fits your gap' : ''}`
      L.marker([b.lat, b.lng], {
        title: label, alt: label, keyboard: true,
        icon: L.divIcon({ className: '', iconSize: [44, 44], html: planetHtml({ e, n, mine: m?.size, sel: list.some((x) => x.id === sel), dim: f === 'clashes', pill: f === 'clashes' ? 'Clashes' : f === 'fits' ? 'Fits your gap' : null, pillFits: f === 'fits', label }) }),
      }).on('click', () => (list.length === 1 ? (setSheet(null), setSel(e.id)) : (setSel(null), setSheet(code)))).addTo(layer.current)
    }
  }, [byBuilding, counts, freeUntil, fitMode, showAll, view, sel, mine])

  const setFree = (date) => { const iso = date ? date.toISOString() : null; setPrefs({ freeUntil: iso }); setFreeUntil(iso) }
  const onTime = (v) => { if (!v) return setFree(null); const d = new Date(); const [h, mm] = v.split(':'); d.setHours(+h, +mm, 0, 0); setFree(d) }
  const onIcs = async (file) => {
    try {
      const b = busyFromIcs(await file.text()); setBusy(b)
      const g = gapFrom(b); setFree(g.busyNow ? new Date() : g.freeUntil)
      setMsg(g.busyNow ? `You're busy now. Next free gap: ${fmtTime(g.nextGap.toISOString())}.` : '')
    } catch { setMsg("Couldn't read that calendar file. Try the time picker instead.") }
  }
  const onScan = async (file) => {
    setMsg('Reading the code…')
    const text = await scanQrImage(file).catch(() => null)
    const m = text && text.match(/#\/(checkin|event)\/([0-9a-f-]{36})/)
    if (m) location.hash = `#/${m[1]}/${m[2]}`
    else setMsg("That doesn't look like an event QR. Try again, or open the event from the map.")
  }
  const toHHMM = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
  const groups = Object.keys(mine).length

  const Row = ({ e }) => (
    <button className="cu-item" style={{ textAlign: 'left' }} onClick={() => { setView('map'); setSheet(null); setSel(e.id) }}>
      <span className="cu-row"><span className={`cu-tag ${isNow(e) ? 'live' : 'later'}`}>{isNow(e) ? 'LIVE' : 'LATER'}</span><strong>{e.title}</strong></span>
      <span className="muted" style={{ fontSize: 13 }}>{placeOf(e)} · {whenText(e)}</span>
      <span className="cu-small">
        {[...(e.offerings ?? []).map((o) => `${o.text || OFFERING_LABEL[o.type]} ${statusOf(o)[0].toLowerCase()}`),
          e.student_run ? 'Student-run · not a club post' : null, e.source === 'campus_connect' ? 'From Campus Connect' : null,
          fitMode && freeUntil ? (fit(e, freeUntil) === 'fits' ? 'Fits your gap' : fit(e, freeUntil) === 'clashes' ? 'Clashes with your schedule' : null) : null,
        ].filter(Boolean).join(' · ')}
      </span>
    </button>
  )

  return (
    <>
      {view === 'map' && <div ref={mapEl} className="cu-map" role="region" aria-label="Campus map. The list view has the same events." />}
      {view === 'map' && (
        <button className="cu-round cu-locate" onClick={toggleLocate} aria-pressed={!!you}
          aria-label={you ? 'Center on my location' : 'Show my location'} title={you ? 'Center on my location' : 'Show my location'}>
          <Icon name="locate" />
        </button>
      )}

      <header className="cu-top">
        <div className="cu-row" style={{ justifyContent: 'space-between' }}>
          <div className="cu-row"><Icon name="star" size={22} /><h1 style={{ fontSize: 19 }}>Constellation U</h1></div>
          <div className="cu-row">
            <a className="btn cu-round" href="#/sky" aria-label="My sky and settings"><Icon name="user" /></a>
            <div className="cu-seg" role="group" aria-label="View">
              <button aria-pressed={view === 'map'} onClick={() => setView('map')}>Map</button>
              <button aria-pressed={view === 'list'} onClick={() => { setView('list'); setSel(null); setSheet(null) }}>List</button>
            </div>
          </div>
        </div>
        <div className="cu-chips" role="group" aria-label="Filter events">
          {CHIPS.map((c) => <button key={c} className="cu-chip" aria-pressed={filter === c} onClick={() => { setFilter(c); setSel(null) }}>{c}</button>)}
        </div>
        {(groups > 0 || sky?.hosting_unlocked) && !fitMode && (
          <div className="cu-row" style={{ flexWrap: 'wrap' }}>
            {groups > 0 && <a className="btn" href="#/sky" style={{ minHeight: 36, fontSize: 13 }}>My sky · {groups} group{groups > 1 ? 's' : ''}</a>}
            {sky?.hosting_unlocked && <a className="btn" href="#/micro" style={{ minHeight: 36, fontSize: 13, borderColor: '#F5C76B' }}>You've earned hosting</a>}
          </div>
        )}
        {error && <p role="alert" className="card">Couldn't load events: {error}</p>}
      </header>

      {view === 'list' && (
        <main className="cu-list" aria-label="Events list">
          <p className="cu-small" style={{ margin: 0 }}>{shown.length} event{shown.length === 1 ? '' : 's'} · same events as the map</p>
          {events === null && <p role="status" className="muted">Loading events…</p>}
          {events && !shown.length && <p className="card">Nothing matches “{filter}” right now.</p>}
          {shown.map((e) => <Row key={e.id} e={e} />)}
        </main>
      )}

      {/* Summary sheet (nothing selected) */}
      {view === 'map' && !sel && !sheet && !fitMode && (
        <section className="cu-sheet" aria-label="Campus right now">
          <div className="cu-sheet-inner">
            <div className="cu-handle" />
            <div className="cu-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ fontSize: 16 }}>{events ? `${onNow} event${onNow === 1 ? '' : 's'} on now · ${later} later` : 'Loading events…'}</h2>
              <span className="cu-small">Tap a planet</span>
            </div>
            <div className="cu-actions">
              <label className="btn primary" style={{ margin: 0, color: '#fff', cursor: 'pointer' }}>Scan event QR
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => e.target.files[0] && onScan(e.target.files[0])} />
              </label>
              <button onClick={() => setFitMode(true)}>What fits my gap</button>
              <a className="btn" href="#/host/new">Host an event</a>
            </div>
            {msg && <p role="status" className="cu-small" style={{ margin: 0 }}>{msg}</p>}
            <div className="cu-row cu-small"><Icon name="locate" size={16} />Your location never leaves this phone. Nobody sees you unless you check in.
              <button className="cu-chip" style={{ marginLeft: 'auto' }} onClick={() => setLegend(true)}>What the shapes mean</button></div>
          </div>
        </section>
      )}

      {/* Selected planet (design 01 sheet) */}
      {view === 'map' && selEv && (
        <section className="cu-sheet" role="dialog" aria-label={selEv.title}>
          <div className="cu-sheet-inner">
            <div className="cu-handle" />
            <div className="cu-row" style={{ justifyContent: 'space-between' }}>
              <span className="cu-row"><span className={`cu-tag ${isNow(selEv) ? 'live' : 'later'}`}>{isNow(selEv) ? 'LIVE' : 'LATER'}</span><span className="cu-small">{whenText(selEv)}</span></span>
              <button className="cu-round" onClick={() => setSel(null)} aria-label="Close"><Icon name="close" /></button>
            </div>
            <h2 style={{ fontSize: 22, lineHeight: 1.15 }}>{selEv.title}</h2>
            <p className="cu-small" style={{ margin: 0 }}>{selEv.student_run ? 'Student-run · not a club post' : selEv.host || 'Host not listed'} · {placeOf(selEv)}</p>
            {(selEv.offerings ?? []).map((o, i) => (
              <div key={i} className="cu-row" style={{ fontWeight: 600, fontSize: 13 }}><span className="cu-dot" style={{ background: statusOf(o)[1] }} />{o.text || OFFERING_LABEL[o.type]} · <span style={{ color: statusOf(o)[1] }}>{offerLine(o)}</span></div>
            ))}
            {openCount(counts, selEv.id) > 0 && <p className="cu-small" style={{ margin: 0 }}>{openCount(counts, selEv.id)} people checked in · joining is optional</p>}
            {mine[selEv.id] && <p className="cu-small" style={{ margin: 0, color: '#F5C76B' }}>Your constellation “{mine[selEv.id].name}” formed here.</p>}
            <p className="cu-row cu-small" style={{ margin: 0 }}><Icon name="access" size={16} />Access: {selEv.access?.step_free === 'yes' ? 'step-free entrance' : selEv.access?.step_free === 'no' ? 'not step-free' : 'unknown. Ask the host on the event page.'}</p>
            {selEv.source === 'campus_connect' && <p className="cu-note" style={{ margin: 0 }}>From Campus Connect. Food and status aren't tracked live until the host claims it.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a className="btn primary" href={`#/event/${selEv.id}`}>Open event</a>
              {buildingByCode[selEv.building_code] ? <a className="btn" href={`#/nav/${selEv.id}`}>Directions</a> : <span />}
            </div>
          </div>
        </section>
      )}

      {/* Several events at one building */}
      {view === 'map' && sheet && byBuilding[sheet] && (
        <section className="cu-sheet" aria-label={`Events at ${buildingByCode[sheet].names[0]}`}>
          <div className="cu-sheet-inner">
            <div className="cu-row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 18 }}>{buildingByCode[sheet].names[0]}</h2>
              <button className="cu-round" onClick={() => setSheet(null)} aria-label="Close"><Icon name="close" /></button>
            </div>
            {byBuilding[sheet].map((e) => <Row key={e.id} e={e} />)}
          </div>
        </section>
      )}

      {/* What fits my gap (design 12) + Sam's empty state (design 16) */}
      {fitMode && !sel && (
        <section className="cu-sheet" aria-label="What fits my gap">
          <div className="cu-sheet-inner">
            <div className="cu-row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 18 }}>What fits my gap</h2>
              <button className="cu-round" onClick={() => setFitMode(false)} aria-label="Close"><Icon name="close" /></button>
            </div>
            {freeUntil ? <p style={{ margin: 0, fontWeight: 600 }}>Free until {fmtTime(freeUntil)}</p> : <p style={{ margin: 0 }}>See what fits your day</p>}
            <p className="cu-row cu-small" style={{ margin: 0 }}><Icon name="clock" size={16} />Your calendar stays on this phone.</p>
            <label className="btn" style={{ margin: 0, cursor: 'pointer', color: 'var(--text)' }}>Load my calendar (.ics)
              <input type="file" accept=".ics,text/calendar" className="sr-only" onChange={(e) => e.target.files[0] && onIcs(e.target.files[0])} />
            </label>
            <div className="cu-row">
              <label htmlFor="free" style={{ margin: 0 }}>Or: I'm free until</label>
              <input id="free" type="time" value={toHHMM(freeUntil)} onChange={(e) => onTime(e.target.value)} style={{ width: 130, minHeight: 40 }} />
            </div>
            <label className="cu-row" style={{ margin: 0, color: 'var(--text)' }}>
              <input type="checkbox" checked={stepFree} onChange={(e) => { setStepFree(e.target.checked); setPrefs({ stepFree: e.target.checked }) }} style={{ width: 22, minHeight: 22 }} />Step-free only
            </label>
            {msg && <p role="status" className="cu-small" style={{ margin: 0 }}>{msg}</p>}
            {freeUntil && fitting.length > 0 && (
              <a className="card" href={`#/event/${fitting[0].id}`} style={{ color: 'var(--text)', textDecoration: 'none', borderColor: '#F5C76B' }}>
                <strong>{fitting[0].title} fits your gap</strong>
                <p className="cu-small" style={{ margin: '4px 0 0' }}>{placeOf(fitting[0])} · {whenText(fitting[0])}{(fitting[0].offerings ?? [])[0] ? ` · ${fitting[0].offerings[0].text || OFFERING_LABEL[fitting[0].offerings[0].type]} ${statusOf(fitting[0].offerings[0])[0].toLowerCase()}` : ''}. Dimmed planets clash with your schedule.</p>
              </a>
            )}
            {freeUntil && !fitting.length && events && (
              <div className="card">
                <strong>Nothing fits right now</strong>
                <p className="cu-small" style={{ margin: '4px 0 8px' }}>{busy && gapFrom(busy).nextGap ? `Next free gap: ${fmtTime(gapFrom(busy).nextGap.toISOString())}. ` : ''}{shown.length ? `${shown.length} event${shown.length > 1 ? 's are' : ' is'} on, but ${shown.length > 1 ? 'they clash' : 'it clashes'} with your schedule. We'll show what opens up.` : 'No events match right now.'}</p>
                <button onClick={() => setShowAll(!showAll)}>{showAll ? 'Dim the clashes again' : 'Show all events anyway'}</button>
              </div>
            )}
            <div className="cu-row">
              {freeUntil && <button onClick={() => { setFree(null); setBusy(null); setMsg('') }}>Clear schedule</button>}
            </div>
            <p className="cu-small" style={{ margin: 0 }}>Social features stay out of the way. Hide them any time in settings.</p>
          </div>
        </section>
      )}

      {/* Legend (design 17, planets part) */}
      {legend && (
        <section className="cu-sheet" role="dialog" aria-label="What the shapes mean">
          <div className="cu-sheet-inner">
            <div className="cu-row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 18 }}>Events are planets. People are stars.</h2>
              <button className="cu-round" onClick={() => setLegend(false)} aria-label="Close"><Icon name="close" /></button>
            </div>
            <p className="cu-small" style={{ margin: 0 }}>Every state also has a text label, so nothing relies on color alone. Never shown anywhere: photos, real names, connection counts, rankings.</p>
            <Legend />
            <p className="cu-small" style={{ margin: 0 }}>People are stars, and only appear inside an event you've checked into.</p>
          </div>
        </section>
      )}
    </>
  )
}
