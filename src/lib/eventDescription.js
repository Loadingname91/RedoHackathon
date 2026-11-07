// Announcements arrive from hosts and calendar feeds, so they often contain
// HTML, copied whitespace, and metadata already displayed elsewhere in the UI.
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }

export function cleanAnnouncement(text) {
  return String(text ?? '')
    .replace(/\r/g, '')
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|nbsp);|&#39;/g, (entity) => ENTITIES[entity] ?? entity)
    .split('\n')
    .map((line) => line.replace(/[\t ]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

// Calendar imports prepend the title, time, and location. Those facts have
// dedicated, more reliable UI above the description, so avoid repeating them.
export function eventDescription(event) {
  const lines = cleanAnnouncement(event?.source_text).split('\n').filter(Boolean)
  if (lines[0]?.toLocaleLowerCase() === String(event?.title ?? '').trim().toLocaleLowerCase()) lines.shift()
  return lines
    .filter((line) => !/^(when|where)\s*:/i.test(line))
    .join('\n')
}

export function descriptionPreview(event, limit = 150) {
  const text = eventDescription(event).replace(/\n+/g, ' ')
  if (text.length <= limit) return text
  return `${text.slice(0, limit).replace(/\s+\S*$/, '').trimEnd()}…`
}
