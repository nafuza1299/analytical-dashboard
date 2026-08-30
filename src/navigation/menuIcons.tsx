import type { ReactNode } from 'react'

const stroke = (paths: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    {paths}
  </svg>
)

// Reverse-lookup by menu key so SideNav items get one icon per category
// instead of the generic bullet dot it falls back to.
export const MENU_ICONS: Record<string, ReactNode> = {
  economy: stroke(<path d="M3 3v18h18M18 9l-5 5-4-4-3 3" />),
  health: stroke(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />),
  education: stroke(<path d="M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />),
  environment: stroke(<path d="M11 20A7 7 0 0 1 4 13V5a7 7 0 0 1 7 7v8ZM11 20a7 7 0 0 0 7-7V5a7 7 0 0 0-7 7" />),
}
