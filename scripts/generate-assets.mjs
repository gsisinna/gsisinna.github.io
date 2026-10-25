#!/usr/bin/env node
// Regenerate raster assets from their sources:
//   - public/og-default.png  (1200x630 social preview, from the profile text + avatar)
//   - public/favicon-32.png, public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png
//
//   npm run assets
//
// Social networks (LinkedIn, X, Facebook) do not render SVG previews, so these must be PNG.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (file) => join(root, "public", file);

// Keep in sync with src/data/profile.ts
const name = "Gabriele Sisinna";
const role = "Senior Robotics Software Engineer";
const tagline = ["Notes on ROS 2, simulation, C++, Python,", "and software architecture for real robots."];
const url = "gsisinna.github.io";

const mono = "JetBrains Mono, Consolas, DejaVu Sans Mono, monospace";
const sans = "IBM Plex Sans, Segoe UI, DejaVu Sans, sans-serif";

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="0.1" cy="0" r="0.9">
      <stop offset="0" stop-color="#5ee6a0" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#5ee6a0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5ee6a0"/>
      <stop offset="0.55" stop-color="#5ee6a0" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#f2c46d"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b0d0f"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="80" y="150" font-family="${mono}" font-size="28" fill="#f2c46d">$ <tspan fill="#5ee6a0">whoami</tspan></text>
  <text x="80" y="240" font-family="${mono}" font-size="72" font-weight="700" fill="#f2f5f3">${name}</text>
  <text x="80" y="300" font-family="${mono}" font-size="30" fill="#5ee6a0">${role}</text>
  <text x="80" y="390" font-family="${sans}" font-size="32" fill="#8e9993">${tagline[0]}</text>
  <text x="80" y="436" font-family="${sans}" font-size="32" fill="#8e9993">${tagline[1]}</text>
  <rect x="80" y="520" width="1040" height="1" fill="#ffffff" fill-opacity="0.1"/>
  <text x="80" y="570" font-family="${mono}" font-size="26" fill="#d9dfdb">~/<tspan fill="#f2f5f3" font-weight="700">gsisinna</tspan></text>
  <text x="1120" y="570" text-anchor="end" font-family="${mono}" font-size="26" fill="#8e9993">${url}</text>
  <circle cx="985" cy="250" r="128" fill="url(#ring)"/>
  <circle cx="985" cy="250" r="124" fill="#0b0d0f"/>
</svg>`;

const avatarSize = 232;
const avatarMask = Buffer.from(
  `<svg width="${avatarSize}" height="${avatarSize}"><circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}"/></svg>`
);
const avatar = await sharp(pub("avatar-profile.jpg"))
  .resize(avatarSize, avatarSize, { fit: "cover", position: "attention" })
  .composite([{ input: avatarMask, blend: "dest-in" }])
  .png()
  .toBuffer();

await sharp(Buffer.from(ogSvg))
  .composite([{ input: avatar, left: 985 - avatarSize / 2, top: 250 - avatarSize / 2 }])
  .png({ compressionLevel: 9 })
  .toFile(pub("og-default.png"));

const favicon = readFileSync(pub("favicon.svg"));
const icons = [
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512]
];
for (const [file, size] of icons) {
  await sharp(favicon, { density: 384 }).resize(size, size).png().toFile(pub(file));
}

console.log("Generated og-default.png and icons in public/");
