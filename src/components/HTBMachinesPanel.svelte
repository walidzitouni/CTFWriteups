<script lang="ts">
  import { onMount } from "svelte";

  export interface MachineTask {
    name: string;
  }

  export interface Machine {
    id: string;
    name: string;
    platform: string;
    os: string;
    difficulty: string;
    releaseDate?: string;
    writeup: string | null;
    tags: string[];
    category: string;
    tasks: MachineTask[];
  }

  export let machines: Machine[] = [];

  // ── Filter state ──────────────────────────────────────────────────────────
  let searchQuery = "";
  let platformFilter = "All";
  let osFilter = "All";
  let difficultyFilter = "All";

  // ── UI state ──────────────────────────────────────────────────────────────
  let expandedRows = new Set<string>();
  let solvedMachines = new Set<string>();
  let tasksDone: Record<string, boolean[]> = {};
  let mounted = false;

  // ── Derived ───────────────────────────────────────────────────────────────
  $: filteredMachines = machines.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.platform.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q));
    const matchesPlatform =
      platformFilter === "All" || m.platform === platformFilter;
    const matchesOs = osFilter === "All" || m.os === osFilter;
    const matchesDiff =
      difficultyFilter === "All" || m.difficulty === difficultyFilter;
    return matchesSearch && matchesPlatform && matchesOs && matchesDiff;
  });

  $: totalSolved = mounted
    ? machines.filter((m) => solvedMachines.has(m.id)).length
    : 0;
  $: linuxCount = machines.filter((m) => m.os === "Linux").length;
  $: windowsCount = machines.filter((m) => m.os === "Windows").length;
  $: windowsAdCount = machines.filter((m) => m.os === "Windows AD").length;

  const platforms = ["All", "HackTheBox", "TryHackMe", "SecDojo", "N/A"];
  const oses = ["All", "Linux", "Windows", "Windows AD", "N/A"];
  const difficulties = ["All", "Easy", "Medium", "Hard", "Insane", "N/A"];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    try {
      const s = localStorage.getItem("htb-machines-solved");
      if (s) solvedMachines = new Set(JSON.parse(s));
    } catch {
      /* ignore */
    }
    try {
      const t = localStorage.getItem("htb-machines-tasks");
      if (t) tasksDone = JSON.parse(t);
    } catch {
      /* ignore */
    }
    mounted = true;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  function toggleSolved(id: string) {
    const next = new Set(solvedMachines);
    next.has(id) ? next.delete(id) : next.add(id);
    solvedMachines = next;
    localStorage.setItem("htb-machines-solved", JSON.stringify([...next]));
  }

  function toggleRow(id: string) {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    expandedRows = next;
  }

  function toggleTask(machineId: string, idx: number, total: number) {
    const cur = tasksDone[machineId] ?? Array(total).fill(false);
    const updated = [...cur];
    updated[idx] = !updated[idx];
    tasksDone = { ...tasksDone, [machineId]: updated };
    localStorage.setItem("htb-machines-tasks", JSON.stringify(tasksDone));
  }

  function getTasksState(machineId: string, total: number): boolean[] {
    return tasksDone[machineId] ?? Array(total).fill(false);
  }

  function getDoneCount(machineId: string, total: number): number {
    return getTasksState(machineId, total).filter(Boolean).length;
  }

  function diffClass(d: string): string {
    return (
      { Easy: "diff-easy", Medium: "diff-medium", Hard: "diff-hard", Insane: "diff-insane" }[d] ?? "text-dim"
    );
  }

  function osIcon(os: string): string {
    if (os === "Linux") return "🐧";
    if (os === "Windows" || os === "Windows AD") return "🪟";
    return "";
  }
</script>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- Stats bar                                                              -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->
<div class="card-base px-6 py-4 mb-4">
  <div class="flex flex-wrap gap-x-6 gap-y-3 justify-center items-center">
    <div class="stat-pill">
      <span class="stat-icon">⊞</span>
      <span class="stat-label">Total Machines</span>
      <span class="stat-value">{machines.length}</span>
    </div>
    <div class="stat-pill">
      <span class="stat-icon solved-icon">✔</span>
      <span class="stat-label">Terminées</span>
      <span class="stat-value">{totalSolved}</span>
    </div>
    <div class="stat-pill">
      <span class="stat-icon">🐧</span>
      <span class="stat-label">Linux</span>
      <span class="stat-value">{linuxCount}</span>
    </div>
    <div class="stat-pill">
      <span class="stat-icon">🪟</span>
      <span class="stat-label">Windows</span>
      <span class="stat-value">{windowsCount}</span>
    </div>
    <div class="stat-pill">
      <span class="stat-icon">🪟</span>
      <span class="stat-label">Windows AD</span>
      <span class="stat-value">{windowsAdCount}</span>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- Filters + Search                                                       -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->
<div class="card-base px-6 py-4 mb-4">
  <!-- Dropdowns row -->
  <div class="flex flex-wrap gap-x-6 gap-y-3 justify-center items-center mb-4">
    <div class="filter-group">
      <span class="filter-label">🌐 Plateforme :</span>
      <select bind:value={platformFilter} class="htb-select">
        {#each platforms as p}
          <option value={p}>{p === "All" ? "Toutes" : p}</option>
        {/each}
      </select>
    </div>
    <div class="filter-group">
      <span class="filter-label">🖥 OS :</span>
      <select bind:value={osFilter} class="htb-select">
        {#each oses as o}
          <option value={o}>{o === "All" ? "Tous" : o}</option>
        {/each}
      </select>
    </div>
    <div class="filter-group">
      <span class="filter-label">🎯 Difficulté :</span>
      <select bind:value={difficultyFilter} class="htb-select">
        {#each difficulties as d}
          <option value={d}>{d === "All" ? "Toutes" : d}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Search row -->
  <div class="flex items-center gap-3 max-w-2xl mx-auto">
    <input
      bind:value={searchQuery}
      type="text"
      placeholder="Rechercher machines, tâches ou compétences..."
      class="htb-input flex-1"
    />
    <button class="search-btn" aria-label="Rechercher">
      🔍
    </button>
    <span class="text-50 text-sm whitespace-nowrap">
      Machines trouvées : <strong class="text-75">{filteredMachines.length}</strong>
    </span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!-- Table                                                                  -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->
<div class="card-base overflow-x-auto">
  <table class="w-full border-collapse">
    <thead>
      <tr class="table-header-row">
        <th class="th-cell w-10"></th>
        <th class="th-cell text-left">Nom</th>
        <th class="th-cell text-left">Plateforme</th>
        <th class="th-cell text-left">OS</th>
        <th class="th-cell text-left">Difficulté</th>
        <th class="th-cell text-left">Write-up</th>
        <th class="th-cell text-center">Résolu</th>
        <th class="th-cell text-center">ToDo</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredMachines as machine (machine.id)}
        <!-- ── Main row ──────────────────────────────────────────────── -->
        <tr
          class="table-row"
          class:solved-row={solvedMachines.has(machine.id)}
        >
          <!-- Expand chevron -->
          <td class="td-cell text-center">
            <button
              class="chevron-btn"
              class:chevron-open={expandedRows.has(machine.id)}
              on:click={() => toggleRow(machine.id)}
              aria-label="Détails"
            >
              ❯
            </button>
          </td>

          <!-- Name -->
          <td class="td-cell font-semibold text-75">
            {machine.name}
          </td>

          <!-- Platform -->
          <td class="td-cell text-50 text-sm">
            {machine.platform}
          </td>

          <!-- OS -->
          <td class="td-cell text-75 text-sm">
            {#if machine.os !== "N/A"}
              <span class="os-badge">
                {osIcon(machine.os)}&nbsp;{machine.os}
              </span>
            {:else}
              <span class="text-30">N/A</span>
            {/if}
          </td>

          <!-- Difficulty -->
          <td class="td-cell text-sm font-semibold">
            <span class={diffClass(machine.difficulty)}>{machine.difficulty}</span>
          </td>

          <!-- Write-up -->
          <td class="td-cell text-sm">
            {#if machine.writeup}
              <a href={machine.writeup} class="writeup-link">Lire Write-up</a>
            {:else}
              <span class="text-30">-</span>
            {/if}
          </td>

          <!-- Solved checkbox -->
          <td class="td-cell text-center">
            <input
              type="checkbox"
              class="htb-checkbox"
              checked={solvedMachines.has(machine.id)}
              on:change={() => toggleSolved(machine.id)}
              aria-label="Marquer comme résolu"
            />
          </td>

          <!-- ToDo badge -->
          <td class="td-cell text-center">
            <span
              class="todo-badge"
              class:todo-done={getDoneCount(machine.id, machine.tasks.length) === machine.tasks.length && machine.tasks.length > 0}
            >
              {getDoneCount(machine.id, machine.tasks.length)}/{machine.tasks.length}
            </span>
          </td>
        </tr>

        <!-- ── Expanded detail row ──────────────────────────────────── -->
        {#if expandedRows.has(machine.id)}
          <tr class="detail-row">
            <td colspan="8" class="td-cell px-8 py-5">
              <div class="flex flex-wrap gap-8">

                <!-- Release Date -->
                {#if machine.releaseDate}
                  <div class="detail-section">
                    <div class="detail-title">Release Date</div>
                    <span class="text-75 text-sm">{machine.releaseDate}</span>
                  </div>
                {/if}

                <!-- Category -->
                <div class="detail-section">
                  <div class="detail-title">Catégorie</div>
                  <span class="category-badge">{machine.category}</span>
                </div>

                <!-- Tags -->
                <div class="detail-section">
                  <div class="detail-title">Tags</div>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    {#each machine.tags as tag}
                      <span class="tag-badge">#{tag}</span>
                    {/each}
                  </div>
                </div>

                <!-- Tasks checklist -->
                {#if machine.tasks.length > 0}
                  <div class="detail-section">
                    <div class="detail-title">
                      Tasks — {getDoneCount(machine.id, machine.tasks.length)}/{machine.tasks.length}
                    </div>
                    <div class="flex flex-col gap-2 mt-1">
                      {#each machine.tasks as task, i}
                        <label class="task-label">
                          <input
                            type="checkbox"
                            class="htb-checkbox"
                            checked={getTasksState(machine.id, machine.tasks.length)[i]}
                            on:change={() => toggleTask(machine.id, i, machine.tasks.length)}
                          />
                          <span
                            class="text-sm"
                            class:task-done={getTasksState(machine.id, machine.tasks.length)[i]}
                          >
                            {task.name}
                          </span>
                        </label>
                      {/each}
                    </div>
                  </div>
                {/if}

              </div>
            </td>
          </tr>
        {/if}
      {/each}

      <!-- Empty state -->
      {#if filteredMachines.length === 0}
        <tr>
          <td colspan="8" class="td-cell text-center py-12 text-50">
            Aucune machine ne correspond aux filtres sélectionnés.
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<style>
  /* ── Stats ─────────────────────────────────────────────────────────────── */
  .stat-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--btn-regular-bg);
    border-radius: 9999px;
    padding: 0.3rem 0.9rem;
    font-size: 0.85rem;
  }
  .stat-icon { font-size: 1rem; line-height: 1; }
  .solved-icon { color: oklch(0.72 0.19 142); }
  .stat-label { opacity: 0.55; }
  .stat-value { font-weight: 700; }

  /* ── Filters ────────────────────────────────────────────────────────────── */
  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .filter-label {
    font-size: 0.85rem;
    opacity: 0.6;
    white-space: nowrap;
  }
  .htb-select {
    background: var(--btn-regular-bg);
    border: 1px solid oklch(0.5 0.02 var(--hue) / 0.25);
    border-radius: 0.5rem;
    padding: 0.3rem 0.75rem;
    font-size: 0.85rem;
    color: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }
  .htb-select:hover { background: var(--btn-regular-bg-hover); }

  /* ── Search ─────────────────────────────────────────────────────────────── */
  .htb-input {
    background: var(--btn-regular-bg);
    border: 1px solid oklch(0.5 0.02 var(--hue) / 0.25);
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: inherit;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .htb-input:focus {
    border-color: var(--primary);
    background: var(--btn-regular-bg-hover);
  }
  .htb-input::placeholder { opacity: 0.4; }
  .search-btn {
    background: var(--primary);
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 0.8rem;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.15s;
    line-height: 1;
  }
  .search-btn:hover { opacity: 0.85; }

  /* ── Table ──────────────────────────────────────────────────────────────── */
  .table-header-row {
    border-bottom: 2px solid oklch(0.5 0.02 var(--hue) / 0.2);
  }
  .th-cell {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.5;
  }
  .td-cell {
    padding: 0.7rem 1rem;
    border-top: 1px solid oklch(0.5 0.02 var(--hue) / 0.1);
  }
  .table-row {
    transition: background 0.12s;
  }
  .table-row:hover { background: var(--btn-plain-bg-hover); }
  .solved-row { opacity: 0.65; }
  .solved-row .td-cell:nth-child(2) { text-decoration: line-through; }

  /* ── Chevron ────────────────────────────────────────────────────────────── */
  .chevron-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    border: none;
    border-radius: 0.35rem;
    background: none;
    color: var(--primary);
    font-size: 0.7rem;
    cursor: pointer;
    transition: transform 0.2s, background 0.12s;
    transform: rotate(90deg);
  }
  .chevron-btn:hover { background: var(--btn-plain-bg-hover); }
  .chevron-open { transform: rotate(270deg); }

  /* ── OS badge ───────────────────────────────────────────────────────────── */
  .os-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* ── Difficulty ─────────────────────────────────────────────────────────── */
  :global(.diff-easy)   { color: oklch(0.72 0.19 142); }
  :global(.diff-medium) { color: oklch(0.72 0.19 60);  }
  :global(.diff-hard)   { color: oklch(0.65 0.21 25);  }
  :global(.diff-insane) { color: oklch(0.68 0.22 310); }
  :global(.text-dim)    { opacity: 0.4; }

  /* ── Write-up link ──────────────────────────────────────────────────────── */
  .writeup-link {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .writeup-link:hover { opacity: 0.75; text-decoration: underline; }

  /* ── Solved checkbox ────────────────────────────────────────────────────── */
  .htb-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: var(--primary);
    cursor: pointer;
  }

  /* ── ToDo badge ─────────────────────────────────────────────────────────── */
  .todo-badge {
    display: inline-block;
    background: var(--btn-regular-bg);
    border-radius: 0.375rem;
    padding: 0.15rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;
    transition: background 0.15s;
  }
  .todo-done {
    background: oklch(0.72 0.19 142 / 0.2);
    color: oklch(0.72 0.19 142);
  }

  /* ── Detail / expanded row ──────────────────────────────────────────────── */
  .detail-row { background: var(--btn-plain-bg-hover); }
  .detail-section { display: flex; flex-direction: column; }
  .detail-title {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    opacity: 0.45;
    margin-bottom: 0.35rem;
  }

  /* ── Category badge ─────────────────────────────────────────────────────── */
  .category-badge {
    display: inline-block;
    background: oklch(0.55 0.15 var(--hue) / 0.15);
    color: var(--primary);
    border-radius: 0.375rem;
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* ── Tag badges ─────────────────────────────────────────────────────────── */
  .tag-badge {
    display: inline-block;
    background: var(--btn-regular-bg);
    border-radius: 9999px;
    padding: 0.15rem 0.65rem;
    font-size: 0.75rem;
    opacity: 0.75;
    transition: opacity 0.15s;
  }
  .tag-badge:hover { opacity: 1; }

  /* ── Task checklist ─────────────────────────────────────────────────────── */
  .task-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .task-done {
    text-decoration: line-through;
    opacity: 0.45;
  }
</style>
