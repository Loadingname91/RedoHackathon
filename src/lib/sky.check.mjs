// node src/lib/sky.check.mjs — self-check: event skies stay readable as rooms fill up.
import assert from 'node:assert'
import { arrange, crossings, confirmedEdges } from './sky.js'

let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const link = (a, b) => ({ id: `${a}-${b}`, a, b, a_confirmed: true, b_confirmed: true })

// Rooms of growing size: groups of 2-6 joined as trees, bigger ones closed into a loop.
for (const N of [3, 12, 24, 40, 60, 100]) {
  const people = Array.from({ length: N }, (_, i) => ({ id: 'p' + i }))
  const conns = []
  for (let i = 0; i < N * 0.8;) {
    const ids = people.slice(i, i + 2 + Math.floor(rnd() * 5)).map((p) => p.id); i += ids.length
    for (let k = 1; k < ids.length; k++) conns.push(link(ids[Math.floor(rnd() * k)], ids[k]))
    if (ids.length >= 4) conns.push(link(ids[0], ids.at(-1)))
  }
  for (const [w, h, gap] of [[360, 340, 52], [980, 560, 83]]) {
    const { pos, fit } = arrange(people, conns, 'p0', w, h, { gap })
    assert.equal(crossings(confirmedEdges(conns), pos), 0, `lines cross at N=${N} ${w}x${h}`)
    const P = Object.values(pos)
    for (const p of P) assert.ok(p.x > 0 && p.x < w && p.y > 0 && p.y < h, `star off screen at N=${N}`)
    for (let a = 0; a < P.length; a++) for (let b = a + 1; b < P.length; b++)
      assert.ok(Math.hypot(P[a].x - P[b].x, P[a].y - P[b].y) >= gap * fit * 0.99, `stars overlap at N=${N} ${w}x${h}`)
    if (N <= 12) assert.ok(fit > 0.8, `small rooms stay near full size (${fit})`)
  }
}

// A loop of 5 drawn on a circle never crosses, whoever "me" is.
const five = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id }))
const loop = [link('a', 'c'), link('c', 'e'), link('e', 'b'), link('b', 'd'), link('d', 'a')]
for (const me of ['a', 'd', 'zz']) assert.equal(crossings(confirmedEdges(loop), arrange(five, loop, me, 360, 340).pos), 0)

// Empty sky still has orbits to draw.
assert.equal(arrange([], [], null, 360, 340).orbits.length, 2)
console.log('sky ok')
