// Generates "Dexter blood-slide box" assets: walnut wood texture + blood smears.
// Run: node scripts/gen-slides.mjs
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/board");
mkdirSync(outDir, { recursive: true });

// --- Walnut wood grain tile ---------------------------------------------
const woodSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.085" numOctaves="5" seed="14" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.6"/></feComponentTransfer>
    </filter>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0" stop-color="#3a2113"/>
      <stop offset="0.5" stop-color="#4d2c18"/>
      <stop offset="1" stop-color="#341c0f"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#base)"/>
  <rect width="600" height="600" fill="#1c0e06" filter="url(#grain)" opacity="0.7" style="mix-blend-mode:multiply"/>
  <rect width="600" height="600" fill="#6b4226" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:screen"/>
</svg>`;

await sharp(Buffer.from(woodSvg)).png().toFile(resolve(outDir, "wood.png"));
console.log("wrote wood.png");

// --- Blood smears (irregular, glossy, transparent) ----------------------
function bloodSvg(seed, hueShift = 0) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="160" viewBox="0 0 360 160">
  <defs>
    <filter id="rough" x="-30%" y="-60%" width="160%" height="220%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="3" seed="${seed}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <radialGradient id="b${seed}" cx="0.42" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#8c1414"/>
      <stop offset="0.45" stop-color="#5e0a0a"/>
      <stop offset="0.8" stop-color="#3a0404"/>
      <stop offset="1" stop-color="#240202"/>
    </radialGradient>
  </defs>
  <g filter="url(#rough)">
    <ellipse cx="180" cy="80" rx="120" ry="46" fill="url(#b${seed})"/>
    <ellipse cx="300" cy="84" rx="26" ry="12" fill="#4a0606"/>
    <circle cx="58" cy="72" r="9" fill="#5e0a0a"/>
    <circle cx="44" cy="90" r="5" fill="#4a0606"/>
    <circle cx="328" cy="70" r="6" fill="#3a0404"/>
  </g>
  <ellipse cx="150" cy="64" rx="46" ry="14" fill="#ffffff" opacity="0.16"/>
</svg>`;
}

for (let i = 1; i <= 3; i++) {
	await sharp(Buffer.from(bloodSvg(i * 5 + 2)))
		.png()
		.toFile(resolve(outDir, `blood-${i}.png`));
	console.log(`wrote blood-${i}.png`);
}
console.log("done");
