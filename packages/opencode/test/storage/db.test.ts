import { describe, expect, test } from "bun:test"
import path from "path"
import * as Database from "../../src/storage/db"

describe("Database.Path", () => {
  test("uses the shared database path by default", () => {
    const file = path.basename(Database.getChannelPath())
    expect(file).toBe("opencode.db")
  })
})
