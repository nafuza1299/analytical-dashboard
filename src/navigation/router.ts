import { useSyncExternalStore } from 'react'

// pushState doesn't fire popstate on its own, so dispatch one synthetically
// to notify useLocationSignal's subscribers and force a re-render.
export function navigate(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useLocationSignal() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('popstate', onChange)
      return () => window.removeEventListener('popstate', onChange)
    },
    () => window.location.pathname + window.location.search,
  )
}
