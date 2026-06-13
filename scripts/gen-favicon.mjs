// Generates the Red Team crosshair/reticle favicons (light + dark) in all sizes.
// Run: node scripts/gen-favicon.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/favicon");
mkdirSync(outDir, { recursive: true });

const RED = "#FF2A36";
const RED_DEEP = "#B3121C";

/** Build the reticle SVG. `mode` = 'dark' | 'light'. */
function svg(mode) {
	const bgTop = mode === "dark" ? "#1b1012" : "#fff5f5";
	const bgBot = mode === "dark" ? "#0e0a0b" : "#ffe4e4";
	const ring = mode === "dark" ? RED : RED_DEEP;
	const glow = mode === "dark" ? 0.55 : 0.0;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bgTop}"/>
      <stop offset="1" stop-color="${bgBot}"/>
    </linearGradient>
    <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ring}"/>
      <stop offset="1" stop-color="${RED_DEEP}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${RED}" stop-opacity="${glow}"/>
      <stop offset="1" stop-color="${RED}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect x="6" y="6" width="500" height="500" rx="106" fill="none" stroke="${ring}" stroke-opacity="0.35" stroke-width="6"/>
  <circle cx="256" cy="256" r="190" fill="url(#glow)"/>

  <g stroke="url(#stroke)" stroke-width="30" stroke-linecap="round" fill="none">
    <!-- outer reticle ring with gaps -->
    <circle cx="256" cy="256" r="138" stroke-dasharray="150 67"/>
    <!-- crosshair ticks -->
    <line x1="256" y1="40"  x2="256" y2="118"/>
    <line x1="256" y1="394" x2="256" y2="472"/>
    <line x1="40"  y1="256" x2="118" y2="256"/>
    <line x1="394" y1="256" x2="472" y2="256"/>
  </g>

  <!-- center lock -->
  <circle cx="256" cy="256" r="38" fill="url(#stroke)"/>
  <circle cx="256" cy="256" r="14" fill="${bgBot}"/>
</svg>`;
}

const sizes = [32, 128, 180, 192];
for (const mode of ["dark", "light"]) {
	const buf = Buffer.from(svg(mode));
	for (const size of sizes) {
		const file = resolve(outDir, `favicon-${mode}-${size}.png`);
		await sharp(buf).resize(size, size).png().toFile(file);
		console.log(`wrote ${file}`);
	}
}
// Also drop a scalable SVG (dark) for modern browsers
writeFileSync(resolve(outDir, "favicon.svg"), svg("dark"));
console.log("done");
