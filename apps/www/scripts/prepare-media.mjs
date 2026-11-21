/**
 * Turns the large original photos and video posters in media-src/ (git-ignored, about 3 MB each)
 * into web-ready JPEGs in src/assets/media/ (committed). Next.js <Image> then serves them as
 * AVIF/WebP at the size each screen needs.
 *
 * Run after adding or replacing a file in media-src/:
 *   pnpm --filter @creatoros/www media
 */
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const input = join(root, "media-src");
const output = join(root, "src", "assets", "media");
// Widest size any layout shows (full-bleed hero on large screens).
const MAX_WIDTH = 2000;

mkdirSync(output, { recursive: true });
const files = readdirSync(input).filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
if (files.length === 0) throw new Error(`No images in ${input}`);

for (const file of files) {
  const target = join(output, `${basename(file, extname(file))}.jpg`);
  const info = await sharp(join(input, file))
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toFile(target);
  const before = statSync(join(input, file)).size;
  console.log(`${file.padEnd(28)} ${info.width}x${info.height}  ${kb(before)} -> ${kb(info.size)}`);
}

function kb(bytes) {
  return `${Math.round(bytes / 1024).toLocaleString("en")} KB`;
}
