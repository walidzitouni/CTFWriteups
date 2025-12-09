# CTF Writeups

A collection of Capture The Flag (CTF) writeups with detailed solutions and explanations.

## Live Site

Visit the live site at: `https://walidzitouni.github.io/CTFWriteups/`

## Categories

- **Web Exploitation** - SQL injection, XSS, SSRF, and web vulnerabilities
- **Cryptography** - Cipher breaking, RSA, AES, and crypto puzzles
- **Binary Exploitation (Pwn)** - Buffer overflows, ROP chains, and memory corruption
- **Reverse Engineering** - Malware analysis, binary reversing, and code analysis
- **Forensics** - Memory forensics, disk analysis, and file carving
- **Miscellaneous** - OSINT, steganography, and unique challenges

## Structure

```
CTFWriteups/
├── index.html          # Main landing page
├── writeups.html       # All writeups listing
├── about.html          # About page
├── css/
│   └── style.css       # Purple/black themed stylesheet
├── writeups/           # Individual writeup pages
│   ├── sample-web-challenge.html
│   ├── sample-crypto-challenge.html
│   └── sample-pwn-challenge.html
└── assets/
    └── images/         # Challenge screenshots and diagrams
```

## Adding New Writeups

1. Create a new HTML file in the `writeups/` directory
2. Use an existing writeup as a template
3. Add the writeup card to `writeups.html`
4. Optionally add to the "Latest Writeups" section in `index.html`

## Local Development

Simply open `index.html` in your browser, or use a local server:

```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your site will be live at `https://username.github.io/CTFWriteups/`

## Theme

The website uses a **purple and black** color scheme, inspired by the hacker aesthetic with modern, clean design elements.

## License

Feel free to use this template for your own CTF writeups!

---

Happy Hacking! 🚩
