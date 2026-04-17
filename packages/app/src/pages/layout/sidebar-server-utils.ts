const COLORS = ["pink", "mint", "orange", "purple", "cyan", "lime"] as const

export function serverRailColorFor(key: string) {
  let hash = 0
  for (let index = 0; index < key.length; index++) hash = (hash * 31 + key.charCodeAt(index)) >>> 0
  return COLORS[hash % COLORS.length]
}

export function serverRailInitials(name: string) {
  const host = name.replace(/^https?:\/\//, "").split(/[:/]/)[0]
  return host.slice(0, 2).toUpperCase()
}
