// Generates an ORIGINAL angry black-samurai-on-red avatar (generic subject, no
// copied artwork): snarling menpo war-mask, fanged grimace, furrowed glowing
// eyes and sharp horns. Run: node scripts/gen-avatar.mjs
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
      <stop offset="0.7" stop-color="#a51111"/>
      <stop offset="1" stop-color="#7a0b0b"/>
    </radialGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#160a0a"/>
      <stop offset="1" stop-color="#050303"/>
    </linearGradient>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer>
    </filter>
    <filter id="glow" x="-90%" y="-90%" width="280%" height="280%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="600" height="600" fill="url(#bg)"/>
  <rect width="600" height="600" filter="url(#paper)" opacity="0.5" style="mix-blend-mode:multiply"/>

  <g fill="url(#ink)">
    <!-- katana blade (behind, up-left) -->
    <path d="M330 470 L312 462 L120 92 L138 86 Z"/>

    <!-- sharp aggressive horns / kuwagata -->
    <path d="M262 150 C228 108 178 96 188 36 C206 66 214 96 252 128 C260 120 276 134 286 146 Z"/>
    <path d="M338 150 C372 108 422 96 412 36 C394 66 386 96 348 128 C340 120 324 134 314 146 Z"/>

    <!-- helmet dome + crest -->
    <ellipse cx="300" cy="148" rx="76" ry="60"/>
    <path d="M300 86 L289 150 L311 150 Z"/>

    <!-- neck guard / shikoro (flared, stepped) -->
    <path d="M230 166 L370 166 L400 252 L200 252 Z"/>

    <!-- shoulders + torso -->
    <path d="M300 230 C244 236 212 262 204 314
             C148 324 106 362 100 434 L100 600 L500 600 L500 434
             C494 362 452 324 396 314 C388 262 356 236 300 230 Z"/>

    <!-- katana hilt over body -->
    <path d="M326 470 L300 522 L320 530 L346 478 Z"/>
  </g>

  <!-- menpo war-mask (snarling), slightly lifted off the dark -->
  <path d="M250 170 C244 206 258 240 300 252 C342 240 356 206 350 170 Z" fill="#1d0c0c"/>

  <!-- furrowed angry brows -->
  <g fill="#0a0505">
    <path d="M246 162 L300 182 L300 192 L248 176 Z"/>
    <path d="M354 162 L300 182 L300 192 L352 176 Z"/>
  </g>

  <!-- snarling fanged mouth -->
  <path d="M266 206 L334 206 L327 232 L273 232 Z" fill="#070303"/>
  <g fill="#e9dcae">
    <!-- upper teeth -->
    <path d="M270 207 L278 219 L286 207 L294 219 L300 207 L306 219 L314 207 L322 219 L330 207
             L330 210 L270 210 Z"/>
    <!-- fangs -->
    <path d="M276 209 L283 209 L281 236 Z"/>
    <path d="M324 209 L317 209 L319 236 Z"/>
  </g>
  <!-- scowl lines -->
  <g fill="#0a0505">
    <path d="M262 188 L276 204 L270 206 L258 192 Z"/>
    <path d="M338 188 L324 204 L330 206 L342 192 Z"/>
  </g>

  <!-- armor lacing / plate lines -->
  <g stroke="#3a0d0d" stroke-width="3" fill="none" opacity="0.8">
    <path d="M148 362 H452"/>
    <path d="M124 412 H476"/>
    <path d="M118 464 H482"/>
    <path d="M114 518 H486"/>
    <path d="M300 362 V600"/>
  </g>
  <ellipse cx="332" cy="468" rx="16" ry="6" fill="#2a0808" transform="rotate(-28 332 468)"/>
  <path d="M330 470 L138 86" stroke="#7a1a1a" stroke-width="2" opacity="0.7"/>

  <!-- fierce glowing eyes (narrow, angled down to the nose) -->
  <g fill="#ffcf3a" filter="url(#glow)">
    <path d="M260 174 L294 188 L292 196 L262 184 Z"/>
    <path d="M340 174 L306 188 L308 196 L338 184 Z"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`wrote ${out}`);
