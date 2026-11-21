import assert from "node:assert/strict";
import { test } from "node:test";
import { alignToPage } from "../utils/element-alignment.ts";

test("page alignment preserves identity fields and original frozen geometry", () => {
  const source = Object.freeze({ id: "text-1", type: "text", x: 12, y: 17, width: 20, height: 10 });
  const page = { width: 100, height: 80 };
  assert.deepEqual(alignToPage(source, page, "left"), { ...source, x: 0 });
  assert.deepEqual(alignToPage(source, page, "center-horizontal"), { ...source, x: 40 });
  assert.deepEqual(alignToPage(source, page, "right"), { ...source, x: 80 });
  assert.deepEqual(alignToPage(source, page, "top"), { ...source, y: 0 });
  assert.deepEqual(alignToPage(source, page, "center-vertical"), { ...source, y: 35 });
  assert.deepEqual(alignToPage(source, page, "bottom"), { ...source, y: 70 });
  assert.equal(source.x, 12);
  assert.equal(source.y, 17);
});

test("alignment no-op preserves reference; invalid geometry cannot enter history", () => {
  const source = Object.freeze({ id: "frame-1", x: 0, y: 10, width: 20, height: 20 });
  assert.equal(alignToPage(source, { width: 100, height: 80 }, "left"), source);
  assert.throws(() => alignToPage(source, { width: 10, height: 80 }, "right"), RangeError);
  assert.throws(() => alignToPage({ ...source, x: NaN }, { width: 100, height: 80 }, "top"), RangeError);
  assert.throws(() => alignToPage(source, { width: 100, height: 80 }, "diagonal" as never), RangeError);
});
