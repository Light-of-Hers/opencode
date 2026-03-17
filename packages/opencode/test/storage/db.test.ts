import { describe, expect, test } from "bun:test"
import path from "path"
import { Database } from "../../src/storage/db"

describe("Database.Path", () => {
  test("uses the shared database path by default", () => {
    const file = path.basename(Database.Path)
    expect(file).toBe("opencode.db")
  })
})
