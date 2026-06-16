// Generates an ORIGINAL black-samurai-on-red avatar (generic subject, no copied
// artwork). Run: node scripts/gen-avatar.mjs
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Served at a stable, unhashed URL (/avatar.png).
const out = resolve(__dirname, "../public/avatar.png");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.4" r="0.9">
      <stop offset="0" stop-color="#d11a1a"/>
      <stop offset="0.7" stop-color="#a81212"/>
      <stop offset="1" stop-color="#7e0c0c"/>
    </radialGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#140909"/>
      <stop offset="1" stop-color="#070404"/>
    </linearGradient>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer>
    </filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="600" height="600" fill="url(#bg)"/>
  <rect width="600" height="600" filter="url(#paper)" opacity="0.5" style="mix-blend-mode:multiply"/>

  <g fill="url(#ink)">
    <!-- katana blade (behind body, up-left) -->
    <path d="M330 470 L312 462 L120 92 L138 86 Z"/>
    <!-- horns / kuwagata -->
    <path d="M262 150 C236 116 196 92 198 50 C214 78 248 116 280 142 Z"/>
    <path d="M338 150 C364 116 404 92 402 50 C386 78 352 116 320 142 Z"/>
    <!-- helmet dome -->
    <ellipse cx="300" cy="150" rx="74" ry="62"/>
    <!-- small center crest -->
    <path d="M300 92 L290 150 L310 150 Z"/>
    <!-- neck guard / shikoro (flared, stepped) -->
    <path d="M232 168 L368 168 L398 252 L202 252 Z"/>
    <!-- face mask band -->
    <rect x="244" y="158" width="112" height="44" rx="10"/>
    <!-- shoulders + torso -->
    <path d="M300 232 C246 238 214 262 206 312
             C150 322 108 360 102 432 L102 600 L498 600 L498 432
             C492 360 450 322 394 312 C386 262 354 238 300 232 Z"/>
    <!-- katana hilt over body -->
    <path d="M326 470 L300 520 L320 528 L346 478 Z"/>
  </g>

  <!-- armor lacing / plate lines -->
  <g stroke="#3a0d0d" stroke-width="3" fill="none" opacity="0.8">
    <path d="M150 360 H450"/>
    <path d="M126 410 H474"/>
    <path d="M120 462 H480"/>
    <path d="M116 516 H484"/>
    <path d="M300 360 V600"/>
  </g>
  <!-- tsuba (sword guard) -->
  <ellipse cx="332" cy="468" rx="16" ry="6" fill="#2a0808" transform="rotate(-28 332 468)"/>
  <!-- blade edge highlight -->
  <path d="M330 470 L138 86" stroke="#7a1a1a" stroke-width="2" opacity="0.7"/>

  <!-- glowing eyes -->
  <g fill="#fff4cf" filter="url(#glow)">
    <ellipse cx="278" cy="180" rx="15" ry="6" transform="rotate(-12 278 180)"/>
    <ellipse cx="322" cy="180" rx="15" ry="6" transform="rotate(12 322 180)"/>
  </g>

  <rect width="600" height="600" fill="none"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`wrote ${out}`);
