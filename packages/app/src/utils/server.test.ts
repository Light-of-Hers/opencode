import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test"

let createSdkForServer: typeof import("./server").createSdkForServer
const createdClients: Array<Record<string, unknown>> = []

beforeAll(async () => {
  mock.module("@opencode-ai/sdk/v2/client", () => ({
    createOpencodeClient: (input: Record<string, unknown>) => {
      createdClients.push(input)
      return { input }
    },
  }))

  Object.defineProperty(globalThis, "location", {
    value: new URL("https://gateway.test/app"),
    configurable: true,
  })
  document.head.innerHTML = '<meta name="opencode-gateway" content="true">'

  ;({ createSdkForServer } = await import("./server"))
})

beforeEach(() => {
  createdClients.length = 0
  document.head.innerHTML = '<meta name="opencode-gateway" content="true">'
})

describe("createSdkForServer", () => {
  test("uses shared gateway proxy fetchers keyed by gateway server", () => {
    const server = { url: "http://backend.test", username: "user", password: "secret" }
    const origin = globalThis.location.origin

    createSdkForServer({ server, gatewayKey: "alpha" })
    createSdkForServer({ server, gatewayKey: "alpha" })

    expect(createdClients).toHaveLength(2)
    expect(createdClients[0].baseUrl).toBe(`${origin}/s/alpha`)
    expect(createdClients[0].fetch).toBe(createdClients[1].fetch)
    expect((createdClients[0].headers as Record<string, string | undefined>)?.Authorization).toBeUndefined()
  })

  test("batches gateway GET requests through the proxy batch endpoint", async () => {
    const origin = globalThis.location.origin
    const fetchMock = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
      expect(url).toBe(`${origin}/s/beta/_batch`)
      expect(init?.method).toBe("POST")
      expect(init?.headers).toEqual({ "Content-Type": "application/json" })
      expect(JSON.parse(String(init?.body))).toEqual([
        { method: "GET", path: "/provider", headers: {} },
        { method: "GET", path: "/command?cursor=2", headers: {} },
      ])

      return new Response(
        JSON.stringify([
          { status: 200, headers: { "content-type": "application/json" }, body: '{"ok":1}' },
          { status: 200, headers: { "content-type": "application/json" }, body: '{"ok":2}' },
        ]),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      )
    })

    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch

    createSdkForServer({ server: { url: "http://backend.test" }, gatewayKey: "beta" })

    const batchFetch = createdClients[0].fetch as ((input: Request) => Promise<Response>) | undefined
    expect(batchFetch).toBeDefined()

    const [provider, command] = await Promise.all([
      batchFetch!(new Request(`${origin}/s/beta/provider`)),
      batchFetch!(new Request(`${origin}/s/beta/command?cursor=2`)),
    ])

    expect(fetchMock.mock.calls).toHaveLength(1)
    expect(await provider.json()).toEqual({ ok: 1 })
    expect(await command.json()).toEqual({ ok: 2 })
  })
})
