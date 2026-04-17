let nav: ((href: string) => void) | undefined

export const setNavigate = (fn: (href: string) => void) => {
  nav = fn
}

export const handleNotificationClick = (href?: string) => {
  window.focus()
  if (!href) return
  if (nav) return nav(href)
  console.warn("notification-click: navigate function not set, falling back to window.location.assign")
  if (typeof window.location.assign === "function") return window.location.assign(href)
  try {
    window.history.pushState?.({}, "", href)
  } catch {
    // Non-browser test environments may not expose a writable location implementation.
  }
}
