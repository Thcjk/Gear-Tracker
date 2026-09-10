/**
 * Rastert public/icon.svg und public/icon-maskable.svg in die PNG-Grössen,
 * die manifest.json und iOS brauchen.
 *
 * Die erzeugten PNGs sind eingecheckt, das Skript wird also nur gebraucht,
 * wenn sich das Icon ändert. sharp ist bewusst keine Projekt-Abhängigkeit,
 * damit npm ci im Deploy-Workflow schlank bleibt:
 *
 *   npm i -D sharp && node scripts/generate-icons.mjs && npm un sharp
 */
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

const PUBLIC = join(process.cwd(), "public");

const targets = [
  { src: "icon.svg", out: "icon-192.png", size: 192 },
  { src: "icon.svg", out: "icon-512.png", size: 512 },
  { src: "icon.svg", out: "apple-touch-icon.png", size: 180 },
  { src: "icon-maskable.svg", out: "icon-maskable-512.png", size: 512 },
];

for (const { src, out, size } of targets) {
  const svg = await readFile(join(PUBLIC, src));
  const png = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(PUBLIC, out), png);
  console.log(`${out.padEnd(24)} ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}
