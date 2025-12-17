---
title: "Tiny Flag"
published: 2025-01-10
description: "Flag hidden in favicon pixel art steganography"
tags: ["Web", "Steganography"]
category: V1t CTF 2025
draft: false
---

## Overview

The page is full of decorative elements (moving dots, scanlines, etc.), which are red herrings. The title and hint suggest the flag is "tiny" and right "in front of your eyes." The trick is that the flag is drawn inside the page's **favicon**.

## Solution Steps

1. Open the site and inspect the page head (View Source or DevTools -> Elements).
2. Notice the favicon reference:

```html
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
```

3. Open `favicon.ico` directly in a new tab (DevTools -> Network -> click the icon request).
4. Zoom way in (800-1600%) to see the pixel art text clearly.

### Alternative: Extract and Upscale Locally

```bash
# Download the favicon
curl -O https://target-site/favicon.ico

# Convert and upscale with nearest-neighbor to keep pixels crisp
# Requires ImageMagick
convert favicon.ico -filter point -resize 1600% out.png

# Open out.png to read the flag
```

## Pitfalls

- Don't over-focus on hidden CSS pixels or JS effects; they're decoys.
- The entire solve is recognizing the favicon and zooming in.

## Flag

```
v1t{T1NY_ICO}
```
