import { describe, expect, test } from "bun:test"
import { serverRailInitials } from "./sidebar-server-utils"

describe("serverRailInitials", () => {
  test("strips protocol, port, and path before taking the hostname initials", () => {
    expect(serverRailInitials("https://alpha.example.com:8080/path")).toBe("AL")
    expect(serverRailInitials("http://zeta.test")).toBe("ZE")
    expect(serverRailInitials("localhost:4096")).toBe("LO")
  })
})
