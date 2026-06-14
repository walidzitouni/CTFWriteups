// Generates the FBI "evidence board" assets: push-pins + a cork texture tile.
// Run: node scripts/gen-board-assets.mjs
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/board");
mkdirSync(outDir, { recursive: true });

/** A glossy top-down push-pin. */
function pinSvg(light, mid, dark) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <radialGradient id="dome" cx="0.38" cy="0.34" r="0.75">
      <stop offset="0" stop-color="${light}"/>
      <stop offset="0.5" stop-color="${mid}"/>
      <stop offset="1" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <ellipse cx="64" cy="104" rx="26" ry="8" fill="#000" opacity="0.28"/>
  <circle cx="64" cy="58" r="40" fill="url(#dome)" stroke="${dark}" stroke-width="2"/>
  <ellipse cx="50" cy="44" rx="14" ry="9" fill="#fff" opacity="0.55"/>
  <circle cx="64" cy="58" r="6" fill="${dark}" opacity="0.55"/>
</svg>`;
}

/** Aged cork board tile using fractal noise. */
const corkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="5" seed="7" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="discrete" tableValues="0 0.15 0 0.35 0.1 0.55 0.2 0.8"/></feComponentTransfer>
    </filter>
    <filter id="grain2">
      <feTurbulence type="turbulence" baseFrequency="0.012" numOctaves="2" seed="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.18"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="512" height="512" fill="#b07a3f"/>
  <rect width="512" height="512" fill="#8a5d2c" filter="url(#grain2)"/>
  <rect width="512" height="512" filter="url(#grain)" opacity="0.5" style="mix-blend-mode:multiply"/>
  <rect width="512" height="512" fill="url(#g)" />
  <radialGradient id="g" cx="0.5" cy="0.4" r="0.8">
    <stop offset="0" stop-color="#caa05f" stop-opacity="0.25"/>
    <stop offset="1" stop-color="#5e3d18" stop-opacity="0.35"/>
  </radialGradient>
</svg>`;

const pins = {
	"pin-red.png": pinSvg("#ff8a8a", "#ff2a36", "#8e0d14"),
	"pin-amber.png": pinSvg("#ffd98a", "#ff9e2a", "#9c5a07"),
	"pin-steel.png": pinSvg("#dfe7ef", "#9aa9bb", "#4a5563"),
};

for (const [name, svg] of Object.entries(pins)) {
	const file = resolve(outDir, name);
	await sharp(Buffer.from(svg)).resize(72, 72).png().toFile(file);
	console.log(`wrote ${file}`);
}

await sharp(Buffer.from(corkSvg)).png().toFile(resolve(outDir, "cork.png"));
console.log(`wrote ${resolve(outDir, "cork.png")}`);
console.log("done");
