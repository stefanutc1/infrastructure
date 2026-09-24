<template>
  <div class="standalone-app gitforge-app">
    <!-- App Top Bar -->
    <header class="app-topbar">
      <div class="brand-box">
        <div class="logo-circle"></div>
        <div>
          <h1 class="app-name">gitforge lite</h1>
          <p class="app-tagline">live local git server &bull; direct sync with .git repository</p>
        </div>
      </div>

      <div class="topbar-actions">
        <div class="live-sync-chip">
          <span class="live-pulse"></span>
          <span>git: sync active</span>
        </div>
        <button class="primary-btn" @click="refreshGitData"> sync now</button>
        <button class="action-btn" @click="copyClone"> git clone</button>
      </div>
    </header>

    <!-- Main Repository Container -->
    <div class="repo-main glass-panel">
      <!-- Repo Header -->
      <div class="repo-header">
        <div class="repo-header-left">
          <div class="repo-type-tag">public repository &bull; live local git tree</div>
          <h2 class="repo-full-title">
            <span class="author-prefix">stefannut / </span>
            <span class="repo-accent">homelab</span>
          </h2>
          <div class="repo-meta-row">
            <span class="branch-pill"> {{ gitInfo.branch }}</span>
            <span class="commit-pill code-font" v-if="gitInfo.latestCommit.hash">
              HEAD: {{ gitInfo.latestCommit.hash }} &bull; {{ gitInfo.latestCommit.date }}
            </span>
            <span class="remote-pill code-font">{{ gitInfo.remote }}</span>
          </div>
        </div>

        <div class="repo-stats-boxes">
          <div class="stat-box">
            <span class="s-val">{{ gitInfo.totalCommits || commits.length }}</span>
            <span class="s-lbl">commits</span>
          </div>
          <div class="stat-box">
            <span class="s-val">{{ repoFiles.length }}</span>
            <span class="s-lbl">tracked files</span>
          </div>
          <div class="stat-box">
            <span class="s-val">4</span>
            <span class="s-lbl">nodes</span>
          </div>
        </div>
      </div>

      <!-- Tab Switcher: Files Browser vs Commits History -->
      <div class="repo-subtabs">
        <button 
          class="subtab-btn" 
          :class="{ active: viewMode === 'files' }" 
          @click="viewMode = 'files'"
        >
           files &amp; code tree
        </button>
        <button 
          class="subtab-btn" 
          :class="{ active: viewMode === 'commits' }" 
          @click="viewMode = 'commits'"
        >
           live git commit log ({{ commits.length }})
        </button>
      </div>

      <!-- Mode 1: Files Browser & Code Viewer -->
      <div v-if="viewMode === 'files'" class="repo-grid">
        <!-- Tree View -->
        <div class="file-tree-pane">
          <div class="pane-title-row">
            <input v-model="fileFilter" type="text" placeholder="filter tracked files..." class="file-filter-input" />
          </div>
          <ul class="file-list">
            <li 
              v-for="item in filteredFiles" 
              :key="item.path"
              class="file-item"
              :class="{ active: selectedFile && selectedFile.path === item.path }"
              @click="loadFile(item)"
            >
              <span class="file-icon"></span>
              <span class="file-name">{{ item.path }}</span>
              <span class="file-commit-msg">{{ item.lastCommit }}</span>
            </li>
          </ul>
        </div>

        <!-- Code Viewer Pane -->
        <div class="code-viewer-pane" v-if="selectedFile">
          <div class="code-header">
            <div class="code-file-title">
              <span class="file-type-dot"></span>
              <span class="file-path code-font">{{ selectedFile.path }}</span>
            </div>
            <div class="code-meta-info">
              <span>{{ selectedFile.lines }} lines</span> &bull;
              <span>{{ selectedFile.size }}</span> &bull;
              <button class="raw-copy-btn" @click="copyContent(fileContent)">copy</button>
            </div>
          </div>

          <div class="code-content-wrap">
            <pre class="code-text code-font"><code>{{ fileContent }}</code></pre>
          </div>
        </div>
      </div>

      <!-- Mode 2: Live Git Commits History & Diff Viewer -->
      <div v-else class="commits-grid">
        <!-- Commits List -->
        <div class="commits-list-col">
          <div class="commits-header-bar">
            <span>chronological git history &bull; branch: {{ gitInfo.branch }}</span>
          </div>
          <div class="commits-scroll">
            <div 
              v-for="c in commits" 
              :key="c.hash"
              class="commit-card"
              :class="{ active: selectedCommit && selectedCommit.hash === c.hash }"
              @click="loadCommitDiff(c)"
            >
              <div class="c-top">
                <span class="c-hash code-font">{{ c.hash }}</span>
                <span class="c-date">{{ c.date }}</span>
              </div>
              <div class="c-msg">{{ c.message }}</div>
              <div class="c-author">
                <span class="author-avatar">{{ c.author.charAt(0).toUpperCase() }}</span>
                <span>{{ c.author }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Commit Diff Viewer -->
        <div class="diff-viewer-col" v-if="selectedCommit">
          <div class="diff-header-bar">
            <div>
              <div class="diff-title-row">
                <span class="diff-hash code-font">{{ selectedCommit.hash }}</span>
                <h3 class="diff-msg">{{ selectedCommit.message }}</h3>
              </div>
              <div class="diff-sub">authored by <strong>{{ selectedCommit.author }}</strong> &bull; {{ selectedCommit.date }}</div>
            </div>
          </div>

          <div class="diff-body-wrap">
            <pre class="diff-pre code-font"><code>{{ commitDiff }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const viewMode = ref('files');
const fileFilter = ref('');

const gitInfo = ref({
  branch: 'main',
  remote: 'https://github.com/moanastefanut/homelab.git',
  totalCommits: 0,
  latestCommit: { hash: '', message: '', author: '', date: '' }
});

const commits = ref([]);
const repoFiles = ref([]);
const selectedFile = ref(null);
const fileContent = ref('// Loading file content...');
const selectedCommit = ref(null);
const commitDiff = ref('// Loading commit diff...');

const filteredFiles = computed(() => {
  if (!fileFilter.value.trim()) return repoFiles.value;
  const q = fileFilter.value.toLowerCase();
  return repoFiles.value.filter(f => f.path.toLowerCase().includes(q) || f.lastCommit.toLowerCase().includes(q));
});

async function refreshGitData() {
  try {
    const [infoRes, commitsRes, filesRes] = await Promise.all([
      fetch('/api/git/info').then(r => r.json()),
      fetch('/api/git/commits').then(r => r.json()),
      fetch('/api/git/files').then(r => r.json())
]);

    gitInfo.value = infoRes;
    commits.value = commitsRes;
    repoFiles.value = filesRes;

    if (filesRes.length > 0 && !selectedFile.value) {
      loadFile(filesRes.find(f => f.name === 'README.md') || filesRes[0]);
    }

    if (commitsRes.length > 0 && !selectedCommit.value) {
      loadCommitDiff(commitsRes[0]);
    }
  } catch (e) {
    console.error('Error syncing live git data:', e);
  }
}

async function loadFile(f) {
  selectedFile.value = f;
  fileContent.value = '// Loading...';
  try {
    const res = await fetch(`/api/git/file-content?path=${encodeURIComponent(f.path)}`);
    fileContent.value = await res.text();
  } catch (e) {
    fileContent.value = `// Error loading file: ${e.message}`;
  }
}

async function loadCommitDiff(c) {
  selectedCommit.value = c;
  commitDiff.value = '// Loading diff...';
  try {
    const res = await fetch(`/api/git/diff?hash=${c.hash}`);
    commitDiff.value = await res.text();
  } catch (e) {
    commitDiff.value = `// Error loading diff: ${e.message}`;
  }
}

function copyClone() {
  navigator.clipboard.writeText(`git clone ${gitInfo.value.remote}`);
}

function copyContent(text) {
  navigator.clipboard.writeText(text);
}

onMounted(() => {
  refreshGitData();
});
</script>

<style scoped>
.standalone-app { display: flex; flex-direction: column; gap: 1.5rem; }

.app-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--primary-border);
}

.brand-box { display: flex; align-items: center; gap: 0.75rem; }
.logo-circle { width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(192, 132, 252, 0.15); border: 1px solid rgba(192, 132, 252, 0.35); color: var(--accent-purple); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.app-name { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); text-transform: lowercase; }
.app-tagline { font-size: 0.78rem; color: var(--text-muted); text-transform: lowercase; }

.topbar-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.live-sync-chip { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-family: var(--font-mono); background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.3); padding: 0.35rem 0.65rem; border-radius: 20px; color: var(--accent-purple); text-transform: lowercase; }
.live-pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-purple); box-shadow: 0 0 6px var(--accent-purple); }

.primary-btn { background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.3); color: #f5ecec; font-size: 0.78rem; font-weight: 700; padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }
.primary-btn:hover { background: #54393c; }
.action-btn { font-size: 0.78rem; border: 1px solid var(--primary-border); color: var(--text-secondary); padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }

.repo-main { border-radius: var(--radius-xl); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

.repo-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--primary-border); padding-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
.repo-type-tag { font-size: 0.68rem; font-family: var(--font-mono); color: var(--accent-purple); background: rgba(192, 132, 252, 0.12); padding: 0.1rem 0.45rem; border-radius: 4px; display: inline-block; margin-bottom: 0.2rem; text-transform: lowercase; }
.repo-full-title { font-size: 1.35rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; }
.author-prefix { color: var(--text-muted); }
.repo-accent { color: var(--accent-purple); font-weight: 800; }

.repo-meta-row { display: flex; gap: 0.5rem; margin-top: 0.4rem; font-size: 0.72rem; color: var(--text-muted); flex-wrap: wrap; }
.branch-pill { background: rgba(255, 255, 255, 0.05); padding: 0.15rem 0.45rem; border-radius: 4px; color: var(--text-primary); }
.commit-pill { color: var(--accent-cyan); }
.remote-pill { color: var(--text-muted); }

.repo-stats-boxes { display: flex; gap: 0.75rem; }
.stat-box { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.45rem 0.75rem; text-align: center; min-width: 65px; }
.s-val { display: block; font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
.s-lbl { font-size: 0.65rem; color: var(--text-muted); text-transform: lowercase; }

.repo-subtabs { display: flex; gap: 0.5rem; border-bottom: 1px solid var(--primary-border); padding-bottom: 0.75rem; }
.subtab-btn { font-size: 0.8rem; font-weight: 600; padding: 0.4rem 0.85rem; border-radius: var(--radius-sm); color: var(--text-secondary); text-transform: lowercase; cursor: pointer; }
.subtab-btn:hover { background: rgba(255, 255, 255, 0.03); color: var(--text-primary); }
.subtab-btn.active { background: #3e2a2c; color: #f5ecec; border: 1px solid rgba(214, 182, 186, 0.25); font-weight: 700; }

/* Files Grid */
.repo-grid { display: grid; grid-template-columns: 320px 1fr; gap: 1.25rem; }

.file-tree-pane { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-lg); padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.file-filter-input { width: 100%; background: #120e0f; border: 1px solid var(--primary-border); border-radius: var(--radius-sm); padding: 0.4rem 0.6rem; font-size: 0.75rem; color: var(--text-primary); outline: none; }

.file-list { list-style: none; display: flex; flex-direction: column; gap: 0.2rem; max-height: 480px; overflow-y: auto; }
.file-item { display: flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.6rem; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 0.75rem; cursor: pointer; text-transform: lowercase; }
.file-item:hover { background: rgba(255, 255, 255, 0.03); color: var(--text-primary); }
.file-item.active { background: #3e2a2c; color: #f5ecec; font-weight: 700; }
.file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-commit-msg { font-size: 0.65rem; color: var(--text-muted); max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.code-viewer-pane { background: #060405; border: 1px solid var(--primary-border); border-radius: var(--radius-lg); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; min-height: 480px; }
.code-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--primary-border); padding-bottom: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
.code-file-title { display: flex; align-items: center; gap: 0.4rem; }
.file-type-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-purple); }
.file-path { color: var(--accent-purple); font-weight: 700; }

.raw-copy-btn { font-size: 0.68rem; background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.25); color: #f5ecec; padding: 0.15rem 0.45rem; border-radius: 4px; cursor: pointer; text-transform: lowercase; }
.code-content-wrap { overflow: auto; max-height: 440px; }
.code-text { font-size: 0.78rem; color: #f5ecec; margin: 0; line-height: 1.6; }

/* Commits Grid */
.commits-grid { display: grid; grid-template-columns: 360px 1fr; gap: 1.25rem; }
.commits-list-col { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-lg); padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.commits-header-bar { font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); padding-bottom: 0.4rem; border-bottom: 1px solid var(--primary-border); text-transform: lowercase; }
.commits-scroll { display: flex; flex-direction: column; gap: 0.4rem; max-height: 520px; overflow-y: auto; }

.commit-card { background: #120e0f; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.65rem 0.75rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.3rem; }
.commit-card:hover { background: rgba(255, 255, 255, 0.03); }
.commit-card.active { background: #3e2a2c; border-color: rgba(214, 182, 186, 0.35); }

.c-top { display: flex; justify-content: space-between; align-items: center; }
.c-hash { font-size: 0.72rem; color: var(--accent-purple); font-weight: 700; }
.c-date { font-size: 0.68rem; color: var(--text-muted); }
.c-msg { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); word-break: break-word; }
.c-author { display: flex; align-items: center; gap: 0.35rem; font-size: 0.68rem; color: var(--text-muted); }
.author-avatar { width: 16px; height: 16px; border-radius: 50%; background: #3e2a2c; color: #f5ecec; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; }

.diff-viewer-col { background: #060405; border: 1px solid var(--primary-border); border-radius: var(--radius-lg); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; min-height: 520px; }
.diff-header-bar { border-bottom: 1px solid var(--primary-border); padding-bottom: 0.65rem; }
.diff-title-row { display: flex; align-items: baseline; gap: 0.5rem; }
.diff-hash { font-size: 0.85rem; color: var(--accent-purple); font-weight: 700; }
.diff-msg { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
.diff-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem; }

.diff-body-wrap { overflow: auto; max-height: 440px; }
.diff-pre { font-size: 0.75rem; color: #baa6a8; margin: 0; line-height: 1.5; white-space: pre-wrap; }

@media (max-width: 900px) {
  .repo-grid, .commits-grid { grid-template-columns: 1fr; }
}
</style>
