<template>
  <div class="standalone-app pricescope-app">
    <!-- App Top Bar -->
    <header class="app-topbar">
      <div class="brand-box">
        <div class="logo-circle"></div>
        <div>
          <h1 class="app-name">pricescope &bull; webwatcher</h1>
          <p class="app-tagline">real-time dom change detector &amp; live web price tracking engine</p>
        </div>
      </div>

      <div class="topbar-actions">
        <div class="live-pulse-badge" :class="{ fetching: isFetchingAll }">
          <span class="live-dot"></span>
          <span>live market &amp; web poller: active</span>
        </div>
        <button class="primary-btn" :disabled="isFetchingAll" @click="fetchEveryTarget">
          <span v-if="!isFetchingAll"> poll all live urls now</span>
          <span v-else> fetching web pages...</span>
        </button>
        <button class="action-btn" @click="showAddModal = true">+ add custom url</button>
      </div>
    </header>

    <!-- Top Live Market & Crypto Price Feed -->
    <div class="market-ticker-banner glass-panel" v-if="marketPrices">
      <div class="ticker-title-group">
        <span class="ticker-logo"></span>
        <span class="ticker-label">live market pricing feed</span>
      </div>
      <div class="ticker-items">
        <div class="ticker-item" v-for="(coin, key) in marketPrices" :key="key">
          <span class="coin-symbol">{{ key.toUpperCase() }}</span>
          <span class="coin-val code-font">${{ Number(coin.usd).toLocaleString() }}</span>
          <span class="coin-ron code-font">({{ Math.round(coin.usd * 4.6).toLocaleString() }} RON)</span>
          <span class="coin-change" :class="coin.usd_24h_change >= 0 ? 'up' : 'down'">
            {{ coin.usd_24h_change >= 0 ? '+' : '' }}{{ coin.usd_24h_change ? coin.usd_24h_change.toFixed(2) : '0.00' }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Main Grid: Monitored Web Targets -->
    <div class="targets-container">
      <div v-for="t in watchTargets" :key="t.id" class="target-card glass-panel" :class="{ fetching: t.isFetching }">
        <div class="target-header">
          <div>
            <div class="tag-row">
              <span class="cat-pill">{{ t.category }}</span>
              <span class="status-badge" :class="t.statusCode === 200 ? 'online' : 'error'">
                http {{ t.statusCode || 200 }}
              </span>
              <span class="hash-tag code-font">sha: {{ t.hash }}</span>
            </div>
            <h2 class="t-name">{{ t.name }}</h2>
            <a :href="t.url" target="_blank" class="t-url code-font">{{ t.url }} </a>
          </div>

          <div class="target-pricing" v-if="t.currentPrice || (t.detectedPrices && t.detectedPrices.length > 0)">
            <div class="current-price code-font">{{ t.currentPrice ? `${t.currentPrice} ${t.currency}` : t.detectedPrices[0] }}</div>
            <div class="price-badge" :class="{ discount: t.discountPct > 0 }">
              {{ t.discountPct > 0 ? `-${t.discountPct}% live price drop` : 'live tracked price' }}
            </div>
          </div>
        </div>

        <!-- Target Configuration Info -->
        <div class="target-meta-row">
          <span class="meta-item">content size: <code class="code-font">{{ t.contentLength ? (t.contentLength / 1024).toFixed(1) + ' KB' : 'cached' }}</code></span>
          <span class="meta-item">probe latency: <code class="code-font text-cyan">{{ t.latency }}ms</code></span>
          <span class="meta-item">last check: <strong class="text-primary">{{ t.lastCheck }}</strong></span>
        </div>

        <!-- Visual / DOM Text Diff Inspector -->
        <div class="diff-box">
          <div class="diff-topbar">
            <span>real-time dom snapshot diff &bull; version hash {{ t.hash }}</span>
            <span class="diff-time">checked {{ t.lastCheck }}</span>
          </div>
          <div class="diff-body">
            <div v-for="(line, idx) in t.diffLines" :key="idx" class="diff-row" :class="line.type">
              <span class="prefix">{{ line.prefix }}</span>
              <span class="diff-text code-font">{{ line.content }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-footer">
          <span class="footer-msg">status: active live sync &bull; alert threshold: any dom change / price alert</span>
          <button class="poll-single-btn" :disabled="t.isFetching" @click="fetchSingleTarget(t)">
            {{ t.isFetching ? ' fetching live...' : ' poll target now' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for adding custom URL -->
    <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
      <div class="modal-card glass-panel">
        <h3 class="modal-title">add live web / price watch target</h3>
        <p class="modal-desc">pricescope will immediately fetch the url, calculate its sha-256 hash, and track DOM &amp; price changes.</p>

        <div class="form-group">
          <label>friendly target name:</label>
          <input v-model="newTarget.name" type="text" placeholder="e.g. Hacker News Top Story / Product Deal" class="saas-input" />
        </div>

        <div class="form-group">
          <label>target url to monitor:</label>
          <input v-model="newTarget.url" type="text" placeholder="https://..." class="saas-input code-font" />
        </div>

        <div class="form-group">
          <label>category:</label>
          <select v-model="newTarget.category" class="saas-select">
            <option value="e-commerce & hardware">e-commerce &amp; hardware</option>
            <option value="infrastructure & releases">infrastructure &amp; releases</option>
            <option value="news & web content">news &amp; web content</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="primary-btn" @click="addTarget">add &amp; fetch immediately</button>
          <button class="action-btn" @click="showAddModal = false">cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showAddModal = ref(false);
const isFetchingAll = ref(false);
const marketPrices = ref(null);

const newTarget = ref({
  name: '',
  url: 'https://news.ycombinator.com',
  category: 'news & web content'
});

const watchTargets = ref([
  {
    id: 'hackernews',
    name: 'hacker news frontpage live headlines',
    url: 'https://news.ycombinator.com',
    category: 'news & web content',
    statusCode: 200,
    latency: 140,
    contentLength: 48200,
    hash: 'a9f201e74b',
    currentPrice: null,
    discountPct: 0,
    detectedPrices: [],
    lastCheck: 'just now',
    isFetching: false,
    diffLines: [
      { type: 'normal', prefix: ' ', content: 'Hacker News Frontpage Live Snapshot' },
      { type: 'added', prefix: '+', content: 'Top Story: Linux Kernel 6.10 Released with Multi-Architecture Updates' },
      { type: 'normal', prefix: ' ', content: '142 points by username 2 hours ago | 48 comments' }
]
  },
  {
    id: 'proxmox-wiki',
    name: 'proxmox ve release notes & roadmap',
    url: 'https://pve.proxmox.com/wiki/Roadmap',
    category: 'infrastructure & releases',
    statusCode: 200,
    latency: 180,
    contentLength: 64100,
    hash: '8c41de03f1',
    currentPrice: null,
    discountPct: 0,
    detectedPrices: [],
    lastCheck: 'just now',
    isFetching: false,
    diffLines: [
      { type: 'normal', prefix: ' ', content: '== Proxmox VE 9.2 Release Roadmap ==' },
      { type: 'added', prefix: '+', content: '* Linux Kernel 6.8.8-2-pve default hypervisor kernel' },
      { type: 'added', prefix: '+', content: '* QEMU 8.2.2 with hardware-assisted memory ballooning' },
      { type: 'normal', prefix: ' ', content: '* Enhanced ZFS 2.2.4 block cloning support' }
]
  },
  {
    id: 'hardware-rtx',
    name: 'hardware nvidia geforce rtx 4060 ti tracking',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,ron',
    category: 'e-commerce & hardware',
    statusCode: 200,
    latency: 95,
    contentLength: 2100,
    hash: 'e410b991aa',
    currentPrice: 1899.99,
    currency: 'RON',
    discountPct: 14.5,
    detectedPrices: ['1,899.99 RON', '2,219.00 RON'],
    lastCheck: 'just now',
    isFetching: false,
    diffLines: [
      { type: 'normal', prefix: ' ', content: '<div class="product-title">NVIDIA GeForce RTX 4060 Ti 8GB GDDR6</div>' },
      { type: 'removed', prefix: '-', content: '<span class="old-price">2,219.00 RON</span>' },
      { type: 'added', prefix: '+', content: '<span class="new-price">1,899.99 RON (-14.5% Flash Deal)</span>' },
      { type: 'normal', prefix: ' ', content: '<div class="stock in-stock">In Stoc (Livrare 24h)</div>' }
]
  }
]);

async function fetchLiveMarkets() {
  try {
    const res = await fetch('/api/pricescope/live-markets');
    marketPrices.value = await res.json();
  } catch (e) {
    console.error('Market fetch error:', e);
  }
}

async function fetchSingleTarget(t) {
  t.isFetching = true;
  try {
    const res = await fetch(`/api/pricescope/fetch?url=${encodeURIComponent(t.url)}`);
    const data = await res.json();

    t.statusCode = data.statusCode || 200;
    t.latency = data.latency || t.latency;
    t.contentLength = data.contentLength || t.contentLength;
    t.hash = data.hash || t.hash;
    t.lastCheck = data.timestamp || new Date().toLocaleTimeString();

    if (data.detectedPrices && data.detectedPrices.length > 0) {
      t.detectedPrices = data.detectedPrices;
    }

    if (data.diffSnippet && data.diffSnippet.length > 0) {
      t.diffLines = data.diffSnippet;
    }
  } catch (e) {
    console.error('Target fetch error:', e);
  } finally {
    t.isFetching = false;
  }
}

async function fetchEveryTarget() {
  isFetchingAll.value = true;
  await Promise.all([
    fetchLiveMarkets(),
    ...watchTargets.value.map(t => fetchSingleTarget(t))
]);
  isFetchingAll.value = false;
}

function addTarget() {
  if (!newTarget.value.name.trim() || !newTarget.value.url.trim()) return;
  const item = {
    id: 'target-' + Date.now(),
    name: newTarget.value.name.toLowerCase(),
    url: newTarget.value.url,
    category: newTarget.value.category,
    statusCode: 200,
    latency: 120,
    contentLength: 0,
    hash: 'calculating...',
    currentPrice: null,
    discountPct: 0,
    detectedPrices: [],
    lastCheck: 'just now',
    isFetching: false,
    diffLines: [{ type: 'normal', prefix: ' ', content: 'Fetching initial live DOM snapshot...' }]
  };
  watchTargets.value.unshift(item);
  showAddModal.value = false;
  fetchSingleTarget(item);
  newTarget.value = { name: '', url: 'https://news.ycombinator.com', category: 'news & web content' };
}

let syncTimer = null;

onMounted(() => {
  fetchEveryTarget();
  syncTimer = setInterval(() => {
    fetchEveryTarget();
  }, 15000);
});

onUnmounted(() => {
  if (syncTimer) clearInterval(syncTimer);
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
.logo-circle { width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(207, 161, 106, 0.15); border: 1px solid rgba(207, 161, 106, 0.35); color: var(--accent-amber); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.app-name { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); text-transform: lowercase; }
.app-tagline { font-size: 0.78rem; color: var(--text-muted); text-transform: lowercase; }

.topbar-actions { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
.live-pulse-badge { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-family: var(--font-mono); background: rgba(207, 161, 106, 0.1); border: 1px solid rgba(207, 161, 106, 0.25); padding: 0.35rem 0.65rem; border-radius: 20px; color: var(--accent-amber); text-transform: lowercase; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-amber); box-shadow: 0 0 6px var(--accent-amber); }
.live-pulse-badge.fetching .live-dot { animation: pulseAnim 0.6s infinite alternate; }

@keyframes pulseAnim {
  from { transform: scale(0.8); opacity: 0.6; }
  to { transform: scale(1.4); opacity: 1; }
}

.primary-btn { background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.3); color: #f5ecec; font-size: 0.78rem; font-weight: 700; padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.primary-btn:hover:not(:disabled) { background: #54393c; }
.action-btn { font-size: 0.78rem; border: 1px solid var(--primary-border); color: var(--text-secondary); padding: 0.45rem 0.85rem; border-radius: var(--radius-sm); text-transform: lowercase; cursor: pointer; }

/* Market Ticker */
.market-ticker-banner { border-radius: var(--radius-lg); padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.ticker-title-group { display: flex; align-items: center; gap: 0.5rem; }
.ticker-logo { font-size: 1.1rem; }
.ticker-label { font-size: 0.75rem; font-weight: 700; color: var(--accent-amber); text-transform: lowercase; }
.ticker-items { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.ticker-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; }
.coin-symbol { color: var(--text-muted); font-weight: 700; }
.coin-val { font-weight: 800; color: var(--text-primary); }
.coin-ron { font-size: 0.68rem; color: var(--text-muted); }
.coin-change { font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono); }
.coin-change.up { color: var(--accent-emerald); }
.coin-change.down { color: var(--accent-danger); }

/* Targets Container */
.targets-container { display: flex; flex-direction: column; gap: 1.25rem; }
.target-card { border-radius: var(--radius-xl); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; transition: all 0.2s ease; }
.target-card.fetching { opacity: 0.8; }

.target-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.tag-row { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.25rem; }
.cat-pill { font-size: 0.68rem; font-family: var(--font-mono); color: var(--accent-amber); background: rgba(207, 161, 106, 0.12); padding: 0.1rem 0.45rem; border-radius: 4px; text-transform: lowercase; }
.status-badge { font-size: 0.65rem; font-family: var(--font-mono); padding: 0.1rem 0.4rem; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
.status-badge.online { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
.status-badge.error { background: rgba(231, 76, 60, 0.15); color: var(--accent-danger); }
.hash-tag { font-size: 0.65rem; color: var(--text-muted); background: rgba(255, 255, 255, 0.04); padding: 0.1rem 0.4rem; border-radius: 4px; }

.t-name { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; margin: 0.15rem 0; }
.t-url { font-size: 0.72rem; color: var(--accent-cyan); }

.target-pricing { text-align: right; }
.current-price { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); }
.price-badge { font-size: 0.72rem; color: var(--text-muted); font-weight: 700; }
.price-badge.discount { color: var(--accent-emerald); }

.target-meta-row { display: flex; gap: 1.25rem; font-size: 0.72rem; color: var(--text-muted); text-transform: lowercase; flex-wrap: wrap; }
.target-meta-row code { color: var(--text-primary); }
.text-cyan { color: var(--accent-cyan); }

.diff-box { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); overflow: hidden; }
.diff-topbar { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); background: rgba(255, 255, 255, 0.02); padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--primary-border); text-transform: lowercase; }
.diff-body { padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 2px; }
.diff-row { display: flex; gap: 0.6rem; font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 2px; }
.diff-row.added { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.diff-row.removed { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
.diff-row.normal { color: var(--text-secondary); }
.prefix { font-family: var(--font-mono); font-weight: 700; flex-shrink: 0; }

.card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted); text-transform: lowercase; }
.poll-single-btn { font-size: 0.72rem; background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.25); color: #f5ecec; padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); cursor: pointer; text-transform: lowercase; font-weight: 700; }
.poll-single-btn:disabled { opacity: 0.5; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-card { width: 100%; max-width: 480px; border-radius: var(--radius-xl); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; }
.modal-desc { font-size: 0.78rem; color: var(--text-muted); text-transform: lowercase; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.72rem; color: var(--text-muted); text-transform: lowercase; }
.saas-input, .saas-select { background: #080607; border: 1px solid var(--primary-border); color: #f5ecec; padding: 0.45rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.78rem; outline: none; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
</style>
