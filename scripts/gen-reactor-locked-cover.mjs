// Redacted cover for the locked Reactor post (no technique spoilers).
// Run: node scripts/gen-reactor-locked-cover.mjs
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/covers");
mkdirSync(outDir, { recursive: true });

const W = 1200;
const H = 630;

// redaction bars
let bars = "";
for (let i = 0; i < 5; i++) {
	const y = 150 + i * 26;
	const w = 360 + ((i * 137) % 360);
	const x = 120 + ((i * 90) % 200);
	bars += `<rect x="${x}" y="${y}" width="${w}" height="14" rx="3" fill="#000" opacity="0.85"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a0e10"/>
      <stop offset="1" stop-color="#0b0708"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ff2a36" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="#ff2a36"/>

  ${bars}

  <text x="${W / 2}" y="420" text-anchor="middle" font-family="monospace" font-size="120">🔒</text>
  <text x="${W / 2}" y="500" text-anchor="middle" font-family="monospace" font-size="40" font-weight="800" fill="#fff" letter-spacing="6">ACCESS RESTRICTED</text>
  <text x="${W / 2}" y="545" text-anchor="middle" font-family="monospace" font-size="22" fill="#ff7a6a" letter-spacing="4">ACTIVE MACHINE · SEALED UNTIL RETIREMENT</text>

  <text x="40" y="64" font-family="monospace" font-size="22" fill="#ff2a36" opacity="0.85">// CLASSIFIED — DARYX</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(resolve(outDir, "htb-reactor-locked.png"));
console.log("wrote covers/htb-reactor-locked.png");
