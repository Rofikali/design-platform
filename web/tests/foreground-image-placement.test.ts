import { afterEach, describe, expect, it, vi } from "vitest";
import { prepareForegroundImagePlacement } from "../utils/foreground-image-placement";

const png = "data:image/png;base64,iVBORw0KGgo=";
afterEach(() => vi.unstubAllGlobals());

function stubDecodedRaster(width: number, height: number) {
  const close = vi.fn();
  const decode = vi.fn().mockResolvedValue({ width, height, close });
  vi.stubGlobal("createImageBitmap", decode);
  return { decode, close };
}

describe("browser-local foreground image placement draft", () => {
  it("centers a small raster at original dimensions and releases decode resources", async () => {
    const { decode, close } = stubDecodedRaster(320, 240);
    const draft = await prepareForegroundImagePlacement(png, { width: 800, height: 600 });
    expect(draft).toEqual({
      data_url: png, x: 240, y: 180, width: 320, height: 240,
      intrinsic_width: 320, intrinsic_height: 240,
    });
    expect(Object.isFrozen(draft)).toBe(true);
    expect(decode).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it("fits an oversized raster inside 80% of the page without distorting its ratio", async () => {
    const { close } = stubDecodedRaster(4000, 2000);
    await expect(prepareForegroundImagePlacement(png, { width: 800, height: 600 })).resolves.toMatchObject({
      x: 80, y: 140, width: 640, height: 320,
      intrinsic_width: 4000, intrinsic_height: 2000,
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it.each([
    { width: 0, height: 600 },
    { width: Number.NaN, height: 600 },
    { width: 10001, height: 600 },
    { width: 8000, height: 8000 },
    { width: 1000, height: 1 },
  ])("rejects invalid page geometry before decoding: %o", async page => {
    const { decode } = stubDecodedRaster(100, 100);
    await expect(prepareForegroundImagePlacement(png, page)).rejects.toThrow(RangeError);
    expect(decode).not.toHaveBeenCalled();
  });

  it("rejects non-raster input before decoding", async () => {
    const { decode } = stubDecodedRaster(100, 100);
    await expect(prepareForegroundImagePlacement("https://example.org/image.png", { width: 800, height: 600 })).rejects.toThrow();
    expect(decode).not.toHaveBeenCalled();
  });

  it("rejects an impossible narrow-placement aspect without silently stretching the image", async () => {
    const { close } = stubDecodedRaster(8192, 1);
    await expect(prepareForegroundImagePlacement(png, { width: 800, height: 600 })).rejects.toThrow(RangeError);
    expect(close).toHaveBeenCalledOnce();
  });
});
