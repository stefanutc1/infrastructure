<template>
  <div class="custom-saas-platform">
    <!-- Platform Global Navigation Bar -->
    <header class="platform-nav">
      <div class="nav-inner">
        <div class="brand-group">
          <span class="platform-logo">⬡</span>
          <div class="brand-text">
            <h1 class="platform-title">homelab &bull; custom saas platform</h1>
            <span class="platform-sub">5 standalone microservice replacements with dedicated guis</span>
          </div>
        </div>

        <!-- Service Launcher Bar -->
        <div class="service-selector-nav">
          <button 
            v-for="app in services" 
            :key="app.id"
            class="service-nav-btn"
            :class="{ active: currentAppId === app.id }"
            @click="currentAppId = app.id"
          >
            <span class="s-icon" :style="{ color: app.color }">{{ app.icon }}</span>
            <div class="s-info">
              <span class="s-name">{{ app.name }}</span>
              <span class="s-sub">replaces {{ app.replaces }}</span>
            </div>
            <span class="tier-tag" :class="app.tier">{{ app.tier }}</span>
          </button>
        </div>

        <div class="platform-status">
          <span class="status-indicator-dot"></span>
          <span>vite port :5174</span>
        </div>
      </div>
    </header>

    <!-- Standalone Microservice GUI Canvas -->
    <main class="platform-main">
      <div class="app-host-container">
        <!-- 1. PulseGuard Uptime Monitor & Public Status Page -->
        <PulseGuard v-if="currentAppId === 'pulseguard'" />

        <!-- 2. DevForge Developer Utilities Hub -->
        <DevForge v-else-if="currentAppId === 'devforge'" />

        <!-- 3. PriceScope Web Change & Price Monitor -->
        <PriceScope v-else-if="currentAppId === 'pricescope'" />

        <!-- 4. GitForge Mini Git Server & Code Browser -->
        <GitForge v-else-if="currentAppId === 'gitforge'" />

        <!-- 5. PipeRunner CI/CD Pipeline Runner -->
        <PipeRunner v-else-if="currentAppId === 'piperunner'" />
      </div>
    </main>

    <!-- Platform Footer -->
    <footer class="platform-footer">
      <div class="footer-inner">
        <span>homelab custom saas lab &bull; independent microservices architecture</span>
        <span>built by <a href="https://github.com/stefannut" target="_blank"><strong>@stefannut</strong></a></span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PulseGuard from './apps/PulseGuard.vue';
import DevForge from './apps/DevForge.vue';
import PriceScope from './apps/PriceScope.vue';
import GitForge from './apps/GitForge.vue';
import PipeRunner from './apps/PipeRunner.vue';

const currentAppId = ref('pulseguard');

const services = [
  { id: 'pulseguard', name: 'pulseguard', replaces: 'uptime kuma', icon: '', color: '#10b981', tier: 'tier 1' },
  { id: 'devforge', name: 'devforge', replaces: 'it-tools', icon: '', color: '#00cec9', tier: 'tier 1' },
  { id: 'pricescope', name: 'pricescope', replaces: 'changedetection', icon: '', color: '#cfa16a', tier: 'tier 1' },
  { id: 'gitforge', name: 'gitforge', replaces: 'gitea', icon: '', color: '#c084fc', tier: 'tier 2' },
  { id: 'piperunner', name: 'piperunner', replaces: 'woodpecker ci', icon: '', color: '#e74c3c', tier: 'tier 2' }
];
</script>

<style scoped>
.custom-saas-platform {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-base);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(62, 42, 44, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(20, 15, 17, 0.6) 0%, transparent 60%);
}

.platform-nav {
  background: rgba(18, 14, 15, 0.95);
  border-bottom: 1px solid var(--primary-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.nav-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.platform-logo {
  font-size: 1.6rem;
  color: var(--accent-amber);
}

.platform-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: lowercase;
}

.platform-sub {
  font-size: 0.68rem;
  color: var(--text-muted);
  display: block;
  text-transform: lowercase;
}

.service-selector-nav {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.3rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--primary-border);
  flex-wrap: wrap;
}

.service-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.15s ease;
  text-align: left;
}

.service-nav-btn:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
}

.service-nav-btn.active {
  background: #3e2a2c;
  color: #f5ecec;
  font-weight: 700;
  border: 1px solid rgba(214, 182, 186, 0.3);
}

.s-icon { font-size: 1.1rem; }
.s-info { display: flex; flex-direction: column; }
.s-name { font-size: 0.78rem; font-weight: 700; text-transform: lowercase; }
.s-sub { font-size: 0.62rem; color: var(--text-muted); text-transform: lowercase; }

.tier-tag {
  font-size: 0.58rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.platform-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--primary-border);
  padding: 0.35rem 0.65rem;
  border-radius: 20px;
  color: var(--accent-emerald);
  text-transform: lowercase;
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-emerald);
  box-shadow: 0 0 6px var(--accent-emerald);
}

.platform-main {
  flex: 1;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
}

.app-host-container {
  width: 100%;
}

.platform-footer {
  border-top: 1px solid var(--primary-border);
  background: rgba(12, 9, 10, 0.95);
  padding: 1rem 1.5rem;
  margin-top: auto;
}

.footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: lowercase;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-inner a {
  color: var(--text-secondary);
}

.footer-inner a:hover {
  color: var(--text-primary);
}

@media (max-width: 1024px) {
  .nav-inner {
    flex-direction: column;
    align-items: stretch;
  }
  .service-selector-nav {
    justify-content: center;
  }
  .platform-status {
    align-self: center;
  }
}
</style>
