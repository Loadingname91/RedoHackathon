// node src/lib/foryou.check.mjs — self-check for the "For you" ranking.
import assert from 'node:assert'
import fs from 'node:fs'
import { rankEvents, scoreEvent } from './foryou.js'
const { weights } = JSON.parse(fs.readFileSync(new URL('../data/affinity.json', import.meta.url), 'utf8'))

const now = new Date('2026-11-07T01:00:00Z') // 6 PM Denver
const at = (h) => new Date(now.getTime() + h * 3600e3).toISOString()
const pizza = { id: 'p', start_at: at(-0.5), end_at: at(1.5), offerings: [{ type: 'food', status: 'available' }] }
const talk = { id: 't', start_at: at(1), end_at: at(2), offerings: [{ type: 'speaker' }] }
const tomorrow = { id: 'x', start_at: at(26), offerings: [{ type: 'food' }] }
const ended = { id: 'e', start_at: at(-3), end_at: at(-1), offerings: [{ type: 'food' }] }

const r = rankEvents([talk, tomorrow, ended, pizza], { interests: ['Pizza'], weights, now })
assert.deepEqual(r.map((x) => x.e.id), ['p', 't', 'x']) // pizza lover: live pizza first, ended dropped
assert.ok(r[0].r.reasons.includes('Pizza fans rate food highly') && r[0].r.reasons.includes('On now'))
assert.equal(rankEvents([talk, pizza], { interests: ['Film'], weights, now })[0].e.id, 't') // film fan prefers the talk

// Finished food doesn't count, and a clash with your schedule sinks it.
const gone = scoreEvent({ ...pizza, offerings: [{ type: 'food', status: 'finished' }] }, { interests: ['Pizza'], weights, now })
assert.ok(gone.score < scoreEvent(pizza, { interests: ['Pizza'], weights, now }).score)
assert.ok(scoreEvent(talk, { weights, now, freeUntil: at(0.5) }).score < scoreEvent(talk, { weights, now, freeUntil: at(3) }).score)
console.log('foryou checks passed')
