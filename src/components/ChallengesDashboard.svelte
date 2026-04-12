<script lang="ts">
import { onMount } from "svelte";
import { getPostUrlBySlug } from "../utils/url-utils";

export let sortedPosts: Post[] = [];

interface Post {
    slug: string;
    data: {
        title: string;
        tags: string[];
        category?: string;
        published: Date;
        description?: string;
    };
}

let searchQuery = "";
let selectedPlatform = "all";
let selectedTag = "all";
let filteredPosts: Post[] = [];
let allPlatforms: string[] = [];
let allTags: string[] = [];
let mounted = false;

// Platform config for icons and colors
const platformConfig: Record<string, { color: string; icon: string; short: string }> = {
    "HackTheBox": { color: "#9fef00", icon: "HTB", short: "HTB" },
    "HackerLab": { color: "#00c8ff", icon: "HL", short: "HL" },
    "AmateursCTF 2025": { color: "#ff6b6b", icon: "AC", short: "ACTF" },
    "V1t CTF 2025": { color: "#ffd93d", icon: "V1", short: "V1T" },
    "QnQSec CTF 2025": { color: "#6bcb77", icon: "QS", short: "QnQ" },
    "NextHunt CTF": { color: "#4d96ff", icon: "NH", short: "NH" },
    "PatriotCTF 2025": { color: "#ff6b6b", icon: "PC", short: "PCTF" },
    "BuckeyeCTF 2025": { color: "#ff922b", icon: "BC", short: "BCTF" },
    "AKASEC 2025": { color: "#cc5de8", icon: "AK", short: "AKA" },
    "CVE Analysis": { color: "#ff4444", icon: "CV", short: "CVE" },
    "Web": { color: "#20c997", icon: "WB", short: "Web" },
    "Reverse Engineering": { color: "#845ef7", icon: "RE", short: "RE" },
    "CTF Writeups": { color: "#339af0", icon: "CT", short: "CTF" },
};

function getPlatformInfo(category: string | undefined) {
    if (!category) return { color: "#868e96", icon: "??", short: "N/A" };
    return platformConfig[category] || { color: "#868e96", icon: category.substring(0, 2).toUpperCase(), short: category.substring(0, 4) };
}

// Tag category colors
function getTagColor(tag: string): string {
    const tagColors: Record<string, string> = {
        "Web": "#20c997",
        "Crypto": "#ffd43b",
        "RSA": "#fab005",
        "PWN": "#ff6b6b",
        "Forensics": "#4dabf7",
        "Reverse Engineering": "#845ef7",
        "SSTI": "#ff922b",
        "RCE": "#f03e3e",
        "SQLi": "#fd7e14",
        "CVE": "#ff4444",
        "Misc": "#868e96",
    };
    return tagColors[tag] || "oklch(0.7 0.14 var(--hue))";
}

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDifficultyFromTags(tags: string[]): string {
    // Infer rough difficulty from tag complexity
    const hardTags = ["RCE", "Deserialization", "CVE", "HTTP Smuggling", "Heap", "UAF"];
    const medTags = ["SSTI", "SQLi", "XXE", "SSRF", "Command Injection", "Privilege Escalation"];

    if (tags.some(t => hardTags.includes(t))) return "Hard";
    if (tags.some(t => medTags.includes(t))) return "Medium";
    return "Easy";
}

function getDifficultyColor(diff: string): string {
    if (diff === "Hard") return "#ff4444";
    if (diff === "Medium") return "#ffb733";
    return "#4ade80";
}

onMount(() => {
    // Extract unique platforms and tags
    const platformSet = new Set<string>();
    const tagSet = new Set<string>();

    for (const post of sortedPosts) {
        if (post.data.category) platformSet.add(post.data.category);
        if (post.data.tags) {
            for (const tag of post.data.tags) tagSet.add(tag);
        }
    }

    allPlatforms = Array.from(platformSet).sort();
    allTags = Array.from(tagSet).sort();
    filteredPosts = sortedPosts;
    mounted = true;
});

$: if (mounted) {
    let result = sortedPosts;

    if (selectedPlatform !== "all") {
        result = result.filter(p => p.data.category === selectedPlatform);
    }
    if (selectedTag !== "all") {
        result = result.filter(p => p.data.tags && p.data.tags.includes(selectedTag));
    }
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(p =>
            p.data.title.toLowerCase().includes(q) ||
            (p.data.description && p.data.description.toLowerCase().includes(q)) ||
            (p.data.tags && p.data.tags.some(t => t.toLowerCase().includes(q))) ||
            (p.data.category && p.data.category.toLowerCase().includes(q))
        );
    }

    filteredPosts = result;
}

// Stats
$: totalWriteups = sortedPosts.length;
$: totalCategories = new Set(sortedPosts.map(p => p.data.category).filter(Boolean)).size;
$: totalTags = new Set(sortedPosts.flatMap(p => p.data.tags || [])).size;
$: webCount = sortedPosts.filter(p => p.data.tags && p.data.tags.includes("Web")).length;
$: cryptoCount = sortedPosts.filter(p => p.data.tags && p.data.tags.includes("Crypto")).length;
</script>

<!-- Stats Bar -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <div class="card-base px-4 py-4 text-center">
        <div class="text-2xl font-bold" style="color: oklch(0.7 0.14 var(--hue))">{totalWriteups}</div>
        <div class="text-xs text-black/50 dark:text-white/50 mt-1 uppercase tracking-wider">Writeups</div>
    </div>
    <div class="card-base px-4 py-4 text-center">
        <div class="text-2xl font-bold" style="color: oklch(0.7 0.14 var(--hue))">{totalCategories}</div>
        <div class="text-xs text-black/50 dark:text-white/50 mt-1 uppercase tracking-wider">CTF Events</div>
    </div>
    <div class="card-base px-4 py-4 text-center">
        <div class="text-2xl font-bold" style="color: #20c997">{webCount}</div>
        <div class="text-xs text-black/50 dark:text-white/50 mt-1 uppercase tracking-wider">Web Challs</div>
    </div>
    <div class="card-base px-4 py-4 text-center">
        <div class="text-2xl font-bold" style="color: #ffd43b">{cryptoCount}</div>
        <div class="text-xs text-black/50 dark:text-white/50 mt-1 uppercase tracking-wider">Crypto Challs</div>
    </div>
</div>

<!-- Filters -->
<div class="card-base px-5 py-4 mb-6">
    <div class="flex flex-col md:flex-row gap-3">
        <!-- Search -->
        <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search challenges..."
                class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/5 dark:bg-white/5 border-none outline-none
                       text-black/75 dark:text-white/75 placeholder-black/30 dark:placeholder-white/30
                       focus:ring-2 focus:ring-[oklch(0.7_0.14_var(--hue))] transition text-sm"
            />
        </div>

        <!-- Platform Filter -->
        <select
            bind:value={selectedPlatform}
            class="px-4 py-2.5 rounded-lg bg-black/5 dark:bg-white/5 border-none outline-none
                   text-black/75 dark:text-white/75 text-sm cursor-pointer
                   focus:ring-2 focus:ring-[oklch(0.7_0.14_var(--hue))] transition"
        >
            <option value="all">All Platforms</option>
            {#each allPlatforms as platform}
                <option value={platform}>{platform}</option>
            {/each}
        </select>

        <!-- Tag Filter -->
        <select
            bind:value={selectedTag}
            class="px-4 py-2.5 rounded-lg bg-black/5 dark:bg-white/5 border-none outline-none
                   text-black/75 dark:text-white/75 text-sm cursor-pointer
                   focus:ring-2 focus:ring-[oklch(0.7_0.14_var(--hue))] transition"
        >
            <option value="all">All Tags</option>
            {#each allTags as tag}
                <option value={tag}>{tag}</option>
            {/each}
        </select>
    </div>

    <div class="mt-3 flex items-center justify-between">
        <span class="text-xs text-black/40 dark:text-white/40">
            Showing {filteredPosts.length} of {totalWriteups} challenges
        </span>
        {#if selectedPlatform !== "all" || selectedTag !== "all" || searchQuery.trim()}
            <button
                on:click={() => { searchQuery = ""; selectedPlatform = "all"; selectedTag = "all"; }}
                class="text-xs px-3 py-1 rounded-md transition
                       bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10
                       text-black/50 dark:text-white/50"
            >
                Clear Filters
            </button>
        {/if}
    </div>
</div>

<!-- Challenge Cards Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each filteredPosts as post}
        {@const platform = getPlatformInfo(post.data.category)}
        {@const difficulty = getDifficultyFromTags(post.data.tags || [])}
        <a
            href={getPostUrlBySlug(post.slug)}
            class="card-base group block overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
            <div class="p-5">
                <!-- Header: Platform badge + difficulty -->
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <span
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold text-black/90"
                            style="background-color: {platform.color}20; color: {platform.color}; border: 1px solid {platform.color}40"
                        >
                            {platform.icon}
                        </span>
                        <span class="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-wide">
                            {post.data.category || "Uncategorized"}
                        </span>
                    </div>
                    <span
                        class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style="background-color: {getDifficultyColor(difficulty)}15; color: {getDifficultyColor(difficulty)}; border: 1px solid {getDifficultyColor(difficulty)}30"
                    >
                        {difficulty}
                    </span>
                </div>

                <!-- Title -->
                <h3 class="font-bold text-lg text-black/90 dark:text-white/90 mb-2 group-hover:text-[oklch(0.7_0.14_var(--hue))] transition">
                    {post.data.title}
                </h3>

                <!-- Description -->
                {#if post.data.description}
                    <p class="text-sm text-black/50 dark:text-white/50 mb-3 line-clamp-2">
                        {post.data.description}
                    </p>
                {/if}

                <!-- Tags -->
                <div class="flex flex-wrap gap-1.5 mb-3">
                    {#each (post.data.tags || []).slice(0, 4) as tag}
                        <span
                            class="text-[11px] px-2 py-0.5 rounded-md font-medium"
                            style="background-color: {getTagColor(tag)}15; color: {getTagColor(tag)}"
                        >
                            {tag}
                        </span>
                    {/each}
                    {#if (post.data.tags || []).length > 4}
                        <span class="text-[11px] px-2 py-0.5 rounded-md text-black/30 dark:text-white/30">
                            +{post.data.tags.length - 4}
                        </span>
                    {/if}
                </div>

                <!-- Footer: Date + Read arrow -->
                <div class="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                    <span class="text-xs text-black/30 dark:text-white/30">
                        {formatDate(post.data.published)}
                    </span>
                    <span class="text-xs font-medium text-black/30 dark:text-white/30 group-hover:text-[oklch(0.7_0.14_var(--hue))] transition flex items-center gap-1">
                        Read writeup
                        <svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    {/each}
</div>

{#if filteredPosts.length === 0 && mounted}
    <div class="card-base px-8 py-16 text-center">
        <div class="text-4xl mb-4 opacity-30">:/</div>
        <div class="text-black/50 dark:text-white/50 text-lg font-medium">No challenges found</div>
        <div class="text-black/30 dark:text-white/30 text-sm mt-1">Try adjusting your filters or search query</div>
    </div>
{/if}
