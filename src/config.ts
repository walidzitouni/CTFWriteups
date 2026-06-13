import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "DARYX // Red Team Ops",
	subtitle: "Offensive Security · Red Teaming · CTF",
	lang: "en", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 18, // Red Team crimson theme
		fixed: true, // Keep the red theme fixed
	},
	banner: {
		enable: true,
		src: "", // Not used while matrix banner is enabled
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		video: false,
		matrix: true, // Render the custom animated cyber / matrix-rain banner
		credit: {
			enable: false, // No external credit needed for the self-built banner
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "HTB Machines",
			url: "/htb-machines/",
			external: false,
		},
		{
			name: "Resources",
			url: "/resources/",
			external: false,
		},
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/walidzitouni",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png",
	name: "Daryx",
	bio: "Red Team Engineer & Offensive Security researcher. Breaking systems to make them stronger — one flag at a time.",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/walidzitouni",
		},
		{
			name: "LinkedIn",
			icon: "fa6-brands:linkedin",
			url: "https://www.linkedin.com/in/walid-zitouni/",
		},
		{
			name: "Twitter",
			icon: "fa6-brands:x-twitter",
			url: "https://x.com/walidzitouni04",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
