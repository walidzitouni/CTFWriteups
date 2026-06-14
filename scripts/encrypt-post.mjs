// Encrypts a post's body so the published site/repo contain ONLY ciphertext.
// AES-256-GCM with a PBKDF2(SHA-256) key — interoperable with browser WebCrypto.
// Run: node scripts/encrypt-post.mjs <post-file> <password>
import crypto from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";

const __dirname = dirname(fileURLToPath(import.meta.url));

const postArg = process.argv[2];
const password = process.argv[3];
if (!postArg || !password) {
	console.error("Usage: node scripts/encrypt-post.mjs <post-file> <password>");
	process.exit(1);
}

const ITER = 200000;
const postPath = resolve(__dirname, "..", postArg);
const raw = readFileSync(postPath, "utf8");

// strip frontmatter (--- ... ---)
const fm = raw.match(/^---\n[\s\S]*?\n---\n?/);
const body = fm ? raw.slice(fm[0].length) : raw;

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
const html = md.render(body);

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(password, salt, ITER, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([cipher.update(html, "utf8"), cipher.final()]);
const tag = cipher.getAuthTag();
const data = Buffer.concat([ct, tag]); // WebCrypto expects the GCM tag appended

const slug = basename(postArg).replace(/\.mdx?$/, "");
const outDir = resolve(__dirname, "../public/locked");
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, `${slug}.json`);
writeFileSync(
	outFile,
	JSON.stringify({
		v: 1,
		iter: ITER,
		salt: salt.toString("base64"),
		iv: iv.toString("base64"),
		data: data.toString("base64"),
	}),
);

console.log(`Encrypted ${body.length} chars -> ${outFile}`);
console.log("Ciphertext bytes:", data.length);
