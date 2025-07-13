<template>
  <main class="main-content">
    <div v-if="dbStatus" class="db-status-bar" :class="dbStatus.status">
      <span v-if="dbStatus.status === 'pending'">🔄 {{ dbStatus.message }}</span>
      <span v-else-if="dbStatus.status === 'connected'">✅ {{ dbStatus.message }}</span>
      <span v-else-if="dbStatus.status === 'failed'">❌ {{ dbStatus.message }}</span>
    </div>
    <div v-if="currentPage === 'home'" class="page home-page">
      <div class="welcome-section">
        <h2>Welcome to Flicky Electron! 🚀</h2>
        <p>A modern desktop application built with Vue.js and Electron</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Fast & Lightweight</h3>
          <p>Built with Vue.js for optimal performance</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🖥️</div>
          <h3>Cross Platform</h3>
          <p>Runs on Windows, macOS, and Linux</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>Modern UI</h3>
          <p>Beautiful and responsive design</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔧</div>
          <h3>Easy to Customize</h3>
          <p>Modular architecture for easy development</p>
        </div>
      </div>

      <div class="electron-demo">
        <h3>Electron Integration Demo</h3>
        <div class="demo-controls">
          <input
            v-model="message"
            type="text"
            placeholder="Enter a message to send to Electron..."
            class="message-input"
          />
          <button @click="sendMessage" class="send-btn">Send Message</button>
          <button @click="handleFileOpen" class="file-btn">Open File</button>
        </div>
        <div v-if="electronMessage" class="message-feedback">
          {{ electronMessage }}
        </div>
      </div>
    </div>

    <div v-else-if="currentPage === 'dashboard'" class="page dashboard-page">
      <h2>📊 Dashboard</h2>
      <div class="dashboard-grid">
        <div class="metric-card">
          <h3>Active Users</h3>
          <div class="metric-value">1,234</div>
          <div class="metric-change positive">+12%</div>
        </div>
        <div class="metric-card">
          <h3>Total Downloads</h3>
          <div class="metric-value">5,678</div>
          <div class="metric-change positive">+8%</div>
        </div>
        <div class="metric-card">
          <h3>System Load</h3>
          <div class="metric-value">45%</div>
          <div class="metric-change neutral">0%</div>
        </div>
        <div class="metric-card">
          <h3>Memory Usage</h3>
          <div class="metric-value">2.1GB</div>
          <div class="metric-change negative">-3%</div>
        </div>
      </div>
    </div>

    <div v-else-if="currentPage === 'settings'" class="page settings-page">
      <div
        style="
          color: white;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        "
      >
        <h2>Settings Page Test</h2>
        <p>Current page: {{ currentPage }}</p>
        <p>If you see this, the settings page is working!</p>
        <button
          @click="() => console.log('Settings button clicked')"
          style="
            padding: 10px;
            margin: 10px 0;
            background: #367bf0;
            color: white;
            border: none;
            border-radius: 5px;
          "
        >
          Test Button
        </button>
      </div>
      <Settings />
    </div>

    <div v-else-if="currentPage === 'about'" class="page about-page">
      <h2>ℹ️ About</h2>
      <div class="about-content">
        <div class="app-info">
          <h3>Flicky Electron</h3>
          <p>Version 1.0.0</p>
          <p>
            A modern desktop application showcasing the power of Vue.js and
            Electron.
          </p>
        </div>

        <div class="tech-stack">
          <h3>Built with:</h3>
          <ul>
            <li>⚡ Vue.js 3 - Progressive UI framework</li>
            <li>🖥️ Electron 28 - Cross-platform desktop runtime</li>
            <li>🚀 Vite - Fast build tool</li>
            <li>🎨 Modern CSS - Beautiful styling</li>
          </ul>
        </div>

        <div class="links">
          <h3>Links:</h3>
          <a href="https://vuejs.org" target="_blank">Vue.js Documentation</a>
          <a href="https://electronjs.org" target="_blank"
            >Electron Documentation</a
          >
          <a href="https://vitejs.dev" target="_blank">Vite Documentation</a>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Settings from "./Settings.vue";

export default {
  name: "MainContent",
  components: {
    Settings,
  },
  props: {
    currentPage: {
      type: String,
      default: "home",
    },
  },
  data() {
    return {
      message: "",
      electronMessage: "",
      electronApiAvailable: false,
      dbStatus: null,
    };
  },
  mounted() {
    this.electronApiAvailable = typeof window !== 'undefined' && !!window.electronAPI;
    if (this.electronApiAvailable && window.electronAPI.onDBConnectionStatus) {
      window.electronAPI.onDBConnectionStatus((status) => {
        console.log("DB status:", status);
        this.dbStatus = status;
      });
    }
  },
  methods: {
    sendMessage() {
      if (this.electronApiAvailable) {
        window.electronAPI.sendMessage(this.message);
        this.electronMessage = "Message sent to Electron!";
        this.message = "";
        setTimeout(() => {
          this.electronMessage = "";
        }, 3000);
      } else {
        this.electronMessage = "Not running in Electron environment";
      }
    },
    handleFileOpen() {
      if (this.electronApiAvailable) {
        window.electronAPI
          .openFile()
          .then((result) => {
            if (result) {
              this.electronMessage = `File selected: ${result.filePath}`;
            }
          })
          .catch((error) => {
            this.electronMessage = "Error opening file";
          });
      }
    },
  },
};
</script>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.page {
  max-width: 1200px;
  margin: 0 auto;
}

.page h2 {
  color: white;
  font-size: 2rem;
  margin-bottom: 30px;
  font-weight: 600;
}

/* Home Page Styles */
.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.welcome-section p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  color: white;
  margin-bottom: 8px;
  font-size: 1.2rem;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.electron-demo {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.electron-demo h3 {
  color: white;
  margin-bottom: 16px;
}

.demo-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.message-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.send-btn,
.file-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}

.send-btn:hover,
.file-btn:hover {
  background: #5a6fd8;
}

.message-feedback {
  padding: 12px 16px;
  background: rgba(46, 213, 115, 0.2);
  border: 1px solid rgba(46, 213, 115, 0.3);
  border-radius: 6px;
  color: #2ed573;
  font-size: 0.9rem;
}

/* Dashboard Page Styles */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.metric-card h3 {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.metric-change {
  font-size: 0.8rem;
  font-weight: 500;
}

.metric-change.positive {
  color: #2ed573;
}

.metric-change.negative {
  color: #ff4757;
}

.metric-change.neutral {
  color: rgba(255, 255, 255, 0.6);
}

/* About Page Styles */
.about-content {
  display: grid;
  gap: 30px;
}

.app-info,
.tech-stack,
.links {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.app-info h3,
.tech-stack h3,
.links h3 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.app-info p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.tech-stack ul {
  list-style: none;
  padding: 0;
}

.tech-stack li {
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tech-stack li:last-child {
  border-bottom: none;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.links a {
  color: #667eea;
  text-decoration: none;
  padding: 8px 0;
  transition: color 0.2s ease;
}

.links a:hover {
  color: #5a6fd8;
}

.db-status-bar {
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
}
.db-status-bar.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}
.db-status-bar.connected {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}
.db-status-bar.failed {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}
</style>
