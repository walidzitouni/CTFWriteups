export interface MachineTask {
  name: string;
}

export interface Machine {
  id: string;
  name: string;
  platform: "HackTheBox" | "TryHackMe" | "SecDojo" | "N/A";
  os: "Linux" | "Windows" | "Windows AD" | "N/A";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane" | "N/A";
  /** Relative URL to the writeup post, or null if not written yet */
  writeup: string | null;
  tags: string[];
  category: string;
  tasks: MachineTask[];
}

export const machines: Machine[] = [
  {
    id: "tombwatcher",
    name: "TombWatcher",
    platform: "HackTheBox",
    os: "Windows AD",
    difficulty: "Medium",
    writeup: null,
    tags: ["Active Directory", "Kerberos", "LDAP", "Enumeration"],
    category: "Active Directory",
    tasks: [{ name: "Root Flag" }],
  },
  {
    id: "forest",
    name: "Forest",
    platform: "HackTheBox",
    os: "Windows AD",
    difficulty: "Easy",
    writeup: null,
    tags: ["Active Directory", "AS-REP Roasting", "DCSync", "BloodHound"],
    category: "Active Directory",
    tasks: [{ name: "Root Flag" }],
  },
  {
    id: "ad101",
    name: "AD101",
    platform: "SecDojo",
    os: "Windows AD",
    difficulty: "Easy",
    writeup: null,
    tags: ["Active Directory", "LDAP", "Kerberos"],
    category: "Active Directory",
    tasks: [{ name: "Root Flag" }],
  },
  {
    id: "cicada",
    name: "Cicada",
    platform: "HackTheBox",
    os: "Windows AD",
    difficulty: "Easy",
    writeup: null,
    tags: ["Active Directory", "SMB", "Enumeration", "Credentials"],
    category: "Active Directory",
    tasks: [{ name: "Root Flag" }],
  },
  {
    id: "cactifall",
    name: "Cactifall",
    platform: "SecDojo",
    os: "Linux",
    difficulty: "Easy",
    writeup: null,
    tags: ["Web", "Cacti", "CVE", "RCE"],
    category: "Web Exploitation",
    tasks: [{ name: "Root Flag" }],
  },
  {
    id: "dog",
    name: "Dog",
    platform: "HackTheBox",
    os: "Linux",
    difficulty: "Easy",
    writeup: null,
    tags: ["Web", "Gitea", "RCE", "Privilege Escalation"],
    category: "Web Exploitation",
    tasks: [{ name: "User Flag" }, { name: "Root Flag" }],
  },
  {
    id: "checker",
    name: "Checker",
    platform: "HackTheBox",
    os: "Linux",
    difficulty: "Hard",
    writeup: null,
    tags: ["Web", "Bookstack", "Cacti", "SSRF", "Privilege Escalation"],
    category: "Web Exploitation",
    tasks: [{ name: "User Flag" }, { name: "Root Flag" }],
  },
  {
    id: "shadow-phishing-2",
    name: "Shadow Phishing 2",
    platform: "TryHackMe",
    os: "Windows",
    difficulty: "Hard",
    writeup: "/posts/shadow-phishing-2/",
    tags: ["Phishing", "Macro", "Windows", "Social Engineering"],
    category: "Red Team",
    tasks: [{ name: "Root Flag" }],
  },
  {
    id: "apprentissage",
    name: "Apprentissage",
    platform: "N/A",
    os: "N/A",
    difficulty: "N/A",
    writeup: null,
    tags: ["Learning", "Fundamentals"],
    category: "Training",
    tasks: [{ name: "Task 1" }, { name: "Task 2" }],
  },
];
