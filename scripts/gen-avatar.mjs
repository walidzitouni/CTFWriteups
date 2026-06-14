// Generates an ORIGINAL Dexter-mood avatar: a noir silhouette over a blood
// spatter (no copyrighted artwork / likeness). Run: node scripts/gen-avatar.mjs
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "../src/assets/images/avatar.png");

// scattered blood droplets for the spatter
let droplets = "";
const seedRand = (() => {
	let s = 1337;
	return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
})();
for (let i = 0; i < 70; i++) {
	const x = 30 + seedRand() * 340;
	const y = 20 + seedRand() * 200;
	const r = 1 + seedRand() * (i % 9 === 0 ? 12 : 5);
	const o = 0.35 + seedRand() * 0.5;
	droplets += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#8a0f0f" opacity="${o.toFixed(2)}"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0" stop-color="#2a0c0e"/>
      <stop offset="0.6" stop-color="#160708"/>
      <stop offset="1" stop-color="#0b0405"/>
    </radialGradient>
    <filter id="spat" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.07" numOctaves="2" seed="9" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="20" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff2a36"/>
      <stop offset="1" stop-color="#7a0d0d"/>
    </linearGradient>
  </defs>

  <rect width="400" height="400" fill="url(#bg)"/>

  <!-- blood spatter -->
  <g filter="url(#spat)">${droplets}</g>

  <!-- thin drips -->
  <g fill="#7a0d0d" opacity="0.55">
    <rect x="120" y="40" width="2.5" height="60" rx="1"/>
    <rect x="250" y="60" width="2" height="44" rx="1"/>
    <rect x="300" y="30" width="2" height="80" rx="1"/>
  </g>

  <!-- red rim light (offset silhouette) -->
  <g transform="translate(-4,0)" fill="url(#rim)">
    <path d="M200 150 C152 150 150 200 158 232 C120 250 96 286 92 360 L92 400 L308 400 L308 360 C304 286 280 250 242 232 C250 200 248 150 200 150 Z"/>
  </g>

  <!-- silhouette -->
  <g fill="#070405">
    <path d="M200 150 C152 150 150 200 158 232 C120 250 96 286 92 360 L92 400 L308 400 L308 360 C304 286 280 250 242 232 C250 200 248 150 200 150 Z"/>
  </g>

  <!-- vignette -->
  <rect width="400" height="400" fill="none"/>
  <rect width="400" height="400" fill="url(#bg)" opacity="0" />
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`wrote ${out}`);
