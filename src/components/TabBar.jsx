import React from 'react'
import './tabbar.css'

const ICON = {
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  sky: 'M12 3l2.2 5.6L20 9.3l-4.5 3.8 1.5 5.9L12 15.8 7 19l1.5-5.9L4 9.3l5.8-.7z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  plus: 'M12 5v14M5 12h14',
  data: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
}

export const TABS = {
  student: [
    { to: '#/', label: 'Explore', icon: 'map', match: (r) => r.name === '' || r.name === 'event' },
    { to: '#/sky', label: 'My sky', icon: 'sky', match: (r) => r.name === 'sky' },
    { to: '#/micro', label: 'Host', icon: 'plus', match: (r) => r.name === 'micro' }, // locked until 3 connections
  ],
  organizer: [
    { to: '#/host', label: 'My events', icon: 'list', match: (r) => r.name === 'host' && r.param !== 'new' },
    { to: '#/host/new', label: 'New event', icon: 'plus', match: (r) => r.name === 'host' && r.param === 'new' },
    { to: '#/', label: 'Map', icon: 'map', match: (r) => r.name === '' || r.name === 'event' },
  ],
  admin: [
    { to: '#/admin', label: 'Campus data', icon: 'data', match: (r) => r.name === 'admin' },
    { to: '#/host', label: 'Events', icon: 'list', match: (r) => r.name === 'host' },
    { to: '#/', label: 'Map', icon: 'map', match: (r) => r.name === '' || r.name === 'event' },
  ],
}

export default function TabBar({ role, route }) {
  const tabs = [...(TABS[role] ?? TABS.student), { to: '#/start', label: 'Account', icon: 'user', match: (r) => r.name === 'start' }]
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((t) => {
        const on = t.match(route)
        return (
          <a key={t.to} href={t.to} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICON[t.icon]} /></svg>
            <span>{t.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
