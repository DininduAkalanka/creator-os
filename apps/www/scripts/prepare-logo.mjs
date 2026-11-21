/**
 * Traces the brand logo PNGs in media-src/brand/ (git-ignored) into crisp, recolourable vector
 * paths, and writes the favicon and the Apple touch icon.
 *
 *   pnpm --filter @creatoros/www logo
 *
 * Inputs (as supplied by the founder, dark logo on a near-white background):
 *   logo-full.png    the symbol with the name
 *   logo-symbol.png  the symbol only
 * Outputs (committed):
 *   src/components/brand-paths.ts  path data for <Logo>, <LogoSymbol> and <Wordmark>
 *   src/app/icon.svg               favicon: the symbol on a white rounded tile
 *   src/app/apple-icon.png         180 x 180 home-screen icon
 *
 * Each colour is traced on its own: the navy "ink" and the red "accent". The site can then show
 * the ink light on dark backgrounds and keep the accent red. Method: a coverage field per colour,
 * contours at 50% coverage with marching squares (sub-pixel accurate), simplified with
 * Ramer-Douglas-Peucker. Replace with the designer's original vector files when they exist.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const input = join(root, "media-src", "brand");

// Brand colours, sampled from the supplied PNGs (see the design doc).
const INK = "#0b0a47";
const ACCENT = "#fe4d49";
const BACKGROUND = 248; // the PNGs' near-white background, per channel
const INK_RED = 11; // the navy's red channel
const ACCENT_SPREAD = 254 - 73; // red minus blue, in the accent red

const TOLERANCE = 0.3; // simplification, in source pixels (the PNGs are 2000 px wide)
const MIN_AREA = 40; // drops specks, in square source pixels
// The PNGs have soft, slightly noisy edges: a light blur first, so the outline follows the shape
// rather than the noise (it rounds true corners by well under a pixel).
const SOFTEN = 1.2;

const clamp = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);

async function load(file) {
  const { data, info } = await sharp(join(input, file))
    .removeAlpha()
    .blur(SOFTEN)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const ink = new Float32Array(width * height);
  const accent = new Float32Array(width * height);
  for (let pixel = 0, i = 0; pixel < width * height; pixel++, i += channels) {
    const red = data[i];
    const blue = data[i + 2];
    // Navy has almost no red; the background and the red accent have a lot.
    ink[pixel] = clamp((BACKGROUND - red) / (BACKGROUND - INK_RED));
    // The accent has far more red than blue; navy and the grey background do not.
    accent[pixel] = clamp((red - blue) / ACCENT_SPREAD);
  }
  return { width, height, ink, accent };
}

/** Closed outlines where the field crosses 0.5 (marching squares, linear interpolation). */
function trace(field, width, height) {
  const W = width + 2; // one pixel of padding on every side, so every outline closes
  const H = height + 2;
  const value = new Float32Array(W * H);
  for (let y = 0; y < height; y++) {
    value.set(field.subarray(y * width, (y + 1) * width), (y + 1) * W + 1);
  }
  const at = (x, y) => value[y * W + x];
  const level = 0.5;
  const points = new Map(); // edge id -> crossing point
  const links = new Map(); // edge id -> linked edge ids

  const horizontal = (x, y) => {
    const id = (y * W + x) * 2;
    if (!points.has(id)) {
      const a = at(x, y);
      points.set(id, [x + (level - a) / (at(x + 1, y) - a), y]);
    }
    return id;
  };
  const vertical = (x, y) => {
    const id = (y * W + x) * 2 + 1;
    if (!points.has(id)) {
      const a = at(x, y);
      points.set(id, [x, y + (level - a) / (at(x, y + 1) - a)]);
    }
    return id;
  };
  const link = (a, b) => {
    (links.get(a) ?? links.set(a, []).get(a)).push(b);
    (links.get(b) ?? links.set(b, []).get(b)).push(a);
  };

  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const tl = at(x, y) > level;
      const tr = at(x + 1, y) > level;
      const br = at(x + 1, y + 1) > level;
      const bl = at(x, y + 1) > level;
      const index = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (index === 0 || index === 15) continue;
      const top = () => horizontal(x, y);
      const bottom = () => horizontal(x, y + 1);
      const left = () => vertical(x, y);
      const right = () => vertical(x + 1, y);
      const centre = (at(x, y) + at(x + 1, y) + at(x + 1, y + 1) + at(x, y + 1)) / 4 > level;
      switch (index) {
        case 1:
        case 14:
          link(left(), bottom());
          break;
        case 2:
        case 13:
          link(bottom(), right());
          break;
        case 3:
        case 12:
          link(left(), right());
          break;
        case 4:
        case 11:
          link(top(), right());
          break;
        case 6:
        case 9:
          link(top(), bottom());
          break;
        case 7:
        case 8:
          link(left(), top());
          break;
        case 5: // saddle: top-right and bottom-left inside
          if (centre) {
            link(left(), top());
            link(right(), bottom());
          } else {
            link(top(), right());
            link(left(), bottom());
          }
          break;
        case 10: // saddle: top-left and bottom-right inside
          if (centre) {
            link(top(), right());
            link(left(), bottom());
          } else {
            link(left(), top());
            link(right(), bottom());
          }
          break;
      }
    }
  }

  const loops = [];
  const seen = new Set();
  for (const start of links.keys()) {
    if (seen.has(start)) continue;
    const loop = [];
    let previous = -1;
    let current = start;
    while (current !== undefined && !seen.has(current)) {
      seen.add(current);
      const [px, py] = points.get(current);
      loop.push([px - 0.5, py - 0.5]); // back to image coordinates (pixel centres)
      const next = (links.get(current) ?? []).find((id) => id !== previous && !seen.has(id));
      previous = current;
      current = next;
    }
    if (loop.length >= 3 && Math.abs(area(loop)) >= MIN_AREA) loops.push(simplify(loop));
  }
  return loops;
}

function area(loop) {
  let sum = 0;
  for (let i = 0; i < loop.length; i++) {
    const [x1, y1] = loop[i];
    const [x2, y2] = loop[(i + 1) % loop.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

/** Ramer-Douglas-Peucker on a closed outline: split at the point farthest from the first. */
function simplify(loop) {
  let far = 0;
  let best = -1;
  for (let i = 1; i < loop.length; i++) {
    const d = (loop[i][0] - loop[0][0]) ** 2 + (loop[i][1] - loop[0][1]) ** 2;
    if (d > best) {
      best = d;
      far = i;
    }
  }
  const first = rdp(loop.slice(0, far + 1));
  const second = rdp([...loop.slice(far), loop[0]]);
  return [...first.slice(0, -1), ...second.slice(0, -1)];
}

function rdp(points) {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const length = Math.hypot(bx - ax, by - ay) || 1;
  let index = 0;
  let distance = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const d = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / length;
    if (d > distance) {
      distance = d;
      index = i;
    }
  }
  if (distance <= TOLERANCE) return [points[0], points[points.length - 1]];
  return [...rdp(points.slice(0, index + 1)).slice(0, -1), ...rdp(points.slice(index))];
}

function bounds(loops) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const loop of loops) {
    for (const [x, y] of loop) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

/** Compact SVG path data: absolute start, relative lines, one decimal, no leading zeros. */
function pathData(loops, dx, dy, scale) {
  const n = (v) => {
    const s = (Math.round(v * 10) / 10).toString();
    return s.replace(/^(-?)0\./, "$1.");
  };
  const join = (values) =>
    values.map((v, i) => (i === 0 || v.startsWith("-") ? v : ` ${v}`)).join("");
  return loops
    .map((loop) => {
      const rounded = loop.map(([x, y]) => [
        Math.round((x - dx) * scale * 10) / 10,
        Math.round((y - dy) * scale * 10) / 10,
      ]);
      const parts = [`M${join([n(rounded[0][0]), n(rounded[0][1])])}l`];
      const deltas = [];
      for (let i = 1; i < rounded.length; i++) {
        deltas.push(n(rounded[i][0] - rounded[i - 1][0]), n(rounded[i][1] - rounded[i - 1][1]));
      }
      return parts[0] + join(deltas) + "z";
    })
    .join("");
}

/**
 * Path data for a set of ink and accent outlines, in source pixels (one decimal), moved to the
 * origin. Source pixels keep the detail: rounding a scaled-down copy made the curves faceted.
 */
function asset(ink, accent) {
  const box = bounds([...ink, ...accent]);
  return {
    width: Math.round((box.maxX - box.minX) * 10) / 10,
    height: Math.round((box.maxY - box.minY) * 10) / 10,
    ink: pathData(ink, box.minX, box.minY, 1),
    accent: pathData(accent, box.minX, box.minY, 1),
  };
}

// --- Trace -------------------------------------------------------------------------------

const full = await load("logo-full.png");
const fullInk = trace(full.ink, full.width, full.height);
const fullAccent = trace(full.accent, full.width, full.height);

const symbolImage = await load("logo-symbol.png");
const symbolInk = trace(symbolImage.ink, symbolImage.width, symbolImage.height);
const symbolAccent = trace(symbolImage.accent, symbolImage.width, symbolImage.height);

// The name is the ink to the right of the widest empty column between the symbol and the text.
const spans = fullInk
  .map((loop) => {
    const box = bounds([loop]);
    return [box.minX, box.maxX];
  })
  .sort((a, b) => a[0] - b[0]);
let split = 0;
let gap = 0;
let reach = spans[0][1];
for (const [start, end] of spans.slice(1)) {
  if (start - reach > gap) {
    gap = start - reach;
    split = (start + reach) / 2;
  }
  reach = Math.max(reach, end);
}
const nameInk = fullInk.filter((loop) => bounds([loop]).minX > split);

const logo = asset(fullInk, fullAccent);
const symbol = asset(symbolInk, symbolAccent);
const wordmark = asset(nameInk, []);

const header = `// Generated by scripts/prepare-logo.mjs from media-src/brand/*.png. Do not edit by hand.
// Traced from the founder's PNG logo; replace with the designer's vector files when they exist.

/** One logo drawing: a viewBox of 0 0 width height, and path data per colour. */
export type LogoPaths = { width: number; height: number; ink: string; accent: string };
`;
const entry = (name, doc, value) =>
  `\n/** ${doc} */\nexport const ${name}: LogoPaths = ${JSON.stringify(value, null, 2)};\n`;
writeFileSync(
  join(root, "src", "components", "brand-paths.ts"),
  header +
    entry("LOGO_FULL", "The symbol with the name (the main logo).", logo) +
    entry("LOGO_SYMBOL", "The symbol only.", symbol) +
    entry("LOGO_WORDMARK", "The name only, as set in the logo.", wordmark),
);

// Favicon: the symbol on a white rounded tile, so it reads on light and dark browser tabs.
const tile = 64;
const inset = 7;
const fit = Math.min((tile - inset * 2) / symbol.width, (tile - inset * 2) / symbol.height);
const ox = (tile - symbol.width * fit) / 2;
const oy = (tile - symbol.height * fit) / 2;
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tile} ${tile}"><rect width="${tile}" height="${tile}" rx="14" fill="#ffffff"/><g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${fit.toFixed(4)})"><path fill="${INK}" fill-rule="evenodd" d="${symbol.ink}"/><path fill="${ACCENT}" fill-rule="evenodd" d="${symbol.accent}"/></g></svg>\n`;
writeFileSync(join(root, "src", "app", "icon.svg"), iconSvg);
await sharp(Buffer.from(iconSvg.replace('rx="14" ', "")), { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(join(root, "src", "app", "apple-icon.png"));

const size = (value) => `${(Buffer.byteLength(JSON.stringify(value)) / 1024).toFixed(1)} KB`;
console.log(`logo      ${logo.width} x ${logo.height}  ${size(logo)}`);
console.log(`symbol    ${symbol.width} x ${symbol.height}  ${size(symbol)}`);
console.log(`wordmark  ${wordmark.width} x ${wordmark.height}  ${size(wordmark)}`);
console.log(
  `icon.svg  ${(Buffer.byteLength(iconSvg) / 1024).toFixed(1)} KB, apple-icon.png 180 x 180`,
);
