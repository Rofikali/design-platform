import { describe, expect, it, vi } from "vitest";
import { loadLocalDocument, saveLocalDocument, type LocalStorageLike } from "../utils/local-document-storage";

function fakeStorage(initial: Record<string, string> = {}): LocalStorageLike {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  };
}

describe("loadLocalDocument", () => {
  it("returns saved content and distinguishes an empty key", () => {
    const storage = fakeStorage({ "design:v1": '{"schema_version":1}' });
    expect(loadLocalDocument("design:v1", () => storage)).toEqual({
      status: "loaded",
      value: '{"schema_version":1}',
    });
    expect(loadLocalDocument("missing", () => storage)).toEqual({ status: "empty" });
  });

  it("contains failures while accessing or reading browser storage", () => {
    expect(loadLocalDocument("design:v1", () => { throw new Error("blocked"); }))
      .toEqual({ status: "unavailable" });
    const brokenStorage: LocalStorageLike = {
      getItem: () => { throw new Error("denied"); },
      setItem: vi.fn(),
    };
    expect(loadLocalDocument("design:v1", () => brokenStorage)).toEqual({ status: "unavailable" });
  });
});

describe("saveLocalDocument", () => {
  it("saves content at the UTF-8 byte limit and reports success", () => {
    const storage = fakeStorage();
    expect(saveLocalDocument("design:v1", "1234", 4, () => storage)).toEqual({ status: "saved" });
    expect(storage.getItem("design:v1")).toBe("1234");
  });

  it("rejects content above the limit without touching storage", () => {
    const setItem = vi.fn();
    const storage: LocalStorageLike = { getItem: () => null, setItem };
    expect(saveLocalDocument("design:v1", "12345", 4, () => storage)).toEqual({ status: "too-large" });
    expect(setItem).not.toHaveBeenCalled();
  });

  it("counts multi-byte text as UTF-8 bytes rather than UTF-16 code units", () => {
    const setItem = vi.fn();
    const storage: LocalStorageLike = { getItem: () => null, setItem };
    // A single emoji is 2 UTF-16 code units but 4 UTF-8 bytes.
    expect("😀".length).toBe(2);
    expect(new TextEncoder().encode("😀").byteLength).toBe(4);
    expect(saveLocalDocument("design:v1", "😀", 3, () => storage)).toEqual({ status: "too-large" });
    expect(setItem).not.toHaveBeenCalled();
    expect(saveLocalDocument("design:v1", "😀", 4, () => storage)).toEqual({ status: "saved" });
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it("contains storage provider and quota/security failures", () => {
    expect(saveLocalDocument("design:v1", "x", 4, () => { throw new Error("blocked"); }))
      .toEqual({ status: "unavailable" });
    const brokenStorage: LocalStorageLike = {
      getItem: () => null,
      setItem: () => { throw new Error("quota exceeded"); },
    };
    expect(saveLocalDocument("design:v1", "x", 4, () => brokenStorage)).toEqual({ status: "unavailable" });
  });
});
