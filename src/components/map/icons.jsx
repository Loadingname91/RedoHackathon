import React from 'react'

// One stroke style for every icon (24px grid). Decorative unless a label is passed.
export const ICON_PATHS = {
  star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
  food: 'M4 20L12 4l8 16zM9 13h.01M13 15h.01M12 10h.01',
  swag: 'M4 9h16v11H4zM2 6h20v3H2zM12 6v14M12 6c-2-4-6-3-5 0M12 6c2-4 6-3 5 0',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z',
  games: 'M4 4h16v16H4zM9 9h.01M15 15h.01M15 9h.01M9 15h.01',
  speaker: 'M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3zM19 11a7 7 0 01-14 0M12 18v4',
  workshop: 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  prizes: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4',
  networking: 'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2M16 3a4 4 0 010 8M22 21v-2a5 5 0 00-3-4.6',
  other: 'M12 8v8M8 12h8',
  access: 'M12 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 7h4l-1 6h4l2 6M13 13H9.5M8 11a6 6 0 105.5 9',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  map: 'M9 3L3 6v15l6-3 6 3 6-3V3l-6 3zM9 3v15M15 6v15',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  back: 'M15 18l-6-6 6-6',
  close: 'M18 6L6 18M6 6l12 12',
  nav: 'M3 11l19-9-9 19-2-8z',
  locate: 'M12 2v3M12 19v3M2 12h3M19 12h3M12 16a4 4 0 100-8 4 4 0 000 8z',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  turn: 'M9 18V9h9M14 4l5 5-5 5',
}

export default function Icon({ name, size = 20, label, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" role={label ? 'img' : undefined} aria-label={label}
      aria-hidden={label ? undefined : 'true'} focusable="false" {...rest}>
      <path d={ICON_PATHS[name] ?? ICON_PATHS.other} />
    </svg>
  )
}

export const OFFERING_LABEL = {
  food: 'Food', swag: 'Swag', music: 'Music', games: 'Games', speaker: 'Speaker',
  workshop: 'Workshop', prizes: 'Prizes', networking: 'Networking', other: 'Other',
}
