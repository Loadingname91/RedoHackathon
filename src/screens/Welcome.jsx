import React, { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { prefs, setPrefs } from '../lib/identity.js'
import { useAuth, homeFor } from '../lib/auth.js'

// First sign-in only: promise → your star → comfort → location → home for your role.
const NAMES = ['Comet', 'Nova', 'Vega', 'Lumen', 'Orbit', 'Juniper', 'Pulsar', 'Halley', 'Lyra', 'Quasar']
const INTERESTS = ['Games', 'Pizza', 'Music', 'Coding', 'Hiking', 'Art', 'Film', 'Skiing']
const STEPS = ['Welcome', 'Your star', 'Comfort', 'Location']

function Toggle({ on, set, title, sub }) {
  return (
    <button type="button" onClick={() => set(!on)} aria-pressed={on} className="card"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%' }}>
      <span style={{ display: 'grid', gap: 2 }}><span style={{ fontWeight: 600 }}>{title}</span><span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>{sub}</span></span>
      <span aria-hidden="true" style={{ flex: 'none', width: 46, height: 28, borderRadius: 14, background: on ? 'var(--gold)' : 'var(--surface-2)', border: '1px solid var(--line)', position: 'relative' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: on ? '#1a1405' : 'var(--muted)' }} />
      </span>
      <span className="sr-only">{on ? 'On' : 'Off'}</span>
    </button>
  )
}

export default function Welcome() {
  const { user, role } = useAuth()
  const p = prefs()
  const [step, setStep] = useState(0)
  const [nickname, setNickname] = useState(p.nickname ?? NAMES[Math.floor(Math.random() * NAMES.length)])
  const [interests, setInterests] = useState(p.interests ?? [])
  const [c, setC] = useState({ prefersText: !!p.prefersText, comeToMe: !!p.comeToMe, stepFree: !!p.stepFree, calm: !!p.calm })
  const [locMsg, setLocMsg] = useState('')
  const [err, setErr] = useState('')
  const first = (user?.user_metadata?.full_name ?? user?.email ?? '').split(/[ @]/)[0]

  const toggle = (i) => setInterests((xs) => xs.includes(i) ? xs.filter((x) => x !== i) : xs.length < 3 ? [...xs, i] : xs)
  const askLocation = () => {
    if (!navigator.geolocation) return setLocMsg('This device has no location. You can still use the map.')
    setLocMsg('Asking your phone…')
    navigator.geolocation.getCurrentPosition(() => setLocMsg('Location is on. It stays on this phone.'),
      () => setLocMsg('Location is off. You can turn it on later from the map.'), { timeout: 10000 })
  }
  const finish = async () => {
    setErr('')
    setPrefs({ nickname: nickname.trim(), interests, ...c, role: role === 'student' ? 'student' : role })
    const { error } = await supabase.rpc('save_my_profile', { p: { nickname: nickname.trim(), interests, comfort: c, onboarded: true } })
    if (error) return setErr(`Couldn't save your profile: ${error.message}`)
    location.hash = homeFor(role)
  }
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish())

  return (
    <main className="screen" style={{ display: 'grid', gap: 16, alignContent: 'start', paddingTop: 28 }}>
      <p className="muted" style={{ margin: 0, fontSize: 14 }} aria-live="polite">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
        {STEPS.map((s, i) => <span key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--gold)' : 'var(--line)' }} />)}
      </div>

      {step === 0 && (<>
        <h1 style={{ fontSize: 28 }}>Welcome{first ? `, ${first}` : ''}</h1>
        <p style={{ margin: 0 }}>Constellation U puts campus events on one map, and helps you meet people once you're there.</p>
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          <strong>Three promises</strong>
          <span>Only a nickname is ever shown. Never your name or email.</span>
          <span>Nobody sees you unless you check in to an event, and you vanish when it ends.</span>
          <span>Lines between people only appear when both say yes.</span>
        </div>
        {role !== 'student' && <p className="card" style={{ margin: 0 }}>Your account is an <strong>{role}</strong>. You'll land on your {role === 'admin' ? 'campus data' : 'events'} page after this.</p>}
      </>)}

      {step === 1 && (<>
        <h1 style={{ fontSize: 26 }}>Your star</h1>
        <p className="muted" style={{ margin: 0 }}>Used to fill in check-in. You can change it at every event.</p>
        <div>
          <label htmlFor="w-nick">Nickname</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="w-nick" value={nickname} maxLength={24} onChange={(e) => setNickname(e.target.value)} autoComplete="off" />
            <button type="button" onClick={() => setNickname(NAMES[Math.floor(Math.random() * NAMES.length)])}>Shuffle</button>
          </div>
        </div>
        <div>
          <span style={{ display: 'flex', justifyContent: 'space-between' }}><label style={{ margin: 0 }}>Pick 2–3 interests</label><span className="muted" aria-live="polite">{interests.length} / 3</span></span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {INTERESTS.map((i) => <button type="button" key={i} aria-pressed={interests.includes(i)} onClick={() => toggle(i)}
              style={interests.includes(i) ? { background: 'var(--gold)', color: '#1a1405', borderColor: 'var(--gold)' } : undefined}>{i}</button>)}
          </div>
        </div>
      </>)}

      {step === 2 && (<>
        <h1 style={{ fontSize: 26 }}>Comfort and access</h1>
        <p className="muted" style={{ margin: 0 }}>Saved to your account. Change any time in My sky.</p>
        <Toggle on={c.prefersText} set={(v) => setC({ ...c, prefersText: v })} title="I prefer text" sub="Answer prompts by typing. No talking needed." />
        <Toggle on={c.comeToMe} set={(v) => setC({ ...c, comeToMe: v })} title="Come to me" sub="You stay put. Your match walks over." />
        <Toggle on={c.stepFree} set={(v) => setC({ ...c, stepFree: v })} title="Step-free routes" sub="Directions avoid stairs where possible." />
        <Toggle on={c.calm} set={(v) => setC({ ...c, calm: v })} title="Calm mode" sub="No twinkling, flashing or sounds." />
      </>)}

      {step === 3 && (<>
        <h1 style={{ fontSize: 26 }}>See yourself on the map</h1>
        <p style={{ margin: 0 }}>Your location shows as a blue dot so you can see what's near you and get walking directions.</p>
        <p className="card" style={{ margin: 0 }}>It never leaves this phone. Nobody else sees it, and it isn't saved.</p>
        <button onClick={askLocation}>Allow location</button>
        {locMsg && <p role="status" style={{ margin: 0 }}>{locMsg}</p>}
      </>)}

      {err && <p role="alert" style={{ color: 'var(--coral)', margin: 0 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
        <button className="primary" style={{ flex: 1 }} onClick={next}
          disabled={step === 1 && (!nickname.trim() || interests.length < 2)}>
          {step === STEPS.length - 1 ? 'Start exploring' : 'Next'}
        </button>
      </div>
      {step === 1 && interests.length < 2 && <p className="muted" style={{ margin: 0, fontSize: 14 }}>Pick at least 2 interests to continue.</p>}
    </main>
  )
}
