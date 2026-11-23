import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decodeForegroundImageDimensions,
  MAX_FOREGROUND_IMAGE_DIMENSION,
  MAX_FOREGROUND_IMAGE_PIXELS,
} from "../utils/foreground-image-decode";

const png = "data:image/png;base64,iVBORw0KGgo=";
afterEach(() => vi.unstubAllGlobals());

describe("foreground raster browser decode boundary", () => {
  it("returns decoded dimensions and always closes the bitmap", async () => {
    const close = vi.fn();
    const decode = vi.fn().mockResolvedValue({ width: 320, height: 240, close });
    vi.stubGlobal("createImageBitmap", decode);
    await expect(decodeForegroundImageDimensions(png)).resolves.toEqual({ width: 320, height: 240 });
    expect(decode).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    const blob = decode.mock.calls[0]![0] as Blob;
    expect(blob.type).toBe("image/png");
  });

  it("rejects malformed input before invoking the browser decoder", async () => {
    const decode = vi.fn();
    vi.stubGlobal("createImageBitmap", decode);
    await expect(decodeForegroundImageDimensions("https://example.org/image.png")).rejects.toThrow();
    expect(decode).not.toHaveBeenCalled();
  });

  it.each([
    [0, 100], [100, 0], [MAX_FOREGROUND_IMAGE_DIMENSION + 1, 1],
    [1, MAX_FOREGROUND_IMAGE_DIMENSION + 1], [5000, 4000],
    [Number.NaN, 1],
  ])("rejects unsupported decoded dimensions %s x %s and releases resources", async (width, height) => {
    const close = vi.fn();
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width, height, close }));
    await expect(decodeForegroundImageDimensions(png)).rejects.toThrow(RangeError);
    expect(close).toHaveBeenCalledOnce();
  });

  it("accepts a decoded image at the pixel ceiling", async () => {
    const close = vi.fn();
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 4000, height: MAX_FOREGROUND_IMAGE_PIXELS / 4000, close }));
    await expect(decodeForegroundImageDimensions(png)).resolves.toEqual({ width: 4000, height: 4000 });
    expect(close).toHaveBeenCalledOnce();
  });

  it("propagates corrupt image decode failures", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("decode failed")));
    await expect(decodeForegroundImageDimensions(png)).rejects.toThrow("decode failed");
  });

  it("rejects browsers without an image decoder", async () => {
    vi.stubGlobal("createImageBitmap", undefined);
    await expect(decodeForegroundImageDimensions(png)).rejects.toThrow("cannot decode");
  });
});
