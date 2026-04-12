import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Daryx",
	subtitle: "cybersec related stuff",
	lang: "en",
	themeColor: {
		hue: 160, // Green/teal accent
		fixed: true,
	},
	banner: {
		enable: false,
		src: "",
		position: "center",
		video: false,
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 3,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		{
			name: "Categories",
			url: "/categories/",
			external: false,
		},
		{
			name: "Achievements",
			url: "/achievements/",
			external: false,
		},
		LinkPreset.Archive,
		{
			name: "Tags",
			url: "/tags/",
			external: false,
		},
		LinkPreset.About,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png",
	name: "Daryx",
	bio: "cybersec related stuff",
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
	theme: "github-dark",
};
