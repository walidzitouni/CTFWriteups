// Generates a themed cover image for the HTB Reactor writeup.
// Run: node scripts/gen-reactor-cover.mjs
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/covers");
mkdirSync(outDir, { recursive: true });

const W = 1200;
const H = 630;

const rings = Array.from({ length: 5 })
	.map((_, i) => {
		const r = 70 + i * 52;
		const op = 0.5 - i * 0.07;
		return `<circle cx="${W / 2}" cy="300" r="${r}" fill="none" stroke="#ff2a36" stroke-opacity="${op}" stroke-width="${i === 0 ? 6 : 2}" stroke-dasharray="${i % 2 ? "10 12" : "none"}"/>`;
	})
	.join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a0e10"/>
      <stop offset="1" stop-color="#0b0708"/>
    </linearGradient>
    <radialGradient id="core" cx="0.5" cy="0.48" r="0.5">
      <stop offset="0" stop-color="#ff5a4a" stop-opacity="0.55"/>
      <stop offset="0.5" stop-color="#b3121c" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#b3121c" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ff2a36" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <circle cx="${W / 2}" cy="300" r="300" fill="url(#core)"/>
  ${rings}
  <circle cx="${W / 2}" cy="300" r="22" fill="#ff5a4a"/>

  <text x="${W / 2}" y="430" text-anchor="middle" font-family="monospace" font-size="92" font-weight="800" fill="#fff" letter-spacing="6">REACTOR</text>
  <text x="${W / 2}" y="478" text-anchor="middle" font-family="monospace" font-size="26" fill="#ff7a6a" letter-spacing="4">HTB · CVE-2025-55182 · React2Shell RCE</text>
  <text x="${W / 2}" y="560" text-anchor="middle" font-family="monospace" font-size="22" fill="#ffffff" opacity="0.5" letter-spacing="3">// writeup by Daryx</text>

  <text x="40" y="64" font-family="monospace" font-size="22" fill="#ff2a36" opacity="0.8">root@reactor:~#</text>
  <rect x="0" y="0" width="${W}" height="6" fill="#ff2a36"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(resolve(outDir, "htb-reactor.png"));
console.log("wrote covers/htb-reactor.png");
