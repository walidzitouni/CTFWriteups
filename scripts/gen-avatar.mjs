// Generates an ORIGINAL menacing red-on-black cat avatar (theme-matched,
// no copied artwork). Run: node scripts/gen-avatar.mjs
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Written to /public so it is served at a stable, unhashed URL (/avatar.png).
const out = resolve(__dirname, "../public/avatar.png");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.4" r="0.85">
      <stop offset="0" stop-color="#1a0405"/>
      <stop offset="1" stop-color="#050304"/>
    </radialGradient>
    <radialGradient id="fur" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#ff3b34"/>
      <stop offset="0.65" stop-color="#e01616"/>
      <stop offset="1" stop-color="#9c0d0d"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.62">
      <stop offset="0.62" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.7"/>
    </radialGradient>
  </defs>

  <rect width="600" height="600" fill="url(#bg)"/>

  <!-- red cat (head, ears, body) -->
  <g fill="url(#fur)">
    <path d="M170 92 L256 240 L118 214 Z"/>
    <path d="M430 92 L344 240 L482 214 Z"/>
    <ellipse cx="300" cy="300" rx="168" ry="152"/>
    <path d="M112 600 C133 466 226 426 300 426 C374 426 467 466 488 600 Z"/>
  </g>

  <!-- inner ears -->
  <g fill="#7a0a0a">
    <path d="M188 132 L242 228 L158 198 Z"/>
    <path d="M412 132 L358 228 L442 198 Z"/>
  </g>

  <!-- angry brows -->
  <g fill="#3a0303">
    <path d="M196 252 L286 286 L282 302 L196 272 Z"/>
    <path d="M404 252 L314 286 L318 302 L404 272 Z"/>
  </g>

  <!-- eyes -->
  <ellipse cx="232" cy="294" rx="43" ry="17" transform="rotate(-16 232 294)" fill="#060000"/>
  <ellipse cx="368" cy="294" rx="43" ry="17" transform="rotate(16 368 294)" fill="#060000"/>
  <circle cx="240" cy="292" r="4" fill="#ff5a4a" opacity="0.8"/>
  <circle cx="360" cy="292" r="4" fill="#ff5a4a" opacity="0.8"/>

  <!-- nose + mouth -->
  <path d="M300 330 L281 352 L319 352 Z" fill="#180101"/>
  <path d="M300 352 L300 376 M300 376 C300 392 274 394 260 386 M300 376 C300 392 326 394 340 386"
        stroke="#180101" stroke-width="5" fill="none" stroke-linecap="round"/>

  <!-- whiskers -->
  <g stroke="#ff9a92" stroke-width="3" stroke-linecap="round" opacity="0.85" fill="none">
    <path d="M250 360 L108 332"/>
    <path d="M250 372 L104 374"/>
    <path d="M250 384 L116 414"/>
    <path d="M350 360 L492 332"/>
    <path d="M350 372 L496 374"/>
    <path d="M350 384 L484 414"/>
  </g>

  <rect width="600" height="600" fill="url(#vig)"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`wrote ${out}`);
