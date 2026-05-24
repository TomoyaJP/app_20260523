import { normalizeQueryText } from "@/lib/normalize-query";
import { describe, expect, it } from "vitest";

describe("normalizeQueryText", () => {
  it("lowercases and trims japanese punctuation spacing", () => {
    expect(normalizeQueryText("  イベント　管理ツール が欲しい  ")).toMatch(/イベント/);
  });
});
