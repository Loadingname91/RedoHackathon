// Shared synthetic population: used by train-foryou.mjs (the model) and seed-synthetic.mjs (the database).
import { INTERESTS } from '../src/lib/foryou.js'

export const OFFERS = ['food', 'swag', 'music', 'games', 'speaker', 'workshop', 'prizes', 'networking']

// Seeded random so every run makes the same data.
export function rng(seed = 42) {
  return () => { seed = (seed + 0x6D2B79F5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
export const pick = (rand, arr, n) => [...arr].sort(() => rand() - 0.5).slice(0, n)

// Hidden "true" tastes the model has to discover (-1 dislike .. 1 love). Unlisted pairs are 0.
export const TRUE = {
  Pizza: { food: 1, games: 0.3, swag: 0.2 },
  Games: { games: 1, prizes: 0.7, food: 0.3, speaker: -0.4 },
  Music: { music: 1, networking: 0.3, workshop: -0.3 },
  Coding: { workshop: 0.9, prizes: 0.6, speaker: 0.5, music: -0.3 },
  Hiking: { networking: 0.5, swag: 0.4, speaker: 0.2, games: -0.3 },
  Art: { workshop: 0.7, music: 0.5, prizes: -0.2 },
  Film: { speaker: 0.8, food: 0.3, workshop: -0.2 },
  Skiing: { swag: 0.8, networking: 0.5, music: 0.3 },
}
export const truth = (i, o) => TRUE[i]?.[o] ?? 0

// Rating 1 (😞), 2 (😐) or 3 (😄), like the Feedback screen.
export function rate(rand, interests, offers) {
  let x = (rand() + rand() + rand() - 1.5) * 0.8
  for (const i of interests) for (const o of offers) x += truth(i, o)
  return x > 0.6 ? 3 : x > -0.3 ? 2 : 1
}

// Fake device ids all start with 5e1f0000- so they can be found and deleted later.
export const SYNTH_PREFIX = '5e1f0000-'
export const synthDevice = (n) => `${SYNTH_PREFIX}0000-4000-8000-${String(n).padStart(12, '0')}`

export function makeStudents(rand, n) {
  return Array.from({ length: n }, (_, k) => ({ device: synthDevice(k + 1), interests: pick(rand, INTERESTS, 1 + Math.floor(rand() * 3)) }))
}
