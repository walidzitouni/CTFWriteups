export interface MachineTask {
  name: string;
}

export interface Machine {
  id: string;
  name: string;
  platform: "HackTheBox" | "TryHackMe" | "SecDojo" | "N/A";
  os: "Linux" | "Windows" | "Windows AD" | "N/A";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane" | "N/A";
  releaseDate: string;
  /** Relative URL to the writeup post, or null if not written yet */
  writeup: string | null;
  tags: string[];
  category: string;
  tasks: MachineTask[];
}

const stdTasks: MachineTask[] = [{ name: "User Flag" }, { name: "Root Flag" }];

export const machines: Machine[] = [
  { id: "garfield",       name: "Garfield",       platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Apr 2026", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "pirate",         name: "Pirate",         platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Feb 2026", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "overwatch",      name: "Overwatch",      platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jan 2026", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "fries",          name: "Fries",          platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Nov 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "nanocorp",       name: "NanoCorp",       platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Nov 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "hercules",       name: "Hercules",       platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Oct 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "signed",         name: "Signed",         platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Oct 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "darkzero",       name: "DarkZero",       platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Oct 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "mirage",         name: "Mirage",         platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Jul 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "voleur",         name: "Voleur",         platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jul 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "rustykey",       name: "RustyKey",       platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Jun 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "tombwatcher",    name: "TombWatcher",    platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jun 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "certificate",   name: "Certificate",    platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "May 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "fluffy",         name: "Fluffy",         platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "May 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "puppy",          name: "Puppy",          platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "May 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "scepter",        name: "Scepter",        platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Apr 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "haze",           name: "Haze",           platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Mar 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "thefrizz",       name: "TheFrizz",       platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Mar 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "darkcorp",       name: "DarkCorp",       platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Feb 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "escapetwo",      name: "EscapeTwo",      platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Jan 2025", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "vintage",        name: "Vintage",        platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Nov 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "administrator",  name: "Administrator",  platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Nov 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "certified",      name: "Certified",      platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Nov 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "university",     name: "University",     platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Oct 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "cicada",         name: "Cicada",         platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Sep 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "infiltrator",    name: "Infiltrator",    platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Aug 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "ghost",          name: "Ghost",          platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Jul 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "freelancer",     name: "Freelancer",     platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Jun 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "mist",           name: "Mist",           platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Mar 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "office",         name: "Office",         platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Feb 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "analysis",       name: "Analysis",       platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Jan 2024", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "manager",        name: "Manager",        platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Oct 2023", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "rebound",        name: "Rebound",        platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Sep 2023", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "authority",      name: "Authority",      platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jul 2023", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "coder",          name: "Coder",          platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Apr 2023", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "escape",         name: "Escape",         platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Feb 2023", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "flight",         name: "Flight",         platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Nov 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "absolute",       name: "Absolute",       platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Sep 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "support",        name: "Support",        platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Jul 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "scrambled",      name: "Scrambled",      platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jun 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "streamio",       name: "StreamIO",       platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jun 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "hathor",         name: "Hathor",         platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Apr 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "timelapse",      name: "Timelapse",      platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Mar 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "object",         name: "Object",         platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Feb 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "acute",          name: "Acute",          platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Feb 2022", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "search",         name: "Search",         platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Dec 2021", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "return",         name: "Return",         platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Sep 2021", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "anubis",         name: "Anubis",         platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Aug 2021", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "intelligence",   name: "Intelligence",   platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jul 2021", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "pivotapi",       name: "PivotAPI",       platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "May 2021", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "apt",            name: "APT",            platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Oct 2020", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "blackfield",     name: "Blackfield",     platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Jun 2020", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "cascade",        name: "Cascade",        platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Mar 2020", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "multimaster",    name: "Multimaster",    platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Mar 2020", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "sauna",          name: "Sauna",          platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Feb 2020", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "monteverde",     name: "Monteverde",     platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Jan 2020", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "resolute",       name: "Resolute",       platform: "HackTheBox", os: "Windows AD", difficulty: "Medium", releaseDate: "Dec 2019", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "forest",         name: "Forest",         platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Oct 2019", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "sizzle",         name: "Sizzle",         platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Jan 2019", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "active",         name: "Active",         platform: "HackTheBox", os: "Windows AD", difficulty: "Easy",   releaseDate: "Jul 2018", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "reel",           name: "Reel",           platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Jun 2018", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "rabbit",         name: "Rabbit",         platform: "HackTheBox", os: "Windows AD", difficulty: "Insane", releaseDate: "Mar 2018", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
  { id: "mantis",         name: "Mantis",         platform: "HackTheBox", os: "Windows AD", difficulty: "Hard",   releaseDate: "Sep 2017", writeup: null, tags: ["Active Directory"], category: "Active Directory", tasks: stdTasks },
];
