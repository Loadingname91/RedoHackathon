// node src/lib/geo.check.mjs — self-check for schedule fit and off-route distance.
import assert from 'node:assert'
import { fit, distanceToLine, meters } from './geo.js'
const now = new Date('2026-11-06T20:00:00-07:00')
const ev = (s, e) => ({ start_at: new Date(s).toISOString(), end_at: e && new Date(e).toISOString() })
const until = new Date('2026-11-06T21:00:00-07:00').toISOString()
assert.equal(fit(ev('2026-11-06T20:30:00-07:00'), until, now), 'fits')
assert.equal(fit(ev('2026-11-06T21:30:00-07:00'), until, now), 'clashes')
assert.equal(fit(ev('2026-11-06T17:00:00-07:00', '2026-11-06T18:00:00-07:00'), until, now), null) // already over
assert.equal(fit(ev('2026-11-06T20:30:00-07:00'), null, now), null)
const line = [[-111.846, 40.765], [-111.846, 40.767]]
assert.ok(distanceToLine({ lat: 40.766, lng: -111.846 }, line) < 1)
const d = distanceToLine({ lat: 40.766, lng: -111.8455 }, line)
assert.ok(Math.abs(d - meters({ lat: 40.766, lng: -111.846 }, { lat: 40.766, lng: -111.8455 })) < 1)
console.log('geo checks passed')
