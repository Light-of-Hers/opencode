import { useDialog } from "@tui/ui/dialog"
import { DialogSelect } from "@tui/ui/dialog-select"
import { useRoute } from "@tui/context/route"
import { useSync } from "@tui/context/sync"
import type { GlobalSession } from "@opencode-ai/sdk/v2"
import { createMemo, createSignal, createResource, onMount } from "solid-js"
import { Locale } from "@/util/locale"
import { useTheme } from "../context/theme"
import { useSDK } from "../context/sdk"
import { DialogSessionRename } from "./dialog-session-rename"
import { createDebouncedSignal } from "../util/signal"
import { Spinner } from "./spinner"
import { useKeybind } from "../context/keybind"

export function DialogGlobalSessionList() {
  const dialog = useDialog()
  const route = useRoute()
  const sync = useSync()
  const { theme } = useTheme()
  const sdk = useSDK()
  const keybind = useKeybind()
  const [search, setSearch] = createDebouncedSignal("", 150)

  const [listed] = createResource(
    () => true,
    async () => {
      const result = await sdk.client.experimental.session.list({ roots: true, limit: 200 })
      return result.data ?? []
    },
  )

  const [searchResults] = createResource(search, async (query) => {
    if (!query) return undefined
    const result = await sdk.client.experimental.session.list({ search: query, roots: true, limit: 30 })
    return result.data ?? []
  })

  const currentSessionID = createMemo(() => (route.data.type === "session" ? route.data.sessionID : undefined))
  const sessions = createMemo<GlobalSession[]>(() => searchResults() ?? listed() ?? [])

  const options = createMemo(() => {
    const today = new Date().toDateString()
    return sessions()
      .filter((x) => x.parentID === undefined)
      .toSorted((a, b) => b.time.updated - a.time.updated)
      .map((x) => {
        const date = new Date(x.time.updated)
        let category = date.toDateString()
        if (category === today) category = "Today"
        const status = sync.data.session_status?.[x.id]
        const isWorking = status?.type === "busy"
        return {
          title: x.title,
          description: x.project?.worktree ?? x.directory,
          bg: undefined,
          value: x.id,
          category,
          footer: Locale.time(x.time.updated),
          gutter: isWorking ? <Spinner /> : undefined,
        }
      })
  })

  onMount(() => {
    dialog.setSize("large")
  })

  return (
    <DialogSelect
      title="Global Sessions"
      options={options()}
      skipFilter={true}
      current={currentSessionID()}
      onFilter={setSearch}
      onSelect={(option) => {
        route.navigate({
          type: "session",
          sessionID: option.value,
        })
        dialog.clear()
      }}
      keybind={[
        {
          keybind: keybind.all.session_rename?.[0],
          title: "rename",
          onTrigger: async (option) => {
            dialog.replace(() => <DialogSessionRename session={option.value} />)
          },
        },
      ]}
    />
  )
}
