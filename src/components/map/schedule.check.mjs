// node src/components/map/schedule.check.mjs — self-check for .ics parsing and free-gap logic.
import assert from 'node:assert'
import { busyFromIcs, gapFrom } from './schedule.js'
const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:a
DTSTART:20261107T040000Z
DTEND:20261107T050000Z
SUMMARY:CS 3500
END:VEVENT
BEGIN:VEVENT
UID:b
DTSTART:20261106T150000Z
DTEND:20261106T160000Z
RRULE:FREQ=DAILY;COUNT=5
SUMMARY:Daily standup
END:VEVENT
END:VCALENDAR`
const now = new Date('2026-11-07T03:00:00Z') // 8 PM Denver
const busy = busyFromIcs(ics, now)
assert.equal(busy[0].start.toISOString(), '2026-11-07T04:00:00.000Z') // class at 9 PM Denver first
assert.ok(busy.some((b) => b.start.toISOString() === '2026-11-07T15:00:00.000Z')) // recurring next morning
assert.equal(gapFrom(busy, now).freeUntil.toISOString(), '2026-11-07T04:00:00.000Z')
const g = gapFrom(busy, new Date('2026-11-07T04:30:00Z'))
assert.ok(g.busyNow && g.nextGap.toISOString() === '2026-11-07T05:00:00.000Z')
console.log('schedule checks passed')
