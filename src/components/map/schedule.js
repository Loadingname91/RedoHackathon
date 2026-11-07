import ICAL from 'ical.js'

// Busy blocks from an .ics file, read on this phone only.
export function busyFromIcs(text, now = new Date()) {
  const comp = new ICAL.Component(ICAL.parse(text))
  const end = new Date(now.getTime() + 24 * 3600e3), out = []
  for (const v of comp.getAllSubcomponents('vevent')) {
    const ev = new ICAL.Event(v)
    const it = ev.iterator()
    for (let t = it.next(), i = 0; t && i < 500; t = it.next(), i++) {
      const s = t.toJSDate()
      if (s > end) break
      const occ = ev.getOccurrenceDetails(t)
      const e = occ.endDate.toJSDate()
      if (e > now) out.push({ start: s, end: e })
      if (!ev.isRecurring()) break
    }
  }
  return out.sort((a, b) => a.start - b.start)
}
// Free until the next busy block starts (or end of the current one if you're busy now → that's your next gap).
export function gapFrom(busy, now = new Date()) {
  const cur = busy.find((b) => b.start <= now && b.end > now)
  if (cur) return { busyNow: true, nextGap: cur.end }
  const next = busy.find((b) => b.start > now)
  return { busyNow: false, freeUntil: next ? next.start : new Date(new Date(now).setHours(23, 59, 0, 0)) }
}

