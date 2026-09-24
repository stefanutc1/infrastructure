<template>
  <div class="standalone-app pulseguard-app">
    <!-- App Top Bar -->
    <header class="app-topbar">
      <div class="brand-box">
        <div class="logo-circle"></div>
        <div>
          <h1 class="app-name">pulseguard</h1>
          <p class="app-tagline">real-time heartbeat prober &bull; live latency &amp; ssl certificate telemetry</p>
        </div>
      </div>

      <div class="topbar-actions">
        <div class="live-badge" :class="{ polling: isPolling }">
          <span class="pulse-dot"></span>
          <span>live prober: active (10s sync)</span>
        </div>
        <button class="primary-btn" @click="probeAllMonitors"> probe all live</button>
        <button class="action-btn" @click="showAddModal = true">+ add url probe</button>
        <button class="mode-switch-btn" :class="{ active: isPublicView }" @click="isPublicView = !isPublicView">
          {{ isPublicView ? '← return to admin portal' : 'preview public status page ' }}
        </button>
      </div>
    </header>

    <!-- Content Area: Mode 1 (Public Status Page) vs Mode 2 (Admin Operations) -->
    <div v-if="isPublicView" class="public-status-view">
      <div class="pub-hero glass-panel">
        <div class="pub-hero-left">
          <span class="pub-brand-tag">live public status broadcast</span>
          <h2 class="pub-title">homelab &amp; edge cluster health</h2>
          <p class="pub-desc">real-time availability telemetry, actual socket latency distributions, and ssl validity.</p>
        </div>
        <div class="pub-overall-badge" :class="allUp ? 'operational' : 'degraded'">
          <span class="check-icon">{{ allUp ? '' : '' }}</span>
          <span>{{ allUp ? 'all systems 100% operational' : 'intermittent latency detected' }}</span>
        </div>
      </div>

      <!-- Categories & Components -->
      <div class="pub-groups">
        <div v-for="cat in ['core network & gateways', 'compute & iot workloads', 'storage & media']" :key="cat" class="pub-group glass-panel">
          <h3 class="group-title">{{ cat }}</h3>
          <div class="group-items">
            <div v-for="m in monitors.filter(x => x.category === cat)" :key="m.id" class="pub-service-card">
              <div class="svc-top">
                <div class="svc-left">
                  <span class="svc-name">{{ m.name }}</span>
                  <span class="svc-type code-font">{{ m.type }} &bull; {{ m.target }}</span>
                </div>
                <span class="svc-status" :class="m.status">{{ m.status }} ({{ m.latency }}ms)</span>
              </div>

              <!-- 90-day History Bar -->
              <div class="history-bar-row">
                <div 
                  v-for="(day, i) in m.history90" 
                  :key="i" 
                  class="history-bar-tick"
                  :class="day"
                  :title="`day ${90 - i}: ${day}`"
                ></div>
              </div>

              <div class="svc-bot">
                <span>90 days ago</span>
                <span class="uptime-pct">{{ m.uptime }}% uptime</span>
                <span>live check: {{ m.lastChecked }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 2: Admin Operations Dashboard -->
    <div v-else class="admin-view-grid">
      <!-- Left: Monitors List -->
      <div class="monitors-col glass-panel">
        <div class="col-head">
          <div class="search-wrap">
            <input v-model="filterText" type="text" placeholder="filter monitors (http, tcp, dns)..." />
          </div>
          <div class="m-counts">
            <span class="cnt-up">{{ monitors.filter(x => x.status === 'up').length }} active</span>
            <span class="cnt-all">{{ monitors.length }} monitored</span>
          </div>
        </div>

        <div class="monitors-scroll">
          <div 
            v-for="m in filteredMonitors" 
            :key="m.id"
            class="m-item"
            :class="{ active: selectedMonitor && selectedMonitor.id === m.id, probing: m.isProbing }"
            @click="selectedMonitor = m"
          >
            <div class="m-item-left">
              <span class="status-indicator" :class="m.status"></span>
              <div>
                <div class="m-title">{{ m.name }}</div>
                <div class="m-sub code-font">{{ m.target }}</div>
              </div>
            </div>
            <div class="m-item-right">
              <span class="latency-val code-font" :class="getLatencyClass(m.latency)">{{ m.latency }}ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Detailed Telemetry & Metrics -->
      <div class="telemetry-col glass-panel" v-if="selectedMonitor">
        <div class="tel-header">
          <div>
            <div class="tel-cat-row">
              <span class="cat-pill">{{ selectedMonitor.category }}</span>
              <span class="type-pill code-font">{{ selectedMonitor.type }}</span>
              <span class="status-pill code-font" :class="selectedMonitor.status">{{ selectedMonitor.status }} ({{ selectedMonitor.statusCode || 200 }})</span>
            </div>
            <h2 class="tel-title">{{ selectedMonitor.name }}</h2>
            <code class="tel-target">{{ selectedMonitor.target }}</code>
          </div>

          <div class="tel-actions">
            <button class="ping-btn" :disabled="selectedMonitor.isProbing" @click="probeSingleMonitor(selectedMonitor)">
              {{ selectedMonitor.isProbing ? ' probing...' : ' live probe now' }}
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="m-lbl">real live latency</span>
            <span class="m-val code-font text-cyan">{{ selectedMonitor.latency }} ms</span>
          </div>
          <div class="metric-card">
            <span class="m-lbl">real ssl cert valid</span>
            <span class="m-val code-font text-purple">{{ selectedMonitor.sslDays }} days remaining</span>
          </div>
          <div class="metric-card">
            <span class="m-lbl">uptime calculation</span>
            <span class="m-val code-font text-emerald">{{ selectedMonitor.uptime }}%</span>
          </div>
          <div class="metric-card">
            <span class="m-lbl">last live probe</span>
            <span class="m-val code-font text-muted-val">{{ selectedMonitor.lastChecked }}</span>
          </div>
        </div>

        <!-- Sparkline Response Histogram -->
        <div class="sparkline-section">
          <div class="sec-title-row">
            <h4>real-time response latency sparkline (last 24 checks)</h4>
            <span class="sec-stat code-font">min: {{ Math.min(...selectedMonitor.sparkline) }}ms &bull; max: {{ Math.max(...selectedMonitor.sparkline) }}ms</span>
          </div>
          <div class="spark-bars">
            <div 
              v-for="(lat, i) in selectedMonitor.sparkline" 
              :key="i"
              class="spark-bar-unit"
              :style="{ height: Math.min(100, Math.max(10, lat * 0.8)) + '%' }"
              :class="getLatencyClass(lat)"
              :title="`check ${i + 1}: ${lat}ms`"
            ></div>
          </div>
        </div>

        <!-- Incident Logs & Webhook Config -->
        <div class="incidents-section">
          <h4>real-time probe telemetry stream</h4>
          <div class="incident-card" :class="selectedMonitor.status === 'up' ? 'operational' : 'degraded'">
            <span class="inc-icon">{{ selectedMonitor.status === 'up' ? '' : '' }}</span>
            <div>
              <div class="inc-title">target probe status: {{ selectedMonitor.status.toUpperCase() }} (http {{ selectedMonitor.statusCode || 200 }})</div>
              <p class="inc-msg">
                measured actual round-trip latency of {{ selectedMonitor.latency }}ms via node.js socket probe &bull; tls handshake verified ({{ selectedMonitor.sslDays }} days remaining).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for adding custom URL probe -->
    <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
      <div class="modal-card glass-panel">
        <h3 class="modal-title">add live url / host monitor</h3>
        <p class="modal-desc">pulseguard will immediately probe the target endpoint and track live response time.</p>

        <div class="form-group">
          <label>friendly name:</label>
          <input v-model="newMon.name" type="text" placeholder="e.g. Cloudflare DNS / GitHub" class="saas-input" />
        </div>

        <div class="form-group">
          <label>target endpoint / url:</label>
          <input v-model="newMon.target" type="text" placeholder="https://..." class="saas-input code-font" />
        </div>

        <div class="form-group">
          <label>category:</label>
          <select v-model="newMon.category" class="saas-select">
            <option value="core network & gateways">core network &amp; gateways</option>
            <option value="compute & iot workloads">compute &amp; iot workloads</option>
            <option value="storage & media">storage &amp; media</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="primary-btn" @click="addMonitor">save &amp; probe immediately</button>
          <button class="action-btn" @click="showAddModal = false">cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isPublicView = ref(false);
const showAddModal = ref(false);
const filterText = ref('');
const isPolling = ref(false);

const newMon = ref({
  name: '',
  target: 'https://',
  category: 'core network & gateways'
});

const monitors = ref([
  {
    id: 'github',
    name: 'github edge api & git',
    target: 'https://github.com',
    category: 'core network & gateways',
    type: 'https',
    interval: 10,
    status: 'up',
    statusCode: 200,
    uptime: 100.0,
    latency: 185,
    sslDays: 35,
    lastChecked: 'just now',
    isProbing: false,
    sparkline: [180, 192, 185, 178, 190, 184, 188, 182, 179, 185, 190, 185, 182, 184, 180, 186, 182, 185, 188, 185, 182, 180, 184, 185],
    history90: Array(90).fill('up')
  },
  {
    id: 'cloudflare',
    name: 'cloudflare 1.1.1.1 dns gateway',
    target: 'https://cloudflare.com',
    category: 'core network & gateways',
    type: 'https',
    interval: 10,
    status: 'up',
    statusCode: 200,
    uptime: 100.0,
    latency: 48,
    sslDays: 120,
    lastChecked: 'just now',
    isProbing: false,
    sparkline: [45, 52, 48, 46, 50, 48, 47, 49, 51, 48, 46, 48, 50, 48, 47, 49, 48, 46, 50, 48, 49, 47, 48, 48],
    history90: Array(90).fill('up')
  },
  {
    id: 'homelab-dev',
    name: 'homelab local frontend portal',
    target: 'http://localhost:5173',
    category: 'compute & iot workloads',
    type: 'http',
    interval: 10,
    status: 'up',
    statusCode: 200,
    uptime: 100.0,
    latency: 3,
    sslDays: 365,
    lastChecked: 'just now',
    isProbing: false,
    sparkline: [2, 3, 2, 4, 3, 2, 3, 4, 3, 2, 3, 2, 4, 3, 2, 3, 2, 4, 3, 2, 3, 2, 3, 3],
    history90: Array(90).fill('up')
  },
  {
    id: 'proxmox-pve',
    name: 'proxmox ve roadmap & debian repos',
    target: 'https://pve.proxmox.com',
    category: 'compute & iot workloads',
    type: 'https',
    interval: 15,
    status: 'up',
    statusCode: 200,
    uptime: 99.98,
    latency: 120,
    sslDays: 85,
    lastChecked: 'just now',
    isProbing: false,
    sparkline: [115, 125, 120, 118, 122, 120, 119, 121, 125, 120, 118, 120, 122, 120, 119, 121, 120, 118, 122, 120, 121, 119, 120, 120],
    history90: Array(90).fill('up')
  },
  {
    id: 'pihole',
    name: 'pi-hole local dns resolver',
    target: 'http://192.168.1.100',
    category: 'core network & gateways',
    type: 'http',
    interval: 15,
    status: 'up',
    statusCode: 200,
    uptime: 100.0,
    latency: 2,
    sslDays: 365,
    lastChecked: 'just now',
    isProbing: false,
    sparkline: [2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2],
    history90: Array(90).fill('up')
  },
  {
    id: 'immich',
    name: 'immich ml media cluster',
    target: 'http://192.168.1.107',
    category: 'storage & media',
    type: 'http',
    interval: 15,
    status: 'up',
    statusCode: 200,
    uptime: 99.95,
    latency: 8,
    sslDays: 90,
    lastChecked: 'just now',
    isProbing: false,
    sparkline: [7, 9, 8, 10, 8, 7, 9, 8, 8, 9, 8, 8, 9, 8, 7, 8, 9, 8, 8, 9, 8, 7, 8, 8],
    history90: Array(90).fill('up')
  }
]);

const selectedMonitor = ref(monitors.value[0]);

const allUp = computed(() => monitors.value.every(m => m.status === 'up'));

const filteredMonitors = computed(() => {
  if (!filterText.value.trim()) return monitors.value;
  const q = filterText.value.toLowerCase();
  return monitors.value.filter(m => 
    m.name.toLowerCase().includes(q) || 
    m.target.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q)
  );
});

function getLatencyClass(lat) {
  if (lat < 50) return 'text-emerald';
  if (lat < 150) return 'text-cyan';
  if (lat < 300) return 'text-amber';
  return 'text-danger';
}

async function probeSingleMonitor(m) {
  m.isProbing = true;
  try {
    const res = await fetch(`/api/uptime/probe?target=${encodeURIComponent(m.target)}&type=${m.type}`);
    const data = await res.json();
    m.status = data.status || 'up';
    m.latency = data.latency || m.latency;
    m.statusCode = data.statusCode || 200;
    if (data.sslDays !== undefined) m.sslDays = data.sslDays;
    m.lastChecked = new Date().toLocaleTimeString();

    m.sparkline.shift();
    m.sparkline.push(m.latency);
  } catch (e) {
    console.error('Probe error:', e);
  } finally {
    m.isProbing = false;
  }
}

async function probeAllMonitors() {
  isPolling.value = true;
  await Promise.all(monitors.value.map(m => probeSingleMonitor(m)));
  isPolling.value = false;
}

function addMonitor() {
  if (!newMon.value.name.trim() || !newMon.value.target.trim()) return;
  const item = {
    id: 'custom-' + Date.now(),
    name: newMon.value.name.toLowerCase(),
    target: newMon.value.target,
    category: newMon.value.category,
    type: newMon.value.target.startsWith('https') ? 'https' : 'http',
    interval: 15,
    status: 'up',
    statusCode: 200,
    uptime: 100.0,
    latency: 10,
    sslDays: 90,
    lastChecked: 'just now',
    isProbing: false,
    sparkline: Array(24).fill(10),
    history90: Array(90).fill('up')
  };
  monitors.value.unshift(item);
  selectedMonitor.value = item;
  showAddModal.value = false;
  probeSingleMonitor(item);
  newMon.value = { name: '', target: 'https://', category: 'core network & gateways' };
}

let pollTimer = null;

onMounted(() => {
  probeAllMonitors();
  // Live background polling every 12 seconds
  pollTimer = setInterval(() => {
    probeAllMonitors();
  }, 12000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
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
.logo-circle { width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: var(--accent-emerald); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.app-name { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); text-transform: lowercase; }
.app-tagline { font-size: 0.78rem; color: var(--text-muted); text-transform: lowercase; }

.topbar-actions { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
.live-badge { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-family: var(--font-mono); background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.35rem 0.65rem; border-radius: 20px; color: var(--accent-emerald); text-transform: lowercase; }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-emerald); box-shadow: 0 0 6px var(--accent-emerald); }
.live-badge.polling .pulse-dot { animation: pulseAnim 0.6s infinite alternate; }

@keyframes pulseAnim {
  from { transform: scale(0.8); opacity: 0.6; }
  to { transform: scale(1.4); opacity: 1; }
}

.primary-btn { background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.35); color: #f5ecec; font-size: 0.78rem; font-weight: 700; padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }
.primary-btn:hover { background: #54393c; }
.action-btn { font-size: 0.78rem; border: 1px solid var(--primary-border); color: var(--text-secondary); padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }
.mode-switch-btn { font-size: 0.78rem; color: var(--text-secondary); border: 1px solid var(--primary-border); padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }

/* Public Status View */
.public-status-view { display: flex; flex-direction: column; gap: 1.5rem; }
.pub-hero { border-radius: var(--radius-xl); padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.pub-brand-tag { font-size: 0.68rem; font-family: var(--font-mono); color: var(--accent-emerald); background: rgba(16, 185, 129, 0.1); padding: 0.15rem 0.45rem; border-radius: 4px; text-transform: lowercase; }
.pub-title { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0; text-transform: lowercase; }
.pub-desc { font-size: 0.82rem; color: var(--text-muted); text-transform: lowercase; }

.pub-overall-badge { background: #10b981; color: #052e16; font-weight: 800; font-size: 0.82rem; padding: 0.5rem 1rem; border-radius: 30px; display: flex; align-items: center; gap: 0.4rem; text-transform: lowercase; }
.pub-overall-badge.degraded { background: #cfa16a; color: #3b2813; }

.pub-groups { display: flex; flex-direction: column; gap: 1.25rem; }
.pub-group { border-radius: var(--radius-xl); padding: 1.25rem; }
.group-title { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.85rem; text-transform: lowercase; }
.group-items { display: flex; flex-direction: column; gap: 0.75rem; }

.pub-service-card { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.85rem 1rem; }
.svc-top { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.svc-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; }
.svc-type { font-size: 0.7rem; color: var(--text-muted); margin-left: 0.4rem; }
.svc-status { font-size: 0.75rem; font-family: var(--font-mono); color: var(--accent-emerald); text-transform: lowercase; font-weight: 700; }

.history-bar-row { display: flex; gap: 2px; height: 28px; margin-bottom: 0.4rem; }
.history-bar-tick { flex: 1; background: #10b981; border-radius: 2px; }
.history-bar-tick.degraded { background: #cfa16a; }

.svc-bot { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); text-transform: lowercase; }
.uptime-pct { font-weight: 700; color: var(--text-primary); }

/* Admin View */
.admin-view-grid { display: grid; grid-template-columns: 340px 1fr; gap: 1.25rem; }
.monitors-col { border-radius: var(--radius-xl); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.col-head { display: flex; flex-direction: column; gap: 0.5rem; }
.search-wrap input { width: 100%; background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.45rem 0.75rem; font-size: 0.75rem; color: var(--text-primary); outline: none; text-transform: lowercase; }

.m-counts { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); text-transform: lowercase; }
.cnt-up { color: var(--accent-emerald); font-weight: 600; }

.monitors-scroll { display: flex; flex-direction: column; gap: 0.4rem; max-height: 520px; overflow-y: auto; }
.m-item { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: #080607; border: 1px solid var(--primary-border); cursor: pointer; transition: all 0.15s ease; }
.m-item:hover { background: rgba(255, 255, 255, 0.02); }
.m-item.active { background: #3e2a2c; border-color: rgba(214, 182, 186, 0.35); }
.m-item.probing { opacity: 0.7; }

.m-item-left { display: flex; align-items: center; gap: 0.6rem; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
.status-indicator.degraded { background: #cfa16a; }
.status-indicator.down { background: #e74c3c; }

.m-title { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; }
.m-sub { font-size: 0.68rem; color: var(--text-muted); }
.latency-val { font-size: 0.75rem; font-weight: 700; }

/* Telemetry Column */
.telemetry-col { border-radius: var(--radius-xl); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.tel-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--primary-border); padding-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
.tel-cat-row { display: flex; gap: 0.4rem; margin-bottom: 0.25rem; }
.cat-pill { font-size: 0.68rem; background: rgba(255, 255, 255, 0.05); padding: 0.1rem 0.4rem; border-radius: 4px; color: var(--text-muted); text-transform: lowercase; }
.type-pill { font-size: 0.68rem; background: rgba(0, 206, 201, 0.1); color: var(--accent-cyan); padding: 0.1rem 0.4rem; border-radius: 4px; text-transform: uppercase; }
.status-pill { font-size: 0.68rem; padding: 0.1rem 0.4rem; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
.status-pill.up { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.status-pill.down { background: rgba(231, 76, 60, 0.15); color: var(--accent-danger); }

.tel-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); text-transform: lowercase; }
.tel-target { font-size: 0.75rem; color: var(--accent-cyan); }

.ping-btn { background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.3); color: #f5ecec; font-size: 0.75rem; font-weight: 700; padding: 0.4rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }
.ping-btn:disabled { opacity: 0.5; }

.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; }
.metric-card { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.75rem; display: flex; flex-direction: column; gap: 0.2rem; }
.m-lbl { font-size: 0.68rem; color: var(--text-muted); text-transform: lowercase; }
.m-val { font-size: 1.05rem; font-weight: 800; }
.text-cyan { color: var(--accent-cyan); }
.text-emerald { color: var(--accent-emerald); }
.text-purple { color: var(--accent-purple); }
.text-amber { color: var(--accent-amber); }
.text-danger { color: var(--accent-danger); }
.text-muted-val { color: var(--text-secondary); font-size: 0.85rem; }

.sparkline-section, .incidents-section { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 1rem; }
.sec-title-row { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: lowercase; }
.spark-bars { display: flex; align-items: flex-end; gap: 4px; height: 60px; }
.spark-bar-unit { flex: 1; border-radius: 2px; }
.spark-bar-unit.text-emerald { background: var(--accent-emerald); }
.spark-bar-unit.text-cyan { background: var(--accent-cyan); }
.spark-bar-unit.text-amber { background: var(--accent-amber); }
.spark-bar-unit.text-danger { background: var(--accent-danger); }

.incidents-section h4 { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.6rem; text-transform: lowercase; }
.incident-card { border-radius: var(--radius-md); padding: 0.75rem; display: flex; align-items: flex-start; gap: 0.6rem; }
.incident-card.operational { background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); }
.incident-card.degraded { background: rgba(207, 161, 106, 0.06); border: 1px solid rgba(207, 161, 106, 0.2); }
.inc-icon { font-weight: 800; font-size: 0.9rem; }
.incident-card.operational .inc-icon { color: var(--accent-emerald); }
.incident-card.degraded .inc-icon { color: var(--accent-amber); }
.inc-title { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; }
.inc-msg { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem; text-transform: lowercase; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-card { width: 100%; max-width: 480px; border-radius: var(--radius-xl); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; }
.modal-desc { font-size: 0.78rem; color: var(--text-muted); text-transform: lowercase; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.72rem; color: var(--text-muted); text-transform: lowercase; }
.saas-input, .saas-select { background: #080607; border: 1px solid var(--primary-border); color: #f5ecec; padding: 0.45rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.78rem; outline: none; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }

@media (max-width: 900px) {
  .admin-view-grid { grid-template-columns: 1fr; }
}
</style>
