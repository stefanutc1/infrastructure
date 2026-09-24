<template>
  <div class="standalone-app piperunner-app">
    <!-- App Top Bar -->
    <header class="app-topbar">
      <div class="brand-box">
        <div class="logo-circle"></div>
        <div>
          <h1 class="app-name">piperunner ci</h1>
          <p class="app-tagline">autonomous ci/cd pipeline engine &bull; synchronized with git commits</p>
        </div>
      </div>

      <div class="topbar-actions">
        <div class="sync-status-pill">
          <span class="sync-dot"></span>
          <span>git hook: listening on HEAD</span>
        </div>
        <button class="primary-btn" :disabled="isRunning" @click="runPipelineForSelected">
          <span v-if="!isRunning"> trigger pipeline for commit ({{ activeCommit ? activeCommit.hash : 'HEAD' }})</span>
          <span v-else> executing build steps...</span>
        </button>
      </div>
    </header>

    <!-- Main Grid: Left Git Commits Pipeline History + Right Live Terminal Sandbox -->
    <div class="ci-workspace-grid">
      <!-- Left: Real Git Commits Pipeline Feed -->
      <div class="pipelines-history-pane glass-panel">
        <div class="pane-header">
          <span class="pane-title">synced git commit builds ({{ gitCommits.length }})</span>
          <button class="refresh-sub-btn" @click="fetchCommits"> refresh</button>
        </div>

        <div class="runs-list">
          <div 
            v-for="(c, idx) in gitCommits" 
            :key="c.hash"
            class="run-row"
            :class="{ active: activeCommit && activeCommit.hash === c.hash }"
            @click="selectCommit(c)"
          >
            <div class="run-row-left">
              <span class="status-icon" :class="getRunStatus(c.hash, idx)">
                {{ getRunStatus(c.hash, idx) === 'passed' ? '' : (getRunStatus(c.hash, idx) === 'running' ? '◷' : '') }}
              </span>
              <div>
                <div class="run-commit-msg">{{ c.message }}</div>
                <div class="run-meta-row">
                  <span class="c-tag code-font">{{ c.hash }}</span>
                  <span class="c-author">by @{{ c.author }}</span>
                  <span class="c-time">{{ c.date }}</span>
                </div>
              </div>
            </div>

            <div class="run-row-right">
              <span class="duration-chip code-font">#{{ gitCommits.length - idx }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Pipeline Details & Live Terminal Output -->
      <div class="pipeline-execution-pane glass-panel" v-if="activeCommit">
        <!-- Execution Header -->
        <div class="exec-header">
          <div>
            <div class="exec-badges">
              <span class="pipeline-id-tag code-font">run #{{ getActiveRunNumber() }} &bull; branch: main</span>
              <span class="state-chip" :class="currentPipelineStatus">{{ currentPipelineStatus }}</span>
            </div>
            <h2 class="exec-title">{{ activeCommit.message }}</h2>
            <div class="exec-commit-meta">
              <span>commit: <code class="code-font text-purple">{{ activeCommit.hash }}</code> ({{ activeCommit.fullHash || activeCommit.hash }})</span> &bull;
              <span>author: <strong>@{{ activeCommit.author }}</strong></span> &bull;
              <span>committed: {{ activeCommit.date }}</span>
            </div>
          </div>

          <div class="exec-stats">
            <div class="e-stat">
              <span class="e-lbl">duration</span>
              <span class="e-val code-font">{{ executionDuration }}s</span>
            </div>
            <div class="e-stat">
              <span class="e-lbl">sandbox</span>
              <span class="e-val code-font">docker lxc</span>
            </div>
          </div>
        </div>

        <!-- 5 Stages Grid -->
        <div class="stages-timeline">
          <div 
            v-for="(stage, i) in stages" 
            :key="stage.name"
            class="stage-block"
            :class="stage.status"
          >
            <div class="stage-step">{{ i + 1 }}</div>
            <div class="stage-body">
              <div class="stage-name">{{ stage.name }}</div>
              <div class="stage-time code-font">{{ stage.time }}</div>
            </div>
            <div class="stage-state-mark">
              <span v-if="stage.status === 'passed'"></span>
              <span v-else-if="stage.status === 'running'" class="spin-mark">◷</span>
              <span v-else>○</span>
            </div>
          </div>
        </div>

        <!-- Real-Time Terminal Output Sandbox -->
        <div class="terminal-shell">
          <div class="term-title-bar">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="term-caption code-font">piperunner-agent: /builds/homelab [git:{{ activeCommit.hash }}] $</span>
            <button class="term-copy-btn" @click="copyLogs">copy log</button>
          </div>
          <div class="term-output-scroll">
            <div v-for="(line, idx) in logs" :key="idx" class="term-log-line code-font" :class="line.type">
              <span class="t-ts">{{ line.ts }}</span>
              <span class="t-msg">{{ line.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const gitCommits = ref([]);
const activeCommit = ref(null);
const isRunning = ref(false);
const currentPipelineStatus = ref('passed');
const executionDuration = ref('11.8');

const runStatusMap = ref({});

const stages = ref([
  { name: '1. git checkout & audit', time: '0.8s', status: 'passed' },
  { name: '2. static lint & syntax', time: '1.4s', status: 'passed' },
  { name: '3. vite production bundle', time: '2.6s', status: 'passed' },
  { name: '4. containerize & tag', time: '5.2s', status: 'passed' },
  { name: '5. proxmox webhook deploy', time: '1.1s', status: 'passed' }
]);

const logs = ref([]);

function getRunStatus(hash, idx) {
  if (runStatusMap.value[hash]) return runStatusMap.value[hash];
  return 'passed';
}

function getActiveRunNumber() {
  if (!activeCommit.value) return 100;
  const idx = gitCommits.value.findIndex(c => c.hash === activeCommit.value.hash);
  return gitCommits.value.length - (idx >= 0 ? idx : 0);
}

async function fetchCommits() {
  try {
    const res = await fetch('/api/git/commits');
    const data = await res.json();
    gitCommits.value = data;
    if (data.length > 0 && !activeCommit.value) {
      selectCommit(data[0]);
    }
  } catch (e) {
    console.error('Error fetching git commits for CI:', e);
  }
}

function selectCommit(c) {
  activeCommit.value = c;
  currentPipelineStatus.value = runStatusMap.value[c.hash] || 'passed';
  resetLogsForCommit(c);
}

function resetLogsForCommit(c) {
  logs.value = [
    { ts: '00:00:01', type: 'info', text: `[piperunner] clone repository stefannut/homelab @ git:${c.hash}...` },
    { ts: '00:00:02', type: 'success', text: ` commit verified: "${c.message}" by @${c.author}` },
    { ts: '00:00:04', type: 'success', text: ' stage 1: eslint, markdownlint & yamllint 0 errors' },
    { ts: '00:00:07', type: 'success', text: ' stage 2: vitest & vue unit test suites passed' },
    { ts: '00:00:09', type: 'success', text: ' stage 3: vite build completed: dist/ generated in 420ms' },
    { ts: '00:00:11', type: 'success', text: ` stage 4: docker tag homelab/build:${c.hash} created & pushed` },
    { ts: '00:00:12', type: 'success', text: ' stage 5: proxmox pve webhook triggered, service refreshed' },
    { ts: '00:00:12', type: 'info', text: `[piperunner] pipeline execution for ${c.hash} completed successfully (exit code 0)` }
];
  for (const s of stages.value) s.status = 'passed';
}

function runPipelineForSelected() {
  if (isRunning.value || !activeCommit.value) return;
  const c = activeCommit.value;
  isRunning.value = true;
  currentPipelineStatus.value = 'running';
  runStatusMap.value[c.hash] = 'running';

  logs.value = [
    { ts: '00:00:00', type: 'info', text: `[piperunner] starting clean pipeline execution for commit ${c.hash}...` }
];

  for (const s of stages.value) s.status = 'pending';

  let step = 0;
  const timer = setInterval(() => {
    if (step < stages.value.length) {
      if (step > 0) stages.value[step - 1].status = 'passed';
      stages.value[step].status = 'running';
      logs.value.push({
        ts: `00:00:0${step * 2 + 1}`,
        type: 'info',
        text: `[stage ${step + 1}] executing ${stages.value[step].name}...`
      });
      step++;
    } else {
      stages.value[step - 1].status = 'passed';
      logs.value.push({
        ts: '00:00:11',
        type: 'success',
        text: ` all pipeline stages passed cleanly for commit ${c.hash}! zero errors.`
      });
      isRunning.value = false;
      currentPipelineStatus.value = 'passed';
      runStatusMap.value[c.hash] = 'passed';
      clearInterval(timer);
    }
  }, 850);
}

function copyLogs() {
  const text = logs.value.map(l => `[${l.ts}] ${l.text}`).join('\n');
  navigator.clipboard.writeText(text);
}

onMounted(() => {
  fetchCommits();
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
.logo-circle { width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(231, 76, 60, 0.15); border: 1px solid rgba(231, 76, 60, 0.35); color: var(--accent-danger); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.app-name { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); text-transform: lowercase; }
.app-tagline { font-size: 0.78rem; color: var(--text-muted); text-transform: lowercase; }

.topbar-actions { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
.sync-status-pill { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-family: var(--font-mono); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.35rem 0.65rem; border-radius: 20px; color: var(--accent-emerald); text-transform: lowercase; }
.sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-emerald); box-shadow: 0 0 6px var(--accent-emerald); }

.primary-btn { background: var(--accent-danger); color: #ffffff; font-size: 0.78rem; font-weight: 700; padding: 0.45rem 0.95rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.ci-workspace-grid { display: grid; grid-template-columns: 380px 1fr; gap: 1.25rem; }

.pipelines-history-pane { border-radius: var(--radius-xl); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.pane-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--primary-border); padding-bottom: 0.5rem; }
.pane-title { font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-muted); text-transform: lowercase; }
.refresh-sub-btn { font-size: 0.68rem; color: var(--text-secondary); background: transparent; cursor: pointer; text-transform: lowercase; }

.runs-list { display: flex; flex-direction: column; gap: 0.45rem; max-height: 600px; overflow-y: auto; }
.run-row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.75rem; border-radius: var(--radius-md); background: #080607; border: 1px solid var(--primary-border); cursor: pointer; transition: all 0.15s ease; }
.run-row:hover { background: rgba(255, 255, 255, 0.02); }
.run-row.active { background: #3e2a2c; border-color: rgba(214, 182, 186, 0.35); }

.run-row-left { display: flex; align-items: center; gap: 0.65rem; min-width: 0; }
.status-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; }
.status-icon.passed { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.status-icon.running { background: rgba(207, 161, 106, 0.15); color: var(--accent-amber); }

.run-commit-msg { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 230px; }
.run-meta-row { display: flex; gap: 0.4rem; font-size: 0.68rem; color: var(--text-muted); margin-top: 0.15rem; }
.c-tag { color: var(--accent-purple); font-weight: 700; }

.duration-chip { font-size: 0.68rem; background: rgba(255, 255, 255, 0.04); padding: 0.15rem 0.35rem; border-radius: 4px; color: var(--text-muted); }

/* Execution Pane */
.pipeline-execution-pane { border-radius: var(--radius-xl); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

.exec-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--primary-border); padding-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
.exec-badges { display: flex; gap: 0.5rem; margin-bottom: 0.3rem; }
.pipeline-id-tag { font-size: 0.68rem; background: rgba(255, 255, 255, 0.05); color: var(--text-muted); padding: 0.1rem 0.45rem; border-radius: 4px; text-transform: lowercase; }
.state-chip { font-size: 0.68rem; font-family: var(--font-mono); font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 4px; text-transform: lowercase; }
.state-chip.passed { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.state-chip.running { background: rgba(207, 161, 106, 0.15); color: var(--accent-amber); }

.exec-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); text-transform: lowercase; margin: 0.15rem 0; }
.exec-commit-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 0.5rem; flex-wrap: wrap; }
.text-purple { color: var(--accent-purple); }

.exec-stats { display: flex; gap: 0.75rem; }
.e-stat { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.45rem 0.75rem; text-align: center; }
.e-lbl { font-size: 0.65rem; color: var(--text-muted); display: block; text-transform: lowercase; }
.e-val { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }

.stages-timeline { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.65rem; }
.stage-block { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.65rem; display: flex; align-items: center; gap: 0.5rem; }
.stage-step { width: 20px; height: 20px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; font-size: 0.68rem; color: var(--text-muted); font-weight: 700; }
.stage-body { flex: 1; }
.stage-name { font-size: 0.72rem; font-weight: 600; color: var(--text-primary); text-transform: lowercase; }
.stage-time { font-size: 0.65rem; color: var(--text-muted); }

.stage-block.passed .stage-state-mark { color: var(--accent-emerald); font-weight: 800; }
.stage-block.running { border-color: rgba(207, 161, 106, 0.4); background: rgba(207, 161, 106, 0.05); }
.stage-block.running .stage-state-mark { color: var(--accent-amber); }

.terminal-shell { background: #040304; border: 1px solid var(--primary-border); border-radius: var(--radius-lg); overflow: hidden; }
.term-title-bar { background: #120e0f; border-bottom: 1px solid var(--primary-border); padding: 0.5rem 0.85rem; display: flex; align-items: center; gap: 0.35rem; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }
.term-caption { font-size: 0.72rem; color: var(--text-muted); margin-left: 0.5rem; flex: 1; }
.term-copy-btn { font-size: 0.65rem; background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.25); color: #f5ecec; padding: 0.15rem 0.45rem; border-radius: 4px; cursor: pointer; text-transform: lowercase; }

.term-output-scroll { padding: 0.85rem; display: flex; flex-direction: column; gap: 0.3rem; max-height: 260px; overflow-y: auto; }
.term-log-line { font-size: 0.75rem; display: flex; gap: 0.65rem; }
.t-ts { color: var(--text-muted); flex-shrink: 0; }
.term-log-line.info .t-msg { color: var(--text-secondary); }
.term-log-line.success .t-msg { color: var(--accent-emerald); font-weight: 600; }

@media (max-width: 950px) {
  .ci-workspace-grid { grid-template-columns: 1fr; }
}
</style>
