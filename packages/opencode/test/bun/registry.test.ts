import { describe, expect, spyOn, test } from "bun:test"
import { PackageRegistry } from "../../src/bun/registry"

describe("PackageRegistry.isOutdated", () => {
  test("treats invalid cached preview version as outdated", async () => {
    const spy = spyOn(PackageRegistry, "info").mockResolvedValue("1.2.27")
    expect(await PackageRegistry.isOutdated("@opencode-ai/plugin", "0.0.0-crz/dev-202603171248")).toBe(true)
    spy.mockRestore()
  })

  test("returns false when latest version cannot be resolved", async () => {
    const spy = spyOn(PackageRegistry, "info").mockResolvedValue(null)
    expect(await PackageRegistry.isOutdated("@opencode-ai/plugin", "1.2.27")).toBe(false)
    spy.mockRestore()
  })
})
