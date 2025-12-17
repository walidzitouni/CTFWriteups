---
title: "Mark The Lyrics"
published: 2025-01-10
description: "Flag hidden in HTML mark tags within song lyrics"
tags: ["Web", "HTML"]
category: V1t CTF 2025
draft: false
---

## Overview

The page shows well-formatted Vietnamese rap lyrics (Verse, Pre-Chorus, Chorus, Outro). The prompt hints that something is "odd" about the lyrics. Viewing the HTML reveals certain fragments wrapped in `<mark>...</mark>` elements. Those marked fragments, read in order, form the flag.

## Manual Extraction

Reading each `<mark>` in document order yields:

1. `V`
2. `1`
3. `T` (from "M-TP", the letter T is marked)
4. `{`
5. `MCK`
6. `pap-`
7. `cool`
8. `ooh-`
9. `yeah`
10. `}`

## Browser Console One-liner

```javascript
Array.from(document.querySelectorAll('mark'))
  .map(m => m.textContent)
  .join('');
// => "V1T{MCK-pap-cool-ooh-yeah}"
```

## Python Script

```python
#!/usr/bin/env python3
import re, pathlib

html = pathlib.Path('index.html').read_text(encoding='utf-8')
marks = re.findall(r'<mark>([^<]+)</mark>', html)

print("MARK THE LYRICS - FLAG EXTRACTOR")
for i, m in enumerate(marks, 1):
    print(f"{i}. {m}")

flag = ''.join(marks)
print("\nCombined:", flag)
```

## Flag

```
V1T{MCK-pap-cool-ooh-yeah}
```
