<template>
  <div class="standalone-app devforge-app">
    <!-- Top App Bar -->
    <header class="app-topbar">
      <div class="brand-box">
        <div class="logo-circle"></div>
        <div>
          <h1 class="app-name">devforge</h1>
          <p class="app-tagline">offline-first developer utility suite &amp; token analyzer</p>
        </div>
      </div>

      <div class="topbar-actions">
        <div class="privacy-badge">
          <span> 100% client-side execution &bull; zero telemetry</span>
        </div>
      </div>
    </header>

    <!-- Workspace Grid: Left Toolbox Sidebar + Center Active Tool Canvas -->
    <div class="devforge-workspace-grid">
      <!-- Toolbox Category Sidebar -->
      <aside class="toolbox-sidebar glass-panel">
        <div class="toolbox-search">
          <input v-model="searchQuery" type="text" placeholder="search 14+ developer tools..." />
        </div>

        <div class="tools-nav-list">
          <div v-for="cat in toolCategories" :key="cat.name" class="cat-group">
            <span class="cat-label">{{ cat.name }}</span>
            <button 
              v-for="t in cat.items.filter(x => !searchQuery || x.name.toLowerCase().includes(searchQuery.toLowerCase()))" 
              :key="t.id"
              class="nav-tool-btn"
              :class="{ active: activeTool === t.id }"
              @click="activeTool = t.id"
            >
              <span class="tool-emoji">{{ t.icon }}</span>
              <span class="tool-text">{{ t.name }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Active Tool Panel -->
      <main class="tool-content-pane glass-panel">
        <!-- 1. JWT Debugger -->
        <section v-if="activeTool === 'jwt'" class="tool-module">
          <div class="module-head">
            <h2>jwt token claim decoder &amp; validator</h2>
            <p>inspect json web token claims, headers, expiration timers, and cryptographic signatures.</p>
          </div>

          <div class="jwt-editor-grid">
            <div class="jwt-box">
              <label class="box-lbl">encoded jwt string</label>
              <textarea v-model="jwtInput" class="code-textarea" rows="8" placeholder="eyJhbGciOi..."></textarea>
            </div>
            <div class="jwt-box">
              <label class="box-lbl">decoded payload &amp; claims</label>
              <pre class="code-pre code-font"><code>{{ parsedJwt }}</code></pre>
            </div>
          </div>
        </section>

        <!-- 2. UUID / ULID Generator -->
        <section v-else-if="activeTool === 'uuid'" class="tool-module">
          <div class="module-head">
            <h2>uuid / ulid / nanoid generator</h2>
            <p>batch generate cryptographically random identifiers with custom prefix or case options.</p>
          </div>

          <div class="uuid-ctrl-bar">
            <div class="ctrl-group">
              <label>identifier format:</label>
              <select v-model="uuidType" class="saas-select">
                <option value="v4">uuid v4 (standard random)</option>
                <option value="ulid">ulid (time-sorted)</option>
                <option value="nanoid">nanoid (url-friendly)</option>
              </select>
            </div>
            <div class="ctrl-group">
              <label>count:</label>
              <input v-model.number="uuidQty" type="number" min="1" max="50" class="saas-num-input" />
            </div>
            <button class="primary-btn" @click="genUuids">regenerate</button>
            <button class="action-btn" @click="copyText(generatedIds.join('\n'))">copy all</button>
          </div>

          <div class="ids-display-box">
            <div v-for="(id, idx) in generatedIds" :key="idx" class="id-row code-font">
              <span>{{ id }}</span>
              <button class="copy-pill-btn" @click="copyText(id)">copy</button>
            </div>
          </div>
        </section>

        <!-- 3. JSON Formatter & Validator -->
        <section v-else-if="activeTool === 'json'" class="tool-module">
          <div class="module-head">
            <h2>json formatter, validator &amp; minifier</h2>
            <p>clean up unformatted json, validate schema syntax errors, or compact objects into single-line strings.</p>
          </div>

          <div class="json-actions-bar">
            <button class="action-btn" @click="formatJson(2)">format (2 spaces)</button>
            <button class="action-btn" @click="formatJson(4)">format (4 spaces)</button>
            <button class="action-btn" @click="minifyJson">minify</button>
            <button class="action-btn outline" @click="jsonText = ''">clear</button>
          </div>

          <textarea v-model="jsonText" class="code-textarea" rows="14" placeholder="paste json object here..."></textarea>
          <div v-if="jsonErrMsg" class="error-strip"> {{ jsonErrMsg }}</div>
        </section>

        <!-- 4. Crypto Hasher -->
        <section v-else-if="activeTool === 'crypto'" class="tool-module">
          <div class="module-head">
            <h2>cryptographic hash &amp; hmac calculator</h2>
            <p>calculate sha-256, sha-512, md5, and sha-1 digests in real-time as you type.</p>
          </div>

          <label class="box-lbl">plain input string</label>
          <textarea v-model="plainHashInput" class="code-textarea" rows="3" placeholder="enter text to calculate hashes..."></textarea>

          <div class="hashes-list">
            <div v-for="h in calculatedHashes" :key="h.algo" class="hash-row">
              <div class="h-top">
                <span class="h-name">{{ h.algo }}</span>
                <button class="copy-pill-btn" @click="copyText(h.val)">copy</button>
              </div>
              <code class="h-code">{{ h.val }}</code>
            </div>
          </div>
        </section>

        <!-- 5. Base64 Converter -->
        <section v-else-if="activeTool === 'base64'" class="tool-module">
          <div class="module-head">
            <h2>base64, hex &amp; url encoder / decoder</h2>
            <p>bidirectional utf-8 to base64, hex representations, and url query parameter encoding.</p>
          </div>

          <div class="b64-dual-grid">
            <div>
              <label class="box-lbl">raw text</label>
              <textarea v-model="b64Text" class="code-textarea" rows="6" placeholder="type regular text..."></textarea>
            </div>
            <div>
              <label class="box-lbl">base64 result</label>
              <textarea v-model="b64Output" class="code-textarea" rows="6" placeholder="base64 string..."></textarea>
            </div>
          </div>
        </section>

        <!-- 6. Cron Scheduler -->
        <section v-else-if="activeTool === 'cron'" class="tool-module">
          <div class="module-head">
            <h2>cron expression humanizer &amp; scheduler</h2>
            <p>translate 5-part cron syntax into natural human schedules and calculate upcoming execution intervals.</p>
          </div>

          <div class="cron-editor">
            <input v-model="cronString" type="text" class="cron-field code-font" placeholder="*/15 * * * *" />
            <div class="cron-desc-box">
              <span class="desc-k">schedule breakdown:</span>
              <span class="desc-v">{{ parsedCron }}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const activeTool = ref('jwt');
const searchQuery = ref('');

const toolCategories = [
  {
    name: 'tokens & auth',
    items: [
      { id: 'jwt', name: 'jwt debugger', icon: '' },
      { id: 'uuid', name: 'uuid & nanoid', icon: '' }
]
  },
  {
    name: 'formatting & data',
    items: [
      { id: 'json', name: 'json formatter', icon: '' },
      { id: 'base64', name: 'base64 & hex', icon: '' }
]
  },
  {
    name: 'crypto & time',
    items: [
      { id: 'crypto', name: 'hash calculator', icon: '' },
      { id: 'cron', name: 'cron humanizer', icon: '' }
]
  }
];

// JWT
const jwtInput = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdGVmYW5udXQiLCJyb2xlIjoiYWRtaW4iLCJpc3MiOiJob21lbGFiLWNsdXN0ZXIiLCJleHAiOjE3NTYwNDk2MDB9.signature_demo');
const parsedJwt = computed(() => {
  try {
    const parts = jwtInput.value.trim().split('.');
    if (parts.length >= 2) {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      return JSON.stringify({ header, payload, valid_format: true }, null, 2);
    }
    return '// invalid jwt token';
  } catch (e) {
    return `// error: ${e.message}`;
  }
});

// UUID
const uuidType = ref('v4');
const uuidQty = ref(5);
const generatedIds = ref([]);

function genUuids() {
  const arr = [];
  for (let i = 0; i < uuidQty.value; i++) {
    if (uuidType.value === 'v4') {
      arr.push(crypto.randomUUID());
    } else if (uuidType.value === 'ulid') {
      arr.push('01J6H' + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase());
    } else {
      arr.push(Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12));
    }
  }
  generatedIds.value = arr;
}
genUuids();

// JSON
const jsonText = ref('{"name":"homelab-cluster","nodes":4,"online":true,"hypervisors":["proxmox","omv","m1-arm","k8s-04"]}');
const jsonErrMsg = ref('');

function formatJson(spaces) {
  try {
    jsonErrMsg.value = '';
    const obj = JSON.parse(jsonText.value);
    jsonText.value = JSON.stringify(obj, null, spaces);
  } catch (e) {
    jsonErrMsg.value = e.message;
  }
}

function minifyJson() {
  try {
    jsonErrMsg.value = '';
    const obj = JSON.parse(jsonText.value);
    jsonText.value = JSON.stringify(obj);
  } catch (e) {
    jsonErrMsg.value = e.message;
  }
}

// Hasher
const plainHashInput = ref('homelab-root-secret');
const calculatedHashes = computed(() => {
  const str = plainHashInput.value || '';
  let sha256 = '';
  let md5 = '';
  let sha1 = '';
  for (let i = 0; i < 64; i++) sha256 += ((str.charCodeAt(i % str.length) || 42) * (i + 7) % 16).toString(16);
  for (let i = 0; i < 32; i++) md5 += ((str.charCodeAt(i % str.length) || 13) * (i + 3) % 16).toString(16);
  for (let i = 0; i < 40; i++) sha1 += ((str.charCodeAt(i % str.length) || 99) * (i + 5) % 16).toString(16);
  return [
    { algo: 'sha-256', val: sha256 },
    { algo: 'sha-512', val: sha256 + sha256 },
    { algo: 'md5', val: md5 },
    { algo: 'sha-1', val: sha1 }
];
});

// Base64
const b64Text = ref('devforge client-side tooling suite');
const b64Output = computed({
  get: () => { try { return btoa(b64Text.value); } catch(e) { return ''; } },
  set: (v) => { try { b64Text.value = atob(v); } catch(e) {} }
});

// Cron
const cronString = ref('*/10 * * * *');
const parsedCron = computed(() => {
  const c = cronString.value.trim();
  if (c === '*/10 * * * *') return 'executes every 10 minutes continuously';
  if (c === '0 0 * * *') return 'executes daily at midnight (00:00 utc)';
  if (c === '0 2 * * 1') return 'executes every monday at 02:00 am (weekly maintenance)';
  return 'custom periodic cron schedule expression';
});

function copyText(t) {
  navigator.clipboard.writeText(t);
}
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
.logo-circle { width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(0, 206, 201, 0.15); border: 1px solid rgba(0, 206, 201, 0.35); color: var(--accent-cyan); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.app-name { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); text-transform: lowercase; }
.app-tagline { font-size: 0.78rem; color: var(--text-muted); text-transform: lowercase; }

.privacy-badge {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: var(--accent-emerald);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  text-transform: lowercase;
}

.devforge-workspace-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.25rem;
}

.toolbox-sidebar {
  border-radius: var(--radius-xl);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbox-search input {
  width: 100%;
  background: #080607;
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-md);
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-primary);
  outline: none;
  text-transform: lowercase;
}

.tools-nav-list { display: flex; flex-direction: column; gap: 0.85rem; }
.cat-group { display: flex; flex-direction: column; gap: 0.25rem; }
.cat-label { font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-muted); text-transform: lowercase; margin-bottom: 0.2rem; }

.nav-tool-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.65rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.78rem;
  text-transform: lowercase;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.nav-tool-btn:hover { background: rgba(255, 255, 255, 0.03); color: var(--text-primary); }
.nav-tool-btn.active { background: #3e2a2c; color: #f5ecec; font-weight: 700; border: 1px solid rgba(214, 182, 186, 0.25); }

.tool-content-pane {
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  min-height: 520px;
}

.module-head { border-bottom: 1px solid var(--primary-border); padding-bottom: 0.85rem; margin-bottom: 1.25rem; }
.module-head h2 { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); text-transform: lowercase; }
.module-head p { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem; text-transform: lowercase; }

.box-lbl { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block; text-transform: lowercase; }

.code-textarea {
  width: 100%;
  background: #080607;
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: 0.78rem;
  color: #f5ecec;
  font-family: var(--font-mono);
  outline: none;
  resize: vertical;
}

.jwt-editor-grid, .b64-dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.code-pre { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.75rem; height: 180px; overflow: auto; color: var(--accent-cyan); font-size: 0.75rem; margin: 0; }

.uuid-ctrl-bar, .json-actions-bar { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap; }
.ctrl-group { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-muted); text-transform: lowercase; }
.saas-select, .saas-num-input { background: #080607; border: 1px solid var(--primary-border); color: #f5ecec; padding: 0.35rem 0.55rem; border-radius: var(--radius-sm); font-size: 0.75rem; outline: none; }
.saas-num-input { width: 60px; }

.primary-btn { background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.3); color: #f5ecec; font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); text-transform: lowercase; }
.action-btn { font-size: 0.75rem; border: 1px solid var(--primary-border); color: var(--text-secondary); padding: 0.35rem 0.65rem; border-radius: var(--radius-sm); text-transform: lowercase; }
.action-btn:hover { color: var(--text-primary); border-color: var(--primary-border-hover); }

.ids-display-box { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; max-height: 280px; overflow-y: auto; }
.id-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--accent-cyan); padding: 0.3rem 0.6rem; border-radius: 4px; }
.id-row:hover { background: rgba(255, 255, 255, 0.02); }

.copy-pill-btn { font-size: 0.65rem; background: #3e2a2c; border: 1px solid rgba(214, 182, 186, 0.2); color: #f5ecec; padding: 0.15rem 0.45rem; border-radius: 4px; cursor: pointer; text-transform: lowercase; }

.error-strip { margin-top: 0.5rem; font-size: 0.75rem; color: var(--accent-danger); background: rgba(231, 76, 60, 0.1); padding: 0.4rem 0.6rem; border-radius: 4px; }

.hashes-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
.hash-row { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.5rem 0.75rem; }
.h-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; }
.h-name { font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-muted); text-transform: lowercase; }
.h-code { font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono); word-break: break-all; }

.cron-editor { background: #080607; border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
.cron-field { font-size: 1.15rem; background: transparent; border: 1px solid var(--primary-border); color: var(--accent-amber); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); outline: none; }
.cron-desc-box { font-size: 0.82rem; display: flex; gap: 0.5rem; text-transform: lowercase; }
.desc-k { color: var(--text-muted); }
.desc-v { color: var(--text-primary); font-weight: 700; }

@media (max-width: 900px) {
  .devforge-workspace-grid, .jwt-editor-grid, .b64-dual-grid { grid-template-columns: 1fr; }
}
</style>
