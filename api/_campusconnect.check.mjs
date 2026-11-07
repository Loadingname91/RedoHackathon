// Self-check for the rule-based matchers: node api/_campusconnect.check.mjs
import assert from 'node:assert/strict'
import { matchBuilding, matchRoom, matchOfferings, loadBuildings } from './_campusconnect.js'
const B = loadBuildings()
assert.equal(matchBuilding('Warnock Engineering Building (WEB) 1230', B), 'WEB')
assert.equal(matchBuilding('A. Ray Olpin University Union, Saltair Room', B), 'UNION')
assert.equal(matchBuilding('Webinar on Zoom', B), null) // "web" inside a word is not WEB
assert.equal(matchRoom('WEB 1230, 72 Central Campus Dr'), '1230')
assert.equal(matchRoom('Union Room 323'), '323')
assert.equal(matchRoom('200 S Central Campus Dr'), null)
assert.deepEqual(matchOfferings('Free pizza and stickers').map((o) => o.type), ['food', 'swag'])
console.log('campusconnect checks passed')
