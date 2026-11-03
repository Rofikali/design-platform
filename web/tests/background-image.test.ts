import { afterEach, describe, expect, it, vi } from "vitest";
import { prepareBackgroundImage, validateEmbeddedBackgroundImage } from "../utils/background-image";

afterEach(() => vi.unstubAllGlobals());

function pngFile(size = 16): File {
  const bytes = new Uint8Array(size);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return new File([bytes], "background.png", { type: "image/png" });
}

function stubDecoder(width: number, height: number) {
  const close = vi.fn();
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width, height, close })));
  return close;
}

describe("background image preparation", () => {
  it("accepts a decoded PNG and returns a portable embedded data URL", async () => {
    stubDecoder(1200, 800);
    const result = await prepareBackgroundImage(pngFile());
    expect(result.fit).toBe("cover");
    expect(result.data_url).toMatch(/^data:image\/png;base64,/);
  });


  it("accepts JPEG and WebP signatures independently of filename extensions", async () => {
    stubDecoder(64, 64);
    const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], "photo.bin", { type: "application/octet-stream" });
    await expect(prepareBackgroundImage(jpeg)).resolves.toMatchObject({ data_url: expect.stringMatching(/^data:image\\/jpeg;base64,/) });

    stubDecoder(64, 64);
    const webp = new File([new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])], "photo.bin", { type: "application/octet-stream" });
    await expect(prepareBackgroundImage(webp)).resolves.toMatchObject({ data_url: expect.stringMatching(/^data:image\\/webp;base64,/) });
  });

  it("rejects content that only claims to be an image by filename or MIME type", async () => {
    const fake = new File(["<svg></svg>"], "image.png", { type: "image/png" });
    await expect(prepareBackgroundImage(fake)).rejects.toThrow(/Only valid PNG, JPEG and WebP/);
  });

  it("rejects decoded images that exceed the dimension or pixel budget", async () => {
    const close = stubDecoder(5000, 1000);
    await expect(prepareBackgroundImage(pngFile())).rejects.toThrow(/4,096-pixel edge or 16-million-pixel limit/);
    expect(close).toHaveBeenCalledOnce();
  });


  it("rejects decoded images above the total pixel budget even when each edge is allowed", async () => {
    const close = stubDecoder(4096, 4096);
    await expect(prepareBackgroundImage(pngFile())).rejects.toThrow(/16-million-pixel limit/);
    expect(close).toHaveBeenCalledOnce();
  });

  it("rejects images whose embedded base64 representation exceeds the document limit", async () => {
    stubDecoder(100, 100);
    const bytes = new Uint8Array(800_000);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const large = new File([bytes], "large.png", { type: "image/png" });
    await expect(prepareBackgroundImage(large)).rejects.toThrow(/Encoded image exceeds the 1 MiB document limit/);
  });

  it("validates embedded image bytes and decoded dimensions on import", async () => {
    stubDecoder(32, 32);
    const prepared = await prepareBackgroundImage(pngFile());
    const close = stubDecoder(32, 32);
    await expect(validateEmbeddedBackgroundImage(prepared)).resolves.toBeUndefined();
    expect(close).toHaveBeenCalledOnce();
  });

  it("rejects embedded image data whose declared MIME type disagrees with its bytes", async () => {
    const image = { data_url: "data:image/jpeg;base64,iVBORw0KGgo=", fit: "cover" as const };
    await expect(validateEmbeddedBackgroundImage(image)).rejects.toThrow(/MIME type does not match/);
  });
});
